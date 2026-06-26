"use client";

import { motion } from "framer-motion";

interface TextRevealProps {
  children: string;
  inView: boolean;
  delay?: number;
  wordDelay?: number;
}

export function TextReveal({
  children,
  inView,
  delay = 0,
  wordDelay = 0.065,
}: TextRevealProps) {
  const words = children.split(" ");

  return (
    <span aria-label={children}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            marginRight: i < words.length - 1 ? "0.26em" : 0,
            // Extend the clip box below the baseline so descenders (g, y, p)
            // aren't cut; negative margin keeps layout spacing unchanged.
            paddingBottom: "0.18em",
            marginBottom: "-0.18em",
          }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "108%" }}
            animate={inView ? { y: "0%" } : { y: "108%" }}
            transition={{
              duration: 0.74,
              delay: delay + i * wordDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
