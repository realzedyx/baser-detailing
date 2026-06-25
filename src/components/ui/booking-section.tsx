"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

const GOLD = "#CBA65C";
const CHROME = "#E4C883";

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function BookingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const anim = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="contact"
      ref={ref}
      style={{ backgroundColor: "#0a0a0a" }}
      className="relative w-full overflow-hidden py-24 sm:py-32"
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/25 to-transparent" />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 60%, rgba(203,166,92,0.055) 0%, transparent 65%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundSize: "52px 52px",
          backgroundImage:
            "linear-gradient(to right, #CBA65C 1px, transparent 1px), linear-gradient(to bottom, #CBA65C 1px, transparent 1px)",
        }}
      />

      <div className="relative z-10 container mx-auto px-5 md:px-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Eyebrow */}
            <motion.p {...anim(0)} className="text-[#CBA65C] text-[10px] uppercase tracking-[0.32em] font-semibold mb-5">
              Book a Detail
            </motion.p>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.08] mb-5"
            >
              Let&apos;s get your<br />car sorted.
            </motion.h2>

            {/* Subheading */}
            <motion.p {...anim(0.18)} className="text-[#E8E8E8]/55 text-sm sm:text-base leading-relaxed max-w-sm mb-10">
              Call or text for the quickest reply, or send your details and I&apos;ll come back
              with a time. A 20% deposit secures your spot — the balance is paid on the day
              by PayID or cash.
            </motion.p>

            {/* Phone number */}
            <motion.div {...anim(0.26)} className="mb-9">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#CBA65C]/60 font-semibold mb-2">
                Call or Text
              </p>
              <a
                href="tel:0410532042"
                className="group inline-flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
              >
                <span
                  className="text-4xl sm:text-5xl font-black tracking-tight"
                  style={{ color: CHROME, fontVariantNumeric: "tabular-nums" }}
                >
                  0410 532 042
                </span>
              </a>
            </motion.div>

            {/* Contact rows */}
            <motion.div {...anim(0.34)} className="flex flex-col gap-3 mb-7">
              <ContactRow
                icon={<IconSms />}
                label="TEXT"
                value="Send a message"
                href="sms:0410532042"
              />
              <ContactRow
                icon={<IconInstagram />}
                label="INSTAGRAM"
                value="@baserdetailing"
                href="https://instagram.com/baserdetailing"
              />
              <ContactRow
                icon={<IconEmail />}
                label="EMAIL"
                value="hello@baserdetailing.com.au"
                href="mailto:hello@baserdetailing.com.au"
              />
            </motion.div>

            {/* Reply note */}
            <motion.p {...anim(0.42)} className="text-[#E8E8E8]/28 text-xs tracking-wide">
              I usually reply the same day.
            </motion.p>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pt-16"
          >
            <div
              className="relative rounded-2xl overflow-hidden p-8 sm:p-10"
              style={{
                background: "linear-gradient(145deg, rgba(26,24,20,0.98) 0%, rgba(14,13,11,0.98) 100%)",
                border: "1px solid rgba(203,166,92,0.18)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.55)",
              }}
            >
              {/* Card top accent line */}
              <div
                className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
              />

              {/* Corner ornament */}
              <div
                className="absolute top-5 right-5 w-10 h-10 opacity-10"
                style={{
                  background: `radial-gradient(circle at center, ${GOLD} 0%, transparent 70%)`,
                  borderRadius: "50%",
                }}
              />

              <div className="relative">
                {/* Card title */}
                <h3 className="text-white text-2xl font-bold tracking-tight mb-2">
                  Book online
                </h3>
                <p className="text-[#E8E8E8]/45 text-sm leading-relaxed mb-10">
                  Pick a service, choose an available day and lock it in.
                </p>

                {/* CTA button */}
                <a
                  href="/book"
                  className="group relative w-full inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl font-bold text-[#0a0a0a] text-base overflow-hidden mb-10 transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`,
                    boxShadow: `0 0 0 1px rgba(203,166,92,0.4), 0 10px 28px -4px rgba(203,166,92,0.38)`,
                  }}
                >
                  {/* Shimmer */}
                  <span
                    className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-in-out pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
                    }}
                    aria-hidden
                  />
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Book a detail
                </a>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#CBA65C]/15 to-transparent mb-7" />

                {/* Footer note */}
                <p className="text-[#E8E8E8]/30 text-[11px] leading-relaxed">
                  A 20% deposit secures your spot. Balance paid on the day by PayID or cash.{" "}
                  <span className="text-[#E8E8E8]/20">
                    Need to reschedule? Just give me 24 hours&apos; notice.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom footer strip */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
      style={{ border: "1px solid rgba(203,166,92,0.1)" }}
    >
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-[#CBA65C]/15"
        style={{ background: "rgba(203,166,92,0.08)" }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.25em] text-[#CBA65C]/50 font-semibold mb-0.5">
          {label}
        </p>
        <p className="text-[#E8E8E8]/75 text-sm font-medium group-hover:text-[#E4C883] transition-colors duration-200 truncate">
          {value}
        </p>
      </div>
      <svg
        className="ml-auto w-3.5 h-3.5 text-[#CBA65C]/25 group-hover:text-[#CBA65C]/60 transition-colors duration-200 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

function IconSms() {
  return (
    <svg className="w-4 h-4 text-[#CBA65C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="w-4 h-4 text-[#CBA65C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg className="w-4 h-4 text-[#CBA65C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}
