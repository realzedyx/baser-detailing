// src/components/ui/cinematic-hero.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  /* Environment Overlays */
  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background: radial-gradient(ellipse at center, #0d0d0d 0%, #0a0a0a 100%);
  }

  /* -------------------------------------------------------------------
     PHYSICAL SKEUOMORPHIC MATERIALS (Restored 3D Depth)
  ---------------------------------------------------------------------- */

  /* OUTSIDE THE CARD: Theme-aware text (Shadow in Light Mode, Glow in Dark Mode) */
  .text-3d-matte {
      color: var(--color-foreground);
      text-shadow:
          0 10px 30px color-mix(in srgb, var(--color-foreground) 20%, transparent),
          0 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 40%, transparent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0); /* Hardware acceleration to prevent WebKit clipping bug */
      filter:
          drop-shadow(0px 10px 20px color-mix(in srgb, var(--color-foreground) 15%, transparent))
          drop-shadow(0px 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent));
  }

  /* INSIDE THE CARD: Hardcoded Silver/White for the dark background, deep rich shadows */
  .text-card-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter:
          drop-shadow(0px 12px 24px rgba(0,0,0,0.8))
          drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  /* Deep Physical Card with Dynamic Mouse Lighting */
  .premium-depth-card {
      background: linear-gradient(145deg, #1c1c1c 0%, #0a0a0a 100%);
      box-shadow:
          0 40px 100px -20px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.04);
      position: relative;
  }

  /* Scroll indicator */
  @keyframes scrollBounce {
      0%, 100% { transform: translateY(0) rotate(45deg); opacity: 0.7; }
      50%       { transform: translateY(7px) rotate(45deg); opacity: 0.25; }
  }
  .scroll-chevron {
      animation: scrollBounce 1.5s ease-in-out infinite;
  }
  .scroll-chevron:nth-child(2) {
      animation-delay: 0.22s;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
  }

  /* Realistic iPhone Mockup Hardware */
  .iphone-bezel {
      background-color: #111;
      box-shadow:
          inset 0 0 0 2px #52525B,
          inset 0 0 0 7px #000,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }

  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      box-shadow:
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.03);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255,255,255,0.2),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  /* Physical Tactile Buttons */
  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:active {
      transform: translateY(1px);
      background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1), inset 0 3px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.02);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:active {
      transform: translateY(1px);
      background: #18181B;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 3px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.5);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }

  /* Gold gradient text — for hero tagline accent line */
  .text-gold-gradient {
      background: linear-gradient(160deg, #E4C883 0%, #CBA65C 45%, #A8862E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      /* text-shadow traces glyph outlines — no bounding-box artifact */
      text-shadow:
          0 6px 20px rgba(203, 166, 92, 0.45),
          0 2px 8px rgba(203, 166, 92, 0.30);
  }
`;

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function CinematicHero({
  brandName = "Sobers",
  tagline1 = "Track the journey,",
  tagline2 = "not just the days.",
  cardHeading = "Accountability, redefined.",
  cardDescription = <><span className="text-white font-semibold">Sobers</span> empowers sponsors and sponsees in 12-step recovery programs with structured accountability, precise sobriety tracking, and beautiful visual timelines.</>,
  metricValue = 365,
  metricLabel = "Days Sober",
  ctaHref = "/signup",
  ctaLabel = "Create Account",
  className,
  ...props
}: CinematicHeroProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  // 1. Mockup 3D tilt — reads from root CursorTracker via custom event
  useEffect(() => {
    const onCursor = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (mockupRef.current) {
        const xVal = (x / window.innerWidth - 0.5) * 2;
        const yVal = (y / window.innerHeight - 0.5) * 2;
        gsap.to(mockupRef.current, {
          rotationY: xVal * 12,
          rotationX: -yVal * 12,
          ease: "power3.out",
          duration: 1.2,
        });
      }
    };

    document.addEventListener("cursormove", onCursor);
    return () => document.removeEventListener("cursormove", onCursor);
  }, []);

  // 2. Complex Cinematic Scroll Timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(-10px 100% -10px 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".brand-intro-letter", { autoAlpha: 0, y: 18, filter: "blur(6px)" });

      const introTl = gsap.timeline({ delay: 0.15 });
      introTl
        // Brand name letters stagger in
        .to(".brand-intro-letter", {
          autoAlpha: 1, y: 0, filter: "blur(0px)",
          duration: 0.45, stagger: 0.038, ease: "power3.out",
        })
        // Hold briefly, then dissolve
        .to(".brand-intro", { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "+=0.35")
        // Taglines roll in
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" }, "-=0.05")
        .to(".text-days", { duration: 1.4, clipPath: "inset(-10px 0% -10px 0)", ease: "power4.inOut" }, "-=1.0");

      if (isMobile) {
        // Mobile: no pin, no scrub. The card grows to fullscreen and pulls back on
        // desktop as a scroll-jacking transition — that reads as "broken" on touch
        // devices, so instead everything plays once, right after the intro finishes,
        // and settles at its resting size (already 92vw/92vh via the Tailwind classes).
        gsap.timeline({ delay: 2.0 })
          .to(".main-card", { y: 0, duration: 1.1, ease: "expo.out" }, 0)
          .to(".hero-text-wrapper", { autoAlpha: 0.15, filter: "blur(8px)", duration: 1, ease: "power2.inOut" }, 0)
          .fromTo(".mockup-scroll-wrapper",
            { y: 40, scale: 0.92, autoAlpha: 0 },
            { y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" }, 0.3
          )
          .fromTo(".phone-widget", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.7, ease: "power3.out" }, 0.5)
          .to(".progress-ring", { strokeDashoffset: 60, duration: 1.2, ease: "power3.inOut" }, 0.5)
          .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 1.2, ease: "expo.out" }, 0.5)
          .fromTo(".floating-badge", { y: 30, autoAlpha: 0, scale: 0.85 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.7, ease: "back.out(1.6)" }, 0.6)
          .fromTo(".card-left-text", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.7)
          .fromTo(".card-right-text", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.7)
          // Scroll hint fades on its own after a few seconds rather than being tied to scroll —
          // there's still more content below, so it stays up long enough to register.
          .to(".scroll-indicator", { autoAlpha: 0, y: 8, duration: 0.8, ease: "power2.in" }, 5.5);
      } else {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=2200",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        scrollTl
          .to(".scroll-indicator", { autoAlpha: 0, y: 12, duration: 0.6, ease: "power2.in" }, 0)
          .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
          .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
          .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
          .fromTo(".mockup-scroll-wrapper",
            { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
            { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
          )
          .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
          .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
          .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
          .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
          .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
          .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
          .to({}, { duration: 0.2 })
          .set(".hero-text-wrapper", { autoAlpha: 0 })
          .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
            scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 0.8, stagger: 0.04,
          })
          .to(".main-card", {
            width: "85vw",
            height: "85vh",
            borderRadius: "40px",
            ease: "expo.inOut",
            duration: 1.0
          }, "pullback")
          .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.0 })
          .to(containerRef.current, { autoAlpha: 0, duration: 0.6 }, "-=0.3");
      }

    }, containerRef);

    return () => ctx.revert();
  },[metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center bg-background text-foreground font-sans antialiased", className)}
      style={{ perspective: "1500px", zIndex: 20 }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

      {/* Brand name cinematic entrance — letter by letter, dissolves before taglines */}
      <div
        className="brand-intro absolute z-20 flex items-center justify-center pointer-events-none"
        style={{ inset: 0 }}
      >
        <p
          className="text-[11px] uppercase font-bold"
          style={{ letterSpacing: "0.45em", color: "#CBA65C" }}
        >
          {brandName.split("").map((char, i) => (
            <span
              key={i}
              className="brand-intro-letter inline-block"
              style={{ visibility: "hidden" }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </p>
      </div>

      {/* BACKGROUND LAYER: Hero Texts */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform transform-style-3d">
        <h1 className="text-track gsap-reveal text-3d-matte text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2 pb-4">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-gold-gradient text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter pb-6 px-8">
          {tagline2}
        </h1>
      </div>

      {/* Scroll indicator — bottom-24 on mobile clears the bottom tab bar (which is
         fixed bottom-0 z-50); reverts to bottom-10 once the navbar moves to the top at sm+ */}
      <div className="scroll-indicator absolute bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none select-none">
        <span className="text-[#E4C883]/50 text-[10px] uppercase tracking-[0.22em] font-semibold">Scroll</span>
        <div className="flex flex-col items-center">
          <div className="scroll-chevron w-[18px] h-[18px] border-r-2 border-b-2 border-[#CBA65C]/65 rotate-45" />
          <div className="scroll-chevron w-[18px] h-[18px] border-r-2 border-b-2 border-[#CBA65C]/35 rotate-45 -mt-[9px]" />
        </div>
      </div>

      {/* FOREGROUND LAYER: The Physical Deep Blue Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* DYNAMIC RESPONSIVE GRID: Flex-col on mobile to force order, Grid on desktop */}
          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* 1. TOP (Mobile) / RIGHT (Desktop): BRAND NAME */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-black tracking-tighter text-card-silver-matte lg:mt-0 pb-4">
                {brandName}
              </h2>
            </div>

            {/* 2. MIDDLE (Mobile) / CENTER (Desktop): IPHONE MOCKUP */}
            <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>

              {/* Inner wrapper for safe CSS scaling that doesn't conflict with GSAP */}
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-85 lg:scale-100">

                {/* The iPhone Bezel */}
                <div
                  ref={mockupRef}
                  className="relative w-[280px] h-[580px] rounded-[3rem] iphone-bezel flex flex-col will-change-transform transform-style-3d"
                >
                  {/* Physical Hardware Buttons */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                  {/* Inner Screen Container */}
                  <div className="absolute inset-[7px] bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island Notch */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                    </div>

                    {/* App Interface */}
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                      <div className="phone-widget flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Today</span>
                          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">Journey</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/5 text-neutral-200 flex items-center justify-center font-bold text-sm border border-white/10 shadow-lg shadow-black/50">JS</div>
                      </div>

                      <div className="phone-widget relative w-44 h-44 mx-auto flex items-center justify-center mb-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                          <circle className="progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#CBA65C" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="counter-val text-4xl font-extrabold tracking-tighter text-white">0</span>
                          <span className="text-[8px] text-[#E4C883]/60 uppercase tracking-[0.1em] font-bold mt-0.5">{metricLabel}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="phone-widget widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CBA65C]/20 to-[#CBA65C]/5 flex items-center justify-center mr-3 border border-[#CBA65C]/20 shadow-inner">
                            <svg className="w-4 h-4 text-[#CBA65C] drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-xs font-semibold leading-none mb-1">Regular</p>
                            <p className="text-[#E4C883]/60 text-[10px] font-medium">300 pts</p>
                          </div>
                        </div>
                        <div className="phone-widget widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E4C883]/20 to-[#E4C883]/5 flex items-center justify-center mr-3 border border-[#E4C883]/20 shadow-inner">
                            <svg className="w-4 h-4 text-[#E4C883] drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-xs font-semibold leading-none mb-1">VIP</p>
                            <p className="text-[#E4C883]/60 text-[10px] font-medium">1,000 pts</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badges */}
                <div className="floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-[#CBA65C]/20 to-[#CBA65C]/5 flex items-center justify-center border border-[#CBA65C]/30 shadow-inner">
                    <span className="text-base lg:text-xl drop-shadow-lg" aria-hidden="true">🎁</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">Earn Rewards!</p>
                    <p className="text-[#E4C883]/60 text-[10px] lg:text-xs font-medium">Book to earn points</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-[#E4C883]/20 to-[#E4C883]/5 flex items-center justify-center border border-[#E4C883]/30 shadow-inner">
                    <span className="text-base lg:text-lg drop-shadow-lg" aria-hidden="true">⭐</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">VIP Unlocked</p>
                    <p className="text-[#E4C883]/60 text-[10px] lg:text-xs font-medium">20% Off Next Detail!</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. BOTTOM (Mobile) / LEFT (Desktop): ACCOUNTABILITY TEXT */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight">
                {cardHeading}
              </h3>
              {/* HIDDEN ON MOBILE (added hidden md:block) */}
              <p className="hidden md:block text-[#E8E8E8]/70 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                {cardDescription}
              </p>
              <a
                href={ctaHref}
                className="hidden md:inline-flex self-center lg:self-start items-center gap-2.5 mt-6 rounded-xl px-6 py-3 text-sm font-semibold tracking-tight transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 group relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #E4C883 0%, #CBA65C 55%, #A8862E 100%)",
                  color: "#0a0a0a",
                  boxShadow: "0 0 0 1px rgba(203,166,92,0.4), 0 6px 20px -4px rgba(203,166,92,0.4)",
                }}
              >
                <span
                  className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-in-out pointer-events-none"
                  style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)" }}
                />
                {ctaLabel}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.8 }}>
                  <path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
