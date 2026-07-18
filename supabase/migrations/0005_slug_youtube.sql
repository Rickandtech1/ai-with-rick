-- Speakable URLs (/r/vibe-coding instead of /r/<uuid>) and the
-- video↔resource cross-link for the YouTube-first workflow.
alter table public.resources add column if not exists slug text unique;
alter table public.resources add column if not exists youtube_url text;
