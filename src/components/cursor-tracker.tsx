"use client";

import { useState, useEffect, useRef } from "react";

export function CursorTracker() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const dotPosition = useRef({ x: 0, y: 0 });
  const borderPosition = useRef({ x: 0, y: 0 });
  const [renderPos, setRenderPos] = useState({ dot: { x: 0, y: 0 }, border: { x: 0, y: 0 } });
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);

  const DOT_SMOOTHNESS = 0.2;
  const BORDER_SMOOTHNESS = 0.1;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      const root = document.documentElement;
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
      document.dispatchEvent(
        new CustomEvent("cursormove", { detail: { x: e.clientX, y: e.clientY } })
      );
    };

    const onEnter = () => setIsHovering(true);
    const onLeave = () => setIsHovering(false);

    document.addEventListener("mousemove", onMove, { passive: true });

    const interactive = document.querySelectorAll("a, button, img, input, textarea, select");
    interactive.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const animate = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      dotPosition.current.x = lerp(dotPosition.current.x, mousePosition.current.x, DOT_SMOOTHNESS);
      dotPosition.current.y = lerp(dotPosition.current.y, mousePosition.current.y, DOT_SMOOTHNESS);
      borderPosition.current.x = lerp(borderPosition.current.x, mousePosition.current.x, BORDER_SMOOTHNESS);
      borderPosition.current.y = lerp(borderPosition.current.y, mousePosition.current.y, BORDER_SMOOTHNESS);
      setRenderPos({
        dot: { x: dotPosition.current.x, y: dotPosition.current.y },
        border: { x: borderPosition.current.x, y: borderPosition.current.y },
      });
      rafId = requestAnimationFrame(animate);
    };

    setMounted(true);
    let rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      interactive.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: 8,
          height: 8,
          transform: "translate(-50%, -50%)",
          left: renderPos.dot.x,
          top: renderPos.dot.y,
        }}
      />
      <div
        className="absolute rounded-full border border-white/70"
        style={{
          width: isHovering ? 44 : 28,
          height: isHovering ? 44 : 28,
          transform: "translate(-50%, -50%)",
          left: renderPos.border.x,
          top: renderPos.border.y,
          transition: "width 0.3s, height 0.3s",
        }}
      />
    </div>
  );
}
