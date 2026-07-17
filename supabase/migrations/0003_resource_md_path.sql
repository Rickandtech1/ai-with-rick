-- Optional markdown twin of a resource's main file, offered as a
-- second download button after the lead form.
alter table public.resources add column if not exists md_path text;
