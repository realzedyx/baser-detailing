# Baser Detailing — Full Site Review

_Reviewed: 2026-06-27. Scope: landing page, booking/auth/account flow, admin dashboard, infra/SEO/config._

This is an unusually **well-built** site for a one-person detailing business — the GSAP cinematic hero, the scroll choreography, the booking wizard, and the legally-thorough terms page are all above the bar. The gaps are not craft; they're **trust content** (fake/placeholder assets), **security** (the data layer is wide open), and **commercial basics** (SEO is essentially absent). Fix those three and this converts.

Severity legend: 🔴 critical · 🟠 high · 🟡 medium · ⚪ polish

---

## 0. Top priorities (if you only do five things)

1. 🔴 **Lock down Supabase RLS.** The dashboard "PIN" is `1234`, hardcoded client-side (`dashboard/page.tsx:13`) and trivially bypassed. The only thing actually protecting customer names/phones/addresses/revenue is Row-Level Security. Audit every table.
2. 🔴 **Replace placeholder trust assets.** The before/after slider literally shows the word "Placeholder" under a "Real results" heading; the testimonials are hardcoded fakes labelled "Verified customer." Both actively damage credibility.
3. 🔴 **Stop trusting the client in `/api/book`.** `amount`, `pending_points`, `reward_applied`, and `user_id` all come from the request body and are inserted verbatim — a user can book a Full Detail for $0 with a 50%-off reward and 0 points.
4. 🟠 **Add SEO.** No sitemap, no robots, no JSON-LD, no OG image. A Melbourne mobile detailer with zero local SEO is leaving the main acquisition channel on the table.
5. 🟠 **Fix the "Add another car" data-loss trap** — it overwrites the user's single saved car instead of adding one.

---

## 1. Landing page (marketing sections)

### Hero (`cinematic-hero.tsx`) — strong, two small fixes
- ✅ Live site is correct: `page.tsx:39-49` overrides all props with real detailing copy. The component's *default* props are stale ("Sobers / Days Sober / 12-step recovery") but never render.
- 🟡 **CHANGE** the stale defaults to detailing copy anyway, so a future missing override fails safe instead of advertising a recovery app.
- 🟡 **CHANGE** the leftover word **"Journey"** (line 412) and **"JS"** avatar initials inside the phone mockup — holdovers from the old template.
- 🟡 The hero sells the *loyalty program* as the headline message. A first-time visitor needs "what / where / why trust you" first; the points scheme is premature above the fold. Consider leading with the service + a "Melbourne · mobile · one car a day" trust line, loyalty second.
- ⚪ Card description is `hidden md:block` (line 488) — mobile users get a heading + CTA with no value prop.

### Why Baser (`why-baser.tsx`) — keep
- ✅ Genuinely good owner-operator positioning ("one person start to finish", "thorough not fast", "I come to you"). Real copy, no placeholders.
- 🟡 **ADD** one quantified proof point (rating, cars detailed, years) — every claim here is currently qualitative.

### How It Works (`how-it-works.tsx`) — keep
- ✅ Specific, consistent (60+45+75 min ≈ the 4–6h claim). No issues.
- ⚪ Footer "4–6 hours" note is `text-[#E8E8E8]/25` — too faint for load-bearing info.
- ⚪ **ADD** a soft "See packages →" CTA at the end; a convinced reader has nowhere to act.

### Pricing (`pricing-section.tsx`)
- 🟡 **ADD "Save $59"** to the Full Detail — Interior ($149) + Exterior ($129) = $278 vs $219, but the saving is never shown.
- 🟡 **"from" pricing with no size matrix.** Footer says "varies by vehicle size & condition" but gives no range. Customers can't self-qualify; "from" erodes trust if the real number is much higher. Add a sedan/SUV/van indication.
- 🟡 **"Introductory pricing for friends & family"** reads as "you're not the target customer" to a cold visitor. Reconsider the framing (keep the urgency, drop "friends & family").
- 🟡 The signed-out **RewardsTracker** shows a bare "Sign in to track" — make it *sell* the perk instead ("$1 spent = 1 pt toward a free detail").
- 🟡 **ADD** the satisfaction guarantee here (it currently only lives in Good-to-Know) — pricing is where purchase anxiety peaks.

### Before/After (`before-after-slider.tsx`) — 🔴 broken trust asset
- 🔴 Both sides are CSS gradients; labels read "Before · Placeholder" / "After · Placeholder" and the caption says "Placeholder images shown above" (lines 58, 114, 386) — under a **"Real results"** headline. For a detailer this is the single highest-converting asset and it's currently a credibility *negative*.
- **REPLACE** with real photos (`next/image`), or **REMOVE** the section until you have them.

