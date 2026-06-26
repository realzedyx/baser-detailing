"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────
// Placeholder image layers
// ─────────────────────────────────────────────

function BeforeLayer() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 40%, rgba(60,50,35,0.6) 0%, transparent 70%),
          linear-gradient(160deg, #1a1410 0%, #0f0d0a 40%, #181410 100%)
        `,
      }}
    >
      {/* Simulate grime / dust texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 55%, rgba(80,65,40,0.25) 0%, transparent 40%),
            radial-gradient(circle at 70% 35%, rgba(70,58,35,0.18) 0%, transparent 35%),
            radial-gradient(circle at 50% 75%, rgba(90,70,40,0.2) 0%, transparent 30%)
          `,
        }}
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }}
      />
      {/* Scratches / dirt streaks */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              87deg,
              transparent,
              transparent 60px,
              rgba(60,48,28,0.08) 61px,
              rgba(60,48,28,0.08) 62px
            )
          `,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/10 text-[10px] uppercase tracking-[0.3em] font-semibold select-none">
          Before · Placeholder
        </p>
      </div>
    </div>
  );
}

function AfterLayer() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse 70% 55% at 50% 35%, rgba(203,166,92,0.08) 0%, transparent 65%),
          linear-gradient(160deg, #0d0d0c 0%, #080808 40%, #0c0c0a 100%)
        `,
      }}
    >
      {/* Gloss / shine reflection */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 30% at 35% 30%, rgba(228,200,131,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 40% 20% at 68% 55%, rgba(203,166,92,0.06) 0%, transparent 50%)
          `,
        }}
      />
      {/* Crisp highlight streak */}
      <div
        className="absolute"
        style={{
          top: "18%",
          left: "12%",
          width: "28%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(228,200,131,0.35) 40%, rgba(255,240,180,0.55) 60%, rgba(228,200,131,0.15) 85%, transparent)",
          transform: "rotate(-6deg)",
          filter: "blur(0.5px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "32%",
          left: "55%",
          width: "18%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(228,200,131,0.22) 40%, rgba(255,240,180,0.38) 60%, transparent)",
          transform: "rotate(-4deg)",
          filter: "blur(0.5px)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[#CBA65C]/20 text-[10px] uppercase tracking-[0.3em] font-semibold select-none">
          After · Placeholder
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Slider
// ─────────────────────────────────────────────

function Slider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hinted, setHinted] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  // Attach listeners synchronously in the handler — avoids the async-state
  // delay that would otherwise miss mousemove events fired before the next render.
  const onContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setHinted(true);
      updatePosition(e.clientX);

      const move = (ev: MouseEvent) => updatePosition(ev.clientX);
      const up = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [updatePosition]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      setHinted(true);
      updatePosition(e.touches[0].clientX);

      const move = (ev: TouchEvent) => { ev.preventDefault(); updatePosition(ev.touches[0].clientX); };
      const end = () => {
        setIsDragging(false);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);
      };
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", end);
    },
    [updatePosition]
  );

  // unused — kept to satisfy the onMouseDown prop on the handle div below
  const onMouseDown = onContainerMouseDown;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      data-drag-zone="true"
      style={{
        height: "clamp(300px, 62vw, 680px)",
        cursor: isDragging ? "col-resize" : "ew-resize",
        // Stop the browser from claiming the gesture for vertical scroll while
        // the user drags the comparison handle horizontally.
        touchAction: "pan-y",
      }}
      onMouseDown={onContainerMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Before */}
      <BeforeLayer />

      {/* After — clipped to left of divider */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <AfterLayer />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left: `${position}%`,
          background:
            "linear-gradient(180deg, transparent 0%, #CBA65C 8%, #E4C883 50%, #CBA65C 92%, transparent 100%)",
          boxShadow: "0 0 12px rgba(203,166,92,0.55), 0 0 28px rgba(203,166,92,0.2)",
        }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 pointer-events-none"
        style={{
          left: `${position}%`,
          transform: "translate(-50%, -50%)",
        }}
        onMouseDown={onMouseDown}
      >
        {/* Outer ring glow */}
        <motion.div
          animate={
            isDragging
              ? { scale: 1.15, boxShadow: "0 0 0 3px rgba(203,166,92,0.25), 0 0 32px rgba(203,166,92,0.45)" }
              : { scale: 1, boxShadow: "0 0 0 2px rgba(203,166,92,0.18), 0 0 18px rgba(203,166,92,0.28)" }
          }
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)",
            border: "1.5px solid rgba(203,166,92,0.65)",
          }}
        >
          {/* Arrows */}
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path
              d="M7 7H1M1 7L4 4M1 7L4 10"
              stroke="#CBA65C"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 7H21M21 7L18 4M21 7L18 10"
              stroke="#CBA65C"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* Drag hint — fades out after first interaction */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: hinted ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <motion.div
          animate={{ x: [-6, 6, -6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(10,10,10,0.75)",
            border: "1px solid rgba(203,166,92,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="text-[#CBA65C] text-[11px] font-medium tracking-wide">Drag to compare</span>
        </motion.div>
      </motion.div>

      {/* Before label */}
      <div
        className="absolute bottom-5 left-5 pointer-events-none"
        style={{ opacity: Math.min(1, (position / 100) * 2.2) }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.22em] px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(10,10,10,0.72)",
            color: "rgba(232,232,232,0.55)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(8px)",
          }}
        >
          Before
        </span>
      </div>

      {/* After label */}
      <div
        className="absolute bottom-5 right-5 pointer-events-none"
        style={{ opacity: Math.min(1, ((100 - position) / 100) * 2.2) }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.22em] px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(10,10,10,0.72)",
            color: "#CBA65C",
            border: "1px solid rgba(203,166,92,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          After
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function BeforeAfterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, margin: "-38%" });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/20 to-transparent z-10" />

      {/* Section header */}
      <div className="relative z-10 text-center pt-16 pb-10 px-4">
        <motion.p
          initial={{ opacity: 0, y: 28, letterSpacing: "0.1em" }}
          animate={inView ? { opacity: 1, y: 0, letterSpacing: "0.28em" } : { opacity: 0, y: 28, letterSpacing: "0.1em" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-4"
        >
          Real results
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 72, filter: "blur(22px)", scale: 0.94 }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } : { opacity: 0, y: 72, filter: "blur(22px)", scale: 0.94 }}
          transition={{ duration: 0.95, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[1.04]"
        >
          See the difference.
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.75, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 w-12 h-[2px] rounded-full origin-center"
          style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)" }}
        />
      </div>

      {/* Slider — full width, no padding */}
      <motion.div
        initial={{ opacity: 0, y: 64, scale: 0.88, filter: "blur(12px)" }}
        animate={inView ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : { opacity: 0, y: 64, scale: 0.88, filter: "blur(12px)" }}
        transition={{ duration: 1.05, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <Slider />
      </motion.div>

      {/* Footer caption */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.7, delay: 0.85 }}
        className="text-center py-8 text-[#E8E8E8]/25 text-xs tracking-wide"
      >
        Results vary by vehicle condition. Placeholder images shown above
      </motion.p>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
