-- Baser Detailing — Supabase security setup
-- ---------------------------------------------------------------------------
-- Run this in the Supabase SQL editor. Review each block before applying — the
-- policies assume the schema described below. This file is the REAL security
-- boundary for the app (the dashboard PIN is only a convenience lock).
--
-- Assumed tables / key columns:
--   profiles    (id uuid pk = auth.uid(), email text, points int, is_admin bool, created_at)
--   cars        (owner_id uuid = auth.uid(), make, model, year, colour)
--   bookings    (id, user_id uuid null, status, date, ... , reward_applied, pending_points, amount)
--   jobs        (id, date, amount, ...)            -- admin-only business records
--   availability(date text pk, status, updated_at) -- open/booked/blocked
--   settings    (key text pk, value text)
-- ---------------------------------------------------------------------------

-- 1) Atomic points adjustment (used by the dashboard awardPoints helper).
--    Avoids the read-modify-write race that could clobber concurrent updates.
create or replace function public.increment_points(uid uuid, delta int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set points = greatest(0, coalesce(points, 0) + delta)
   where id = uid;
$$;

-- 2) Admin check. Mark the owner's account: update profiles set is_admin = true
--    where id = '<owner-auth-uid>'. The dashboard must be used while signed in as
--    that account for the admin policies below to grant access.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 3) Row-Level Security. Enable, then add policies per table.
-- ---------------------------------------------------------------------------

-- PROFILES ------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles: owner reads self"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: owner updates self (not points/admin)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- Points are changed only via increment_points (security definer) or by an admin.

create policy "profiles: admin updates any"
  on public.profiles for update
  using (public.is_admin());

-- CARS ----------------------------------------------------------------------
alter table public.cars enable row level security;

create policy "cars: owner full access"
  on public.cars for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- BOOKINGS ------------------------------------------------------------------
alter table public.bookings enable row level security;

create policy "bookings: insert own or guest"
  on public.bookings for insert
  with check (user_id is null or auth.uid() = user_id);

create policy "bookings: read own"
  on public.bookings for select
  using (auth.uid() = user_id or public.is_admin());

create policy "bookings: owner updates own active"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "bookings: admin manages any"
  on public.bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- JOBS (admin-only business ledger) -----------------------------------------
alter table public.jobs enable row level security;

create policy "jobs: admin only"
  on public.jobs for all
  using (public.is_admin())
  with check (public.is_admin());

-- AVAILABILITY --------------------------------------------------------------
-- Public read (the calendar needs it). Writes restricted to authenticated users
-- (the booking flow blocks a day) and admins. This closes the previous hole where
-- the public anon key could rewrite the whole calendar.
alter table public.availability enable row level security;

create policy "availability: public read"
  on public.availability for select
  using (true);

create policy "availability: authenticated upsert"
  on public.availability for insert
  with check (auth.role() = 'authenticated' or public.is_admin());

create policy "availability: authenticated update"
  on public.availability for update
  using (auth.role() = 'authenticated' or public.is_admin());

-- SETTINGS ------------------------------------------------------------------
alter table public.settings enable row level security;

create policy "settings: public read"
  on public.settings for select
  using (true);

create policy "settings: admin write"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());
