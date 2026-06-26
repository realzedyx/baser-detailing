export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const body = await req.json();
  const { service, date, time, notes } = body;

  const { error } = await supabase
    .from('bookings')
    .update({ service, date, time: time || null, notes: notes || null })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Grab the booked date before cancelling so we can reopen the day if it's far enough out
  const { data: existing } = await supabase
    .from('bookings')
    .select('date')
    .eq('id', params.id)
    .single();

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reopen the day if the booking is more than 24h away — short-notice cancels stay closed
  if (existing?.date) {
    const bookingTime = new Date(`${existing.date}T00:00:00`).getTime();
    if (bookingTime - Date.now() > 24 * 60 * 60 * 1000) {
      await supabase.from('availability').upsert(
        { date: existing.date, status: 'open', updated_at: new Date().toISOString() },
        { onConflict: 'date' }
      );
    }
  }

  return NextResponse.json({ success: true });
}
