'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';
import { Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TIERS = [
  { name: 'Regular',  pts: 300,  perk: '20% off exterior',    icon: '✦' },
  { name: 'Regular+', pts: 500,  perk: '20% off any service',  icon: '✦✦' },
  { name: 'VIP',      pts: 1000, perk: '50% off full detail',  icon: '✦✦✦' },
];

function getTier(pts: number) {
  if (pts >= 1000) return 'VIP';
  if (pts >= 500)  return 'Regular+';
  if (pts >= 300)  return 'Regular';
  return null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
}

function LightBeam({ delay = 0 }: { delay?: number }) {
  return (
    <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
      <motion.div className="absolute top-0 left-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-[#CBA65C] to-transparent" style={{ opacity: 0.5 }} animate={{ left: ['-45%', '100%'] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3, delay }} />
      <motion.div className="absolute top-0 right-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-[#CBA65C] to-transparent" style={{ opacity: 0.5 }} animate={{ top: ['-45%', '100%'] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3, delay: delay + 0.75 }} />
      <motion.div className="absolute bottom-0 right-0 h-[2px] w-[45%] bg-gradient-to-l from-transparent via-[#CBA65C] to-transparent" style={{ opacity: 0.5 }} animate={{ right: ['-45%', '100%'] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3, delay: delay + 1.5 }} />
      <motion.div className="absolute bottom-0 left-0 h-[45%] w-[2px] bg-gradient-to-t from-transparent via-[#CBA65C] to-transparent" style={{ opacity: 0.5 }} animate={{ bottom: ['-45%', '100%'] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3, delay: delay + 2.25 }} />
    </div>
  );
}

function GlassCard({ children, className = '', glow = false, beamDelay = 0 }: { children: React.ReactNode; className?: string; glow?: boolean; beamDelay?: number }) {
  return (
    <div className={`relative group ${className}`}>
      {glow && (
        <motion.div className="absolute -inset-px rounded-2xl" animate={{ opacity: [0.12, 0.28, 0.12] }} transition={{ duration: 5, repeat: Infinity }} style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(203,166,92,0.2), transparent 70%)', filter: 'blur(10px)' }} />
      )}
      <LightBeam delay={beamDelay} />
      <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

function Ring({ pts, max = 1000 }: { pts: number; max?: number }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(pts / max, 1);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 208, height: 208 }}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(203,166,92,0.07) 0%, transparent 65%)', filter: 'blur(8px)' }} />
      <svg width="208" height="208" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CBA65C" />
            <stop offset="50%" stopColor="#E4C883" />
            <stop offset="100%" stopColor="#CBA65C" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="104" cy="104" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <motion.circle cx="104" cy="104" r={r} fill="none" stroke="url(#rg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - pct * circ }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} filter="url(#glow)" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.5 }} style={{ fontSize: 44, color: '#CBA65C', fontWeight: 200, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {pts}
        </motion.span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 4 }}>points</span>
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-xs tracking-widest transition-all duration-300 px-4 py-2 rounded-xl border" style={{ borderColor: copied ? 'rgba(203,166,92,0.5)' : 'rgba(255,255,255,0.08)', background: copied ? 'rgba(203,166,92,0.08)' : 'transparent', color: copied ? '#CBA65C' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, letterSpacing: '0.1em' }}>
      {copied ? '✓ Copied' : 'Copy link'}
    </motion.button>
  );
}

const s = (i: number) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.07 },
});

type Booking = { id: string; date: string; service: string; amount: number; status: string };
type Car = { make: string; model: string; year: number; colour: string };

