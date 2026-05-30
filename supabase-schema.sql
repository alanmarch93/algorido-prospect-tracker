-- Run this in your Supabase SQL Editor

-- Prospects table
create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  linkedin_url text,
  company_name text not null,
  website text,
  stage text not null default 'Outreach'
    check (stage in ('Outreach','Contacted','Interested','Demo Set','Converted','Lost')),
  lead_source text default 'Other'
    check (lead_source in ('LinkedIn','Twitter','Referral','Cold Email','Event','Other')),
  score integer default 50 check (score >= 0 and score <= 100),
  notes text,
  account_value integer default 100,
  converted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities table
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('note','email','call','demo','status_change','created')),
  title text not null,
  body text,
  created_at timestamptz default now()
);

-- RLS
alter table prospects enable row level security;
alter table activities enable row level security;

create policy "Users manage own prospects"
  on prospects for all using (auth.uid() = user_id);

create policy "Users manage own activities"
  on activities for all using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger prospects_updated_at
  before update on prospects
  for each row execute function update_updated_at();
