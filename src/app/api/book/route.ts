export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { REWARDS, SERVICE_PRICE } from "@/lib/rewards";
import { getAddOnsForService } from "@/lib/addons";

// The client may send either the service id ("full") or its display label
// ("Full Detail"). Normalise both to the canonical id so pricing is server-trusted.
const SERVICE_LABEL = "Exterior Detail" as const;
const SERVICE_BY_LABEL: Record<string, string> = {
  "Exterior Detail": "exterior",
  "Interior Detail": "interior",
  "Full Detail": "full",
};
function resolveServiceId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (SERVICE_PRICE[raw] != null) return raw;
  return SERVICE_BY_LABEL[raw] ?? null;
}

function str(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const service = body.service;
  const date = str(body.date, 20);
  const time = str(body.time, 20);
  const name = str(body.name, 80);
  const phone = str(body.phone, 30);
  const suburb = str(body.suburb, 80);
  const carMake = str(body.carMake, 40);
  const carModel = str(body.carModel, 40);
  const carYear = str(body.carYear, 10);
  const carColour = str(body.carColour, 40);
  const notes = str(body.notes, 1000);

  // Validate required fields server-side (the client also checks, but never trust it).
  if (!name || !phone || !carMake || !carModel) {
    return NextResponse.json({ error: "Missing required details" }, { status: 400 });
  }
  const serviceId = resolveServiceId(service);
  if (!serviceId) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }
  const serviceLabel =
    Object.keys(SERVICE_BY_LABEL).find((l) => SERVICE_BY_LABEL[l] === serviceId) ?? SERVICE_LABEL;

  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
  );

  // Identity is derived from the verified JWT — never from the request body.
  let userId: string | null = null;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData } = await supabase.auth.getUser(token);
    userId = userData.user?.id ?? null;
  }

  // Server-side availability check: refuse days that are explicitly booked/blocked.
  if (date && date !== "TBD") {
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

  // Recompute price, reward, add-ons and points from server-trusted values.
  // The client's amount / pending_points / reward / add-on prices are ignored entirely.
  const basePrice = SERVICE_PRICE[serviceId];

  // Add-ons are validated against the service's own list so a tampered id/price
  // can't be smuggled in — only known add-ons for this service are counted.
  const requestedAddOnIds = Array.isArray(body.addOnIds)
    ? body.addOnIds.filter((v): v is string => typeof v === "string")
    : [];
  const matchedAddOns = getAddOnsForService(serviceId).filter((a) => requestedAddOnIds.includes(a.id));
  const addOnsTotal = matchedAddOns.reduce((sum, a) => sum + a.price, 0);

  let discountedBase = basePrice;
  let rewardId: string | null = null;

  if (userId) {
    const requestedReward = typeof body.rewardApplied === "string" ? body.rewardApplied : null;
    if (requestedReward) {
      const reward = REWARDS.find((r) => r.id === requestedReward);
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();
      const userPoints = profile?.points ?? 0;
      const serviceOk = reward && (!reward.services || reward.services.includes(serviceId));
      if (reward && userPoints >= reward.pts && serviceOk) {
        // Only one reward may be in flight at a time.
        const { data: active } = await supabase
          .from("bookings")
          .select("id")
          .eq("user_id", userId)
          .in("status", ["pending", "confirmed"])
          .not("reward_applied", "is", null)
          .limit(1);
        if (!active || active.length === 0) {
          // Reward discount applies to the base package price only, not add-ons.
          discountedBase = Math.round(basePrice * (1 - reward.discount));
          rewardId = reward.id;
        }
      }
    }
  }

  const finalAmount = discountedBase + addOnsTotal;
  // Estimate only — real points are awarded from the actual amount when the job is logged.
  const pendingPoints = userId ? finalAmount : 0;

  const addOnsSummary = matchedAddOns.length > 0
    ? matchedAddOns.map((a) => `${a.name} (+$${a.price})`).join(", ")
    : null;
  const finalNotes = [notes, addOnsSummary ? `Add-ons: ${addOnsSummary}` : null].filter(Boolean).join("\n\n") || null;

  const { error } = await supabase.from("bookings").insert([
    {
      service: serviceLabel,
      date: date ?? "TBD",
      time,
      name,
      phone,
      suburb,
      car_make: carMake,
      car_model: carModel,
      car_year: carYear,
      car_colour: carColour,
      notes: finalNotes,
      amount: finalAmount,
      status: "pending",
      created_at: new Date().toISOString(),
      user_id: userId,
      reward_applied: rewardId,
      pending_points: pendingPoints,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Block the date immediately so no one else can book it while pending.
  if (date && date !== "TBD") {
    await supabase.from("availability").upsert(
      { date, status: "booked", updated_at: new Date().toISOString() },
      { onConflict: "date" }
    );
  }

  const ntfyTopic = process.env.NTFY_TOPIC ?? "baserdetailing";
  try {
    const ntfyRes = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: "POST",
      body: `New booking request from ${name}\nService: ${serviceLabel}${addOnsSummary ? `\nAdd-ons: ${addOnsSummary}` : ""}\nDate: ${date}${time ? ` at ${time}` : ""}\nCar: ${carMake} ${carModel}\nPhone: ${phone}\nSuburb: ${suburb ?? "-"}`,
      headers: {
        Title: "New Booking Request",
        Priority: "high",
        Tags: "car,calendar",
        // Authenticated publishes get your account's quota instead of sharing
        // Cloudflare's shared egress-IP anonymous quota (which gets exhausted
        // by other Cloudflare customers' traffic, not just this app's).
        ...(process.env.NTFY_TOKEN ? { Authorization: `Bearer ${process.env.NTFY_TOKEN}` } : {}),
      },
    });
    if (!ntfyRes.ok) {
      console.error("ntfy notification rejected:", ntfyRes.status, await ntfyRes.text());
    }
  } catch (err) {
    // ntfy notification is best-effort, but log so failures are visible in Cloudflare logs
    console.error("ntfy notification failed:", err);
  }

  return NextResponse.json({ success: true });
}
