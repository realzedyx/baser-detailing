"use client";

import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL = 8;

const SECTION_NAMES = [
  "Home",
  "Why Baser",
  "How It Works",
  "Pricing",
  "Results",
  "Good to Know",
  "Testimonials",
  "Book",
];

export function SectionNav() {
  const [current, setCurrent] = useState(0);
  const [starts, setStarts]   = useState<number[]>([0, Infinity, Infinity]);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  useEffect(() => {
    const resolve = () => {
      const pinned    = ScrollTrigger.getAll().filter((t) => t.vars.pin);
      const heroEnd   = pinned[0]?.end ?? 2200;
      const whyEnd    = pinned[1]?.end ?? heroEnd + 1600;
      const howEnd    = whyEnd + 900;
      const pricingEnd      = howEnd + 900;
      const beforeAfterEnd  = pricingEnd + 900;
      const goodToKnowEnd   = beforeAfterEnd + 900;
      const testimonialsEnd = goodToKnowEnd + 900;
      setStarts([0, heroEnd, whyEnd, howEnd, pricingEnd, beforeAfterEnd, goodToKnowEnd, testimonialsEnd]);
    };
    const id = window.setTimeout(resolve, 600);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      let idx = 0;
      for (let i = starts.length - 1; i >= 0; i--) {
        if (y >= starts[i] - 150) { idx = i; break; }
      }
      setCurrent(Math.min(idx, TOTAL - 1));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [starts]);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= TOTAL) return;
    let target = starts[idx] ?? 0;
    // Pinned sections (Hero=0, WhyBaser=1) have long scroll ranges.
    // WhyBaser's card/icon animations don't finish until the very end of its pin,
    // so land near the end (95%) — just before it scrolls away — where everything
    // is settled. This also avoids the scrub-lag empty state when arriving from above.
    if (idx === 0 && starts[1] !== Infinity) {
      target = starts[1] * 0.75;
    } else if (idx === 1 && starts[2] !== Infinity) {
      target = starts[1] + (starts[2] - starts[1]) * 0.95;
    }
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  const canPrev = current > 0;
  const canNext = current < TOTAL - 1;

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none select-none">
      {/* Up */}
      <NavBtn onClick={() => goTo(current - 1)} enabled={canPrev} dir="up" label="Previous section" />

      {/* Section dots */}
      <div className="flex flex-col gap-[6px] py-1">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="relative flex items-center justify-end pointer-events-auto"
            onMouseEnter={() => setHoveredDot(i)}
            onMouseLeave={() => setHoveredDot(null)}
            onClick={() => goTo(i)}
            style={{ cursor: "pointer" }}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {hoveredDot === i && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-6 pointer-events-none"
                  style={{
                    background: "rgba(10,10,10,0.92)",
                    border: "1px solid rgba(203,166,92,0.35)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#CBA65C",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {SECTION_NAMES[i]}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dot */}
            <motion.div
              animate={{
                height: i === current ? 20 : 6,
                backgroundColor: i === current ? "#CBA65C" : hoveredDot === i ? "rgba(203,166,92,0.55)" : "rgba(203,166,92,0.25)",
                boxShadow: i === current ? "0 0 8px rgba(203,166,92,0.5)" : "none",
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: 3, borderRadius: 999 }}
            />
          </div>
        ))}
      </div>

      {/* Down */}
      <NavBtn onClick={() => goTo(current + 1)} enabled={canNext} dir="down" label="Next section" />
    </div>
  );
}

function NavBtn({
  onClick, enabled, dir, label,
}: {
  onClick: () => void;
  enabled: boolean;
  dir: "up" | "down";
  label: string;
}) {
  const Icon   = dir === "up" ? ChevronUp : ChevronDown;
  const bounce = dir === "up" ? [-2, -6, -2] : [2, 6, 2];

  return (
    <motion.button
      onClick={onClick}
      disabled={!enabled}
      aria-label={label}
      className="pointer-events-auto relative w-11 h-11 rounded-full flex items-center justify-center"
      animate={
        enabled
          ? { boxShadow: ["0 0 0px 0px rgba(203,166,92,0)", "0 0 12px 3px rgba(203,166,92,0.22)", "0 0 0px 0px rgba(203,166,92,0)"] }
          : { boxShadow: "0 0 0px 0px rgba(203,166,92,0)" }
      }
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: "linear-gradient(135deg, rgba(28,28,28,0.95) 0%, rgba(10,10,10,0.95) 100%)",
        border: enabled ? "1px solid rgba(203,166,92,0.45)" : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        opacity: enabled ? 1 : 0.3,
        cursor: enabled ? "pointer" : "default",
      }}
      whileHover={enabled ? { scale: 1.12 } : {}}
      whileTap={enabled ? { scale: 0.93 } : {}}
    >
      <motion.div
        animate={enabled ? { y: bounce } : { y: 0 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
      >
        <Icon size={18} strokeWidth={2.2} className={enabled ? "text-[#E4C883]" : "text-white/30"} />
      </motion.div>
    </motion.button>
  );
}
