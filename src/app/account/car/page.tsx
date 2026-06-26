'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const s = (i: number) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.07 },
});

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

export default function AddCarPage() {
  const router = useRouter();
  const [form, setForm] = useState({ make: '', model: '', year: '', colour: '' });
  const [focused, setFocused] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/signin'); return; }
    await supabase.from('cars').upsert(
      { user_id: session.user.id, make: form.make, model: form.model, year: parseInt(form.year), colour: form.colour },
      { onConflict: 'user_id' }
    );
    router.push('/account');
  };

  const fields: { key: keyof typeof form; label: string; type?: string; placeholder: string }[] = [
    { key: 'make',   label: 'Make',   placeholder: 'e.g. Toyota' },
    { key: 'model',  label: 'Model',  placeholder: 'e.g. Camry' },
    { key: 'year',   label: 'Year',   placeholder: 'e.g. 2021' },
    { key: 'colour', label: 'Colour', placeholder: 'e.g. Midnight Black' },
  ];

  return (
    <div className="min-h-screen w-screen relative overflow-x-hidden flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <ShadowOverlay color="rgba(203,166,92,0.32)" animation={{ scale: 40, speed: 20 }} noise={{ opacity: 0.25, scale: 1.5 }} />
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', width: 500, height: 500, top: '2%', right: '-8%', background: 'radial-gradient(circle, rgba(203,166,92,0.055) 0%, transparent 70%)', filter: 'blur(50px)', borderRadius: '50%' }} />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }} style={{ position: 'absolute', width: 600, height: 600, bottom: '5%', left: '-12%', background: 'radial-gradient(circle, rgba(203,166,92,0.04) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
      </div>

      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="fixed top-5 left-5 z-50">
        <Link href="/account" className="flex items-center gap-2 text-sm" style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
          <ArrowLeft size={14} strokeWidth={1.8} />
          <span style={{ fontSize: 12, letterSpacing: '0.04em' }}>Account</span>
        </Link>
      </motion.div>

      {/* Card */}
      <div className="relative z-10 w-full" style={{ maxWidth: 440, padding: '0 24px' }}>
        <motion.div {...s(0)} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, color: 'rgba(203,166,92,0.65)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 10 }}>My Garage</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, background: 'linear-gradient(135deg, #E8E8E8 60%, rgba(203,166,92,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Add your car.
          </h1>
        </motion.div>

        <motion.div {...s(1)} className="relative">
          <motion.div className="absolute -inset-px rounded-2xl" animate={{ opacity: [0.12, 0.28, 0.12] }} transition={{ duration: 5, repeat: Infinity }} style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(203,166,92,0.2), transparent 70%)', filter: 'blur(10px)' }} />
          <LightBeam delay={0.2} />
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
            <form onSubmit={handleSave} className="relative z-10" style={{ padding: '32px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {fields.map(({ key, label, type, placeholder }, i) => (
                  <motion.div key={key} {...s(i + 2)}>
                    <label style={{ display: 'block', fontSize: 10, color: '#CBA65C', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>{label}</label>
                    <input
                      type={type ?? 'text'}
                      value={form[key]}
                      onChange={set(key)}
                      onFocus={() => setFocused(key)}
                      onBlur={() => setFocused(null)}
                      placeholder={placeholder}
                      required
                      style={{
                        width: '100%',
                        background: focused === key ? 'rgba(203,166,92,0.04)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${focused === key ? 'rgba(203,166,92,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 12,
                        padding: '13px 16px',
                        fontSize: 14,
                        color: '#E8E8E8',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontWeight: 300,
                        letterSpacing: '0.01em',
                        boxSizing: 'border-box',
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.button
                {...s(6)}
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden w-full"
                style={{ marginTop: 32, background: 'linear-gradient(120deg, #BF9A50, #CBA65C 35%, #E4C883 60%, #CBA65C)', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '14px', fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }} />
                <span className="relative z-10">Save car →</span>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
