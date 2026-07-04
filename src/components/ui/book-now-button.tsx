"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const GOLD = "#CBA65C";
const CHROME = "#E4C883";

const MotionLink = motion(Link);

export function BookNowButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed right-4 sm:right-6 top-safe z-50"
    >
      <MotionLink
        href="/book"
        className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide"
        style={{
          background: `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`,
          color: "#0a0a0a",
          boxShadow: "0 8px 24px -4px rgba(203,166,92,0.45)",
        }}
        whileHover={{
          scale: 1.06,
          boxShadow: "0 10px 32px -4px rgba(203,166,92,0.7)",
        }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        Book Now
      </MotionLink>
    </motion.div>
  );
}
