"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const testimonials = [
  {
    id: 1,
    initials: "JR",
    name: "James R",
    location: "Fitzroy",
    quote:
      "Yusuf did an incredible job on my Golf. Booked online, he showed up on time and the car looked brand new.",
    avatarGradient: "linear-gradient(135deg, #CBA65C 0%, #8B6B2E 100%)",
  },
  {
    id: 2,
    initials: "SM",
    name: "Sarah M",
    location: "Richmond",
    quote:
      "Best detail I've had in Melbourne. Interior was spotless, didn't have to lift a finger.",
    avatarGradient: "linear-gradient(135deg, #E4C883 0%, #CBA65C 100%)",
  },
  {
    id: 3,
    initials: "DK",
    name: "Daniel K",
    location: "Doncaster",
    quote:
      "Honest pricing, great results. Will be booking again before summer.",
    avatarGradient: "linear-gradient(135deg, #B8902A 0%, #7A5F1A 100%)",
  },
];

const TOTAL = testimonials.length;

// How far below the container top the active card sits,
// leaving space for behind-card tops to peek out above it.
const PEEK = 36;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function StarRating() {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1l1.67 3.38 3.73.55-2.7 2.63.64 3.71L7 9.52 3.66 11.27l.64-3.71L1.6 4.93l3.73-.55L7 1z"
            fill="#CBA65C"
          />
        </svg>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Stack
// ─────────────────────────────────────────────

function TestimonialStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  // Which card is currently flying out, and in which x-direction
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [exitDir, setExitDir] = useState<1 | -1>(1);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartRef   = useRef(0);
  const hasDraggedRef  = useRef(false);
  const dragOffsetRef  = useRef(0);
  const activeIndexRef = useRef(0);
  const exitTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // ── Navigation ──────────────────────────────

  const navigate = useCallback((dir: 1 | -1) => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    const curr = activeIndexRef.current;
    setExitingIndex(curr);
    setExitDir(dir);
    setActiveIndex(((curr + dir) % TOTAL + TOTAL) % TOTAL);
    exitTimerRef.current = setTimeout(() => setExitingIndex(null), 540);
  }, []);

  const navigateToIdx = useCallback((target: number) => {
    const curr = activeIndexRef.current;
    if (target === curr) return;
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setExitingIndex(curr);
    setExitDir(1);
    setActiveIndex(target);
    exitTimerRef.current = setTimeout(() => setExitingIndex(null), 540);
  }, []);

  // ── Drag / click ────────────────────────────
  // Listeners are registered synchronously inside the handler so they fire
  // immediately — avoids the async-state delay of a useEffect on isDragging.

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, index: number) => {
      if (index !== activeIndexRef.current) return;
      e.preventDefault();
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragOffsetRef.current = 0;
      dragStartRef.current = "touches" in e ? e.touches[0].clientX : e.clientX;

      const move = (ev: MouseEvent | TouchEvent) => {
        const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
        const offset = clientX - dragStartRef.current;
        dragOffsetRef.current = offset;
        setDragOffset(offset);
        if (Math.abs(offset) > 5) hasDraggedRef.current = true;
      };

      const end = () => {
        const offset = dragOffsetRef.current;
        if (!hasDraggedRef.current) {
          navigate(1);
        } else if (Math.abs(offset) > 50) {
          navigate(offset < 0 ? 1 : -1);
        }
        setIsDragging(false);
        setDragOffset(0);
        dragOffsetRef.current = 0;
        hasDraggedRef.current = false;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("mouseup", end);
        window.removeEventListener("touchend", end);
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("mouseup", end);
      window.addEventListener("touchend", end);
    },
    [navigate]
  );

  // ── Per-card targets ─────────────────────────

  const getAnimate = (index: number, displayOrder: number, isExiting: boolean) => {
    if (isExiting) {
      return {
        x: -exitDir * 600,
        rotate: -exitDir * 14,
        y: PEEK,
        scale: 0.84,
        opacity: 0,
      };
    }
    switch (displayOrder) {
      case 0: // active
        return {
          x: dragOffset,
          rotate: dragOffset * 0.02,
          y: PEEK,
          scale: 1,
          opacity: 1,
        };
      case 1: // first behind
        return { x: 0, rotate: 0, y: Math.round(PEEK * 0.38), scale: 0.952, opacity: 1 };
      case 2: // second behind
        return { x: 0, rotate: 0, y: 0, scale: 0.904, opacity: 0.80 };
      default:
        return { x: 0, rotate: 0, y: 0, scale: 0.88, opacity: 0 };
    }
  };

  const getTransition = (displayOrder: number, isExiting: boolean) => {
    if (isExiting) return { duration: 0.34, ease: [0.4, 0, 1, 1] as const };
    if (displayOrder === 0 && isDragging) {
      // Instant x/rotate while dragging; everything else normal
      return {
        x: { duration: 0 },
        rotate: { duration: 0 },
        default: { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const },
      };
    }
    return { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const };
  };

  // ── Render ──────────────────────────────────

  return (
    <div className="flex flex-col items-center">
      {/*
        Container height = card content height + PEEK offset.
        overflow: visible so the fly-off exits freely; section clips it.
      */}
      <div
        className="relative w-full max-w-lg mx-auto"
        style={{ height: 272, marginBottom: 32 }}
      >
        {testimonials.map((t, index) => {
          const isExiting     = index === exitingIndex;
          const displayOrder  = (index - activeIndex + TOTAL) % TOTAL;
          const isActive      = displayOrder === 0;

          const zIndex = isExiting
            ? TOTAL + 5
            : isActive
            ? TOTAL
            : TOTAL - displayOrder;

          const blurPx =
            !isExiting && displayOrder === 1
              ? "blur(1.5px)"
              : !isExiting && displayOrder === 2
              ? "blur(3px)"
              : undefined;

          return (
            <motion.div
              key={t.id}
              className="absolute inset-x-0 top-0 rounded-2xl overflow-hidden"
              animate={getAnimate(index, displayOrder, isExiting)}
              transition={getTransition(displayOrder, isExiting) as object}
              style={{
                zIndex,
                filter: blurPx,
                pointerEvents: isActive && !isExiting ? "auto" : "none",
                cursor: isActive ? (isDragging ? "grabbing" : "grab") : "default",
                // Dark semi-transparent card
                background:
                  "linear-gradient(150deg, rgba(30,26,18,0.97) 0%, rgba(12,10,7,0.98) 100%)",
                border: isActive
                  ? "1px solid rgba(203,166,92,0.30)"
                  : "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: isActive
                  ? "0 20px 52px rgba(0,0,0,0.72), 0 0 0 1px rgba(203,166,92,0.05)"
                  : "0 6px 20px rgba(0,0,0,0.45)",
              }}
              onMouseDown={(e) => handleDragStart(e, index)}
              onTouchStart={(e) => handleDragStart(e, index)}
            >
              <div className="p-6 sm:p-7">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 select-none"
                      style={{ background: t.avatarGradient, color: "#0a0a0a" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{ color: "rgba(255,255,255,0.90)" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "rgba(203,166,92,0.68)" }}
                      >
                        {t.location}
                      </p>
                    </div>
                  </div>
                  <StarRating />
                </div>

                {/* Quote */}
                <blockquote
                  className="text-[14px] sm:text-[15px] leading-relaxed select-none"
                  style={{ color: "rgba(232,232,232,0.74)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Tag */}
                <div className="mt-5">
                  <span
                    className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-md"
                    style={{
                      background: "rgba(203,166,92,0.10)",
                      color: "#CBA65C",
                      border: "1px solid rgba(203,166,92,0.22)",
                    }}
                  >
                    Verified customer
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5" style={{ position: "relative", zIndex: 20 }}>
        {/* Dots */}
        <div className="flex gap-[6px] items-center">
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => navigateToIdx(i)}
              animate={{
                width: i === activeIndex ? 20 : 6,
                backgroundColor:
                  i === activeIndex ? "#CBA65C" : "rgba(203,166,92,0.25)",
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-[6px] rounded-full"
            />
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-px h-4 shrink-0"
          style={{ background: "rgba(255,255,255,0.10)" }}
        />

        {/* Next button */}
        <motion.button
          onClick={() => navigate(1)}
          className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide"
          style={{ color: "rgba(203,166,92,0.72)" }}
          whileHover={{ color: "#E4C883" } as object}
          transition={{ duration: 0.15 }}
        >
          Next
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            →
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", zIndex: 5 }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/15 to-transparent" />

      {/* Ambient glow behind the stack */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "35%",
          height: "40%",
          background:
            "radial-gradient(ellipse 55% 100% at 50% 50%, rgba(203,166,92,0.055) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-5 sm:px-8 py-20 lg:py-28">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-5"
          >
            What clients say
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-[1.04]"
          >
            Don&rsquo;t just take our word for it.
          </motion.h2>
        </div>

        {/* Stack */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <TestimonialStack />
        </motion.div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  );
}
