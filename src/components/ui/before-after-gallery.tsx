"use client";

import Image from "next/image";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, useMemo, useEffect } from "react";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

type Category = "exterior" | "interior";

type GalleryItem = {
  id: string;
  category: Category;
  caption: string;
  before: string;
  after: string;
};

const galleryItems: GalleryItem[] = [
  { id: "ext-1", category: "exterior", caption: "Full exterior deep detail", before: "/gallery/side-before.jpg", after: "/gallery/side-after.jpg" },
  { id: "ext-2", category: "exterior", caption: "Wheel & tyre deep clean", before: "/gallery/wheel-before.jpg", after: "/gallery/wheel-after.jpg" },
  { id: "ext-3", category: "exterior", caption: "Rear bumper & panel detail", before: "/gallery/rear-before.jpg", after: "/gallery/rear-after.jpg" },
  { id: "ext-4", category: "exterior", caption: "Front bumper & grille detail", before: "/gallery/bumper-before.jpg", after: "/gallery/bumper-after.jpg" },
  { id: "ext-5", category: "exterior", caption: "Wheel & tyre deep clean", before: "/gallery/wheel2-before.jpg", after: "/gallery/wheel2-after.jpg" },
  { id: "int-1", category: "interior", caption: "Carpet & footwell deep clean", before: "/gallery/interior-before.jpg", after: "/gallery/interior-after.jpg" },
  { id: "int-2", category: "interior", caption: "Pedal & footwell detail", before: "/gallery/footwell2-before.jpg", after: "/gallery/footwell2-after.jpg" },
  { id: "int-3", category: "interior", caption: "Rear seat & floor mat detail", before: "/gallery/rearcargo-before.jpg", after: "/gallery/rearcargo-after.jpg" },
  { id: "int-4", category: "interior", caption: "Full rear deep clean", before: "/gallery/rearbench-before.jpg", after: "/gallery/rearbench-after.jpg" },
];

const INITIAL_COUNT = 6;

const filters: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Exterior", value: "exterior" },
  { label: "Interior", value: "interior" },
];

// ─────────────────────────────────────────────
// Card — tap to toggle before/after (no drag, no per-card listeners
// at rest — avoids stacking horizontal-drag zones inside a vertically
// scrolling grid on mobile)
// ─────────────────────────────────────────────

