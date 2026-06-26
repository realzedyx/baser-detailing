export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { service, date, time, name, phone, suburb, carMake, carModel, carYear, carColour, notes, userId, rewardApplied, pendingPoints, amount } = body;

  const authHeader = req.headers.get('Authorization');

  // Use the user's JWT if available so auth.uid() works in RLS and user_id is stored correctly
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
  );

  const { error } = await supabase.from("bookings").insert([
    {
      service,
      date,
      time,
      name,
      phone,
      suburb,
      car_make: carMake,
      car_model: carModel,
      car_year: carYear || null,
      car_colour: carColour || null,
      notes,
      amount: amount || null,
      status: "pending",
      created_at: new Date().toISOString(),
      user_id: userId || null,
      reward_applied: rewardApplied || null,
      pending_points: pendingPoints || 0,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Block the date immediately so no one else can book it while pending
  if (date) {
    // Use anon client (no auth) for availability upsert — anon INSERT policy covers this
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await anonSupabase.from("availability").upsert(
      { date, status: "booked", updated_at: new Date().toISOString() },
      { onConflict: "date" }
    );
  }

  const ntfyTopic = process.env.NTFY_TOPIC ?? "baserdetailing";
  try {
    await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: "POST",
      body: `New booking request from ${name}\nService: ${service}\nDate: ${date}${time ? ` at ${time}` : ""}\nCar: ${carMake} ${carModel}\nPhone: ${phone}\nSuburb: ${suburb}`,
      headers: {
        Title: "New Booking Request",
        Priority: "high",
        Tags: "car,calendar",
      },
    });
  } catch {
    // ntfy notification is best-effort
  }

  return NextResponse.json({ success: true });
}
