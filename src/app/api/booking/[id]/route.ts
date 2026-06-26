export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function client(authHeader: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

async function verifyUser(supabase: ReturnType<typeof client>, authHeader: string) {
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data } = await supabase.auth.getUser(token);
  return data.user?.id ?? null;
}

const FAR_ENOUGH = 24 * 60 * 60 * 1000;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = client(authHeader);
  const userId = await verifyUser(supabase, authHeader);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { service, date, time, notes } = body;

  // Load the existing row (scoped to this user) so we can guard status and manage availability.
  const { data: existing } = await supabase
    .from("bookings")
    .select("date, status")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status !== "pending" && existing.status !== "confirmed") {
    return NextResponse.json({ error: "This booking can no longer be changed." }, { status: 409 });
  }

  // If the date is moving, make sure the new day isn't already taken.
  if (date && date !== existing.date) {
    const { data: day } = await supabase
      .from("availability")
      .select("status")
      .eq("date", date)
      .maybeSingle();
    if (day && (day.status === "booked" || day.status === "blocked")) {
      return NextResponse.json(
        { error: "That day is no longer available. Please pick another." },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({ service, date, time: time || null, notes: notes || null })
    .eq("id", params.id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Availability bookkeeping on a date change: reopen the old day (if far enough out)
  // and block the new one — otherwise the old day leaks as permanently blocked.
  if (date && date !== existing.date) {
    if (existing.date) {
      const oldTime = new Date(`${existing.date}T00:00:00`).getTime();
      if (oldTime - Date.now() > FAR_ENOUGH) {
        await supabase.from("availability").upsert(
          { date: existing.date, status: "open", updated_at: new Date().toISOString() },
          { onConflict: "date" }
        );
      }
    }
    await supabase.from("availability").upsert(
      { date, status: "booked", updated_at: new Date().toISOString() },
      { onConflict: "date" }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = client(authHeader);
  const userId = await verifyUser(supabase, authHeader);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Grab the booked date (scoped to this user) before cancelling so we can reopen the day.
  const { data: existing } = await supabase
    .from("bookings")
    .select("date, status")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reopen the day if the booking is more than 24h away — short-notice cancels stay closed.
  if (existing?.date) {
    const bookingTime = new Date(`${existing.date}T00:00:00`).getTime();
    if (bookingTime - Date.now() > FAR_ENOUGH) {
      await supabase.from("availability").upsert(
        { date: existing.date, status: "open", updated_at: new Date().toISOString() },
        { onConflict: "date" }
      );
    }
  }

  return NextResponse.json({ success: true });
}
