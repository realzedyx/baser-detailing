export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { service, date, time, name, phone, suburb, carMake, carModel, carYear, carColour, notes } = body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Block the date immediately so no one else can book it while pending
  if (date) {
    await supabase.from("availability").upsert(
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
