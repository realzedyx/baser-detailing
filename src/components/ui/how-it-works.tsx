"use client";

import { motion, useScroll, useTransform, useSpring as useSpringFM, useMotionValueEvent, MotionValue } from "framer-motion";
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
    title: "Interior first",
    body: "The full cabin gets done while everything's dry: vacuum, surfaces, glass and mats. That way no overspray or runoff lands on fresh work.",
  },
  {
    num: "02",
    title: "Then the wheels",
    body: "The dirtiest part of the car gets dealt with first: wheels, barrels, arches and tyres, all before any panel washing starts.",
  },
  {
    num: "03",
    title: "Exterior to finish",
    body: "Thorough wash from top to bottom, then a careful hand dry. The paint is the last thing touched and the first thing you'll notice.",
  },
];

// ─────────────────────────────────────────────
// Step row
// ─────────────────────────────────────────────

const NUM_COL = 88;
const TL_COL  = 28;

// Fraction of stepsScrollY at which the line tip visually reaches each dot.
// Equal-spaced steps → dot 0 early, dot 2 late.
const DOT_THRESHOLDS = [0.08, 0.43, 0.78];

function StepRow({
  step, index, stepsScrollY,
}: {
  step: (typeof STEPS)[0];
  index: number;
  stepsScrollY: MotionValue<number>;
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const numRef  = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [glyphActive, setGlyphActive] = useState(false);
  const [lit, setLit] = useState(false);          // true when the line has reached this dot
  const Glyph = GLYPHS[index];

  // Watch scroll progress — light up dot+number when line tip passes this dot
  useMotionValueEvent(stepsScrollY, "change", (val) => {
    setLit(val >= DOT_THRESHOLDS[index]);
  });

  useEffect(() => {
    if (!ref.current) return;

    gsap.set([numRef.current, bodyRef.current, iconRef.current], { autoAlpha: 0, y: 52 });
    gsap.set(dotRef.current, { scale: 0, autoAlpha: 0 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.to(numRef.current,  { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
          gsap.to(dotRef.current,  { scale: 1, autoAlpha: 1, duration: 0.45, delay: 0.18, ease: "back.out(2)" });
          gsap.to(bodyRef.current, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.12, ease: "power3.out" });
          gsap.to(iconRef.current, {
            autoAlpha: 1, y: 0, duration: 0.65, delay: 0.38, ease: "power3.out",
            onStart: () => setGlyphActive(true),
          });
        },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative flex items-start">

      {/* Numbers: clipped column, stroke brightens when line hits */}
      <div className="flex-shrink-0 overflow-hidden" style={{ width: NUM_COL, zIndex: 1 }}>
        <div
          ref={numRef}
          className="font-black leading-none select-none text-right w-full"
          style={{
            fontSize: "clamp(48px, 6.5vw, 72px)",
            color: "transparent",
            WebkitTextStroke: lit ? "1px rgba(203,166,92,0.85)" : "1px rgba(203,166,92,0.22)",
            fontVariantNumeric: "tabular-nums",
            maskImage: "linear-gradient(to right, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 50%, transparent 100%)",
            filter: lit ? "drop-shadow(0 0 10px rgba(203,166,92,0.55))" : "none",
            transition: "filter 0.5s ease, -webkit-text-stroke-color 0.5s ease",
          }}
        >
          {step.num}
        </div>
      </div>

      {/* Timeline column: dot glows when line reaches it */}
      <div className="flex-shrink-0 flex flex-col items-center" style={{ width: TL_COL, zIndex: 2, position: "relative" }}>
        <div style={{ height: "clamp(12px, 1.8vw, 20px)" }} />
        <div ref={dotRef} className="relative flex-shrink-0">
          {/* Pulse ring — only shows when lit */}
          {lit && (
            <div
              className="absolute rounded-full bg-[#CBA65C]/40"
              style={{ width: 14, height: 14, top: 1, left: 1, animation: "dotPulse 2.0s ease-in-out infinite" }}
            />
          )}
          <div
            className="w-4 h-4 rounded-full border-2 border-[#CBA65C]"
            style={{
              background: lit ? "rgba(203,166,92,0.28)" : "#0a0a0a",
              boxShadow: lit
                ? "0 0 0 3px rgba(203,166,92,0.18), 0 0 18px rgba(203,166,92,0.7), 0 0 36px rgba(203,166,92,0.35)"
                : "0 0 12px rgba(203,166,92,0.3)",
              transition: "box-shadow 0.5s ease, background 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Content + icon */}
      <div ref={bodyRef} className="flex-1 pl-6 pb-20">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-[1.1] mb-4">
              {step.title}
            </h3>
            <div className="w-10 h-[1.5px] rounded-full mb-4"
              style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)" }} />
            <p className="text-[#E8E8E8]/55 text-base leading-relaxed max-w-sm">
              {step.body}
            </p>
          </div>

          <div
            ref={iconRef}
            className="flex-shrink-0 hidden sm:block"
            style={{
              width: 72, height: 72,
              background: "rgba(203,166,92,0.05)",
              border: "1px solid rgba(203,166,92,0.15)",
              borderRadius: "18px",
              padding: "10px",
            }}
          >
            <Glyph active={glyphActive} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function HowItWorksSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stepsRef    = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLParagraphElement>(null);
  const h2Ref       = useRef<HTMLHeadingElement>(null);
  const ruleRef     = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll-driven timeline line
  const { scrollYProgress: stepsScrollY } = useScroll({
    target: stepsRef,
    offset: ["start 85%", "end 30%"],
  });
  const rawLineScale = useTransform(stepsScrollY, [0, 1], [0, 1]);
  const lineScaleY = useSpringFM(rawLineScale, { stiffness: 80, damping: 20, mass: 0.4 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hide heading elements initially
      gsap.set([eyebrowRef.current, h2Ref.current, ruleRef.current, subtitleRef.current, progressBarRef.current],
        { autoAlpha: 0, y: 28 });

      // Animate heading when section enters
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(eyebrowRef.current,  { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" });
          gsap.to(h2Ref.current,       { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.1, ease: "power3.out" });
          gsap.to(ruleRef.current,     { autoAlpha: 1, y: 0, scaleX: 1, duration: 0.6, delay: 0.28, ease: "power3.out" });
          gsap.to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.22, ease: "power3.out" });
          gsap.to(progressBarRef.current, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.38, ease: "power3.out" });
        },
      });

      // Progress bar
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

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 70% at 85% 30%, rgba(203,166,92,0.05) 0%, transparent 65%)" }}
      />

      {/* Noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-10 mx-auto px-6 sm:px-10" style={{ maxWidth: "720px" }}>

        {/* ── Heading block ── */}
        <div className="mb-16 md:mb-20">
          <p ref={eyebrowRef} className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-5">
            Baser Detailing · Process
          </p>

          <h2
            ref={h2Ref}
            className="font-black tracking-tighter text-white leading-[1.04] mb-5"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
          >
            Inside out,<br />
            <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(228,200,131,0.6)" }}>
              in that order.
            </span>
          </h2>

          <div
            ref={ruleRef}
            className="w-14 h-[2px] rounded-full origin-left mb-6"
            style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)", scaleX: 0 } as React.CSSProperties}
          />

          <p
            ref={subtitleRef}
            className="text-[#E8E8E8]/50 text-base sm:text-lg leading-relaxed"
            style={{ maxWidth: "480px" }}
          >
            Interior first while the car&apos;s dry, wheels next as the dirtiest job, then the full exterior wash and dry. The order matters. Nothing gets re-dirtied.
          </p>

          {/* Scroll progress bar */}
          <div ref={progressBarRef} className="mt-10 w-full h-px bg-white/[0.06] rounded-full overflow-hidden">
            <div
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
        <div ref={stepsRef} className="relative">
          {/* Single continuous timeline line — centered in the timeline column, never touches numbers */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: `${NUM_COL + TL_COL / 2}px`, width: 0, zIndex: 0 }}
          >
            {/* Dim background track */}
            <div
              className="absolute w-px"
              style={{ left: "-0.5px", top: "52px", bottom: "80px", background: "rgba(203,166,92,0.08)" }}
            />
            {/* Scroll-driven fill */}
            <motion.div
              className="absolute w-px origin-top"
              style={{
                left: "-0.5px",
                top: "52px",
                bottom: "80px",
                scaleY: lineScaleY,
                background: "linear-gradient(to bottom, #CBA65C 0%, rgba(203,166,92,0.2) 100%)",
                boxShadow: "0 0 6px rgba(203,166,92,0.3)",
              }}
            />
          </div>

          {STEPS.map((step, i) => (
            <StepRow key={step.num} step={step} index={i} stepsScrollY={stepsScrollY} />
          ))}
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#E8E8E8]/45 text-xs tracking-wide mt-2"
        >
          One detailer, start to finish
        </motion.p>

        {/* Soft CTA so a convinced reader can act without scrolling on */}
        <motion.a
          href="#packages"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-block mt-5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
          style={{ color: "#CBA65C" }}
        >
          See packages &amp; pricing →
        </motion.a>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
