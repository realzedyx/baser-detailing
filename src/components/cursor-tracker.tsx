"use client";

import { useState, useEffect, useRef } from "react";

export function CursorTracker() {
  const mousePos  = useRef({ x: 0, y: 0 });
  const dotPos    = useRef({ x: 0, y: 0 });
  const glowPos   = useRef({ x: 0, y: 0 });
  const [pos, setPos]         = useState({ dot: { x: 0, y: 0 }, glow: { x: 0, y: 0 } });
  const [isHovering, setHovering]   = useState(false);
  const [isDragZone, setDragZone]   = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    // Only on devices with a real mouse — skip touch/mobile entirely (no custom
    // cursor, and no constant rAF loop running for nothing).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
      document.dispatchEvent(new CustomEvent("cursormove", { detail: { x: e.clientX, y: e.clientY } }));

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        setDragZone(!!el.closest("[data-drag-zone]"));
        setHovering(!!el.closest("a, button, [role='button'], input, select, textarea, label, [data-hover]"));
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let raf: number;
    const tick = () => {
      dotPos.current.x  = lerp(dotPos.current.x,  mousePos.current.x, 0.28);
      dotPos.current.y  = lerp(dotPos.current.y,  mousePos.current.y, 0.28);
      glowPos.current.x = lerp(glowPos.current.x, mousePos.current.x, 0.1);
      glowPos.current.y = lerp(glowPos.current.y, mousePos.current.y, 0.1);
      setPos({ dot: { ...dotPos.current }, glow: { ...glowPos.current } });
      raf = requestAnimationFrame(tick);
    };

    setMounted(true);
    raf = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted) return null;

  const dotSize  = isDragZone ? 36 : isHovering ? 18 : 7;
  const glowSize = isDragZone ? 88 : isHovering ? 52 : 32;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* Outer glow halo */}
      <div
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(203,166,92,0.22) 0%, transparent 70%)",
          transform: "translate(-50%,-50%)",
          left: pos.glow.x,
          top: pos.glow.y,
          filter: "blur(10px)",
          transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), height 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* Core dot */}
      <div
        style={{
          position: "absolute",
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: isDragZone
            ? "rgba(10,10,10,0.9)"
            : "radial-gradient(circle at 35% 35%, #E4C883, #CBA65C)",
          border: isDragZone ? "1.5px solid rgba(203,166,92,0.75)" : "none",
          boxShadow: isDragZone
            ? "0 0 18px rgba(203,166,92,0.45), 0 0 6px rgba(203,166,92,0.25)"
            : "0 0 10px rgba(203,166,92,0.55)",
          transform: "translate(-50%,-50%)",
          left: pos.dot.x,
          top: pos.dot.y,
          transition: "width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDragZone && (
          <span style={{
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: "#CBA65C",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}>
            DRAG
          </span>
        )}
      </div>
    </div>
  );
}
