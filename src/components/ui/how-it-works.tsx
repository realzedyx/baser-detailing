"use client";

import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useEffect, useState } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────
// Step micro-graphics (SVG, animated on inView)
// ─────────────────────────────────────────────

function InteriorGlyph({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Seat silhouette */}
      <motion.path
        d="M12 48 Q12 36 20 34 L44 34 Q52 36 52 48"
        stroke="#CBA65C" strokeWidth="1.5" strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      />
      {/* Headrest */}
      <motion.rect x="22" y="18" width="20" height="14" rx="4"
        stroke="#CBA65C" strokeWidth="1.5" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      />
      {/* Vacuum lines */}
      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1={18 + i * 8} y1="54" x2={18 + i * 8} y2="48"
          stroke="#CBA65C" strokeWidth="1" strokeLinecap="round"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={active ? { scaleY: 1, opacity: 0.4 } : {}}
          transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
          style={{ originY: "100%" }}
        />
      ))}
      {/* Gold dot */}
      <motion.circle cx="32" cy="10" r="2.5"
        fill="#CBA65C"
        initial={{ scale: 0, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 300 }}
      />
    </svg>
  );
}

function WheelGlyph({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Outer rim */}
      <motion.circle cx="32" cy="32" r="22"
        stroke="#CBA65C" strokeWidth="1.5" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.0, ease: "easeOut" }}
      />
      {/* Inner hub */}
      <motion.circle cx="32" cy="32" r="8"
        stroke="#CBA65C" strokeWidth="1.5" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
      />
      {/* Spokes */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.line
            key={angle}
            x1={32 + 8 * Math.cos(rad)} y1={32 + 8 * Math.sin(rad)}
            x2={32 + 22 * Math.cos(rad)} y2={32 + 22 * Math.sin(rad)}
            stroke="#CBA65C" strokeWidth="1.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={active ? { pathLength: 1, opacity: 0.5 } : {}}
            transition={{ duration: 0.4, delay: 0.7 + i * 0.06 }}
          />
        );
      })}
      {/* Center dot */}
      <motion.circle cx="32" cy="32" r="3"
        fill="#CBA65C"
        initial={{ scale: 0 }}
        animate={active ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 1.1, type: "spring" }}
      />
    </svg>
  );
}

function ExteriorGlyph({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Car body silhouette */}
      <motion.path
        d="M8 40 L8 34 Q16 22 24 20 L40 20 Q48 22 56 34 L56 40 Q56 44 52 44 L12 44 Q8 44 8 40Z"
        stroke="#CBA65C" strokeWidth="1.5" fill="none" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* Water flow lines */}
      {[0, 1, 2, 3].map((i) => (
        <motion.path
          key={i}
          d={`M${16 + i * 10} 14 Q${18 + i * 10} 18 ${16 + i * 10} 22`}
          stroke="#CBA65C" strokeWidth="1.2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0, y: -4 }}
          animate={active ? { pathLength: 1, opacity: 0.4, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
        />
      ))}
      {/* Shine highlight */}
      <motion.path
        d="M24 28 Q28 26 36 27"
        stroke="#E4C883" strokeWidth="1.5" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.9 } : {}}
        transition={{ duration: 0.6, delay: 1.0 }}
      />
      {/* Wheels */}
      {[18, 46].map((cx) => (
        <motion.circle
          key={cx} cx={cx} cy="44" r="5"
          stroke="#CBA65C" strokeWidth="1.2" fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 0.6 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
      ))}
    </svg>
  );
}

const GLYPHS = [InteriorGlyph, WheelGlyph, ExteriorGlyph];

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    eyebrow: "~60 min",
    title: "Interior first",
    body: "The full cabin gets done while everything's dry — vacuum, surfaces, glass and mats — so no overspray or runoff lands on fresh work.",
  },
  {
    num: "02",
    eyebrow: "~45 min",
    title: "Then the wheels",
    body: "The dirtiest part of the car gets isolated — wheels, barrels, arches and tyres — before any panel washing starts.",
  },
  {
    num: "03",
    eyebrow: "~75 min",
    title: "Exterior to finish",
    body: "Thorough wash from top to bottom, then a careful hand dry. The paint is the last thing touched and the first thing you'll notice.",
  },
];

// ─────────────────────────────────────────────
// Step row
// ─────────────────────────────────────────────

