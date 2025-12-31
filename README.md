# PathFinder (FYP Prototype) — Psychometric Career Guidance (Technology)

Frontend-only prototype: students take a **RIASEC psychometric test**, get an explainable **career path guidance** + **technology course direction**, and follow an interactive roadmap.

- **Not an LMS**: no syllabus, modules, grading, or teaching materials
- **Prototype scope**: Technology field only
- **Database (optional, gradual)**: Supabase can be added page-by-page

## Run locally

```bash
npm install
npm run dev
```

## Supabase (Phase 1: Profile only — no authentication)

This project supports **Profile CRUD + Avatar upload** using Supabase.

### 1) Add env vars

Create a file named `.env.local` in the project root:

 ```bash
 # copy values from env.example
 VITE_SUPABASE_URL=your_supabase_project_url
 VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
 # set this to your Storage bucket name (your screenshot shows "media")
 VITE_SUPABASE_AVATAR_BUCKET=media
 ```

Restart the dev server after adding env vars.

### 2) Create database table

In Supabase SQL editor:

```sql
create table if not exists public.profiles (
  id text primary key,
  full_name text,
  email text,
  program text,
  aspiring_role text,
  interests text,
  availability text,
  avatar_url text,
  updated_at timestamptz
);

alter table public.profiles enable row level security;
```

### 3) Add RLS policies (prototype-only)

Because we are **not using authentication yet**, we allow public read/write (prototype mode).

```sql
create policy "profiles_public_read"
on public.profiles for select
using (true);

create policy "profiles_public_write"
on public.profiles for insert
with check (true);

create policy "profiles_public_update"
on public.profiles for update
using (true)
with check (true);
```

> Important: This is only acceptable for an FYP prototype. For a real system, use auth and restrict access per user.

## Supabase Auth (Phase 2: Sign Up / Login / Logout)

This app now supports **student authentication** with Supabase Auth (email + password).

### Auth settings (recommended for FYP demo)

- In Supabase Dashboard → **Authentication → Providers → Email**
- Turn **OFF** email confirmations (so Sign Up returns a session immediately)

### Profiles table (linked to auth.users)

Create (or migrate) the `profiles` table to match the auth-linked schema:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  class text,
  email text,
  avatar_url text,
  about_me text,
  skills jsonb default '[]'::jsonb,
  interests jsonb default '[]'::jsonb,
  hobbies jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
```

### Add / migrate extra profile fields (About Me + Skills)

If your `profiles` table already exists, run:

```sql
alter table public.profiles
  add column if not exists about_me text;

alter table public.profiles
  add column if not exists skills jsonb default '[]'::jsonb;

alter table public.profiles
  add column if not exists interests jsonb default '[]'::jsonb;

alter table public.profiles
  add column if not exists hobbies jsonb default '[]'::jsonb;
```

### RLS policies (authenticated user can access own profile)

```sql
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

> If you previously created public RLS policies, remove/disable them for better safety in the auth version.

  


