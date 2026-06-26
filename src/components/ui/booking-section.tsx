"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/text-reveal";
import { supabase } from "@/lib/supabase";

const GOLD = "#CBA65C";
const CHROME = "#E4C883";

export function BookingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    supabase
      .from("availability")
      .select("date", { count: "exact", head: false })
      .eq("status", "open")
      .gte("date", fmt(monday))
      .lte("date", fmt(sunday))
      .then(({ count, error }) => setSpotsLeft(error ? null : count ?? 0));
  }, []);

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

      {/* Dramatic gold diagonal wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(203,166,92,0.07) 0%, transparent 45%, rgba(228,200,131,0.04) 100%)",
        }}
      />
      {/* Left radial anchor */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 10% 55%, rgba(203,166,92,0.08) 0%, transparent 65%)",
        }}
      />
      {/* Right ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 90% 40%, rgba(228,200,131,0.05) 0%, transparent 60%)",
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
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.08] mb-5">
              <span style={{ display: "block" }}>
                <TextReveal inView={inView} delay={0.08}>Let&apos;s get your</TextReveal>
              </span>
              <span style={{ display: "block" }}>
                <TextReveal inView={inView} delay={0.3}>car sorted.</TextReveal>
              </span>
            </h2>

            {/* Subheading */}
            <motion.p {...anim(0.18)} className="text-[#E8E8E8]/55 text-sm sm:text-base leading-relaxed max-w-sm mb-10">
              Call or text for the quickest reply, or send your details and I&apos;ll come back
              with a time. A 20% deposit locks in your spot, with the balance paid on the day
              by card, PayID, or cash.
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
                value="support@baserdetailing.com"
                href="mailto:support@baserdetailing.com"
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
                <p className="text-[#E8E8E8]/45 text-sm leading-relaxed mb-6">
                  Pick a service, choose an available day and lock it in.
                </p>

                {/* Availability indicator */}
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: spotsLeft === null ? "#888" : spotsLeft > 0 ? "#4ade80" : "#E4C883" }}
                    />
                    {(spotsLeft === null || spotsLeft > 0) && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: spotsLeft === null ? "#888" : "#4ade80" }}
                      />
                    )}
                  </div>
                  <p className="text-[12px] font-semibold" style={{ color: "rgba(232,232,232,0.55)" }}>
                    {spotsLeft === null ? (
                      <span style={{ color: "rgba(232,232,232,0.3)" }}>Checking availability…</span>
                    ) : spotsLeft > 0 ? (
                      <><span style={{ color: "#E4C883" }}>{spotsLeft} {spotsLeft === 1 ? "spot" : "spots"}</span> left this week</>
                    ) : (
                      // Neutral fallback — a 0 count often just means days aren't seeded yet,
                      // so never show a "closed for business" red message.
                      <><span style={{ color: "#E4C883" }}>Booking by request</span> — get in touch to lock a day</>
                    )}
                  </p>
                </div>

                {/* CTA button with pulse glow + magnetic */}
                <div className="relative mb-10">
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{
                      boxShadow: [
                        "0 0 0px 0px rgba(203,166,92,0)",
                        "0 0 28px 6px rgba(203,166,92,0.35)",
                        "0 0 0px 0px rgba(203,166,92,0)",
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <MagneticButton>
                    <a
                      href="/book"
                      className="group relative w-full inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl font-bold text-[#0a0a0a] text-base overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0.5"
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
                  </MagneticButton>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#CBA65C]/15 to-transparent mb-7" />

                {/* Footer note */}
                <p className="text-[#E8E8E8]/30 text-[11px] leading-relaxed">
                  A 20% deposit secures your spot. Balance paid on the day by card, PayID, or cash.{" "}
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

      {/* Footer bar */}
      <div className="relative z-10 mt-16 border-t flex items-center justify-between px-5 md:px-8 pt-6 max-w-6xl mx-auto" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[11px]" style={{ color: "rgba(232,232,232,0.2)" }}>
          © {new Date().getFullYear()} Baser Detailing. ABN 29 765 538 947.
        </p>
        <Link
          href="/terms"
          className="text-[11px] transition-colors duration-200 hover:text-[#CBA65C]"
          style={{ color: "rgba(232,232,232,0.3)" }}
        >
          Terms &amp; Conditions
        </Link>
      </div>
    </section>
  );
}

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 280, damping: 22, mass: 0.5 });

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 90;
    if (dist < radius) {
      const factor = (1 - dist / radius) * 0.48;
      x.set(dx * factor);
      y.set(dy * factor);
    }
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ width: "100%" }}
    >
      <motion.div style={{ x: sx, y: sy }}>
        {children}
      </motion.div>
    </div>
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
