-- ============================================================
-- CUCKOO PROSPECT DASHBOARD – Supabase SQL Setup
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. BRANCHES TABLE
create table if not exists public.branches (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

-- 2. PROFILES TABLE (extends auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  role       text not null default 'client_consultant'
               check (role in ('admin','branch_manager','client_consultant')),
  branch_id  uuid references public.branches(id) on delete set null,
  status     text not null default 'pending'
               check (status in ('pending','active','inactive')),
  created_at timestamptz default now()
);

-- 3. PROSPECTS TABLE
create table if not exists public.prospects (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),
  full_name                 text not null,
  ic                        text not null,
  date_of_birth             date,
  mobile_number             text,
  email                     text,
  installation_address      text,
  postcode                  text,
  employer_name             text,
  emergency_contact_name    text,
  emergency_contact_number  text,
  status                    text not null default 'new'
                              check (status in ('new','contacted','in_progress','converted','lost')),
  assigned_to               uuid references public.profiles(id) on delete set null,
  branch_id                 uuid references public.branches(id) on delete set null,
  notes                     text,
  source                    text
);

-- ============================================================
-- 4. TRIGGER: auto-create profile on sign-up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client_consultant'),
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

alter table public.branches  enable row level security;
alter table public.profiles  enable row level security;
alter table public.prospects enable row level security;

-- ── Branches ────────────────────────────────────────────────
-- Anyone authenticated can read branches
create policy "branches_select" on public.branches
  for select using (auth.role() = 'authenticated');

-- Only admin can insert/update/delete
create policy "branches_insert" on public.branches
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "branches_delete" on public.branches
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── Profiles ────────────────────────────────────────────────
-- Users can read their own profile; admin reads all
create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'branch_manager')
  );

-- Users can update their own profile
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- Admin can update any profile (for approvals / role changes)
create policy "profiles_update_admin" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Trigger inserts profile on signup (security definer, bypasses RLS)

-- ── Prospects ───────────────────────────────────────────────
-- Public insert (QR form — no auth)
create policy "prospects_insert_public" on public.prospects
  for insert with check (true);

-- Client Consultant: only their own assigned prospects
create policy "prospects_select_consultant" on public.prospects
  for select using (
    assigned_to = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'client_consultant' and status = 'active')
  );

-- Branch Manager: all prospects in their branch
create policy "prospects_select_manager" on public.prospects
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'branch_manager' and status = 'active'
      and branch_id = prospects.branch_id
    )
  );

-- Admin: all prospects
create policy "prospects_select_admin" on public.prospects
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active')
  );

-- Update: consultant updates own, manager updates branch, admin updates all
create policy "prospects_update_consultant" on public.prospects
  for update using (
    assigned_to = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'client_consultant' and status = 'active')
  );
create policy "prospects_update_manager" on public.prospects
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'branch_manager' and status = 'active'
      and branch_id = prospects.branch_id
    )
  );
create policy "prospects_update_admin" on public.prospects
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active')
  );

-- ============================================================
-- 6. SEED: Insert your first admin account
--    Replace the email below with YOUR email, then run.
--    Do this AFTER you have signed up via the dashboard.
-- ============================================================

-- UPDATE public.profiles
-- SET role = 'admin', status = 'active'
-- WHERE email = 'YOUR_EMAIL_HERE@example.com';

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