function StepRow({ step, index, isLast }: { step: (typeof STEPS)[0]; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Glyph = GLYPHS[index];

  return (
    <div ref={ref} className="relative flex items-start gap-0">

      {/* Left: ghost number + timeline column */}
      <div className="flex-shrink-0 flex flex-col items-center" style={{ width: "80px" }}>
        {/* Ghost number */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-black leading-none select-none text-right w-full pr-2"
          style={{
            fontSize: "clamp(52px, 7vw, 80px)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(203,166,92,0.18)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {step.num}
        </motion.div>

        {/* Timeline dot */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 400 }}
          className="relative flex-shrink-0 mt-3"
          style={{ zIndex: 2 }}
        >
          {/* Outer pulse ring */}
          <motion.div
            animate={inView ? { scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute inset-0 rounded-full bg-[#CBA65C]/30"
            style={{ width: 14, height: 14, top: 1, left: 1 }}
          />
          <div
            className="w-4 h-4 rounded-full border-2 border-[#CBA65C] bg-[#0a0a0a]"
            style={{ boxShadow: "0 0 12px rgba(203,166,92,0.4)" }}
          />
        </motion.div>

        {/* Connector line to next step */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="w-px bg-gradient-to-b from-[#CBA65C]/50 to-[#CBA65C]/10 origin-top"
            style={{ height: "120px", marginTop: "4px" }}
          />
        )}
      </div>

      {/* Right: content + glyph */}
      <div className="flex-1 pl-8 pb-20">
        <div className="flex items-start justify-between gap-6">

          {/* Text content */}
          <div className="flex-1">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-5 h-px bg-[#CBA65C]/60" />
              <span className="text-[#CBA65C] text-[10px] uppercase tracking-[0.24em] font-semibold">
                {step.eyebrow}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-[1.1] mb-4"
            >
              {step.title}
            </motion.h3>

            {/* Underline rule */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={inView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="w-10 h-[1.5px] rounded-full origin-left mb-4"
              style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)" }}
            />

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#E8E8E8]/55 text-base leading-relaxed max-w-sm"
            >
              {step.body}
            </motion.p>
          </div>

          {/* SVG glyph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 hidden sm:block"
            style={{
              width: 72,
              height: 72,
              background: "rgba(203,166,92,0.05)",
              border: "1px solid rgba(203,166,92,0.15)",
              borderRadius: "18px",
              padding: "10px",
            }}
          >
            <Glyph active={inView} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        onUpdate: (self) => setScrollProgress(self.progress),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0a] overflow-hidden"
      style={{ paddingTop: "7rem", paddingBottom: "8rem", backgroundColor: "#0a0a0a", zIndex: 5, position: "relative" }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/30 to-transparent" />

      {/* Ambient glow — right-side warm light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 85% 30%, rgba(203,166,92,0.05) 0%, transparent 65%)",
        }}
      />

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-10 mx-auto px-6 sm:px-10" style={{ maxWidth: "720px" }}>

        {/* ── Heading block ── */}
        <div ref={headingRef} className="mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-5"
          >
            Baser Detailing · Process
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 44, filter: "blur(12px)" }}
            animate={headingInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-black tracking-tighter text-white leading-[1.04] mb-5"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
          >
            Inside out,<br />
            <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(228,200,131,0.6)" }}>
              in that order.
            </span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headingInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.65, delay: 0.35 }}
            className="w-14 h-[2px] rounded-full origin-left mb-6"
            style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)" }}
          />

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="text-[#E8E8E8]/50 text-base sm:text-lg leading-relaxed"
            style={{ maxWidth: "480px" }}
          >
            Interior first while the car's dry, wheels next as the dirtiest job, then the full exterior wash and dry. The order keeps the finish clean — nothing gets re-dirtied.
          </motion.p>

          {/* Scroll progress bar */}
          <div className="mt-10 w-full h-px bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #CBA65C, #E4C883)",
                width: `${scrollProgress * 100}%`,
                boxShadow: "0 0 8px rgba(203,166,92,0.5)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>

        {/* ── Steps ── */}
        <div>
          {STEPS.map((step, i) => (
            <StepRow key={step.num} step={step} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#E8E8E8]/25 text-xs tracking-wide mt-2"
        >
          Total: 3–4 hours · One detailer, start to finish
        </motion.p>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
