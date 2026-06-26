'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, MessageCircle, Check, X, Trash2,
  ChevronLeft, ChevronRight, Calendar, Users, Briefcase, BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { REWARDS } from '@/lib/rewards';

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PIN = '1234';
const GOLD = '#CBA65C';
const BG = '#0a0a0a';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Types ────────────────────────────────────────────────────────────────────
type DayStatus = 'open' | 'booked' | 'blocked';

interface Job {
  id: string; date: string; make: string; model: string; year: string;
  colour: string; suburb: string; service: string; amount: number;
  payment: string; notes: string; created_at?: string;
}
interface Booking {
  id: string; service: string; date: string; time: string | null;
  name: string; phone: string; suburb: string;
  car_make: string; car_model: string; car_year?: string | null; car_colour?: string | null; notes: string;
  status: string; created_at: string;
  user_id?: string | null; pending_points?: number | null; reward_applied?: string | null;
}
interface Profile {
  id: string; email: string; created_at?: string; points?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const a = (i: number) => ({
  initial: { opacity: 0, y: 16, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.06 },
});

const inp = (focused: boolean): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box',
  background: focused ? 'rgba(203,166,92,0.04)' : 'rgba(255,255,255,0.025)',
  border: `1px solid ${focused ? 'rgba(203,166,92,0.45)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 10, padding: '11px 14px', fontSize: 13,
  color: '#E8E8E8', outline: 'none', transition: 'all 0.2s',
  fontWeight: 300, letterSpacing: '0.01em',
});

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 9, color: GOLD,
  letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 6,
};

// ─── PIN Gate ─────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        setTimeout(onUnlock, 300);
      } else {
        setShake(true); setError(true);
        setTimeout(() => { setDigits(''); setShake(false); setError(false); }, 700);
      }
    }
  };
  const del = () => setDigits(d => d.slice(0, -1));

  return (
    <div className="min-h-screen w-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', width: 600, height: 600, top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(203,166,92,0.045) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ width: 320 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 10 }}>Admin Access</p>
          <h1 style={{ fontSize: 32, fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em', margin: 0 }}>Enter PIN</h1>
        </div>
        <motion.div animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(203,166,92,0.4)'}`, background: i < digits.length ? (error ? 'rgba(239,68,68,0.8)' : GOLD) : 'transparent', transition: 'all 0.15s' }} />
          ))}
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
            k === '' ? <div key={i} /> :
              <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                onClick={() => k === '⌫' ? del() : press(k)}
                style={{ padding: '18px 0', fontSize: k === '⌫' ? 18 : 22, fontWeight: 200, color: k === '⌫' ? 'rgba(255,255,255,0.35)' : '#E8E8E8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', letterSpacing: '-0.02em' }}>
                {k}
              </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ label, revenue, count, delay }: { label: string; revenue: number; count: number; delay: number }) {
  return (
    <motion.div {...a(delay)} style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(203,166,92,0.15)', borderRadius: 16, padding: '20px 22px' }}>
      <p style={{ fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em', margin: 0 }}>${revenue.toLocaleString()}</p>
      {count > 0 && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{count} job{count !== 1 ? 's' : ''}</p>}
    </motion.div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart({ jobs }: { jobs: Job[] }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      label: d.toLocaleString('default', { month: 'short' }),
      revenue: jobs.filter(j => j.date?.startsWith(key)).reduce((acc, j) => acc + (j.amount || 0), 0),
      count: jobs.filter(j => j.date?.startsWith(key)).length,
    };
  });
  const max = Math.max(...months.map(m => m.revenue), 1);

  return (
    <div style={{ padding: '20px 0' }}>
      <p style={{ fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>Revenue — Last 6 Months</p>
      <svg width="100%" viewBox="0 0 420 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {months.map((m, i) => {
          const h = Math.max((m.revenue / max) * 90, m.revenue > 0 ? 6 : 0);
          const x = i * 70 + 10;
          return (
            <g key={i}>
              <title>${m.revenue} — {m.count} job{m.count !== 1 ? 's' : ''}</title>
              <rect x={x} y={110 - h} width={50} height={h} rx={6} fill="rgba(203,166,92,0.15)" stroke="rgba(203,166,92,0.3)" strokeWidth={1} />
              {h > 0 && <rect x={x} y={110 - h} width={50} height={4} rx={2} fill={GOLD} opacity={0.9} />}
              <text x={x + 25} y={120} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="inherit">{m.label}</text>
              {m.revenue > 0 && <text x={x + 25} y={104 - h} textAnchor="middle" fill="rgba(203,166,92,0.7)" fontSize={8} fontFamily="inherit">${m.revenue}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────────
type JobFormPrefill = { date?: string; make?: string; model?: string; year?: string; colour?: string; suburb?: string; service?: string; notes?: string; userId?: string | null };

function JobsTab({ jobs, onRefresh, prefill }: { jobs: Job[]; onRefresh: () => void; prefill?: JobFormPrefill | null }) {
  const [form, setForm] = useState({ date: '', make: '', model: '', year: '', colour: '', suburb: '', service: 'Interior', amount: '', payment: 'PayID', notes: '' });
  // Member tied to a booking being logged — when set, saving the job awards them points = amount
  const [linkedUserId, setLinkedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!prefill) return;
    const svc = (() => {
      const s = (prefill.service || '').toLowerCase();
      if (s.includes('full')) return 'Full Detail';
      if (s.includes('exterior')) return 'Exterior';
      return 'Interior';
    })();
    setForm(f => ({ ...f, date: prefill.date ?? f.date, make: prefill.make ?? f.make, model: prefill.model ?? f.model, year: prefill.year ?? f.year, colour: prefill.colour ?? f.colour, suburb: prefill.suburb ?? f.suburb, service: svc, notes: prefill.notes ?? f.notes }));
    setLinkedUserId(prefill.userId ?? null);
  }, [prefill]);
  const [focused, setFocused] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [filterService, setFilterService] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [search, setSearch] = useState('');
  const [fSearch, setFSearch] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    setDeleting(null);
    setConfirmDelete(null);
    if (!error) onRefresh();
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const amountNum = parseFloat(form.amount) || 0;
    const { error } = await supabase.from('jobs').insert({
      date: form.date, make: form.make, model: form.model, year: form.year,
      colour: form.colour, suburb: form.suburb, service: form.service,
      amount: amountNum, payment: form.payment, notes: form.notes,
    });
    if (error) {
      setSaving(false);
      setSaveResult({ ok: false, msg: error.message });
    } else {
      // Award points = actual amount paid, but only when this job was logged from a member's booking
      let pointsMsg = '';
      if (linkedUserId && amountNum > 0) {
        const { data: prof } = await supabase.from('profiles').select('points').eq('id', linkedUserId).single();
        await supabase.from('profiles').update({ points: (prof?.points ?? 0) + Math.round(amountNum) }).eq('id', linkedUserId);
        pointsMsg = ` (+${Math.round(amountNum)} pts awarded)`;
      }
      setSaving(false);
      setForm({ date: '', make: '', model: '', year: '', colour: '', suburb: '', service: 'Interior', amount: '', payment: 'PayID', notes: '' });
      setLinkedUserId(null);
      setSaveResult({ ok: true, msg: `Job saved!${pointsMsg}` });
      onRefresh();
    }
    setTimeout(() => setSaveResult(null), 4000);
  };

  const filtered = jobs.filter(j => {
    if (filterService !== 'All' && j.service !== filterService) return false;
    if (filterPayment !== 'All' && j.payment !== filterPayment) return false;
    if (search && !`${j.make} ${j.model} ${j.suburb}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selStyle = (f: boolean): React.CSSProperties => ({ ...inp(f), appearance: 'none', WebkitAppearance: 'none' } as React.CSSProperties);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
      {/* Log form */}
      <motion.div {...a(0)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '28px 24px' }}>
        <p style={{ fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>Log a Job</p>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {([
            ['date', 'Date', '', 'date'],
            ['make', 'Make', 'e.g. Toyota', ''],
            ['model', 'Model', 'e.g. Camry', ''],
            ['year', 'Year', 'e.g. 2021', ''],
            ['colour', 'Colour', 'e.g. Black', ''],
            ['suburb', 'Suburb', 'e.g. Parramatta', ''],
            ['amount', 'Amount ($)', 'e.g. 320', ''],
          ] as [string, string, string, string][]).map(([k, l, ph, t]) => (
            <div key={k}>
              <label style={lbl}>{l}</label>
              <input type={t || 'text'} placeholder={ph} value={(form as Record<string, string>)[k]} onChange={set(k)}
                onFocus={() => setFocused(k)} onBlur={() => setFocused('')}
                required={k !== 'notes'} style={inp(focused === k)} />
            </div>
          ))}
          <div>
            <label style={lbl}>Service</label>
            <select value={form.service} onChange={set('service')} onFocus={() => setFocused('service')} onBlur={() => setFocused('')} style={selStyle(focused === 'service')}>
              {['Interior', 'Exterior', 'Full Detail'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Payment</label>
            <select value={form.payment} onChange={set('payment')} onFocus={() => setFocused('payment')} onBlur={() => setFocused('')} style={selStyle(focused === 'payment')}>
              {['PayID', 'Cash'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Optional..." rows={3}
              onFocus={() => setFocused('notes')} onBlur={() => setFocused('')}
              style={{ ...inp(focused === 'notes'), resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <motion.button type="submit" disabled={saving} whileHover={saving ? {} : { scale: 1.02 }} whileTap={saving ? {} : { scale: 0.97 }}
            style={{ marginTop: 4, background: `linear-gradient(120deg, #BF9A50, ${GOLD} 40%, #E4C883 65%, ${GOLD})`, color: BG, border: 'none', borderRadius: 12, padding: '13px', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, position: 'relative', overflow: 'hidden' }}>
            <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }} />
            <span style={{ position: 'relative', zIndex: 1 }}>{saving ? 'Saving…' : 'Save Job →'}</span>
          </motion.button>
          <AnimatePresence>
            {saveResult && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ margin: 0, fontSize: 12, textAlign: 'center', color: saveResult.ok ? 'rgba(74,222,128,0.85)' : 'rgba(239,68,68,0.85)' }}>
                {saveResult.msg}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Right panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <motion.div {...a(1)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '24px' }}>
          <RevenueChart jobs={jobs} />
        </motion.div>

        <motion.div {...a(2)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '24px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            {(['All', 'Interior', 'Exterior', 'Full Detail'] as string[]).map(sv => (
              <button key={sv} onClick={() => setFilterService(sv)}
                style={{ padding: '6px 14px', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 8, cursor: 'pointer', border: `1px solid ${filterService === sv ? GOLD : 'rgba(255,255,255,0.08)'}`, background: filterService === sv ? 'rgba(203,166,92,0.12)' : 'transparent', color: filterService === sv ? GOLD : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>{sv}</button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {(['All', 'PayID', 'Cash'] as string[]).map(p => (
                <button key={p} onClick={() => setFilterPayment(p)}
                  style={{ padding: '6px 12px', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 8, cursor: 'pointer', border: `1px solid ${filterPayment === p ? GOLD : 'rgba(255,255,255,0.08)'}`, background: filterPayment === p ? 'rgba(203,166,92,0.12)' : 'transparent', color: filterPayment === p ? GOLD : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>{p}</button>
              ))}
            </div>
          </div>
          <input placeholder="Search by car or suburb…" value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setFSearch(true)} onBlur={() => setFSearch(false)}
            style={{ ...inp(fSearch), marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0 && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No jobs logged yet</p>}
            {filtered.map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#E8E8E8', fontWeight: 300 }}>{j.make} {j.model} <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>· {j.colour}</span></p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{j.suburb} · {j.service} · {j.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 300, color: GOLD }}>${j.amount}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 10, color: j.payment === 'Cash' ? 'rgba(255,255,255,0.35)' : 'rgba(203,166,92,0.5)', letterSpacing: '0.1em' }}>{j.payment}</p>
                </div>
                {confirmDelete === j.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button type="button" disabled={deleting === j.id} onClick={() => handleDelete(j.id)}
                      style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.95)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 8, padding: '6px 10px', cursor: deleting === j.id ? 'wait' : 'pointer' }}>
                      {deleting === j.id ? '…' : 'Delete'}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)}
                      style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmDelete(j.id)}
                    title="Delete job"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                    <Trash2 size={13} strokeWidth={1.8} />
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab({ bookings, onRefresh, onLogJob }: { bookings: Booking[]; onRefresh: () => void; onLogJob: (b: Booking) => void }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateErrorId, setUpdateErrorId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string, date?: string) => {
    setUpdating(id);
    setUpdateError(null);
    setUpdateErrorId(null);
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) {
        setUpdateError(`bookings update: ${error.message}`);
        setUpdateErrorId(id);
        setUpdating(null);
        return;
      }
    } catch (e: unknown) {
      setUpdateError(`JS error: ${e instanceof Error ? e.message : String(e)}`);
      setUpdateErrorId(id);
      setUpdating(null);
      return;
    }
    if (status === 'confirmed' && date) {
      const { error: avErr } = await supabase.from('availability').upsert(
        { date, status: 'booked', updated_at: new Date().toISOString() },
        { onConflict: 'date' }
      );
      if (avErr) setUpdateError(`availability upsert: ${avErr.message}`);
    }
    // Declining/cancelling reopens the day if it's more than 24h out — short-notice stays closed
    if ((status === 'declined' || status === 'cancelled') && date) {
      const bookingTime = new Date(`${date}T00:00:00`).getTime();
      if (bookingTime - Date.now() > 24 * 60 * 60 * 1000) {
        const { error: avErr } = await supabase.from('availability').upsert(
          { date, status: 'open', updated_at: new Date().toISOString() },
          { onConflict: 'date' }
        );
        if (avErr) setUpdateError(`availability upsert: ${avErr.message}`);
      }
    }
    setUpdating(null);
    onRefresh();
  };

  const markDone = async (b: Booking) => {
    setUpdating(b.id);
    await supabase.from('bookings').update({ status: 'done' }).eq('id', b.id);
    // Deduct the redeemed reward cost now. Earned points are added later, from the
    // actual amount entered in the Log Job form (see JobsTab handleSave).
    if (b.user_id && b.reward_applied) {
      const reward = REWARDS.find(r => r.id === b.reward_applied);
      if (reward) {
        const { data: prof } = await supabase.from('profiles').select('points').eq('id', b.user_id).single();
        const pts = Math.max(0, (prof?.points ?? 0) - reward.pts);
        await supabase.from('profiles').update({ points: pts }).eq('id', b.user_id);
      }
    }
    setUpdating(null);
    onRefresh();
    onLogJob(b);
  };

  const textConfirm = (b: Booking) => {
    const msg = encodeURIComponent(
      `Hi ${b.name}, your ${(b.service || 'detail').toLowerCase()} is confirmed for ${b.date}. I'll be there at the agreed time. Any questions, reply here. — Yusuf, Baser Detailing`
    );
    window.open(`sms:${b.phone}?body=${msg}`);
  };

  const statusColor = (s: string) =>
    s === 'pending' ? 'rgba(251,191,36,0.9)' : s === 'confirmed' ? 'rgba(34,197,94,0.9)' : s === 'done' ? 'rgba(203,166,92,0.6)' : 'rgba(239,68,68,0.7)';
  const statusBg = (s: string) =>
    s === 'pending' ? 'rgba(251,191,36,0.1)' : s === 'confirmed' ? 'rgba(34,197,94,0.1)' : s === 'done' ? 'rgba(203,166,92,0.1)' : 'rgba(239,68,68,0.1)';

  const btnStyle = (color: string, bg: string): React.CSSProperties => ({
    padding: '6px 12px', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
    textTransform: 'uppercase', borderRadius: 8, cursor: 'pointer',
    border: `1px solid ${color}`, background: bg, color, transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No booking requests yet</div>
      )}
      {bookings.map((b, i) => (
        <motion.div key={b.id} {...a(i)} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${updateErrorId === b.id ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 300, color: '#E8E8E8' }}>{b.car_make} {b.car_model}</p>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', color: statusColor(b.status), background: statusBg(b.status), border: `1px solid ${statusColor(b.status)}30` }}>{b.status}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{b.service} · {b.suburb}</p>
              {b.date && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{b.date}{b.time ? ` at ${b.time}` : ''}</p>}
              {b.reward_applied && (
                <span style={{ display: 'inline-block', marginTop: 6, fontSize: 9, color: '#CBA65C', background: 'rgba(203,166,92,0.1)', border: '1px solid rgba(203,166,92,0.3)', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Reward: {b.reward_applied}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#E8E8E8' }}>{b.name}</p>
              <p style={{ margin: '3px 0', fontSize: 12, color: GOLD }}>{b.phone}</p>
              {b.notes && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>{b.notes}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', opacity: updating === b.id ? 0.5 : 1 }}>
                {b.status === 'pending' && <>
                  <button type="button" style={btnStyle('rgba(34,197,94,0.8)', 'rgba(34,197,94,0.1)')} onClick={() => updateStatus(b.id, 'confirmed', b.date)} disabled={!!updating}>
                    {updating === b.id ? 'Saving…' : <><Check size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Confirm &amp; Lock Day</>}
                  </button>
                  <button type="button" style={btnStyle('rgba(239,68,68,0.7)', 'rgba(239,68,68,0.08)')} onClick={() => updateStatus(b.id, 'declined', b.date)} disabled={!!updating}>
                    <X size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Decline
                  </button>
                </>}
                {b.status === 'confirmed' && <>
                  <button type="button" style={btnStyle('rgba(203,166,92,0.7)', 'rgba(203,166,92,0.08)')} onClick={() => textConfirm(b)}>Text Confirmation</button>
                  <button type="button" style={btnStyle('rgba(34,197,94,0.8)', 'rgba(34,197,94,0.1)')} onClick={() => markDone(b)} disabled={!!updating}>Mark Done → Log Job</button>
                  <button type="button" style={btnStyle('rgba(239,68,68,0.7)', 'rgba(239,68,68,0.08)')} onClick={() => updateStatus(b.id, 'cancelled', b.date)} disabled={!!updating}>
                    <X size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Cancel
                  </button>
                </>}
                {b.status === 'done' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Completed</span>
                    <button type="button" style={btnStyle('rgba(203,166,92,0.6)', 'rgba(203,166,92,0.07)')} onClick={() => onLogJob(b)}>Log Job</button>
                  </div>
                )}
                {b.status === 'declined' && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Declined</span>
                )}
                {b.status === 'cancelled' && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Cancelled</span>
                )}
              </div>
              {updateErrorId === b.id && updateError && (
                <div style={{ fontSize: 11, color: 'rgba(239,68,68,0.9)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 10px', maxWidth: 340 }}>
                  ⚠ {updateError}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Availability Tab ─────────────────────────────────────────────────────────
function AvailabilityTab({
  availability,
  confirmedDates,
  onRefresh,
}: {
  availability: Record<string, DayStatus>;
  confirmedDates: Set<string>;
  onRefresh: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [mode, setMode] = useState<DayStatus>('blocked');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [bookingWindow, setBookingWindow] = useState('4');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'booking_window_weeks').single()
      .then(({ data }) => { if (data?.value) setBookingWindow(data.value); });
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const dayKey = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const statusOf = (d: number): DayStatus | null => {
    const k = dayKey(d);
    if (confirmedDates.has(k)) return 'booked';
    return (availability[k] as DayStatus) ?? null;
  };

  const toggleDate = (d: number) => {
    const k = dayKey(d);
    setSelected(s => {
      const next = new Set(s);
      if (next.has(k)) { next.delete(k); } else { next.add(k); }
      return next;
    });
  };

  const applyStatus = async () => {
    if (selected.size === 0) return;
    setApplying(true);
    setApplyError(null);
    const rows = Array.from(selected).map(date => ({ date, status: mode, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'date' });
    if (error) {
      setApplyError(error.message);
    } else {
      setSelected(new Set());
      onRefresh();
    }
    setApplying(false);
  };

  const modeColors: Record<DayStatus, string> = {
    open: 'rgba(34,197,94,0.85)',
    booked: GOLD,
    blocked: 'rgba(239,68,68,0.75)',
  };
  const statusColor = (s: DayStatus) =>
    s === 'open' ? 'rgba(34,197,94,0.7)' : s === 'booked' ? GOLD : 'rgba(239,68,68,0.65)';

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
      <motion.div {...a(0)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '28px' }}>

        {/* Mode selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>Set selected dates as</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['open', 'booked', 'blocked'] as DayStatus[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, padding: '9px 0', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 10, cursor: 'pointer', border: `1px solid ${mode === m ? modeColors[m] : 'rgba(255,255,255,0.08)'}`, background: mode === m ? `${modeColors[m]}22` : 'transparent', color: mode === m ? modeColors[m] : 'rgba(255,255,255,0.35)', transition: 'all 0.15s' }}>
                {m === 'open' ? '✓ Open' : m === 'booked' ? '◉ Booked' : '✕ Blocked'}
              </button>
            ))}
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <ChevronLeft size={14} />
          </button>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 300, color: '#E8E8E8', letterSpacing: '0.05em' }}>{monthName}</p>
          <button onClick={nextMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 }}>
          {DAY_NAMES.map(d => (
            <p key={d} style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.1em' }}>{d}</p>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const k = dayKey(d);
            const st = statusOf(d);
            const isSelected = selected.has(k);
            const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();

            return (
              <motion.button key={d} onClick={() => toggleDate(d)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                style={{
                  aspectRatio: '1', borderRadius: 10, cursor: 'pointer', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: isToday ? 500 : 300,
                  border: isSelected
                    ? `2px solid ${modeColors[mode]}`
                    : st === 'open' ? '1px solid rgba(34,197,94,0.25)'
                    : st === 'booked' ? `1px solid rgba(203,166,92,0.35)`
                    : st === 'blocked' ? '1px solid rgba(239,68,68,0.45)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: isSelected
                    ? `${modeColors[mode]}22`
                    : st === 'open' ? 'rgba(34,197,94,0.07)'
                    : st === 'booked' ? 'rgba(203,166,92,0.08)'
                    : st === 'blocked' ? 'rgba(239,68,68,0.13)'
                    : 'transparent',
                  color: isSelected ? modeColors[mode]
                    : st === 'open' ? 'rgba(34,197,94,0.8)'
                    : st === 'booked' ? GOLD
                    : st === 'blocked' ? 'rgba(239,68,68,0.85)'
                    : isToday ? '#E8E8E8' : 'rgba(255,255,255,0.35)',
                  transition: 'border-color 0.12s, background 0.12s',
                }}>
                {isToday && (
                  <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: GOLD }} />
                )}
                {d}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          {(['open', 'booked', 'blocked'] as DayStatus[]).map(st => (
            <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(st) }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'capitalize' }}>{st}</span>
            </div>
          ))}
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto', fontStyle: 'italic' }}>Click dates to select, then apply</span>
        </div>

        {/* Error */}
        {applyError && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, fontSize: 11, color: 'rgba(239,68,68,0.85)' }}>
            Error: {applyError}
          </div>
        )}

        {/* Apply bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: `${modeColors[mode]}12`, border: `1px solid ${modeColors[mode]}35`, borderRadius: 12 }}>
              <span style={{ fontSize: 12, color: modeColors[mode] }}>{selected.size} date{selected.size !== 1 ? 's' : ''} selected</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSelected(new Set())}
                  style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                  Clear
                </button>
                <motion.button onClick={applyStatus} disabled={applying} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: BG, background: modeColors[mode], border: 'none', borderRadius: 6, padding: '5px 16px', cursor: applying ? 'wait' : 'pointer', opacity: applying ? 0.7 : 1 }}>
                  {applying ? 'Saving…' : `Mark ${mode} →`}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Settings */}
      <motion.div {...a(1)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ margin: 0, fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Settings</p>
        <div>
          <label style={lbl}>Booking Window (weeks ahead)</label>
          <input value={bookingWindow} onChange={e => setBookingWindow(e.target.value)} style={inp(false)} placeholder="4" />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={async () => {
            setSettingsError(null);
            const { error } = await supabase.from('settings').upsert({ key: 'booking_window_weeks', value: bookingWindow }, { onConflict: 'key' });
            if (error) { setSettingsError(error.message); }
            else { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }
          }}
          style={{ marginTop: 4, background: `linear-gradient(120deg, #BF9A50, ${GOLD} 40%, #E4C883 65%, ${GOLD})`, color: BG, border: 'none', borderRadius: 12, padding: '12px', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Save Settings
        </motion.button>
        <AnimatePresence>
          {settingsSaved && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ margin: 0, fontSize: 12, textAlign: 'center', color: 'rgba(74,222,128,0.85)' }}>
              Settings saved
            </motion.p>
          )}
          {settingsError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ margin: 0, fontSize: 12, textAlign: 'center', color: 'rgba(239,68,68,0.85)' }}>
              {settingsError}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Customers Tab ────────────────────────────────────────────────────────────
function CustomersTab({ profiles, bookings }: { profiles: Profile[]; bookings: Booking[] }) {
  const [subTab, setSubTab] = useState<'member' | 'guest'>('member');

  const guestMap = new Map<string, { name: string; phone: string; suburb: string; count: number; lastDate: string }>();
  bookings.forEach(b => {
    const k = `${b.name}|${b.phone}`;
    const ex = guestMap.get(k);
    if (!ex) {
      guestMap.set(k, { name: b.name, phone: b.phone, suburb: b.suburb || '', count: 1, lastDate: b.date || '' });
    } else {
      ex.count += 1;
      if ((b.date || '') > ex.lastDate) ex.lastDate = b.date;
    }
  });
  const guests = Array.from(guestMap.values()).sort((x, y) => y.lastDate.localeCompare(x.lastDate));

  const actionBtn = (icon: React.ReactNode, href: string) => (
    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
      onClick={() => window.open(href)}
      style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(203,166,92,0.3)', background: 'rgba(203,166,92,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: GOLD }}>
      {icon}
    </motion.button>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['member', 'guest'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            style={{ padding: '8px 20px', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 10, cursor: 'pointer', border: `1px solid ${subTab === t ? GOLD : 'rgba(255,255,255,0.08)'}`, background: subTab === t ? 'rgba(203,166,92,0.1)' : 'transparent', color: subTab === t ? GOLD : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>
            {t === 'member' ? `Members (${profiles.length})` : `Guests (${guests.length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence mode="wait">
          {subTab === 'member' && (
            profiles.length === 0
              ? <motion.div key="no-members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No accounts yet</motion.div>
              : profiles.map((p, i) => (
                <motion.div key={p.id} {...a(i)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 40px', height: 40, borderRadius: '50%', background: 'rgba(203,166,92,0.12)', border: '1px solid rgba(203,166,92,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 300, color: GOLD }}>{(p.email?.[0] ?? '?').toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 300, color: '#E8E8E8' }}>{p.email}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      Joined {p.created_at ? new Date(p.created_at).toLocaleDateString('en-AU') : '—'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <p style={{ margin: 0, fontSize: 9, color: 'rgba(203,166,92,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Points</p>
                    <p style={{ margin: '2px 0 0', fontSize: 15, color: GOLD, fontWeight: 300 }}>{p.points ?? 0}</p>
                  </div>
                </motion.div>
              ))
          )}

          {subTab === 'guest' && (
            guests.length === 0
              ? <motion.div key="no-guests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No guest bookings yet</motion.div>
              : guests.map((g, i) => (
                <motion.div key={`${g.name}|${g.phone}`} {...a(i)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 40px', height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>{(g.name[0] ?? '?').toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 300, color: '#E8E8E8' }}>{g.name}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{g.phone}{g.suburb ? ` · ${g.suburb}` : ''}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,auto)', gap: '4px 24px', alignItems: 'center', marginRight: 8 }}>
                    {([['Bookings', g.count], ['Last', g.lastDate || '—']] as [string, string | number][]).map(([l, v]) => (
                      <div key={String(l)} style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 9, color: 'rgba(203,166,92,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{l}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {actionBtn(<Phone size={14} strokeWidth={1.8} />, `tel:${g.phone}`)}
                    {actionBtn(<MessageCircle size={14} strokeWidth={1.8} />, `sms:${g.phone}`)}
                  </div>
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
type Tab = 'Jobs' | 'Bookings' | 'Availability' | 'Customers';
const TABS: { id: Tab; icon: React.ReactNode }[] = [
  { id: 'Jobs', icon: <Briefcase size={13} strokeWidth={1.8} /> },
  { id: 'Bookings', icon: <BookOpen size={13} strokeWidth={1.8} /> },
  { id: 'Availability', icon: <Calendar size={13} strokeWidth={1.8} /> },
  { id: 'Customers', icon: <Users size={13} strokeWidth={1.8} /> },
];

function Dashboard() {
  const [tab, setTab] = useState<Tab>('Jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<Record<string, DayStatus>>({});
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefillJob, setPrefillJob] = useState<JobFormPrefill | null>(null);

  const handleLogJob = (b: Booking) => {
    setPrefillJob({ date: b.date, make: b.car_make, model: b.car_model, year: b.car_year ?? '', colour: b.car_colour ?? '', suburb: b.suburb, service: b.service, notes: b.notes || '', userId: b.user_id ?? null });
    setTab('Jobs');
  };

  const loadData = useCallback(async () => {
    const [jobsRes, bookingsRes, availRes, profilesRes] = await Promise.all([
      supabase.from('jobs').select('*').order('date', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('availability').select('*'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);

    if (jobsRes.data) setJobs(jobsRes.data as Job[]);
    if (bookingsRes.data) setBookings(bookingsRes.data as Booking[]);
    if (availRes.data) {
      const map: Record<string, DayStatus> = {};
      (availRes.data as { date: string; status: DayStatus }[]).forEach(r => { map[r.date] = r.status; });
      setAvailability(map);
    }
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Computed stats from real job data
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const thisMonthJobs = jobs.filter(j => j.date?.startsWith(thisMonthKey));
  const weekJobs = jobs.filter(j => j.date && new Date(j.date) >= weekAgo);
  const allTimeRev = jobs.reduce((acc, j) => acc + (j.amount || 0), 0);

  // Dates blocked by confirmed bookings
  const confirmedDates = new Set(
    bookings.filter(b => b.status === 'confirmed').map(b => b.date).filter(Boolean)
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, color: '#E8E8E8' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 800, height: 400, top: 0, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(203,166,92,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
        {/* Header */}
        <motion.div {...a(0)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <p style={{ margin: 0, fontSize: 9, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 8 }}>Baser Detailing</p>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px,3vw,40px)', fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em' }}>Command Centre</h1>
          </div>
          {loading && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', paddingTop: 14, margin: 0 }}>Loading…</p>}
        </motion.div>

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
          <StatChip label="This Month" revenue={thisMonthJobs.reduce((acc, j) => acc + j.amount, 0)} count={thisMonthJobs.length} delay={1} />
          <StatChip label="All Time" revenue={allTimeRev} count={jobs.length} delay={2} />
          <StatChip label="Avg Per Job" revenue={jobs.length ? Math.round(allTimeRev / jobs.length) : 0} count={0} delay={3} />
          <StatChip label="This Week" revenue={weekJobs.reduce((acc, j) => acc + j.amount, 0)} count={weekJobs.length} delay={4} />
        </div>

        {/* Tabs */}
        <motion.div {...a(5)} style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {TABS.map(({ id, icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 10, cursor: 'pointer', border: `1px solid ${tab === id ? GOLD : 'rgba(255,255,255,0.08)'}`, background: tab === id ? 'rgba(203,166,92,0.1)' : 'rgba(255,255,255,0.02)', color: tab === id ? GOLD : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
              {icon}{id}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            {tab === 'Jobs' && <JobsTab jobs={jobs} onRefresh={loadData} prefill={prefillJob} />}
            {tab === 'Bookings' && <BookingsTab bookings={bookings} onRefresh={loadData} onLogJob={handleLogJob} />}
            {tab === 'Availability' && <AvailabilityTab availability={availability} confirmedDates={confirmedDates} onRefresh={loadData} />}
            {tab === 'Customers' && <CustomersTab profiles={profiles} bookings={bookings} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
