create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  timezone text not null default 'UTC',
  reminder_time time not null default '20:30',
  goals text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  work_score integer not null check (work_score between 0 and 100),
  tasks_completed integer not null default 0 check (tasks_completed >= 0),
  tasks_planned integer not null default 0 check (tasks_planned >= 0),
  gym_status text not null check (gym_status in ('none', 'light', 'strong')),
  diet_score integer not null check (diet_score between 0 and 100),
  energy_score integer not null check (energy_score between 0 and 100),
  mood_score integer not null check (mood_score between 0 and 100),
  sleep_hours numeric not null default 0 check (sleep_hours >= 0 and sleep_hours <= 14),
  reflection text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_id uuid not null unique references public.daily_logs(id) on delete cascade,
  total_score integer not null check (total_score between 0 and 100),
  work_component integer not null,
  gym_component integer not null,
  diet_component integer not null,
  energy_component integer not null,
  consistency_bonus integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gamification_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  last_logged_date date
);

create table if not exists public.email_reminders (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  enabled boolean not null default true,
  reminder_time time not null default '20:30',
  last_sent_at timestamptz
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  source_period_start date not null,
  source_period_end date not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.daily_scores enable row level security;
alter table public.gamification_state enable row level security;
alter table public.email_reminders enable row level security;
alter table public.insights enable row level security;

create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own logs" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own scores" on public.daily_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own gamification" on public.gamification_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reminders" on public.email_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own insights" on public.insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
