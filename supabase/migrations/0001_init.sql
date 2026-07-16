-- AI with Rick — Resource Library
-- Run this whole file once in the Supabase SQL editor (or `supabase db push`).

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  format text not null check (format in ('PDF Guide', 'Video Walkthrough', 'Notion Template', 'Cheat Sheet', 'Code Repo')),
  published_date date not null default current_date,
  body_content text not null default '',
  file_path text,
  external_url text,
  visible boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one featured resource at a time, enforced by the database itself.
create unique index if not exists resources_one_featured
  on public.resources (featured) where featured;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists resources_updated_at on public.resources;
create trigger resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Log of sent newsletters (shown in /admin/newsletter).
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_md text not null,
  recipient_count integer not null default 0,
  sent_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Public traffic uses the anon key; every write goes through the
-- server (service role, bypasses RLS). The only thing the public
-- may do is read published resources.
-- ============================================================

alter table public.resources enable row level security;
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletters enable row level security;

drop policy if exists "Public can read published resources" on public.resources;
create policy "Public can read published resources"
  on public.resources for select
  using (visible = true);

-- No other policies: leads, subscribers, contact messages and
-- unpublished resources are invisible and unwritable to anon/auth users.

-- ============================================================
-- Storage: private bucket for downloadable files.
-- No storage policies are added, so only the service role can read
-- or write objects; the public gets time-limited signed URLs.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do nothing;
