'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Home } from 'lucide-react';

const GOLD = '#CBA65C';

export default function ForgotPasswordPage() {
  const router = useRouter();
  // "request" = ask for the reset email; "reset" = Supabase opened a recovery
  // session from the email link, so we let the user set a new password.
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset');
    });
    return () => subscription.unsubscribe();
  }, []);

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push('/account'), 1400);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0a0a] relative flex items-center justify-center px-6">
      <Link
        href="/signin"
        className="fixed top-5 left-5 z-50 flex items-center gap-2"
        style={{
          background: 'rgba(10,10,10,0.75)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: '8px 14px',
          color: 'rgba(255,255,255,0.45)',
          fontSize: 12,
        }}
      >
        <Home size={14} strokeWidth={1.8} />
        Sign in
      </Link>

      <div className="w-full max-w-sm relative z-10 rounded-2xl border border-white/[0.06] p-7" style={{ backgroundColor: '#101010' }}>
        <div className="mx-auto mb-5 w-10 h-10 rounded-full border border-[#CBA65C]/30 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: GOLD }}>B</span>
        </div>

        {mode === 'reset' ? (
          done ? (
            <p className="text-center text-sm" style={{ color: '#E8E8E8' }}>
              Password updated. Taking you to your account&hellip;
            </p>
          ) : (
            <form onSubmit={updatePassword} className="space-y-4">
              <div className="text-center mb-2">
                <h1 className="text-lg font-bold text-white">Set a new password</h1>
                <p className="text-white/55 text-xs mt-1">Choose a new password for your account.</p>
              </div>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white placeholder:text-white/30 focus:border-[#CBA65C]/40 outline-none"
              />
              {error && <p className="text-center text-xs" style={{ color: '#f87171' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: GOLD, color: '#0a0a0a' }}
              >
                {loading ? 'Saving…' : 'Update password'}
              </button>
            </form>
          )
        ) : sent ? (
          <div className="text-center">
            <h1 className="text-lg font-bold text-white mb-2">Check your email</h1>
            <p className="text-white/55 text-xs leading-relaxed">
              If an account exists for <span style={{ color: GOLD }}>{email}</span>, a password reset link is on its way.
              Open it on this device to set a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={sendReset} className="space-y-4">
            <div className="text-center mb-2">
              <h1 className="text-lg font-bold text-white">Reset your password</h1>
              <p className="text-white/55 text-xs mt-1">We&rsquo;ll email you a secure reset link.</p>
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white placeholder:text-white/30 focus:border-[#CBA65C]/40 outline-none"
            />
            {error && <p className="text-center text-xs" style={{ color: '#f87171' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: GOLD, color: '#0a0a0a' }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
