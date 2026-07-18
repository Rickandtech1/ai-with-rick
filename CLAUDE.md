@AGENTS.md

# AI with Rick — project notes for Claude

Link-in-bio resource library for "AI with Rick". Owner: Rick (non-developer —
explain in plain language, handle the technical work end-to-end, verify before
claiming done).

- **Live site:** https://ai-with-rick.vercel.app (the ONLY canonical URL —
  `ai-with-rick-xxxx-….vercel.app` URLs are frozen old deployments; never share them)
- **Admin UI:** /admin (Supabase Auth, single admin = ADMIN_EMAIL in .env.local)
- **Repo:** github.com/Rickandtech1/ai-with-rick — pushing `main` auto-deploys via
  Vercel (~1 min). Always verify the change on the live site after pushing.

## Stack & layout

Next.js App Router + TypeScript + Supabase (Postgres/Storage/Auth, project
`qizedpeihympzhspjssw`) + Resend. Styling lives in `app/globals.css`
(design tokens from the README design spec).

- `app/` pages · `components/` UI · `actions/` server actions · `lib/` clients & helpers
- `lib/site-config.ts` — all outward-facing links/identity (social URLs still placeholders)
- `supabase/migrations/` — SQL history. **Claude cannot run DDL**; give Rick the
  SQL block to paste into the Supabase SQL editor and wait for his confirmation.
- `content/` — content pipeline: brand fonts, PDF build scripts, canonical markdown sources
- `README.md` = the design spec (do not overwrite). `SETUP.md` = ops runbook.
  `CONTENT.md` = content publishing playbook.

## The two kinds of changes

1. **Content** (resources, hero video, anything in DB/Storage) — publish via the
   admin API per **CONTENT.md**; live instantly, no deploy, no git.
2. **Code/design** — edit, `npm run build` must pass, commit, push, then poll the
   live site until the change is visible and say so.

## Conventions & gotchas

- Secrets live in `.env.local` only (never commit; `.gitignore` covers it). The
  publish API auth is `Authorization: Bearer $ADMIN_API_SECRET`.
- Resend is in **sandbox**: emails deliver only to ricktey02@gmail.com until a
  domain is verified at resend.com/domains. Newsletter sending to real
  subscribers is the one unfinished core feature.
- `lib/markdown.ts` is the site's only markdown renderer (write-ups, newsletter,
  reader pages). Supported syntax is listed in its header — don't feed it
  anything fancier without extending it.
- Downloads: signed URLs (1 h). Resources can be ungated per-row
  (`require_lead=false` → instant download, no lead form).
- "Featured" is exclusive — setting it clears the previous one (enforced in code
  and by a partial unique index).
- Public reads go through RLS with the anon key; admin/server writes use the
  service role. Keep that split.
- For UI work: screenshot-verify with Playwright before pushing (a venv with
  playwright/reportlab/pypdf may need creating in the session scratchpad; brand
  fonts are in `content/fonts/`). Lead-form email field: use `#lead-email`
  (three elements match the label "Email").
- Rick runs dashboards (Vercel/Supabase/Resend) himself — give exact click paths,
  one step at a time, and verify results from here afterwards.
