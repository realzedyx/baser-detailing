"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ErrorToast } from "@/components/ui/error-toast";
import { supabase } from "@/lib/supabase";

// ─── Constants ───────────────────────────────────────────────────────────────

const GOLD = "#CBA65C";
const CHROME = "#E4C883";
const BG = "#0a0a0a";

const SERVICES = [
  {
    id: "exterior",
    label: "Exterior Detail",
    price: "from $129",
    duration: "1–2 hrs",
    highlights: ["Hand wash & dry", "Wheel & tyre clean", "Glass polish", "Trim dressed"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 18l3-6h14l3 6" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 18h24v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="8" cy="21" r="2" stroke={GOLD} strokeWidth="1.6"/>
        <circle cx="20" cy="21" r="2" stroke={GOLD} strokeWidth="1.6"/>
        <path d="M9 12l2-4h6l2 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "interior",
    label: "Interior Detail",
    price: "from $149",
    duration: "2–4 hrs",
    highlights: ["Deep vacuum", "Steam clean seats", "Dashboard & console", "Glass inside"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="22" height="14" rx="2" stroke={GOLD} strokeWidth="1.8"/>
        <path d="M3 14h22" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M9 14v8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M19 14v8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <path d="M8 8V6a2 2 0 012-2h8a2 2 0 012 2v2" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "full",
    label: "Full Detail",
    price: "from $219",
    duration: "4–6 hrs",
    highlights: ["Everything in both", "Paint decontamination", "Leather conditioning", "Engine bay"],
    popular: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3l2.5 5.5 6 .9-4.3 4.2 1 6-5.2-2.8L8.8 19.6l1-6L5.5 9.4l6-.9L14 3z" stroke={GOLD} strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="14" cy="12" r="2.5" fill={GOLD} fillOpacity="0.15" stroke={GOLD} strokeWidth="1.4"/>
      </svg>
    ),
  },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Service", "Schedule", "Details"];
  return (
    <div className="flex items-center justify-center gap-0 mb-14">
      {steps.map((label, i) => {
        const isComplete = i < step;
        const isActive = i === step;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  background: isActive
                    ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 100%)`
                    : isComplete
                    ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 100%)`
                    : "rgba(255,255,255,0.05)",
                  borderColor: isActive || isComplete ? GOLD : "rgba(255,255,255,0.1)",
                  boxShadow: isActive ? `0 0 20px rgba(203,166,92,0.4)` : "none",
                }}
                transition={{ duration: 0.4 }}
                className="w-9 h-9 rounded-full flex items-center justify-center border text-sm font-bold"
                style={{ border: "1.5px solid" }}
              >
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{ color: isActive ? "#0a0a0a" : "rgba(232,232,232,0.35)", fontSize: 13 }}>{i + 1}</span>
                )}
              </motion.div>
              <span
                className="text-[10px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap"
                style={{ color: isActive ? CHROME : isComplete ? GOLD : "rgba(232,232,232,0.25)" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-3 mb-5">
                <div
                  className="h-px w-16 sm:w-24"
                  style={{
                    background: isComplete
                      ? `linear-gradient(90deg, ${GOLD}, ${GOLD})`
                      : "rgba(255,255,255,0.08)",
                    transition: "background 0.4s",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: typeof SERVICES[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      className="relative w-full text-left rounded-2xl p-6 transition-all duration-300 focus:outline-none"
      style={{
        background: selected
          ? "linear-gradient(145deg, rgba(203,166,92,0.12) 0%, rgba(14,13,11,0.95) 100%)"
          : "linear-gradient(145deg, rgba(22,20,16,0.95) 0%, rgba(12,11,9,0.98) 100%)",
        border: selected
          ? `1.5px solid rgba(203,166,92,0.75)`
          : "1.5px solid rgba(255,255,255,0.07)",
        boxShadow: selected
          ? `0 0 0 1px rgba(203,166,92,0.12), 0 8px 40px rgba(203,166,92,0.15)`
          : "0 2px 20px rgba(0,0,0,0.4)",
      }}
    >
      {service.popular && (
        <div
          className="absolute -top-3 left-5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em]"
          style={{
            background: `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 100%)`,
            color: "#0a0a0a",
          }}
        >
          Most Popular
        </div>
      )}

      {/* Top accent line on selection */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute top-0 inset-x-6 h-[2px] rounded-b-full origin-left"
            style={{ background: `linear-gradient(90deg, ${GOLD}, ${CHROME})` }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: selected ? "rgba(203,166,92,0.12)" : "rgba(255,255,255,0.04)",
            border: selected ? `1px solid rgba(203,166,92,0.3)` : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {service.icon}
        </div>

        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${CHROME}, ${GOLD})` }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l2.5 2.5 5.5-5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </div>

      <h3
        className="text-lg font-bold tracking-tight mb-1"
        style={{ color: selected ? CHROME : "rgba(232,232,232,0.9)" }}
      >
        {service.label}
      </h3>

      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="text-2xl font-black tracking-tight"
          style={{ color: selected ? GOLD : "rgba(232,232,232,0.7)" }}
        >
          {service.price}
        </span>
        <span className="text-xs" style={{ color: "rgba(232,232,232,0.3)" }}>
          · {service.duration}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {service.highlights.map((h, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: selected ? GOLD : "rgba(232,232,232,0.2)" }}
            />
            <span
              className="text-[12px] leading-relaxed"
              style={{ color: selected ? "rgba(232,232,232,0.65)" : "rgba(232,232,232,0.35)" }}
            >
              {h}
            </span>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({
  selectedDate,
  onSelectDate,
  availability,
}: {
  selectedDate: string | null;
  onSelectDate: (d: string) => void;
  availability: Record<string, string>;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isPast = (d: number) =>
    new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStr = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const hasOpenDays = Object.values(availability).some(s => s === 'open');

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(18,16,12,0.98) 0%, rgba(10,10,10,0.99) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="rgba(232,232,232,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-sm font-bold tracking-[0.12em] uppercase" style={{ color: CHROME }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="rgba(232,232,232,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center py-1">
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "rgba(232,232,232,0.2)" }}>
              {d.slice(0, 1)}
            </span>
          </div>
        ))}
      </div>

      {/* Day chips */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map(d => {
          const past = isPast(d);
          const ds = dateStr(d);
          const sel = selectedDate === ds;
          const tod = isToday(d);
          const status = availability[ds];
          const isOpen = status === 'open';
          const isUnavailable = status === 'booked' || status === 'blocked';
          const disabled = past || isUnavailable || !isOpen;

          return (
            <button
              key={d}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(ds)}
              className="relative aspect-square flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-200 focus:outline-none"
              style={{
                color: disabled
                  ? "rgba(232,232,232,0.15)"
                  : sel
                  ? "#0a0a0a"
                  : isOpen
                  ? "rgba(74,222,128,0.9)"
                  : tod
                  ? CHROME
                  : "rgba(232,232,232,0.45)",
                background: sel
                  ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 100%)`
                  : isOpen && !sel
                  ? "rgba(34,197,94,0.1)"
                  : tod
                  ? "rgba(203,166,92,0.08)"
                  : "transparent",
                border: sel
                  ? "none"
                  : isOpen
                  ? "1px solid rgba(34,197,94,0.3)"
                  : isUnavailable
                  ? "1px solid rgba(239,68,68,0.12)"
                  : tod
                  ? `1px solid rgba(203,166,92,0.3)`
                  : "1px solid transparent",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: isUnavailable ? 0.35 : 1,
              }}
            >
              {d}
              {sel && (
                <motion.div
                  layoutId="cal-sel"
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: `0 0 14px rgba(203,166,92,0.4)` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "rgba(34,197,94,0.7)" }} />
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "rgba(232,232,232,0.3)" }}>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "rgba(232,232,232,0.15)" }} />
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "rgba(232,232,232,0.3)" }}>Unavailable</span>
        </div>
      </div>

      {/* No availability notice */}
      {!hasOpenDays && (
        <div
          className="mt-5 rounded-xl px-4 py-4 flex items-start gap-3"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="7" stroke="rgba(232,232,232,0.25)" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 11h.01" stroke="rgba(232,232,232,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <p className="text-[12px] font-semibold mb-1" style={{ color: "rgba(232,232,232,0.55)" }}>
              No online availability right now
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(232,232,232,0.3)" }}>
              Call or text{" "}
              <a href="tel:0410532042" className="underline underline-offset-2" style={{ color: GOLD }}>
                0410 532 042
              </a>{" "}
              to lock in a time directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Date confirmation ────────────────────────────────────────────────────────

function DateConfirmation({ selectedDate }: { selectedDate: string }) {
  const fmt = new Date(selectedDate + "T00:00:00");
  const label = fmt.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{
        background: "rgba(34,197,94,0.07)",
        border: "1px solid rgba(34,197,94,0.25)",
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7l3 3 6-6" stroke="rgba(74,222,128,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-0.5" style={{ color: "rgba(74,222,128,0.7)" }}>Date selected</p>
        <p className="text-sm font-bold" style={{ color: "rgba(232,232,232,0.8)" }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: "rgba(203,166,92,0.65)" }}>
        {label}{required && <span style={{ color: GOLD }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200 focus:ring-0"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "rgba(232,232,232,0.85)",
          caretColor: GOLD,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = "rgba(203,166,92,0.45)";
          e.currentTarget.style.background = "rgba(203,166,92,0.05)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
          e.currentTarget.style.background = "rgba(255,255,255,0.035)";
        }}
      />
    </div>
  );
}

// ─── Loyalty display ──────────────────────────────────────────────────────────

function LoyaltyBadge() {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-5 py-4"
      style={{
        background: "linear-gradient(135deg, rgba(203,166,92,0.07) 0%, rgba(10,10,10,0.5) 100%)",
        border: "1px solid rgba(203,166,92,0.18)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(203,166,92,0.12)", border: `1px solid rgba(203,166,92,0.3)` }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5l1.9 3.85 4.25.62-3.07 2.99.72 4.23L9 11.14l-3.79 1.99.72-4.23L2.85 5.97l4.25-.62L9 1.5z" fill={GOLD} fillOpacity="0.8"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5" style={{ color: "rgba(203,166,92,0.5)" }}>
          Loyalty Points
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black" style={{ color: CHROME }}>0</span>
          <span className="text-xs font-semibold" style={{ color: "rgba(232,232,232,0.3)" }}>pts</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-0.5" style={{ color: "rgba(203,166,92,0.4)" }}>
          Tier
        </p>
        <span
          className="text-xs font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
          style={{ background: "rgba(180,140,70,0.15)", color: GOLD, border: "1px solid rgba(203,166,92,0.25)" }}
        >
          Bronze
        </span>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, service }: { name: string; service: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 18 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{ background: `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 100%)` }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M7 18l7 7 15-14" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3"
      >
        Request sent.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48, duration: 0.5 }}
        className="text-sm leading-relaxed max-w-xs mb-8"
        style={{ color: "rgba(232,232,232,0.45)" }}
      >
        Thanks {name}. I&apos;ll come back to you shortly to confirm your {service.toLowerCase()}. The balance is payable on the day by card, PayID, or cash.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: GOLD }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to home
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function BookPageInner() {
  const searchParams = useSearchParams();
  const pkgParam = searchParams.get("package");
  const preselected = pkgParam && ["interior", "exterior", "full"].includes(pkgParam) ? pkgParam : null;

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(preselected);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('availability').select('date,status').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { date: string; status: string }) => { map[r.date] = r.status; });
        setAvailability(map);
      }
    });
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    suburb: "",
    carMake: "",
    carModel: "",
    notes: "",
  });

  const setField = useCallback((key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v })), []);

  const service = SERVICES.find(s => s.id === selectedService);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.carMake || !form.carModel) return;
    setSubmitting(true);
    setToastError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service?.label ?? selectedService,
          date: selectedDate ?? "TBD",
          time: null,
          ...form,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setToastError(err instanceof Error ? err.message : "Something went wrong. Please call instead.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh" }} className="flex items-center justify-center">
        <SuccessScreen name={form.name} service={service?.label ?? "detail"} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }} className="relative overflow-x-hidden">
      <ErrorToast message={toastError} onClose={() => setToastError(null)} />
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div style={{ background: "radial-gradient(ellipse 70% 50% at 20% 20%, rgba(203,166,92,0.055) 0%, transparent 60%)" }} className="absolute inset-0" />
        <div style={{ background: "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(228,200,131,0.035) 0%, transparent 55%)" }} className="absolute inset-0" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="transition-opacity group-hover:opacity-70">
            <path d="M14 4L7 11l7 7" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: "rgba(232,232,232,0.35)" }}>
            Baser Detailing
          </span>
        </Link>
        <a
          href="tel:0410532042"
          className="text-xs font-bold transition-opacity hover:opacity-70"
          style={{ color: GOLD }}
        >
          0410 532 042
        </a>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Page title */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] uppercase tracking-[0.32em] font-semibold mb-3"
            style={{ color: GOLD }}
          >
            Book a Detail
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white"
          >
            Let&apos;s get started.
          </motion.h1>
        </div>

        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          {/* ── Step 0: Service ── */}
          {step === 0 && (
            <motion.div
              key="step-service"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-sm font-semibold mb-6" style={{ color: "rgba(232,232,232,0.45)" }}>
                What are we doing today?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {SERVICES.map(svc => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    selected={selectedService === svc.id}
                    onSelect={() => setSelectedService(svc.id)}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <motion.button
                  disabled={!selectedService}
                  onClick={() => setStep(1)}
                  whileHover={selectedService ? { y: -2 } : {}}
                  whileTap={selectedService ? { scale: 0.97 } : {}}
                  className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300"
                  style={{
                    background: selectedService
                      ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`
                      : "rgba(255,255,255,0.05)",
                    color: selectedService ? "#0a0a0a" : "rgba(232,232,232,0.2)",
                    boxShadow: selectedService ? `0 8px 28px -4px rgba(203,166,92,0.35)` : "none",
                    cursor: selectedService ? "pointer" : "not-allowed",
                  }}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Schedule ── */}
          {step === 1 && (
            <motion.div
              key="step-schedule"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{ background: "rgba(203,166,92,0.1)", color: GOLD, border: `1px solid rgba(203,166,92,0.25)` }}
                >
                  {service?.label}
                </div>
                <span className="text-[11px]" style={{ color: "rgba(232,232,232,0.3)" }}>{service?.price}</span>
              </div>

              <p className="text-sm font-semibold mb-6" style={{ color: "rgba(232,232,232,0.45)" }}>
                Pick a day that works for you.
              </p>

              <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} availability={availability} />

              {selectedDate && <DateConfirmation selectedDate={selectedDate} />}

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setStep(0)}
                  className="text-sm font-semibold transition-opacity hover:opacity-70 flex items-center gap-2"
                  style={{ color: "rgba(232,232,232,0.35)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                <motion.button
                  onClick={() => {
                    if (!selectedDate) { setToastError("Please select a date to continue."); return; }
                    setStep(2);
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`,
                    color: "#0a0a0a",
                    boxShadow: `0 8px 28px -4px rgba(203,166,92,0.35)`,
                  }}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Summary pill */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <div
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{ background: "rgba(203,166,92,0.1)", color: GOLD, border: `1px solid rgba(203,166,92,0.25)` }}
                >
                  {service?.label}
                </div>
                {selectedDate && (
                  <div
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(232,232,232,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </div>
                )}
              </div>

              <p className="text-sm font-semibold mb-6" style={{ color: "rgba(232,232,232,0.45)" }}>
                Last step — a few details about you and the car.
              </p>

              <div
                className="rounded-2xl p-6 sm:p-8 mb-6"
                style={{
                  background: "linear-gradient(145deg, rgba(18,16,12,0.98) 0%, rgba(10,10,10,0.99) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <Field label="Full name" name="name" value={form.name} onChange={setField("name")} required placeholder="Yusuf Baser" />
                  <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={setField("phone")} required placeholder="0400 000 000" />
                </div>
                <div className="mb-5">
                  <Field label="Suburb" name="suburb" value={form.suburb} onChange={setField("suburb")} placeholder="Fitzroy, Richmond..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <Field label="Car make" name="carMake" value={form.carMake} onChange={setField("carMake")} required placeholder="Toyota" />
                  <Field label="Car model" name="carModel" value={form.carModel} onChange={setField("carModel")} required placeholder="Corolla" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: "rgba(203,166,92,0.65)" }}>
                    Anything I should know?
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setField("notes")(e.target.value)}
                    rows={3}
                    placeholder="Stubborn stains, pet hair, light scratches..."
                    className="w-full bg-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(232,232,232,0.85)",
                      caretColor: GOLD,
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "rgba(203,166,92,0.45)";
                      e.currentTarget.style.background = "rgba(203,166,92,0.05)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.035)";
                    }}
                  />
                </div>
              </div>

              <LoyaltyBadge />

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-semibold transition-opacity hover:opacity-70 flex items-center gap-2"
                  style={{ color: "rgba(232,232,232,0.35)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.phone || !form.carMake || !form.carModel}
                  whileHover={!submitting ? { y: -2 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300"
                  style={{
                    background: (!submitting && form.name && form.phone && form.carMake && form.carModel)
                      ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`
                      : "rgba(255,255,255,0.05)",
                    color: (!submitting && form.name && form.phone && form.carMake && form.carModel)
                      ? "#0a0a0a"
                      : "rgba(232,232,232,0.2)",
                    boxShadow: (!submitting && form.name && form.phone && form.carMake && form.carModel)
                      ? `0 8px 28px -4px rgba(203,166,92,0.35)`
                      : "none",
                    cursor: submitting ? "wait" : "pointer",
                  }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
                        <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Request this booking
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-center mt-6 text-[11px] leading-relaxed" style={{ color: "rgba(232,232,232,0.22)" }}>
                20% deposit secures your spot. I&apos;ll send my PayID once confirmed — balance paid on the day by PayID or cash.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom fade */}
      <div className="fixed bottom-0 inset-x-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.6), transparent)" }} />
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense>
      <BookPageInner />
    </Suspense>
  );
}
