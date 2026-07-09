"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const bullets = [
  {
    heading: "One owner, start to finish",
    body: "No rotating crew, no rushing to the next job. The person you book is the person doing the work.",
  },
  {
    heading: "Proper process, every time",
    body: "Thorough wash, stain removal and a hand dry. The steps that actually protect the finish and make it last.",
  },
  {
    heading: "I come to you",
    body: "Mobile across metro Melbourne. Driveway, carport or kerbside. Can't have it done at your place? Free pickup and drop-off.",
  },
];

const faqs = [
  {
    q: "Do you come to me?",
    a: "Always. Pick a time and I'll bring everything to your place. You don't need to go anywhere — I just need access to power and water.",
  },
  {
    q: "What do you need from me?",
    a: "A tap, a power point, and enough room to work around the car. If that's not possible, free pickup and drop-off.",
  },
  {
    q: "What if it rains?",
    a: "I'll message you the night before and we'll move it to the next clear day. No charge.",
  },
  {
    q: "How do I pay?",
    a: "PayID, Card or Cash on the day, once you're happy with the job.",
  },
];

// ─────────────────────────────────────────────
// FAQ item
// ─────────────────────────────────────────────

function FaqItem({
  item,
  open,
  onToggle,
  delay,
  inView,
}: {
  item: { q: string; a: string };
  open: boolean;
  onToggle: () => void;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 48, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: 48, filter: "blur(8px)" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="border-b last:border-b-0"
      style={{ borderColor: open ? "rgba(203,166,92,0.22)" : "rgba(255,255,255,0.07)" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span
          className="text-sm font-semibold leading-snug transition-colors duration-200"
          style={{ color: open ? "#E4C883" : "rgba(232,232,232,0.82)" }}
        >
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: open
              ? "linear-gradient(135deg, #E4C883 0%, #CBA65C 100%)"
              : "rgba(203,166,92,0.10)",
            border: open
              ? "1px solid rgba(203,166,92,0.4)"
              : "1px solid rgba(203,166,92,0.18)",
          }}
        >
          <Plus
            size={13}
            strokeWidth={2.5}
            style={{ color: open ? "#0a0a0a" : "#CBA65C" }}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className="pb-4 text-[13px] leading-relaxed"
              style={{ color: "rgba(232,232,232,0.48)" }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function GoodToKnowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-38%" });
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ backgroundColor: "#0a0a0a", zIndex: 5 }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/15 to-transparent" />

      {/* Background gradients — single inset-0 div, no clipping */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 55% at 15% 40%, rgba(203,166,92,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 85% 70%, rgba(228,200,131,0.045) 0%, transparent 60%),
            linear-gradient(125deg, transparent 30%, rgba(203,166,92,0.02) 50%, transparent 70%)
          `,
        }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">

          {/* ── LEFT: Good to know ── */}
          <div>
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 24, letterSpacing: "0.08em" }}
              animate={inView ? { opacity: 1, y: 0, letterSpacing: "0.28em" } : { opacity: 0, y: 24, letterSpacing: "0.08em" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-5"
            >
              Before you book
            </motion.p>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 68, filter: "blur(20px)", scale: 0.94 }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } : { opacity: 0, y: 68, filter: "blur(20px)", scale: 0.94 }}
              transition={{ duration: 0.95, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-[1.04] mb-10"
            >
              Good to know.
            </motion.h2>

            {/* Bullet list */}
            <div className="flex flex-col gap-7">
              {bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -52, filter: "blur(8px)" }}
                  animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -52, filter: "blur(8px)" }}
                  transition={{ duration: 0.75, delay: 0.28 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-4"
                >
                  {/* Gold dot + line */}
                  <div className="flex flex-col items-center pt-[5px] shrink-0">
                    <div
                      className="w-[7px] h-[7px] rounded-full shrink-0"
                      style={{ background: "linear-gradient(135deg, #E4C883, #CBA65C)" }}
                    />
                    {i < bullets.length - 1 && (
                      <div
                        className="w-px flex-1 mt-2"
                        style={{ background: "linear-gradient(180deg, rgba(203,166,92,0.25), transparent)" }}
                      />
                    )}
                  </div>

                  <div className="pb-2">
                    <p className="text-white text-[14px] font-bold leading-snug mb-1">{b.heading}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(232,232,232,0.45)" }}>
                      {b.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: FAQ + Promise ── */}
          <div className="flex flex-col gap-8">
            {/* FAQ header */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 24, letterSpacing: "0.08em" }}
                animate={inView ? { opacity: 1, y: 0, letterSpacing: "0.28em" } : { opacity: 0, y: 24, letterSpacing: "0.08em" }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-5"
              >
                FAQ
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 52, filter: "blur(16px)", scale: 0.94 }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } : { opacity: 0, y: 52, filter: "blur(16px)", scale: 0.94 }}
                transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight"
              >
                Questions?
              </motion.h3>
            </div>

            {/* Accordion */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(20,20,18,0.7) 0%, rgba(10,10,10,0.8) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="px-5 sm:px-6">
                {faqs.map((item, i) => (
                  <FaqItem
                    key={i}
                    item={item}
                    open={openIdx === i}
                    onToggle={() => toggle(i)}
                    delay={0.38 + i * 0.09}
                    inView={inView}
                  />
                ))}
              </div>
            </div>

            {/* Promise box */}
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.94, filter: "blur(10px)" }}
              animate={inView ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : { opacity: 0, y: 48, scale: 0.94, filter: "blur(10px)" }}
              transition={{ duration: 0.85, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-xl px-6 py-5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(203,166,92,0.07) 0%, rgba(10,10,10,0.6) 100%)",
                border: "1px solid rgba(203,166,92,0.32)",
                boxShadow:
                  "0 0 40px rgba(203,166,92,0.05), inset 0 1px 0 rgba(203,166,92,0.12)",
              }}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
                style={{
                  background: "linear-gradient(180deg, #E4C883, #CBA65C 60%, transparent)",
                }}
              />

              {/* Star / seal */}
              <div className="flex items-start gap-3 pl-4">
                <div className="shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 1.5l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.77l-4.78 2.53.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
                      fill="#CBA65C"
                      fillOpacity="0.9"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[#E4C883] text-[11px] font-black uppercase tracking-[0.18em] mb-2">
                    My promise
                  </p>
                  <p
                    className="text-[13px] sm:text-sm leading-relaxed italic"
                    style={{ color: "rgba(232,232,232,0.62)" }}
                  >
                    &ldquo;I treat every car like my own. If something&rsquo;s not right, tell me before I leave and I&rsquo;ll fix it free of charge.&rdquo;
                  </p>
                </div>
              </div>

              {/* Shimmer */}
              <div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(228,200,131,0.04) 50%, transparent 60%)",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

    </section>
  );
}
