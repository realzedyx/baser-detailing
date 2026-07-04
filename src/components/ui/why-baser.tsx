"use client";

import { motion, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────
// Interactive Starfield (Framer Motion)
// ─────────────────────────────────────────────

function Star({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [pos] = useState({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 1.5,
    duration: 2.5 + Math.random() * 3,
    delay: Math.random() * 6,
  });

  const cfg = { stiffness: 80, damping: 18, mass: 0.12 };
  const springX = useSpring(0, cfg);
  const springY = useSpring(0, cfg);

  useEffect(() => {
    if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
      springX.set(0); springY.set(0); return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const sx = rect.left + (parseFloat(pos.left) / 100) * rect.width;
    const sy = rect.top  + (parseFloat(pos.top)  / 100) * rect.height;
    const dx = mousePosition.x - sx;
    const dy = mousePosition.y - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 550;
    if (dist < radius) {
      const f = (1 - dist / radius) * 0.55;
      springX.set(dx * f); springY.set(dy * f);
    } else {
      springX.set(0); springY.set(0);
    }
  }, [mousePosition, pos, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute rounded-full bg-white/70"
      style={{ top: pos.top, left: pos.left, width: pos.size, height: pos.size, x: springX, y: springY }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: pos.duration, repeat: Infinity, delay: pos.delay, ease: "easeInOut" }}
    />
  );
}

function Starfield({
  mouse,
  containerRef,
}: {
  mouse: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 160 }).map((_, i) => (
        <Star key={i} mousePosition={mouse} containerRef={containerRef} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const CARDS = [
  {
    cls: "why-card-1",
    icon: "🔍",
    title: "One person, start to finish",
    body: "It's me on your car the entire time. No handoffs, no crew rotating through, no one rushing to clock off. You book me and I do the work.",
    highlight: false,
  },
  {
    cls: "why-card-2",
    icon: "⏱",
    title: "Thorough, not fast",
    body: "A full detail takes 4–6 hours. That's what it takes to do proper stain removal, get into every surface, and hand dry the paint without swirl marks.",
    highlight: true,
  },
  {
    cls: "why-card-3",
    icon: "📍",
    title: "I come to you",
    body: "No driving somewhere and waiting around. You go about your day and the car gets sorted in your driveway. If your spot doesn't work, I'll come to collect it at no extra cost.",
    highlight: false,
  },
] as const;

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function WhyBaserSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    // No pin on any breakpoint — the section flows at its natural height and
    // each block reveals as it scrolls into view. Same treatment as mobile
    // previously used, now applied on desktop too.
    const ctx = gsap.context(() => {
      const reveal = (sel: string, y = 36) =>
        gsap.from(sel, {
          autoAlpha: 0, y, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: sel, start: "top 88%", toggleActions: "play reverse play reverse" },
        });
      reveal(".why-eyebrow", 16);
      reveal(".why-heading", 28);
      reveal(".why-rule", 10);
      [".why-card-1", ".why-card-2", ".why-card-3"].forEach((c) => reveal(c, 44));
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={containerRef}
      onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setMouse({ x: null, y: null })}
      className="relative w-screen min-h-screen overflow-visible flex flex-col items-center justify-center bg-[#0a0a0a] py-24"
      style={{ perspective: "1400px", zIndex: 10 }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/30 to-transparent" />

      {/* Starfield */}
      <Starfield mouse={mouse} containerRef={containerRef as React.RefObject<HTMLDivElement>} />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(203,166,92,0.05) 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-8 flex flex-col items-center">

        {/* Heading block */}
        <div className="text-center mb-10 md:mb-14">
          <p className="why-eyebrow text-[#CBA65C] text-[10px] sm:text-xs uppercase tracking-[0.28em] font-semibold mb-4">
            Baser Detailing · Melbourne
          </p>
          <h2 className="why-heading text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-[1.04]">
            Why Baser?
          </h2>
          <div
            className="why-rule mx-auto mt-5 w-16 h-[2px] rounded-full origin-center"
            style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)" }}
          />
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CARDS.map((card) => (
            <div
              key={card.cls}
              className={cn(
                card.cls,
                "relative rounded-2xl p-6 md:p-8 flex flex-col overflow-hidden",
                "bg-gradient-to-b from-[#181818] to-[#0d0d0d]",
                card.highlight
                  ? "border-2 border-[#CBA65C] shadow-[0_0_48px_rgba(203,166,92,0.14)]"
                  : "border border-white/[0.07]",
              )}
            >
              {/* Highlighted card extras */}
              {card.highlight && (
                <>
                  {/* Top badge */}
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="bg-[#CBA65C] text-[#0a0a0a] text-[10px] font-bold uppercase tracking-[0.18em] px-4 py-1 rounded-b-lg whitespace-nowrap">
                      Most thorough
                    </div>
                  </div>
                  {/* Ambient inner glow */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(203,166,92,0.10) 0%, transparent 65%)" }}
                  />
                  {/* Shimmer sweep */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none animate-[shimmer_4s_linear_infinite]"
                    style={{ background: "linear-gradient(120deg, transparent 30%, rgba(228,200,131,0.10) 50%, transparent 70%)", backgroundSize: "200% 100%" }}
                  />
                  {/* Bottom rule */}
                  <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/45 to-transparent" />
                </>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "why-icon w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-2xl mb-6 mt-2 select-none shrink-0",
                  card.highlight
                    ? "bg-[#CBA65C]/12 border border-[#CBA65C]/35 shadow-[0_0_20px_rgba(203,166,92,0.12)]"
                    : "bg-white/[0.04] border border-white/[0.09]",
                )}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3 className={cn(
                "text-base md:text-lg font-bold tracking-tight mb-3 leading-snug",
                card.highlight ? "text-[#E4C883]" : "text-white",
              )}>
                {card.title}
              </h3>

              {/* Body */}
              <p className="text-[#E8E8E8]/55 text-sm leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll target — nav "Why us?" lands here so animation is already done */}
      <div id="services-end" className="absolute bottom-32 left-0 w-0 h-0 pointer-events-none" />

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
