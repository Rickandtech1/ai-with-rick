-- Site-wide settings editable from /admin (currently: the hero video card).
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- The homepage renders the hero video from here, so reads are public.
-- Writes happen only through the service role, which bypasses RLS.
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);