export default function AccountPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [points, setPoints] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingCar, setRemovingCar] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace('/signin');
        return;
      }
      const u = data.session.user;
      setName(u.user_metadata?.full_name || u.email?.split('@')[0] || 'there');
      setEmail(u.email || '');
      setMemberSince(formatMemberSince(u.created_at));

      const [{ data: profile }, { data: carData }, { data: bookingsData }] = await Promise.all([
        supabase.from('profiles').select('points').eq('id', u.id).single(),
        supabase.from('cars').select('make,model,year,colour').eq('owner_id', u.id).maybeSingle(),
        supabase.from('bookings').select('id,date,service,amount,status').eq('user_id', u.id).order('created_at', { ascending: false }),
      ]);

      setPoints(profile?.points ?? 0);
      setCar(carData ?? null);
      setBookings(bookingsData ?? []);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handleRemoveCar = async () => {
    setRemovingCar(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('cars').delete().eq('owner_id', session.user.id);
    }
    setCar(null);
    setRemovingCar(false);
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

  const tier = getTier(points);
  const nextTier = tier === 'VIP' ? null : TIERS[TIERS.findIndex(t => t.name === (tier || 'Regular')) + (tier ? 1 : 0)];
  const referralMsg = `Hey! I use Baser Detailing — results are incredible. Book through my referral and we both get bonus points: baserdetailing.com.au/book`;

  return (
    <div className="min-h-screen w-screen relative overflow-x-hidden" style={{ backgroundColor: '#0a0a0a' }}>

      <div className="absolute inset-0 pointer-events-none">
        <ShadowOverlay color="rgba(203,166,92,0.32)" animation={{ scale: 40, speed: 20 }} noise={{ opacity: 0.25, scale: 1.5 }} />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', width: 500, height: 500, top: '2%', right: '-8%', background: 'radial-gradient(circle, rgba(203,166,92,0.055) 0%, transparent 70%)', filter: 'blur(50px)', borderRadius: '50%' }} />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }} style={{ position: 'absolute', width: 600, height: 600, bottom: '5%', left: '-12%', background: 'radial-gradient(circle, rgba(203,166,92,0.04) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
      </div>

      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="fixed top-5 left-5 z-50">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
          <Home size={14} strokeWidth={1.8} />
          <span style={{ fontSize: 12, letterSpacing: '0.04em' }}>Home</span>
        </Link>
      </motion.div>

      <div className="relative z-10 mx-auto pb-32" style={{ maxWidth: 980, padding: '0 24px' }}>

        <motion.div {...s(0)} style={{ paddingTop: 72, marginBottom: 36 }}>
          <p style={{ fontSize: 11, color: 'rgba(203,166,92,0.65)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 14 }}>
            {getGreeting()}
          </p>
          <h1 style={{ fontSize: 'clamp(42px, 6vw, 68px)', fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em', lineHeight: 1.0, margin: 0, background: 'linear-gradient(135deg, #E8E8E8 60%, rgba(203,166,92,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hey, {name}.
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12, letterSpacing: '0.04em' }}>
            Member since {memberSince}
          </p>
        </motion.div>

        <motion.div {...s(1)} className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Bookings', value: bookings.length || '0' },
            { label: 'Points',   value: points },
            { label: 'Status',   value: tier ?? 'New' },
          ].map((c, i) => (
            <GlassCard key={c.label} beamDelay={i * 0.4}>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 30, color: '#E8E8E8', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 8 }}>{c.label}</div>
              </div>
            </GlassCard>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="flex flex-col gap-5">

            <motion.div {...s(2)}>
              <GlassCard glow beamDelay={0.2}>
                <div style={{ padding: '28px 28px 24px' }}>
                  <p style={{ fontSize: 10, color: '#CBA65C', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 24 }}>Rewards</p>
                  <div className="flex flex-col items-center" style={{ marginBottom: 24 }}>
                    <Ring pts={points} />
                    {nextTier ? (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 14, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                        {nextTier.pts - points} pts to {nextTier.name}
                      </motion.p>
                    ) : (
                      <p style={{ fontSize: 11, color: '#CBA65C', marginTop: 14, letterSpacing: '0.14em', textTransform: 'uppercase' }}>VIP Member ✦</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {TIERS.map(t => {
                      const active = tier === t.name;
                      return (
                        <motion.div key={t.name} whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 12, border: `1px solid ${active ? 'rgba(203,166,92,0.38)' : 'rgba(255,255,255,0.05)'}`, background: active ? 'rgba(203,166,92,0.07)' : 'rgba(255,255,255,0.015)', transition: 'all 0.3s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 9, color: active ? '#CBA65C' : 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>{t.icon}</span>
                            <div>
                              <div style={{ fontSize: 12, color: active ? '#CBA65C' : 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.06em' }}>{t.name}</div>
                              <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)', marginTop: 2 }}>{t.perk}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 10, color: active ? 'rgba(203,166,92,0.55)' : 'rgba(255,255,255,0.12)', letterSpacing: '0.06em' }}>{t.pts} pts</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div {...s(4)}>
              <GlassCard beamDelay={1.2}>
                <div style={{ padding: '24px 28px' }}>
                  <p style={{ fontSize: 10, color: '#CBA65C', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 18 }}>My Car</p>
                  {!car ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.25 }}>🚗</div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>No car saved yet</p>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/account/car')} style={{ fontSize: 11, color: '#CBA65C', background: 'rgba(203,166,92,0.07)', border: '1px solid rgba(203,166,92,0.25)', borderRadius: 10, padding: '9px 22px', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        + Add your car
                      </motion.button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: car.colour, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14, color: '#E8E8E8', fontWeight: 300 }}>{car.year} {car.make} {car.model}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, textTransform: 'capitalize' }}>{car.colour}</div>
                        </div>
                      </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => router.push('/account/car')}
                          style={{ fontSize: 11, color: '#CBA65C', background: 'rgba(203,166,92,0.07)', border: '1px solid rgba(203,166,92,0.25)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                        >
                          + Add another car
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRemoveCar}
                          disabled={removingCar}
                          style={{ fontSize: 11, color: 'rgba(192,57,43,0.7)', background: 'none', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '7px 16px', cursor: removingCar ? 'wait' : 'pointer', letterSpacing: '0.06em', opacity: removingCar ? 0.5 : 1 }}
                        >
                          {removingCar ? 'Removing…' : 'Remove'}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <div className="flex flex-col gap-5">

            <motion.div {...s(3)}>
              <GlassCard beamDelay={0.6}>
                <div style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <p style={{ fontSize: 10, color: '#CBA65C', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500 }}>Your Bookings</p>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em' }}>{bookings.length} total</span>
                  </div>
                  {bookings.length === 0 ? (
                    <div style={{ padding: '36px 0', textAlign: 'center' }}>
                      <motion.div animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 14, color: 'rgba(255,255,255,0.15)' }}>
                        ✦
                      </motion.div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7, marginBottom: 4 }}>No bookings yet</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>Book your first detail and it&apos;ll show up here</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {bookings.map(b => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#E8E8E8' }}>{b.service}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{b.date}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 14, color: '#CBA65C' }}>${b.amount}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{b.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div {...s(5)}>
              <GlassCard glow beamDelay={0.9}>
                <div style={{ padding: '24px 28px' }}>
                  <p style={{ fontSize: 10, color: '#CBA65C', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 }}>Refer a Mate</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', lineHeight: 1.75, marginBottom: 16 }}>
                    Earn <span style={{ color: '#CBA65C' }}>50 bonus points</span> when your mate books using your referral.
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.8, fontStyle: 'italic' }}>
                      &ldquo;{referralMsg}&rdquo;
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <CopyBtn text={referralMsg} />
                    <a href={`sms:?body=${encodeURIComponent(referralMsg)}`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', letterSpacing: '0.06em' }}>
                      Send as text
                    </a>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div {...s(6)}>
              <GlassCard beamDelay={1.5}>
                <div style={{ padding: '24px 28px' }}>
                  <p style={{ fontSize: 10, color: '#CBA65C', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 18 }}>Account</p>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>Email</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{email}</div>
                  </div>
                  <motion.button
                    whileHover={{ x: 3, color: 'rgba(192,57,43,0.9)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSignOut}
                    style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(192,57,43,0.55)', cursor: 'pointer', padding: 0, letterSpacing: '0.02em', transition: 'color 0.2s' }}
                  >
                    Sign out →
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ padding: '20px 24px 36px', background: 'linear-gradient(to top, rgba(10,10,10,0.98) 55%, transparent)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link href="/book" className="block text-center rounded-2xl font-medium relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #BF9A50, #CBA65C 35%, #E4C883 60%, #CBA65C)', color: '#0a0a0a', textDecoration: 'none', padding: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12, fontWeight: 500 }}>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }} />
              <span className="relative z-10">Book a detail →</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
