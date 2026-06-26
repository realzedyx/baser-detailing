'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SERVICES = [
  { value: 'Exterior Detail', label: 'Exterior Detail' },
  { value: 'Interior Detail', label: 'Interior Detail' },
  { value: 'Full Detail', label: 'Full Detail' },
];

const TIME_SLOTS = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
];

type Booking = {
  id: string;
  service: string;
  date: string;
  time: string | null;
  notes: string | null;
  status: string;
  name: string;
  phone: string;
  suburb: string;
  car_make: string;
  car_model: string;
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 13,
  color: '#E8E8E8',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function ManageBookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.replace('/signin'); return; }

      const { data: bk, error: bkErr } = await supabase
        .from('bookings')
        .select('id,service,date,time,notes,status,name,phone,suburb,car_make,car_model')
        .eq('id', id)
        .eq('user_id', data.session.user.id)
        .single();

      if (bkErr || !bk) { router.replace('/account'); return; }
      if (bk.status !== 'pending' && bk.status !== 'confirmed') { router.replace('/account'); return; }

      setBooking(bk as Booking);
      setService(bk.service ?? '');
      setDate(bk.date ?? '');
      setTime(bk.time ?? '');
      setNotes(bk.notes ?? '');
      setLoading(false);
    });
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/signin'); return; }

    const res = await fetch(`/api/booking/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ service, date, time, notes }),
    });

    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? 'Something went wrong');
      setSaving(false);
      return;
    }

    setSaved(true);
    setTimeout(() => { setSaved(false); setSaving(false); }, 2200);
    setSaving(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/signin'); return; }

    await fetch(`/api/booking/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    router.replace('/account');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ fontSize: 11, color: 'rgba(203,166,92,0.5)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          Loading
        </motion.div>
      </div>
    );
  }

  const statusColour = booking?.status === 'confirmed' ? '#4ade80' : '#CBA65C';

  return (
    <div className="min-h-screen w-screen relative" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', width: 500, height: 500, top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(203,166,92,0.04) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
      </div>

      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="fixed top-5 left-5 z-50">
        <Link href="/account" className="flex items-center gap-2 transition-colors" style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 12, letterSpacing: '0.04em' }}>
          <ArrowLeft size={14} strokeWidth={1.8} />
          <span>Account</span>
        </Link>
      </motion.div>

      <div className="relative z-10 mx-auto pb-24" style={{ maxWidth: 560, padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} style={{ paddingTop: 80, marginBottom: 32 }}>
          <p style={{ fontSize: 10, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 12 }}>Manage Booking</p>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em', margin: 0 }}>
            Edit your detail
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <GlassCard className="mb-4">
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 9, color: statusColour, letterSpacing: '0.18em', textTransform: 'uppercase', border: `1px solid ${statusColour}`, borderRadius: 6, padding: '2px 8px' }}>{booking?.status}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{booking?.name} · {booking?.car_make} {booking?.car_model}</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <GlassCard className="mb-5">
            <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Service</label>
                <select value={service} onChange={e => setService(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {SERVICES.map(s => <option key={s.value} value={s.value} style={{ background: '#111' }}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Preferred Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Preferred Time</label>
                <select value={time} onChange={e => setTime(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" style={{ background: '#111' }}>Any time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t} style={{ background: '#111' }}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special instructions..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 12, color: 'rgba(192,57,43,0.8)', margin: 0 }}>{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  background: saved
                    ? 'rgba(74,222,128,0.15)'
                    : 'linear-gradient(120deg, #BF9A50, #CBA65C 35%, #E4C883 60%, #CBA65C)',
                  border: saved ? '1px solid rgba(74,222,128,0.4)' : 'none',
                  color: saved ? '#4ade80' : '#0a0a0a',
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'all 0.3s',
                }}
              >
                {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <GlassCard>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 10, color: 'rgba(192,57,43,0.6)', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>Cancel Booking</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, marginBottom: 16 }}>
                This will cancel your booking request. You can always book again.
              </p>
              <AnimatePresence mode="wait">
                {!confirmCancel ? (
                  <motion.button
                    key="ask"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setConfirmCancel(true)}
                    style={{ fontSize: 12, color: 'rgba(192,57,43,0.6)', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.18)', borderRadius: 10, padding: '9px 20px', cursor: 'pointer', letterSpacing: '0.06em' }}
                  >
                    Cancel booking
                  </motion.button>
                ) : (
                  <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleCancel}
                      disabled={cancelling}
                      style={{ fontSize: 12, color: '#fff', background: 'rgba(192,57,43,0.7)', border: 'none', borderRadius: 10, padding: '9px 20px', cursor: cancelling ? 'wait' : 'pointer', letterSpacing: '0.06em', opacity: cancelling ? 0.6 : 1 }}
                    >
                      {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setConfirmCancel(false)}
                      style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 20px', cursor: 'pointer', letterSpacing: '0.06em' }}
                    >
                      Keep it
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