### Good to Know (`good-to-know.tsx`) — keep
- ✅ Strong FAQ (rain, requirements, payment, PayID) + owner guarantee.
- ⚪ **FIX** dangling asterisk: "You don't need to go anywhere.*" (line 33) has no footnote.

### Testimonials (`testimonials-section.tsx`) — 🔴 fake reviews
- 🔴 Three hardcoded reviews (James R/Sarah M/Daniel K) labelled **"Verified customer."** Publishing invented "verified" testimonials is misleading conduct under Australian Consumer Law (ACCC). Legal + trust risk.
- **REPLACE** with real reviews tied to a source (Google Business Profile), show an aggregate ("5.0 ★ · 23 Google reviews"), or **REMOVE** the section and the "Verified" badge until you have real ones.

### Booking section (`booking-section.tsx`) — strongest section
- ✅ Real phone (0410 532 042), SMS, Instagram, email, ABN 29 765 538 947, deposit policy, live scarcity. Excellent.
- 🟠 **VERIFY** phone/email/Instagram/ABN are all live and owned — a dead handle here loses bookings directly.
- 🟠 **Scarcity backfire:** if the `availability` table is unseeded, every visitor sees red "No spots left this week" = reads as "closed." Fall back to a neutral message when count is 0/unknown.
- ⚪ **ADD** operating days/hours — absent site-wide.

---

## 2. Booking / Auth / Account flow

### Security & integrity (server) — 🔴 the big one
- 🔴 `/api/book` trusts client-supplied **`amount`, `pending_points`, `reward_applied`, `user_id`** verbatim (`api/book/route.ts:8,32-37`). Derive `user_id` from the verified JWT (`auth.uid()`), and **recompute** price/points/reward eligibility server-side.
- 🔴 The post-insert availability write uses a **fresh anon client** relying on an "anon INSERT policy" (`route.ts:48-55`) — i.e. the `availability` table is writable by anyone with the public anon key. A script could mark every day booked (booking DoS). Move behind an authenticated/service path.
- 🟠 **No server-side availability check before insert** → two users on the same open day both succeed (double-book race). Add an atomic check (RPC/transaction).
- 🟠 PATCH/DELETE (`api/booking/[id]/route.ts`) scope by `id` only, no `.eq('user_id', …)` and no status re-check — relies entirely on RLS. Add defense-in-depth.
- ⚪ No input validation / length caps / rate limiting on `/api/book`; user input flows unsanitized into the ntfy notification body.

### Flow / UX bugs
- 🟠 **"Add another car" overwrites the single saved car** (`account/car/page.tsx:71-89` upserts; account reads one car via `maybeSingle()`). Either support multiple cars or relabel to "Edit car."
- 🟠 **Deposit copy is a promise the UI never keeps.** "20% deposit secures your spot" but no payment is ever collected; `SuccessScreen` ("card, PayID, or cash") and the footer ("PayID or cash") also disagree on methods.
- 🟠 **Non-functional auth controls:** "Sign in with Google" buttons have no `onClick` (`signin:353`, `signup:463`); "Remember me" is set but never used (`signin:266`). Wire them up or remove — dead auth controls erode trust.
- 🟡 **Email-confirmation gap:** signup pushes to `/account` after 1.5s; if Supabase email confirmation is on, there's no session and the user bounces to `/signin`. Add a "check your email" state.
- 🟡 **Referral is unearnable:** the referral link is a plain `/book` with no code/param (`account:211`), but promises "50 bonus points." Implement tracking or soften the claim.
- 🟡 Manage page time slots (7:00–4:00, 30-min, no cutoffs) don't match booking (9–4 hourly with service cutoffs); the date picker ignores `availability` so you can move a booking onto an unavailable day, and the original day isn't reopened on a date change (only on cancel).
- 🟡 Cancel DELETE doesn't check `res.ok` before redirecting (`booking/[id]:134`) — a failed cancel looks successful.
- ⚪ `car.colour` (free text like "Pearl White") is used directly as a CSS `background` (`account:450`) → renders no swatch. Map to a swatch or validate.
- ⚪ Inert `export const runtime = 'edge'` in a `'use client'` file (`account/booking/[id]:3`).
- ⚪ Pricing is duplicated in 3 places (`book` strings, `rewards.ts` numbers, cutoffs) — single-source it.

---

## 3. Admin dashboard (`dashboard/page.tsx`)

