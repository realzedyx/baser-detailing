"use client";

import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL = 8; // hero, why-baser, how-it-works, pricing, before-after, good-to-know, testimonials, booking

export function SectionNav() {
  const [current, setCurrent] = useState(0);
  // Scroll positions where each section "starts" (top of pin or top of element)
  const [starts, setStarts] = useState<number[]>([0, Infinity, Infinity]);

  // Resolve section start positions after GSAP triggers are registered
  useEffect(() => {
    const resolve = () => {
      const pinned = ScrollTrigger.getAll().filter((t) => t.vars.pin);
      // pinned[0] = hero, pinned[1] = why-baser
      const heroEnd       = pinned[0]?.end ?? 2200;
      const whyEnd        = pinned[1]?.end ?? heroEnd + 1600;
      const howEnd        = whyEnd + 900;
      const pricingEnd    = howEnd + 900;
      const beforeAfterEnd  = pricingEnd + 900;
      const goodToKnowEnd   = beforeAfterEnd + 900;
      const testimonialsEnd = goodToKnowEnd + 900;
      setStarts([0, heroEnd, whyEnd, howEnd, pricingEnd, beforeAfterEnd, goodToKnowEnd, testimonialsEnd]);
    };

    // Give GSAP time to register all triggers on mount
    const id = window.setTimeout(resolve, 600);
    return () => window.clearTimeout(id);
  }, []);

  // Track current section from scroll position
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
    window.scrollTo({ top: starts[idx] ?? 0, behavior: "smooth" });
  };

  const canPrev = current > 0;
  const canNext = current < TOTAL - 1;

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none select-none">
      {/* Up */}
      <NavBtn
        onClick={() => goTo(current - 1)}
        enabled={canPrev}
        dir="up"
        label="Previous section"
      />

      {/* Section dots */}
      <div className="flex flex-col gap-[6px] py-1">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: i === current ? 20 : 6,
              backgroundColor: i === current ? "#CBA65C" : "rgba(203,166,92,0.25)",
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-[3px] rounded-full"
          />
        ))}
      </div>

      {/* Down */}
      <NavBtn
        onClick={() => goTo(current + 1)}
        enabled={canNext}
        dir="down"
        label="Next section"
      />
    </div>
  );
}

function NavBtn({
  onClick,
  enabled,
  dir,
  label,
}: {
  onClick: () => void;
  enabled: boolean;
  dir: "up" | "down";
  label: string;
}) {
  const Icon = dir === "up" ? ChevronUp : ChevronDown;
  const bounce = dir === "up" ? [-2, -6, -2] : [2, 6, 2];

  return (
    <motion.button
      onClick={onClick}
      disabled={!enabled}
      aria-label={label}
      className="pointer-events-auto relative w-11 h-11 rounded-full flex items-center justify-center"
      animate={
        enabled
          ? {
              boxShadow: [
                "0 0 0px 0px rgba(203,166,92,0)",
                "0 0 12px 3px rgba(203,166,92,0.22)",
                "0 0 0px 0px rgba(203,166,92,0)",
              ],
            }
          : { boxShadow: "0 0 0px 0px rgba(203,166,92,0)" }
      }
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: "linear-gradient(135deg, rgba(28,28,28,0.95) 0%, rgba(10,10,10,0.95) 100%)",
        border: enabled
          ? "1px solid rgba(203,166,92,0.45)"
          : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        opacity: enabled ? 1 : 0.3,
        cursor: enabled ? "pointer" : "default",
      }}
      whileHover={enabled ? { scale: 1.12 } : {}}
      whileTap={enabled ? { scale: 0.93 } : {}}
    >
      {/* Arrow with continuous bounce */}
      <motion.div
        animate={enabled ? { y: bounce } : { y: 0 }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        }}
      >
        <Icon
          size={18}
          strokeWidth={2.2}
          className={enabled ? "text-[#E4C883]" : "text-white/30"}
        />
      </motion.div>
    </motion.button>
  );
}
