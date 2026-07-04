"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/lib/supabase";
import { REWARDS } from "@/lib/rewards";
import { ADD_ONS } from "@/lib/addons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const PACKAGES = [
  {
    id: "interior",
    title: "Interior",
    tagline: "Deep-clean from front to boot.",
    price: "$149",
    featured: false,
    inclusions: [
      "Deep extraction: seats, carpets, mats & boot",
      "Stain removal treatment",
      "Dash, console & trims wiped and treated",
      "Cupholders & door pockets cleaned out",
      "Interior glass streak-free",
    ],
    addOns: ADD_ONS.interior,
  },
  {
    id: "exterior",
    title: "Exterior",
    tagline: "Showroom shine, head to toe.",
    price: "$129",
    featured: false,
    inclusions: [
      "Pre-wash foam & bug/grime removal",
      "Full wheel clean: faces, barrels & tyres dressed",
      "Hand dried with zero water spots",
      "Exterior glass streak-free",
    ],
    addOns: ADD_ONS.exterior,
  },
  {
    id: "full",
    title: "The Full Detail",
    tagline: "Inside out, front to back. Done right.",
    price: "$219",
    featured: true,
    badge: "Most Booked",
    save: "Save $59 vs booking separately",
    inclusions: [
      "Everything included in Interior",
      "Everything included in Exterior",
    ],
  },
] as const;

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

function useScrollVelocityTilt(maxTilt = 3.5) {
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let lastTime = Date.now();
    let velocity = 0;
    let rafId: number;

    const onScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      velocity = ((window.scrollY - lastY) / dt) * 14;
      lastY = window.scrollY;
      lastTime = now;
    };

    const tick = () => {
      velocity *= 0.84;
      const target = Math.max(-maxTilt, Math.min(maxTilt, velocity));
      setTilt((prev) => {
        const next = prev + (target - prev) * 0.14;
        return Math.abs(next) < 0.005 ? 0 : next;
      });
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [maxTilt]);

  return tilt;
}

// ─────────────────────────────────────────────
// Rewards Progress Tracker
// ─────────────────────────────────────────────