- 🔴 **PIN `1234` hardcoded client-side, gate is cosmetic.** The data loads from Supabase regardless of the PIN. Replace with Supabase Auth + an `is_admin` check and move mutations server-side.
- 🟠 **Points read-modify-write race / double-award.** Reads `profiles.points`, adds in JS, writes back (`:213,406`); "Mark done → Log job" can award points twice (no idempotency). Use a Postgres `points = points + n` RPC.
- 🟠 **No error UI on load or on mutations** — `loadData` only sets state on success; failed queries/writes silently show empty tabs (exactly the silent-write-failure class). 
- 🟡 Unbounded full-table selects (4 in parallel on mount) won't scale; add limits/pagination.
- 🟡 `amount` uses `parseFloat || 0` so "abc" silently saves as $0; no validation on the log-job form.
- ⚪ PIN keypad is mouse/touch only (no keyboard entry), buttons lack `aria-label`s.

---

## 4. SEO / metadata — 🟠 mostly absent

- **MISSING:** `openGraph`/`twitter` cards, `metadataBase`, canonical (`layout.tsx` has only title+description); `robots.ts`; `sitemap.ts`; JSON-LD `LocalBusiness`/`AutoDetailing` schema (name, ABN, phone, `areaServed` = metro Melbourne, geo, hours, price range); `apple-touch-icon` / `icon-192/512` / web manifest; a `public/og-image.png` (no `public/` dir exists at all → links shared to Instagram/WhatsApp render with no preview).
- You have a **`seo-local-business` skill** that generates exactly this for Australian businesses — run it.

---

## 5. Accessibility — 🟡

- Form labels not associated (`<label>` with no `htmlFor`/`id`) across dashboard, booking, settings.
- Icon-only buttons (delete, call/SMS) use `title=` or nothing instead of `aria-label`.
- Status/availability conveyed by **colour only** (booking status, calendar) — add text/icon.
- `tel:`/`sms:`/`mailto:` via `window.open` instead of semantic `<a href>` (dashboard).
- `section-nav` dot items are clickable `<div>`s, not focusable buttons.
- `MobileNotice` has `role="dialog"` but no focus trap, no Esc-to-close, no `aria-labelledby`, focus isn't moved in.

---

## 6. Performance — 🟡

- 🟠 **`next.config.mjs: images.unoptimized = true`** disables Next image optimization globally — the biggest lever you're giving up for a photo-heavy detailing site. Re-enable and move gallery images to `public/` with `next/image`.
- 🟡 Three always-on animation engines (GSAP+ScrollTrigger, Framer Motion, Lenis). Heavy main-thread load; fine on desktop, watch low-end mobile (you've already gated several effects — keep going).
- 🟡 `CursorTracker` calls `setPos` every frame → a React re-render per frame on desktop. Prefer writing to refs/CSS vars (you already set `--mx/--my`) and drop the per-frame `setState`. Also `elementFromPoint`+`closest()` on every mousemove is a per-move DOM hit-test.
- ⚪ Fonts are `.woff`; `.woff2` would be smaller (self-hosting via `next/font/local` is already correct).
- 160 animated starfield divs in Why-Baser — each with its own spring; consider a canvas if you ever see jank.

---

## 7. Config / robustness — 🟡

- ✅ `.env.local` correctly gitignored and untracked; `SUPABASE_SERVICE_ROLE_KEY` is not `NEXT_PUBLIC_` and is unused in `src/` (safe, but confirm it's needed — remove if dead, per the standing key-rotation note).
- 🟡 **No custom error pages** — add `src/app/not-found.tsx` (404) and `src/app/error.tsx` (500) styled to match the site.
- ⚪ `.gitignore` covers `.env*.local` but not a plain `.env` — add `.env` to be safe.

---

## What to keep (don't touch)

- The GSAP pin/overlap choreography and stacking model.
- Why-Baser, How-It-Works, Good-to-Know copy.
- The booking wizard's step UX and the booking-section contact block.
- `terms/page.tsx` — legally thorough, semantic, with a working TOC. Genuinely strong.

---

## Suggested order of execution

1. **RLS audit** (gate the whole data layer) — nothing else matters if this is open.
2. **`/api/book` server-side trust fixes** + atomic availability.
3. **Real before/after photos + real testimonials** (or remove both).
4. **SEO bundle** (`seo-local-business` skill).
5. **"Add another car" + deposit/Google/Remember-me/referral** dead-feature cleanup.
6. Error pages, a11y labels, perf polish.
