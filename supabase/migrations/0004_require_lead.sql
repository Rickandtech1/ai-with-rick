-- Per-resource choice: gate the download behind the name/email form
-- (default), or let visitors download instantly with no form.
alter table public.resources add column if not exists require_lead boolean not null default true;
