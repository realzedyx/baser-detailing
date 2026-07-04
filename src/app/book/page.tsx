"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ErrorToast } from "@/components/ui/error-toast";
import { supabase } from "@/lib/supabase";
import { REWARDS, SERVICE_PRICE, type Reward } from "@/lib/rewards";
import { getAddOnsForService } from "@/lib/addons";

// ─── Constants ───────────────────────────────────────────────────────────────

const GOLD = "#CBA65C";
const CHROME = "#E4C883";
const BG = "#0a0a0a";
const BOOKING_DRAFT_KEY = "baser-booking-draft";
const MIN_LEAD_DAYS = 2;

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

const TIME_SLOTS = [
  { label: "9 AM",  value: "9:00 AM",  hour: 9  },
  { label: "10 AM", value: "10:00 AM", hour: 10 },
  { label: "11 AM", value: "11:00 AM", hour: 11 },
  { label: "12 PM", value: "12:00 PM", hour: 12 },
  { label: "1 PM",  value: "1:00 PM",  hour: 13 },
  { label: "2 PM",  value: "2:00 PM",  hour: 14 },
  { label: "3 PM",  value: "3:00 PM",  hour: 15 },
  { label: "4 PM",  value: "4:00 PM",  hour: 16 },
];

const SERVICE_CUTOFFS: Record<string, { maxHour: number; reason: string }> = {
  exterior: { maxHour: 16, reason: "Exterior detail takes up to 2 hrs" },
  interior: { maxHour: 14, reason: "Interior detail takes up to 4 hrs" },
  full:     { maxHour: 12, reason: "Full detail takes up to 6 hrs" },
};

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
          Most Booked
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
  maxWeeks = 4,
}: {
  selectedDate: string | null;
  onSelectDate: (d: string) => void;
  availability: Record<string, string>;
  maxWeeks?: number;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [windowMsg, setWindowMsg] = useState(false);

  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxWeeks * 7);
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    if (nextY > maxYear || (nextY === maxYear && nextM > maxMonth)) {
      setWindowMsg(true);
      setTimeout(() => setWindowMsg(false), 3000);
      return;
    }
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  // Bookings must be made at least MIN_LEAD_DAYS ahead — same-day and next-day
  // slots don't give enough notice to schedule a detailer.
  const isPast = (d: number) =>
    new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate() + MIN_LEAD_DAYS);
  const isBeyondWindow = (d: number) =>
    new Date(viewYear, viewMonth, d) > maxDate;
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

      {/* Booking window message */}
      {windowMsg && (
        <p className="text-center text-[11px] mb-3" style={{ color: 'rgba(203,166,92,0.8)' }}>
          Bookings are only available up to {maxWeeks} {maxWeeks === 1 ? 'week' : 'weeks'} ahead
        </p>
      )}

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
          const beyond = isBeyondWindow(d);
          const ds = dateStr(d);
          const sel = selectedDate === ds;
          const tod = isToday(d);
          const status = availability[ds];
          // A date only reads as "open" (green) if it's actually bookable —
          // marked open in the DB AND not inside the minimum lead-time window.
          const isOpen = status === 'open' && !past;
          const isUnavailable = status === 'booked' || status === 'blocked';
          const disabled = past || beyond || isUnavailable || !isOpen;

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

// ─── Time slots ───────────────────────────────────────────────────────────────

