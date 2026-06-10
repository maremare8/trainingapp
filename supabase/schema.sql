-- Tabata Timer — Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) for your project.
-- It creates the tables, indexes, and Row Level Security policies.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- One row per authenticated user. id == auth.users.id.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- workouts
-- ---------------------------------------------------------------------------
create table if not exists public.workouts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  name                text not null,
  rounds              integer not null default 1 check (rounds >= 1),
  rest_between_rounds integer not null default 0 check (rest_between_rounds >= 0),
  cue_halfway         boolean not null default true,
  cue_10s             boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);

-- ---------------------------------------------------------------------------
-- exercises
-- Belong to a single workout. `position` controls ordering.
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  id             uuid primary key default gen_random_uuid(),
  workout_id     uuid not null references public.workouts (id) on delete cascade,
  position       integer not null default 0,
  name           text not null,
  type           text not null check (type in ('time', 'reps')),
  duration_sec   integer check (duration_sec is null or duration_sec >= 0),
  reps           integer check (reps is null or reps >= 0),
  rest_after_sec integer not null default 0 check (rest_after_sec >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists exercises_workout_id_idx on public.exercises (workout_id);

-- ---------------------------------------------------------------------------
-- workout_sessions (history)
-- ---------------------------------------------------------------------------
create table if not exists public.workout_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  workout_id         uuid references public.workouts (id) on delete set null,
  workout_name       text not null,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  total_duration_sec integer not null default 0,
  rounds_completed   integer not null default 0,
  status             text not null default 'completed' check (status in ('completed', 'aborted'))
);

create index if not exists workout_sessions_user_id_idx on public.workout_sessions (user_id);
create index if not exists workout_sessions_started_at_idx on public.workout_sessions (started_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger for workouts
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles         enable row level security;
alter table public.workouts         enable row level security;
alter table public.exercises        enable row level security;
alter table public.workout_sessions enable row level security;

-- profiles: a user can see / manage only their own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- workouts: owner-only access
drop policy if exists "workouts_all_own" on public.workouts;
create policy "workouts_all_own" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exercises: access governed by the parent workout's owner
drop policy if exists "exercises_all_own" on public.exercises;
create policy "exercises_all_own" on public.exercises
  for all using (
    exists (
      select 1 from public.workouts w
      where w.id = exercises.workout_id and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workouts w
      where w.id = exercises.workout_id and w.user_id = auth.uid()
    )
  );

-- workout_sessions: owner-only access
drop policy if exists "sessions_all_own" on public.workout_sessions;
create policy "sessions_all_own" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
