export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace(/^Bearer\s+/i, '');

  // Service role client: can update any user's profile, bypasses RLS.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Verify the caller's JWT.
  const { data: userData } = await admin.auth.getUser(token);
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = userData.user.id;
  const referrerId = userData.user.user_metadata?.referrer_id as string | undefined;
  if (!referrerId || referrerId === userId) {
    return NextResponse.json({ error: 'No valid referrer' }, { status: 400 });
  }

  // Idempotency: bail if already credited.
  const { data: profile } = await admin
    .from('profiles')
    .select('referral_credited')
    .eq('id', userId)
    .single();
  if (profile?.referral_credited) {
    return NextResponse.json({ ok: true, already: true });
  }

  // Verify referrer exists.
  const { data: referrerProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', referrerId)
    .single();
  if (!referrerProfile) {
    return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
  }

  // Award 50 pts to both. increment_points is SECURITY DEFINER so it bypasses RLS.
  const [r1, r2] = await Promise.all([
    admin.rpc('increment_points', { uid: userId, delta: 50 }),
    admin.rpc('increment_points', { uid: referrerId, delta: 50 }),
  ]);

  // Fallback to direct update if RPC not available.
  if (r1.error) {
    const { data: p } = await admin.from('profiles').select('points').eq('id', userId).single();
    await admin.from('profiles').update({ points: (p?.points ?? 0) + 50 }).eq('id', userId);
  }
  if (r2.error) {
    const { data: p } = await admin.from('profiles').select('points').eq('id', referrerId).single();
    await admin.from('profiles').update({ points: (p?.points ?? 0) + 50 }).eq('id', referrerId);
  }

  // Mark as credited so this never runs twice.
  await admin.from('profiles').update({ referral_credited: true }).eq('id', userId);

  return NextResponse.json({ ok: true });
}