function TimeSlots({
  selectedService,
  selectedTime,
  onSelectTime,
}: {
  selectedService: string;
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
}) {
  const cutoff = SERVICE_CUTOFFS[selectedService] ?? SERVICE_CUTOFFS.exterior;
  const hasBlocked = TIME_SLOTS.some(s => s.hour > cutoff.maxHour);
  const cutoffLabel = TIME_SLOTS.find(s => s.hour === cutoff.maxHour)?.label ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5"
    >
      <p className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-3" style={{ color: "rgba(203,166,92,0.65)" }}>
        Preferred start time
      </p>
      <div className="grid grid-cols-4 gap-2">
        {TIME_SLOTS.map(slot => {
          const isBlocked = slot.hour > cutoff.maxHour;
          const isSel = selectedTime === slot.value;
          return (
            <div key={slot.value} className="relative group">
              <button
                onClick={() => !isBlocked && onSelectTime(slot.value)}
                disabled={isBlocked}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 focus:outline-none"
                style={{
                  background: isSel
                    ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 100%)`
                    : isBlocked
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.05)",
                  color: isSel
                    ? "#0a0a0a"
                    : isBlocked
                    ? "rgba(232,232,232,0.18)"
                    : "rgba(232,232,232,0.65)",
                  border: isSel
                    ? "none"
                    : isBlocked
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "1px solid rgba(255,255,255,0.08)",
                  cursor: isBlocked ? "not-allowed" : "pointer",
                  boxShadow: isSel ? `0 4px 20px rgba(203,166,92,0.3)` : "none",
                }}
              >
                {slot.label}
              </button>
              {isBlocked && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-[11px] font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10"
                  style={{
                    background: "rgba(14,12,9,0.97)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(232,232,232,0.6)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                  }}
                >
                  {cutoff.reason} — may exceed 6pm
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hasBlocked && (
        <div className="mt-3 flex items-start gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 mt-0.5">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(203,166,92,0.4)" strokeWidth="1.2"/>
            <path d="M6.5 4.5v2.5M6.5 9h.01" stroke="rgba(203,166,92,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(232,232,232,0.3)" }}>
            <span style={{ color: "rgba(203,166,92,0.6)" }}>{cutoff.reason}</span> — starts after {cutoffLabel} risk finishing past 6pm and aren&apos;t available online.
          </p>
        </div>
      )}
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
  inputMode,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
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
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="w-full bg-transparent rounded-xl px-4 py-3 text-base sm:text-sm font-medium outline-none transition-all duration-200 focus:ring-0 placeholder:text-white/20"
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

// ─── Rewards bar ─────────────────────────────────────────────────────────────

function RewardsBar({
  points,
  selectedService,
  selectedAddOnIds,
  appliedReward,
  onApply,
  locked,
}: {
  points: number | null;
  selectedService: string | null;
  selectedAddOnIds: string[];
  appliedReward: string | null;
  onApply: (id: string | null) => void;
  locked: boolean;
}) {
  const [err, setErr] = useState<string | null>(null);
  const pts = points ?? 0;
  const MAX = 1000;
  const applied = appliedReward ? REWARDS.find(r => r.id === appliedReward) ?? null : null;
  const basePrice = selectedService ? (SERVICE_PRICE[selectedService] ?? 0) : 0;
  const selectedAddOns = getAddOnsForService(selectedService ?? "").filter(a => selectedAddOnIds.includes(a.id));
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  // Reward discount applies to the base package price only, not add-ons.
  const discountedBase = applied ? Math.round(basePrice * (1 - applied.discount)) : basePrice;
  const originalPrice = basePrice + addOnsTotal;
  const discountedPrice = discountedBase + addOnsTotal;

  const handleApply = (r: Reward) => {
    if (locked) return;
    if (appliedReward === r.id) { onApply(null); setErr(null); return; }
    if (r.services && selectedService && !r.services.includes(selectedService)) {
      const names = r.services.map(s => SERVICES.find(sv => sv.id === s)?.label ?? s).join(' or ');
      setErr(`This reward is only valid for: ${names}`);
      return;
    }
    setErr(null);
    onApply(r.id);
  };

  return (
    <div
      className="rounded-2xl p-5 mt-5"
      style={{
        background: "linear-gradient(145deg, rgba(18,16,12,0.98) 0%, rgba(10,10,10,0.99) 100%)",
        border: locked
          ? "1px solid rgba(239,68,68,0.18)"
          : "1px solid rgba(203,166,92,0.18)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: "rgba(203,166,92,0.65)", margin: 0 }}>
          Rewards
        </p>
        {points !== null && (
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{pts} pts</span>
        )}
      </div>

      {locked ? (
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(239,68,68,0.6)", margin: 0 }}>
          You already have a reward applied to a pending booking. Complete or cancel it before using another.
        </p>
      ) : points === null ? (
        <div>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)", margin: "0 0 14px" }}>
            Earn 1 point per $1 spent. Unlock rewards at 300, 500 &amp; 1000 points.
          </p>
          <Link
            href="/signin"
            className="inline-block text-[11px] font-semibold px-4 py-2 rounded-lg"
            style={{
              background: "rgba(203,166,92,0.08)",
              border: "1px solid rgba(203,166,92,0.25)",
              color: GOLD,
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            Sign in to use rewards →
          </Link>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="relative mb-6" style={{ paddingBottom: 4 }}>
            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((pts / MAX) * 100, 100)}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: `linear-gradient(90deg, ${GOLD}, ${CHROME})` }}
              />
            </div>
            {REWARDS.map(r => {
              const pct = (r.pts / MAX) * 100;
              const earned = pts >= r.pts;
              return (
                <div
                  key={r.id}
                  style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
                >
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: earned ? GOLD : "#111",
                    border: earned ? `1px solid ${CHROME}` : "1px solid rgba(255,255,255,0.12)",
                    boxShadow: earned ? `0 0 10px rgba(203,166,92,0.7)` : "none",
                    transition: "all 0.4s",
                  }} />
                </div>
              );
            })}
          </div>

          {/* Reward rows */}
          <div className="flex flex-col gap-2 mb-2">
            {REWARDS.map(r => {
              const eligible = pts >= r.pts;
              const isApplied = appliedReward === r.id;
              return (
                <motion.button
                  key={r.id}
                  onClick={() => eligible && handleApply(r)}
                  disabled={!eligible}
                  whileHover={eligible ? { x: 2 } : {}}
                  whileTap={eligible ? { scale: 0.98 } : {}}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left focus:outline-none"
                  style={{
                    background: isApplied ? "rgba(203,166,92,0.1)" : eligible ? "rgba(255,255,255,0.03)" : "transparent",
                    border: isApplied ? `1px solid rgba(203,166,92,0.4)` : eligible ? "1px solid rgba(203,166,92,0.18)" : "1px solid rgba(255,255,255,0.04)",
                    boxShadow: eligible && !isApplied ? "0 0 20px rgba(203,166,92,0.07)" : "none",
                    cursor: eligible ? "pointer" : "default",
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold" style={{ color: eligible ? GOLD : "rgba(255,255,255,0.18)", letterSpacing: "0.06em" }}>
                      {r.label}
                    </span>
                    <span className="text-[11px]" style={{ color: eligible ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)" }}>
                      {r.perk}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px]" style={{ color: eligible ? "rgba(203,166,92,0.5)" : "rgba(255,255,255,0.12)", letterSpacing: "0.06em" }}>
                      {r.pts} pts
                    </span>
                    {eligible && !isApplied && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md" style={{ color: GOLD, background: "rgba(203,166,92,0.1)", border: "1px solid rgba(203,166,92,0.25)" }}>
                        Apply
                      </span>
                    )}
                    {isApplied && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md" style={{ color: "#0a0a0a", background: GOLD }}>
                        ✓ On
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Price breakdown — shows the running total once a service is picked */}
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mt-3"
              style={{ background: "rgba(203,166,92,0.05)", border: "1px solid rgba(203,166,92,0.2)" }}
            >
              {applied && (
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(203,166,92,0.6)", margin: "0 0 8px" }}>
                  {applied.perk}
                </p>
              )}
              {selectedAddOns.length > 0 && (
                <ul className="mb-3 space-y-1">
                  {selectedAddOns.map(a => (
                    <li key={a.id} className="flex items-center justify-between text-[11px]" style={{ color: "rgba(232,232,232,0.5)" }}>
                      <span>{a.name}</span>
                      <span>+${a.price}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-baseline gap-3">
                {applied && (
                  <span className="text-xl" style={{ textDecoration: "line-through", color: "rgba(255,255,255,0.25)" }}>
                    from ${originalPrice}
                  </span>
                )}
                <span className="text-3xl font-black" style={{ color: GOLD }}>from ${discountedPrice}</span>
                {applied && (
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>with {applied.label} reward</span>
                )}
              </div>
              {points !== null && (
                <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  This booking will contribute <span style={{ color: GOLD, fontWeight: 600 }}>{discountedPrice} points</span> toward your rewards balance.
                </p>
              )}
            </motion.div>
          )}

          {err && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] mt-3"
              style={{ color: "rgba(239,68,68,0.7)", margin: "8px 0 0" }}
            >
              {err}
            </motion.p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function AuthPromptModal({ open, onClose, onGuest, onCreateAccount }: { open: boolean; onClose: () => void; onGuest: () => void; onCreateAccount: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl p-7 sm:p-8"
            style={{
              background: "linear-gradient(145deg, rgba(26,24,20,0.98) 0%, rgba(14,13,11,0.98) 100%)",
              border: "1px solid rgba(203,166,92,0.18)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.55)",
            }}
          >
            <div
              className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />
            <h3 className="text-white text-xl font-bold tracking-tight mb-2">
              Want to earn rewards on this booking?
            </h3>
            <p className="text-[#E8E8E8]/50 text-sm leading-relaxed mb-7">
              Create a free account to collect points toward your next detail — or continue without one.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/signup?from=booking"
                onClick={onCreateAccount}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-sm text-center"
                style={{
                  background: `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`,
                  color: "#0a0a0a",
                }}
              >
                Create free account
              </Link>
              <button
                onClick={onGuest}
                className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors duration-200"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(232,232,232,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Continue as guest
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
  // A referral link (/book?ref=Name) records who referred this booking so the
  // owner can credit both accounts when the first detail is completed.
  const refParam = (searchParams.get("ref") || "").trim().slice(0, 60);

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(preselected);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [availability, setAvailability] = useState<Record<string, string>>({});
  const [bookingWindowWeeks, setBookingWindowWeeks] = useState(4);

  // Rewards state
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rewardLocked, setRewardLocked] = useState(false);
  const [appliedReward, setAppliedReward] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    suburb: "",
    carMake: "",
    carModel: "",
    carYear: "",
    carColour: "",
    notes: "",
  });

  const setField = useCallback((key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v })), []);

  useEffect(() => {
    supabase.from('availability').select('date,status').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { date: string; status: string }) => { map[r.date] = r.status; });
        setAvailability(map);
      }
    });
    supabase.from('settings').select('value').eq('key', 'booking_window_weeks').single()
      .then(({ data }) => { if (data?.value) setBookingWindowWeeks(parseInt(data.value, 10) || 4); });

    // Load auth + rewards
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      const { data: profile } = await supabase.from('profiles').select('points').eq('id', session.user.id).single();
      setUserPoints(profile?.points ?? 0);

      // Autofill contact + car details for signed-in members (only fields they leave blank)
      const meta = session.user.user_metadata ?? {};
      const { data: savedCar } = await supabase
        .from('cars')
        .select('make,model,year,colour')
        .eq('owner_id', session.user.id)
        .maybeSingle();
      setForm(f => ({
        ...f,
        name: f.name || meta.full_name || '',
        phone: f.phone || meta.phone || '',
        suburb: f.suburb || meta.suburb || '',
        carMake: f.carMake || savedCar?.make || '',
        carModel: f.carModel || savedCar?.model || '',
        carYear: f.carYear || (savedCar?.year ? String(savedCar.year) : ''),
        carColour: f.carColour || savedCar?.colour || '',
      }));

      // Check if a reward is already locked in a pending/confirmed booking
      const { data: active } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', session.user.id)
        .in('status', ['pending', 'confirmed'])
        .not('reward_applied', 'is', null)
        .limit(1);
      if (active && active.length > 0) setRewardLocked(true);
    });

    // Restore an in-progress booking after a signup detour (see AuthPromptModal's onCreateAccount)
    const draftRaw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (draftRaw) {
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
      try {
        const draft = JSON.parse(draftRaw);
        if (draft.selectedService) setSelectedService(draft.selectedService);
        if (draft.selectedDate) setSelectedDate(draft.selectedDate);
        if (draft.selectedTime) setSelectedTime(draft.selectedTime);
        if (Array.isArray(draft.selectedAddOns)) setSelectedAddOns(draft.selectedAddOns);
        if (draft.form) setForm(f => ({ ...f, ...draft.form }));
        if (typeof draft.step === "number") setStep(draft.step);
      } catch {
        // ignore malformed draft
      }
    }
  }, []);

  const service = SERVICES.find(s => s.id === selectedService);

  // Reset time if it becomes blocked when service changes
  useEffect(() => {
    if (!selectedTime || !selectedService) return;
    const cutoff = SERVICE_CUTOFFS[selectedService];
    const slot = TIME_SLOTS.find(s => s.value === selectedTime);
    if (slot && cutoff && slot.hour > cutoff.maxHour) setSelectedTime(null);
  }, [selectedService, selectedTime]);

  // Add-ons are scoped per service — drop any selection that no longer applies.
  useEffect(() => {
    const validIds = new Set(getAddOnsForService(selectedService ?? "").map(a => a.id));
    setSelectedAddOns(prev => prev.filter(id => validIds.has(id)));
  }, [selectedService]);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.carMake || !form.carModel) return;
    setSubmitting(true);
    setToastError(null);
    const basePrice = selectedService ? (SERVICE_PRICE[selectedService] ?? 0) : 0;
    const addOnsTotal = getAddOnsForService(selectedService ?? "")
      .filter(a => selectedAddOns.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    const appliedR = appliedReward ? REWARDS.find(r => r.id === appliedReward) ?? null : null;
    const discountedBase = appliedR ? Math.round(basePrice * (1 - appliedR.discount)) : basePrice;
    const finalAmount = discountedBase + addOnsTotal;
    // Estimate only — the real points are awarded from the actual amount entered when the job is logged
    const pendingPts = userId && selectedService ? finalAmount : 0;
    const { data: { session: authSession } } = await supabase.auth.getSession();
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authSession?.access_token ? { "Authorization": `Bearer ${authSession.access_token}` } : {}),
        },
        body: JSON.stringify({
          service: service?.label ?? selectedService,
          date: selectedDate ?? "TBD",
          time: selectedTime ?? null,
          ...form,
          notes: refParam ? `[Referred by ${refParam}] ${form.notes}`.trim() : form.notes,
          userId: userId ?? null,
          rewardApplied: appliedReward,
          pendingPoints: pendingPts,
          amount: finalAmount,
          addOnIds: selectedAddOns,
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
      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        onGuest={() => { setShowAuthPrompt(false); handleSubmit(); }}
        onCreateAccount={() => {
          sessionStorage.setItem(
            BOOKING_DRAFT_KEY,
            JSON.stringify({ step, selectedService, selectedDate, selectedTime, selectedAddOns, form })
          );
        }}
      />
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

              {selectedService && getAddOnsForService(selectedService).length > 0 && (
                <div className="mb-10">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "rgba(203,166,92,0.6)" }}>
                    Add-ons available
                  </p>
                  <div className="flex flex-col gap-2">
                    {getAddOnsForService(selectedService).map(addon => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <motion.button
                          key={addon.id}
                          type="button"
                          onClick={() =>
                            setSelectedAddOns(prev =>
                              prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]
                            )
                          }
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-between p-3 rounded-xl text-left focus:outline-none"
                          style={{
                            background: isSelected ? "rgba(203,166,92,0.1)" : "rgba(255,255,255,0.03)",
                            border: isSelected ? `1px solid rgba(203,166,92,0.4)` : "1px solid rgba(203,166,92,0.18)",
                            boxShadow: !isSelected ? "0 0 20px rgba(203,166,92,0.07)" : "none",
                          }}
                        >
                          <span className="text-[13px]" style={{ color: "rgba(232,232,232,0.75)" }}>
                            {addon.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <span className="text-[11px]" style={{ color: "rgba(203,166,92,0.6)" }}>
                              +${addon.price}
                            </span>
                            {isSelected ? (
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md" style={{ color: "#0a0a0a", background: GOLD }}>
                                ✓ Added
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md" style={{ color: GOLD, background: "rgba(203,166,92,0.1)", border: "1px solid rgba(203,166,92,0.25)" }}>
                                Add
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

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

              <Calendar selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null); }} availability={availability} maxWeeks={bookingWindowWeeks} />

              {selectedDate && <DateConfirmation selectedDate={selectedDate} />}

              {selectedDate && selectedService && (
                <TimeSlots
                  selectedService={selectedService}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                />
              )}

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
                    if (!selectedTime) { setToastError("Please select a start time to continue."); return; }
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
                {selectedTime && (
                  <div
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.04)", color: "rgba(232,232,232,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {selectedTime}
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
                  <Field label="Full name" name="name" value={form.name} onChange={setField("name")} required placeholder="Yusuf Baser" autoComplete="name" />
                  <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={setField("phone")} required placeholder="0400 000 000" inputMode="tel" autoComplete="tel" />
                </div>
                <div className="mb-5">
                  <Field label="Suburb" name="suburb" value={form.suburb} onChange={setField("suburb")} placeholder="Fitzroy, Richmond..." autoComplete="address-level2" />
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
                    className="w-full bg-transparent rounded-xl px-4 py-3 text-base sm:text-sm font-medium outline-none resize-none transition-all duration-200 placeholder:text-white/20"
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

              <RewardsBar
                points={userPoints}
                selectedService={selectedService}
                selectedAddOnIds={selectedAddOns}
                appliedReward={appliedReward}
                onApply={setAppliedReward}
                locked={rewardLocked}
              />

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
                  onClick={() => {
                    if (!form.name || !form.phone || !form.carMake || !form.carModel) {
                      setToastError("Please fill in your name, phone, car make and model to continue.");
                      return;
                    }
                    if (userId) { handleSubmit(); } else { setShowAuthPrompt(true); }
                  }}
                  disabled={submitting}
                  whileHover={!submitting ? { y: -2 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300"
                  style={{
                    background: !submitting
                      ? `linear-gradient(135deg, ${CHROME} 0%, ${GOLD} 55%, #A8862E 100%)`
                      : "rgba(255,255,255,0.05)",
                    color: !submitting ? "#0a0a0a" : "rgba(232,232,232,0.2)",
                    boxShadow: !submitting ? `0 8px 28px -4px rgba(203,166,92,0.35)` : "none",
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
                Once confirmed, I&apos;ll send my PayID to lock in your spot with a deposit — balance paid on the day by PayID or cash.
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
