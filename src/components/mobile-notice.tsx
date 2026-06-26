"use client";

import { useState, useEffect } from "react";

export function MobileNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only on small / touch screens. Shown once per page load on entry.
    if (window.matchMedia("(max-width: 768px)").matches) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(2px)" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 p-7 text-center shadow-2xl"
        style={{ backgroundColor: "#101010" }}
      >
        {/* Close (X) */}
        <button
          onClick={() => setShow(false)}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white"
          style={{ fontSize: 22, lineHeight: 1 }}
        >
          ×
        </button>

        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "rgba(203,166,92,0.12)", border: "1px solid rgba(203,166,92,0.35)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBA65C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="13" rx="1.5" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>

        <h2 className="mb-2 text-lg font-semibold" style={{ color: "#E8E8E8" }}>
          Best viewed on a larger screen
        </h2>
        <p className="mb-6 text-sm leading-relaxed" style={{ color: "rgba(232,232,232,0.65)" }}>
          This website is designed to be experienced on a laptop or desktop. For
          the full cinematic experience, we highly recommend visiting us on a
          bigger screen.
        </p>

        <button
          onClick={() => setShow(false)}
          className="w-full rounded-xl py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#D6342C", color: "#fff" }}
        >
          Continue on here
        </button>
      </div>
    </div>
  );
}
