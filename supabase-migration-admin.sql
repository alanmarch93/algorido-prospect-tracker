-- 1. Create profiles table (run this in Supabase SQL Editor)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can read their own profile; admins can read all
create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admin reads all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Only the user can update their own profile
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- Allow insert for new sign-ups
create policy "Users insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- 2. Admin policy on prospects — admins can read ALL prospects
create policy "Admin reads all prospects"
  on prospects for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 3. Auto-create profile on sign up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4. Manually insert profiles for existing users (run once)
insert into profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- 5. Make yourself admin — replace with your email
update profiles set is_admin = true where email = 'alanmarch93@gmail.com';
