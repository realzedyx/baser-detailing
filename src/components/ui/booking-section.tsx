"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

export function BookingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative w-full bg-[#0a0a0a] overflow-hidden py-28 sm:py-36"
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/30 to-transparent" />

      {/* Background gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(203,166,92,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundSize: "60px 60px",
          backgroundImage:
            "linear-gradient(to right, #CBA65C 1px, transparent 1px), linear-gradient(to bottom, #CBA65C 1px, transparent 1px)",
          maskImage: "radial-gradient(ellipse at 50% 100%, black 0%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 100%, black 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[#CBA65C] text-xs uppercase tracking-[0.28em] font-semibold mb-6"
        >
          Mobile Detailing · Melbourne
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.05]"
        >
          Book your detail.
        </motion.h2>

        {/* Gold rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-16 h-[2px] bg-gradient-to-r from-[#CBA65C] to-[#E4C883] rounded-full mb-8 origin-center"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="text-[#E8E8E8]/60 text-base sm:text-lg leading-relaxed max-w-md mb-14"
        >
          Placeholder CTA copy — invite customers to book a mobile detailing
          appointment anywhere in Melbourne.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Primary — gold */}
          <a
            href="#"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] font-semibold text-[#0a0a0a] overflow-hidden transition-transform duration-300 hover:-translate-y-1 active:translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #E4C883 0%, #CBA65C 55%, #A8862E 100%)",
              boxShadow:
                "0 0 0 1px rgba(203,166,92,0.4), 0 8px 24px -4px rgba(203,166,92,0.35), 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            {/* Shimmer sweep */}
            <span
              className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-in-out"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
              }}
              aria-hidden="true"
            />
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Book now
          </a>

          {/* Secondary — dark outline */}
          <a
            href="tel:+61400000000"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] font-semibold text-white border border-white/12 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CBA65C]/40 hover:bg-[#CBA65C]/[0.05] active:translate-y-0.5"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <svg
              className="w-5 h-5 shrink-0 text-[#CBA65C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            Call to book
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 text-[#E8E8E8]/30 text-xs tracking-wide"
        >
          Melbourne-wide · Same-week availability · Free quote
        </motion.p>
      </div>

      {/* Bottom footer strip */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