function GalleryCard({
  item,
  index,
  isActive,
  dimmed,
  sectionInView,
  onSelect,
}: {
  item: GalleryItem;
  index: number;
  isActive: boolean;
  dimmed: boolean;
  sectionInView: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [showAfter, setShowAfter] = useState(false);

  // Reset to "before" once another card takes over as active, so the next
  // time this card is picked it starts fresh on "after".
  useEffect(() => {
    if (!isActive) setShowAfter(false);
  }, [isActive]);

  const handleClick = () => {
    if (isActive) {
      // Already the selected card — just flip its own before/after view,
      // without touching selection/dimming.
      setShowAfter((v) => !v);
    } else {
      onSelect();
      setShowAfter(true);
    }
  };

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 36, scale: 0.94, filter: "blur(10px)" }}
      animate={
        sectionInView
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, y: 36, scale: 0.94, filter: "blur(10px)" }
      }
      exit={{ opacity: 0, y: 0, scale: 0.96, filter: "blur(6px)" }}
      whileHover={reduceMotion ? undefined : { scale: 1.015 }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.6,
        delay: reduceMotion || !sectionInView ? 0 : Math.min(index, 5) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={handleClick}
      aria-pressed={showAfter}
      aria-label={`${item.caption} — showing ${showAfter ? "after" : "before"}, click to toggle`}
      className="group relative w-full overflow-hidden rounded-xl text-left"
      style={{
        aspectRatio: "4 / 3",
        border: showAfter ? "1px solid rgba(203,166,92,0.4)" : "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
      }}
    >
      <Image
        src={item.before}
        alt={`${item.caption} — before`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: showAfter ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.25, ease: "easeOut" }}
      >
        <Image
          src={item.after}
          alt={`${item.caption} — after`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Dim every card except the active one — always on, even at rest,
          so the active card reads as "brightened" the instant it's picked */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#000" }}
        animate={{ opacity: dimmed ? 0.65 : 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.3, ease: "easeOut" }}
      />

      {/* Category badge */}
      <span
        className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-md"
        style={{
          background: "rgba(10,10,10,0.75)",
          color: "rgba(232,232,232,0.65)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        {item.category}
      </span>

      {/* Before/After state pill */}
      <span
        className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-md"
        style={{
          background: "rgba(10,10,10,0.75)",
          color: showAfter ? "#CBA65C" : "rgba(232,232,232,0.55)",
          border: showAfter ? "1px solid rgba(203,166,92,0.3)" : "1px solid rgba(255,255,255,0.09)",
        }}
      >
        {showAfter ? "After" : "Before"}
      </span>

      {/* Compare affordance — centered so it reads as the card's main
          interaction, not a corner detail; hides as soon as this card
          becomes active and stays hidden even if toggled back to "before"
          — only reappears once a different card is selected */}
      {!isActive && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 group-hover:opacity-100"
          style={{ opacity: 0.92 }}
        >
          <span
            className="flex items-center gap-2 px-3.5 py-2 rounded-full"
            style={{
              background: "rgba(10,10,10,0.72)",
              border: "1px solid rgba(203,166,92,0.35)",
              backdropFilter: "blur(6px)",
            }}
          >
            <svg width="16" height="12" viewBox="0 0 22 14" fill="none">
              <path d="M7 7H1M1 7L4 4M1 7L4 10" stroke="#CBA65C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 7H21M21 7L18 4M21 7L18 10" stroke="#CBA65C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#CBA65C]">Tap to compare</span>
          </span>
        </div>
      )}

      {/* Caption */}
      <div
        className="absolute bottom-0 inset-x-0 px-3 py-2.5"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
      >
        <p className="text-[11px] font-medium text-[#E8E8E8]/85 leading-snug">{item.caption}</p>
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function BeforeAfterGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-25%" });
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => galleryItems.filter((item) => activeFilter === "all" || item.category === activeFilter),
    [activeFilter]
  );

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > visible.length;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", zIndex: 5 }}
    >
      {/* Section header */}
      <div className="relative z-10 text-center pt-16 pb-8 px-4">
        <motion.p
          initial={{ opacity: 0, y: 28, letterSpacing: "0.1em" }}
          animate={inView ? { opacity: 1, y: 0, letterSpacing: "0.28em" } : { opacity: 0, y: 28, letterSpacing: "0.1em" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#CBA65C] text-[10px] uppercase tracking-[0.28em] font-semibold mb-4"
        >
          Browse the work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 48, filter: "blur(14px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 48, filter: "blur(14px)" }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-[1.05]"
        >
          Every job, up close.
        </motion.h2>
      </div>

      {/* Filter pills */}
      <div className="relative z-10 flex items-center justify-center gap-2 pb-10 px-4" role="tablist" aria-label="Filter gallery by category">
        {filters.map((f, i) => {
          const active = activeFilter === f.value;
          return (
            <motion.button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={
                inView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 16, filter: "blur(6px)" }
              }
              transition={{ duration: 0.5, delay: inView ? 0.2 + i * 0.06 : 0, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setActiveFilter(f.value);
                setShowAll(false);
                setActiveId(null);
              }}
              className="px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.12em] transition-colors duration-200"
              style={{
                minHeight: 44,
                fontWeight: active ? 700 : 500,
                color: active ? "#0a0a0a" : "rgba(232,232,232,0.7)",
                background: active ? "linear-gradient(135deg, #CBA65C, #E4C883)" : "rgba(255,255,255,0.05)",
                border: active ? "1px solid rgba(203,166,92,0.6)" : "1px solid rgba(255,255,255,0.09)",
              }}
            >
              {f.label}
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={i}
                isActive={activeId === item.id}
                dimmed={activeId !== item.id}
                sectionInView={inView}
                onSelect={() => setActiveId(item.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Show more */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex justify-center pb-16"
        >
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="px-6 py-3 rounded-full text-xs uppercase tracking-[0.16em] font-semibold"
            style={{
              minHeight: 44,
              color: "#CBA65C",
              background: "rgba(203,166,92,0.08)",
              border: "1px solid rgba(203,166,92,0.3)",
            }}
          >
            Show more
          </button>
        </motion.div>
      )}

      {!hasMore && <div className="pb-16" />}

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
