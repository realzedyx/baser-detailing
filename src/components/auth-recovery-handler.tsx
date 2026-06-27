'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Global safety net for password-reset links.
//
// Supabase appends the recovery token as a URL hash (#access_token=…&type=recovery).
// If the email's redirect target isn't in Supabase's allow-list, Supabase silently
// falls back to the Site URL (our landing page) and the token lands there with
// nothing to handle it — so the user just sees the homepage.
//
// This component is mounted on every page. Whenever a recovery session appears
// (or a recovery hash is present), it routes the user to the reset-password form.
export function AuthRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const goReset = () => {
      if (window.location.pathname !== '/forgot-password') {
        router.replace('/forgot-password?recovery=1');
      }
    };

    // Case 1: the recovery hash is still in the URL (caught before Supabase strips it).
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      goReset();
    }

    // Case 2: Supabase parsed the hash and fired the recovery event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') goReset();
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
