-- =============================================
-- RouteFlow Database Schema for Supabase
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── ROUTES TABLE ───────────────────────────
create table if not exists routes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── STOPS TABLE ────────────────────────────
create table if not exists stops (
  id         uuid primary key default gen_random_uuid(),
  route_id   uuid references routes(id) on delete cascade not null,
  label      text,
  address    text not null,
  lat        float8,
  lng        float8,
  position   int not null,
  created_at timestamptz default now()
);

-- ─── RLS POLICIES ───────────────────────────

-- Enable RLS
alter table routes enable row level security;
alter table stops  enable row level security;

-- Routes: users own their rows
create policy "routes_select_own" on routes
  for select using (auth.uid() = user_id);

create policy "routes_insert_own" on routes
  for insert with check (auth.uid() = user_id);

create policy "routes_update_own" on routes
  for update using (auth.uid() = user_id);

create policy "routes_delete_own" on routes
  for delete using (auth.uid() = user_id);

-- Stops: users can access stops belonging to their own routes
create policy "stops_select_own" on stops
  for select using (
    route_id in (select id from routes where user_id = auth.uid())
  );

create policy "stops_insert_own" on stops
  for insert with check (
    route_id in (select id from routes where user_id = auth.uid())
  );

create policy "stops_update_own" on stops
  for update using (
    route_id in (select id from routes where user_id = auth.uid())
  );

create policy "stops_delete_own" on stops
  for delete using (
    route_id in (select id from routes where user_id = auth.uid())
  );

-- ─── INDEXES ────────────────────────────────
create index if not exists idx_routes_user_id    on routes(user_id);
create index if not exists idx_routes_updated_at on routes(updated_at desc);
create index if not exists idx_stops_route_id    on stops(route_id);
create index if not exists idx_stops_position    on stops(route_id, position);

-- ─── AUTO-UPDATE updated_at ─────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_routes_updated_at on routes;
create trigger set_routes_updated_at
  before update on routes
  for each row execute function update_updated_at();

-- ─── PROFILES TABLE ─────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  role       text check (role in (
               'food_delivery',
               'parcel_agent', 
               'ecommerce_employee',
               'traveller',
               'other'
             )),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

grant select, insert, update on profiles to authenticated;

-- Auto-create empty profile on signup
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at for profiles
drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
