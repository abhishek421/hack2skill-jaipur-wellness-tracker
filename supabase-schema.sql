-- Run this in Supabase SQL editor to set up the database

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mood integer not null check (mood between 1 and 5),
  stress_level integer not null check (stress_level between 1 and 5),
  energy_level integer not null check (energy_level between 1 and 5),
  created_at timestamptz default now() not null
);

create table if not exists triggers (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid references check_ins(id) on delete cascade not null,
  trigger_name text not null
);

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid references check_ins(id) on delete cascade not null,
  content text not null
);

create table if not exists wellness_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  insight text not null,
  recommendation text not null,
  generated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table check_ins enable row level security;
alter table triggers enable row level security;
alter table reflections enable row level security;
alter table wellness_actions enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users own check_ins" on check_ins
  for all using (auth.uid() = user_id);

create policy "Users own triggers via check_ins" on triggers
  for all using (
    exists (select 1 from check_ins where check_ins.id = triggers.check_in_id and check_ins.user_id = auth.uid())
  );

create policy "Users own reflections via check_ins" on reflections
  for all using (
    exists (select 1 from check_ins where check_ins.id = reflections.check_in_id and check_ins.user_id = auth.uid())
  );

create policy "Users own wellness_actions" on wellness_actions
  for all using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists check_ins_user_id_created_at on check_ins(user_id, created_at desc);
create index if not exists triggers_check_in_id on triggers(check_in_id);
create index if not exists wellness_actions_user_id on wellness_actions(user_id, generated_at desc);
