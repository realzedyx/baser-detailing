export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Awards 50 referral points to BOTH the new (referred) user and their referrer,
// exactly once, the first time the referred user reaches a logged-in state
// (signup complete). Idempotency is tracked in the referred user's metadata so
// this needs no DB schema changes.
export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authHeader.replace(/^Bearer\s+/i, '');

  // Service-role client: required to bump the *referrer's* points and to edit
  // the referred user's metadata — both bypass row-level security.
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

  // Identity comes from the verified JWT, never the request body.
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const md = (user.user_metadata || {}) as Record<string, unknown>;
  const referrerId = typeof md.referrer_id === 'string' ? md.referrer_id : null;

  // Already credited, or no referrer, or self-referral — nothing to do.
  if (md.referral_credited) return NextResponse.json({ ok: true, already: true });
  if (!referrerId || referrerId === user.id) {
    return NextResponse.json({ error: 'No valid referrer' }, { status: 400 });
  }

  // Referrer must be a real existing account. Validate against auth (not a
  // profiles row, which may not exist yet) so a freshly-signed-up referrer
  // still counts and a bad/non-UUID ref is rejected cleanly.
  const { data: refUser } = await admin.auth.admin.getUserById(referrerId);
  if (!refUser?.user) {
    // Bad/stale referrer — mark as handled so we don't keep retrying every load.
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...md, referrer_id: null, referral_credited: true },
    });
    return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
  }

  // Mark credited FIRST so a double-fire (two rapid loads) can't double-award.
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...md, referrer_id: null, referral_credited: true },
  });

  // Award 50 to each. Prefer the atomic RPC; fall back to read-modify-write,
  // creating the profiles row if it doesn't exist yet (so points never no-op).
  const award = async (uid: string) => {
    const { error } = await admin.rpc('increment_points', { uid, delta: 50 });
    if (!error) return;
    const { data: p } = await admin.from('profiles').select('points').eq('id', uid).maybeSingle();
    if (p) {
      await admin.from('profiles').update({ points: ((p.points as number) ?? 0) + 50 }).eq('id', uid);
    } else {
      await admin.from('profiles').insert({ id: uid, points: 50 });
    }
  };
  await Promise.all([award(user.id), award(referrerId)]);

  return NextResponse.json({ ok: true });
}