function RewardsTracker() {
  const router = useRouter();
  const [pts, setPts] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', data.session.user.id)
          .single();
        setPts(profile?.points ?? 0);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const current = pts ?? 0;
  const MAX = 1000;

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <p className="text-center text-[10px] uppercase tracking-[0.26em] font-semibold mb-6" style={{ color: "rgba(203,166,92,0.45)" }}>
        Rewards — $1 = 1 point
      </p>

      {/* Track */}
      <div className="relative px-2 mb-8">
        <div className="h-px rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(current / MAX) * 100}%`,
              background: "linear-gradient(90deg, #CBA65C, #E4C883)",
            }}
          />
        </div>

        {/* Milestone dots */}
        {REWARDS.map(r => {
          const pct = (r.pts / MAX) * 100;
          const earned = current >= r.pts;
          return (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: `calc(${pct}% + 0.5rem)`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: earned ? "#CBA65C" : "#111",
                  border: earned ? "1.5px solid #E4C883" : "1px solid rgba(255,255,255,0.12)",
                  boxShadow: earned
                    ? "0 0 14px rgba(203,166,92,0.8), 0 0 28px rgba(203,166,92,0.3)"
                    : "none",
                  transition: "all 0.5s",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between px-2">
        {REWARDS.map(r => {
          const earned = current >= r.pts;
          return (
            <div key={r.id} className="text-center" style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: earned ? "#CBA65C" : "rgba(255,255,255,0.2)",
                  letterSpacing: "0.06em",
                  transition: "color 0.3s",
                }}
              >
                {r.label}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 9, color: earned ? "rgba(203,166,92,0.5)" : "rgba(255,255,255,0.12)" }}>
                {r.perk}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>
                {r.pts} pts
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <p className="text-center mt-6 text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>
        {pts === null ? (
          <>
            Every $1 spent = 1 point toward free details.{" "}
            <button
              onClick={() => router.push('/signin')}
              style={{ color: "#CBA65C", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}
            >
              Sign in
            </button>
            {" "}to track yours
          </>
        ) : current >= MAX ? (
          "VIP Member ✦"
        ) : (
          `${MAX - current} pts to VIP`
        )}
      </p>
      <p className="text-center mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>
        Refer a friend — you both earn 50 bonus points once they sign up.
      </p>
    </div>
  );
}

export function PricingSection() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [cardSpots, setCardSpots] = useState<Record<string, { x: number; y: number } | null>>({});
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLParagraphElement>(null);
  const scrollTilt = useScrollVelocityTilt(3.5);

  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));

  const handleCardMouseMove = useCallback((pkgId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardSpots((prev) => ({
      ...prev,
      [pkgId]: {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      },
    }));
  }, []);

  const handleCardMouseLeave = useCallback((pkgId: string) => {
    setHoveredCard(null);
    setCardSpots((prev) => ({ ...prev, [pkgId]: null }));
  }, []);

  useEffect(() => {
    const els = [
      headerRef.current,
      bannerRef.current,
      ...cardRefs.current,
      footerRef.current,
    ].filter(Boolean) as HTMLElement[];

    gsap.set(els, { autoAlpha: 0, y: 80, filter: "blur(16px)" });

    const triggers: ScrollTrigger[] = [];

    const reveal = (el: HTMLElement, delay = 0) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 68%",
        onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.85, delay, ease: "power3.out" }),
        onLeaveBack: () => gsap.to(el, { autoAlpha: 0, y: 80, filter: "blur(16px)", duration: 0.5, ease: "power3.in" }),
      });
      triggers.push(st);
    };

    if (headerRef.current) reveal(headerRef.current);
    if (bannerRef.current) reveal(bannerRef.current, 0.08);
    cardRefs.current.forEach((el, i) => { if (el) reveal(el, i * 0.12); });
    if (footerRef.current) reveal(footerRef.current);

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section
      id="packages"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        paddingTop: "7rem",
        paddingBottom: "8rem",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CBA65C]/30 to-transparent" />

      {/* Ambient glow — center top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(203,166,92,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Fine grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundSize: "60px 60px",
          backgroundImage:
            "linear-gradient(to right, #CBA65C 1px, transparent 1px), linear-gradient(to bottom, #CBA65C 1px, transparent 1px)",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-14 md:mb-18">
          <p className="text-[#CBA65C] text-[10px] sm:text-xs uppercase tracking-[0.28em] font-semibold mb-4">
            Baser Detailing · Melbourne
          </p>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-[1.04]">
            Pick your level.
          </h2>

          <div
            className="mx-auto mt-5 w-16 h-[2px] rounded-full"
            style={{ background: "linear-gradient(90deg, #CBA65C, #E4C883)" }}
          />

          <p className="mt-6 text-[#E8E8E8]/50 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
            Tap a card to see exactly what&apos;s included.
          </p>
        </div>

        {/* Introductory pricing banner */}
        <div
          ref={bannerRef}
          className="relative max-w-2xl mx-auto mb-8 rounded-xl px-5 py-4 flex items-start gap-4 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(203,166,92,0.07) 0%, rgba(10,10,10,0.6) 100%)",
            border: "1px solid rgba(203,166,92,0.28)",
            boxShadow: "0 0 32px rgba(203,166,92,0.06), inset 0 1px 0 rgba(203,166,92,0.12)",
          }}
        >

          {/* Left accent bar */}
          <div
            className="shrink-0 w-[3px] self-stretch rounded-full"
            style={{ background: "linear-gradient(180deg, #E4C883, #CBA65C 60%, transparent)" }}
          />

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[#E4C883] text-sm font-bold tracking-tight leading-snug mb-1">
              Introductory pricing for friends &amp; family
            </p>
            <p className="text-[#E8E8E8]/50 text-xs sm:text-[13px] leading-relaxed">
              All current prices are discounted as an introductory offer for friends and family.
              Lock it in now. These rates won&apos;t last once the books fill up.
            </p>
          </div>

          {/* Limited offer pill */}
          <div className="shrink-0 self-start">
            <span
              className="inline-block text-[#0a0a0a] text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #E4C883 0%, #CBA65C 100%)",
              }}
            >
              Limited offer
            </span>
          </div>

          {/* Subtle shimmer overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(228,200,131,0.04) 50%, transparent 60%)",
            }}
          />
        </div>

        {/* Cards — perspective wrapper for scroll tilt */}
        <div style={{ perspective: "1100px", perspectiveOrigin: "50% 40%" }}>
          <div
            className="flex flex-col gap-4 max-w-2xl mx-auto"
            style={{
              transform: `rotateX(${scrollTilt * -0.45}deg)`,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
          {PACKAGES.map((pkg, i) => {
            const isOpen = open === pkg.id;
            const spot = cardSpots[pkg.id] ?? null;
            const addOns = (pkg as { addOns?: { id: string; name: string; price: number }[] }).addOns;

            return (
              <div
                key={pkg.id}
                ref={(el) => { cardRefs.current[i] = el; }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
                  onClick={() => toggle(pkg.id)}
                  onMouseEnter={() => setHoveredCard(pkg.id)}
                  onMouseMove={(e) => handleCardMouseMove(pkg.id, e)}
                  onMouseLeave={() => handleCardMouseLeave(pkg.id)}
                  style={{
                    background:
                      pkg.featured
                        ? "linear-gradient(160deg, #1a1608 0%, #0d0d0d 60%)"
                        : "linear-gradient(160deg, #161616 0%, #0d0d0d 60%)",
                    border: hoveredCard === pkg.id
                      ? pkg.featured
                        ? "1.5px solid rgba(203,166,92,0.95)"
                        : "1px solid rgba(203,166,92,0.55)"
                      : pkg.featured
                      ? "1.5px solid rgba(203,166,92,0.6)"
                      : isOpen
                      ? "1px solid rgba(203,166,92,0.22)"
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: hoveredCard === pkg.id
                      ? pkg.featured
                        ? "0 0 72px rgba(203,166,92,0.22), 0 4px 24px rgba(0,0,0,0.6)"
                        : "0 0 40px rgba(203,166,92,0.10), 0 4px 24px rgba(0,0,0,0.5)"
                      : pkg.featured
                      ? "0 0 48px rgba(203,166,92,0.10), 0 2px 16px rgba(0,0,0,0.5)"
                      : "0 2px 16px rgba(0,0,0,0.4)",
                    transition: "border-color 0.3s ease, box-shadow 0.35s ease",
                  }}
                >
                  {/* Featured card glow overlay */}
                  {pkg.featured && (
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 0%, rgba(203,166,92,0.10) 0%, transparent 65%)",
                      }}
                    />
                  )}

                  {/* Cursor spotlight */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                      opacity: hoveredCard === pkg.id && spot ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      background: spot
                        ? `radial-gradient(circle 210px at ${spot.x}% ${spot.y}%, rgba(203,166,92,0.17) 0%, transparent 72%)`
                        : "none",
                    }}
                  />

                  {/* Badge */}
                  {pkg.featured && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 z-10">
                      <div
                        className="text-[#0a0a0a] text-[10px] font-bold uppercase tracking-[0.18em] px-4 py-1 rounded-b-lg whitespace-nowrap"
                        style={{
                          background: "linear-gradient(135deg, #E4C883 0%, #CBA65C 100%)",
                        }}
                      >
                        {pkg.badge}
                      </div>
                    </div>
                  )}

                  {/* Collapsed header — always visible */}
                  <div
                    className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6"
                    style={{ paddingTop: pkg.featured ? "1.75rem" : undefined }}
                  >
                    {/* Left: title + prompt */}
                    <div>
                      <div className="flex items-baseline gap-3">
                        <h3
                          className="font-bold tracking-tight text-lg sm:text-xl leading-none"
                          style={{ color: pkg.featured ? "#E4C883" : "#ffffff" }}
                        >
                          {pkg.title}
                        </h3>
                        <span className="text-[#E8E8E8]/35 text-xs hidden sm:inline">
                          {pkg.tagline}
                        </span>
                      </div>
                      {/* Mobile tagline */}
                      <p className="sm:hidden text-[#E8E8E8]/35 text-xs mt-1">{pkg.tagline}</p>

                      {/* Prompt */}
                      <AnimatePresence initial={false}>
                        {!isOpen && (
                          <motion.p
                            key="prompt"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-[#CBA65C] text-xs mt-2 font-medium"
                            style={{ overflow: "hidden" }}
                          >
                            See what&apos;s included ↓
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Right: price + chevron */}
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[#E8E8E8]/40 text-[10px] uppercase tracking-widest block">
                          from
                        </span>
                        <motion.span
                          className="text-2xl sm:text-3xl font-black tracking-tight leading-none inline-block"
                          animate={{ scale: hoveredCard === pkg.id ? 1.1 : 1 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          style={{ color: pkg.featured ? "#E4C883" : "#ffffff" }}
                        >
                          {pkg.price}
                        </motion.span>
                        {(pkg as { save?: string }).save && (
                          <span className="block text-[10px] font-semibold mt-1 whitespace-nowrap" style={{ color: "#E4C883" }}>
                            {(pkg as { save?: string }).save}
                          </span>
                        )}
                      </div>

                      {/* Chevron */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: pkg.featured
                            ? "rgba(203,166,92,0.12)"
                            : "rgba(255,255,255,0.05)",
                          border: pkg.featured
                            ? "1px solid rgba(203,166,92,0.3)"
                            : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          style={{ color: pkg.featured ? "#CBA65C" : "rgba(255,255,255,0.5)" }}
                        >
                          <path
                            d="M2.5 5L7 9.5L11.5 5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        {/* Divider */}
                        <div
                          className="mx-6 sm:mx-8 h-px"
                          style={{
                            background: pkg.featured
                              ? "linear-gradient(90deg, transparent, rgba(203,166,92,0.3), transparent)"
                              : "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                          }}
                        />

                        <div className="relative z-10 px-6 sm:px-8 pt-5 pb-7">
                          {/* Inclusions list */}
                          <ul className="space-y-3 mb-7">
                            {pkg.inclusions.map((item, j) => (
                              <motion.li
                                key={item}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: j * 0.06,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="flex items-start gap-3"
                              >
                                <span
                                  className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                                  style={{
                                    background: pkg.featured
                                      ? "rgba(203,166,92,0.15)"
                                      : "rgba(255,255,255,0.06)",
                                    border: pkg.featured
                                      ? "1px solid rgba(203,166,92,0.4)"
                                      : "1px solid rgba(255,255,255,0.12)",
                                  }}
                                >
                                  <Check
                                    size={10}
                                    strokeWidth={2.5}
                                    style={{ color: pkg.featured ? "#CBA65C" : "#E8E8E8" }}
                                  />
                                </span>
                                <span className="text-sm leading-snug" style={{ color: "rgba(232,232,232,0.72)" }}>
                                  {item}
                                </span>
                              </motion.li>
                            ))}
                          </ul>

                          {/* Add-ons — extras available on top of the included items */}
                          {addOns && addOns.length > 0 && (
                            <div className="mb-7">
                              <p
                                className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3"
                                style={{ color: "rgba(203,166,92,0.55)" }}
                              >
                                Add-ons available
                              </p>
                              <ul className="space-y-3">
                                {addOns.map((addon, j) => (
                                  <motion.li
                                    key={addon.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      delay: (pkg.inclusions.length + j) * 0.06,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="flex items-center justify-between gap-3"
                                  >
                                    <span className="flex items-center gap-3">
                                      <span
                                        className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(203,166,92,0.4)" }}
                                      >
                                        <Plus size={10} strokeWidth={2.5} style={{ color: "#CBA65C" }} />
                                      </span>
                                      <span className="text-sm leading-snug" style={{ color: "rgba(232,232,232,0.72)" }}>
                                        {addon.name}
                                      </span>
                                    </span>
                                    <span className="text-xs font-semibold shrink-0" style={{ color: "#CBA65C" }}>
                                      +${addon.price}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Book button */}
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: (pkg.inclusions.length + (addOns?.length ?? 0)) * 0.06 + 0.05 }}
                            onClick={(e) => { e.stopPropagation(); router.push(`/book?package=${pkg.id}`); }}
                            className="group relative inline-flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 font-semibold text-sm overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            style={
                              pkg.featured
                                ? {
                                    background:
                                      "linear-gradient(135deg, #E4C883 0%, #CBA65C 55%, #A8862E 100%)",
                                    color: "#0a0a0a",
                                    boxShadow:
                                      "0 0 0 1px rgba(203,166,92,0.4), 0 6px 20px -4px rgba(203,166,92,0.4)",
                                  }
                                : {
                                    background: "rgba(203,166,92,0.08)",
                                    color: "#CBA65C",
                                    border: "1px solid rgba(203,166,92,0.3)",
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                                  }
                            }
                          >
                            {/* Shimmer for featured */}
                            {pkg.featured && (
                              <span
                                className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-in-out pointer-events-none"
                                style={{
                                  background:
                                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
                                }}
                              />
                            )}
                            Book the {pkg.title}
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              style={{ opacity: 0.8 }}
                            >
                              <path
                                d="M3 7.5H12M12 7.5L8.5 4M12 7.5L8.5 11"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
          </div>{/* end flex col */}
        </div>{/* end perspective */}

        {/* Footer note */}
        <p
          ref={footerRef}
          className="text-center mt-10 text-[#E8E8E8]/45 text-xs tracking-wide"
        >
          Prices shown are for sedans &amp; small cars · SUVs, 4WDs &amp; vans a little more · Free quote anytime
        </p>

        {/* Guarantee — reduce purchase anxiety right where the decision happens */}
        <p className="text-center mt-3 text-xs tracking-wide" style={{ color: "rgba(203,166,92,0.7)" }}>
          Not happy with a spot in your car? Tell me before I leave and I&rsquo;ll fix it free.
        </p>

        {/* Rewards progress tracker */}
        <RewardsTracker />
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
