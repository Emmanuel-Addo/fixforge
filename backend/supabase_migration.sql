-- FixForge Supabase Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─────────────────────────────────────────
-- 1. PROJECTS — connected repositories
-- ─────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  owner       text not null,
  repo        text not null,
  created_at  timestamptz default now()
);

alter table public.projects enable row level security;
create policy "Users see own projects" on public.projects
  for all using (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- 2. FILE_EDITS — track every accepted change
-- ─────────────────────────────────────────
create table if not exists public.file_edits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  owner             text not null,
  repo              text not null,
  file_path         text not null,
  original_content  text,
  modified_content  text not null,
  status            text default 'applied',   -- 'applied' | 'pushed'
  created_at        timestamptz default now()
);

alter table public.file_edits enable row level security;
create policy "Users see own edits" on public.file_edits
  for all using (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- 3. PUSH_HISTORY — track GitHub pushes
-- ─────────────────────────────────────────
create table if not exists public.push_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  owner           text not null,
  repo            text not null,
  commit_message  text not null,
  files_changed   jsonb,
  github_sha      text,
  status          text default 'success',
  created_at      timestamptz default now()
);

alter table public.push_history enable row level security;
create policy "Users see own pushes" on public.push_history
  for all using (auth.uid() = user_id);
