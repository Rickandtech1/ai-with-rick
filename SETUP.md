# AI with Rick — Setup & Operations

The design spec lives in `README.md` (untouched). This file covers running,
configuring, and operating the real app.

## Stack

Next.js (App Router) + TypeScript + Tailwind · Supabase (Postgres, Storage, Auth) · Resend (email) · Vercel (hosting).

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local
chmod 600 .env.local   # lock down permissions before adding secrets
# fill in .env.local (see sections below), then:
npm run dev
```

The site is at http://localhost:3000, the admin at http://localhost:3000/admin
(login page: http://localhost:3000/login — deliberately not linked anywhere).

## 2. Supabase

1. In your Supabase project, open **SQL Editor** and run the whole of
   `supabase/migrations/0001_init.sql`. This creates the five tables
   (`resources`, `leads`, `newsletter_subscribers`, `contact_messages`,
   `newsletters`), all RLS policies, and the private `resources` storage bucket.
2. Copy from **Project Settings → API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never ships to the browser)

**Security model:** the public reads `resources` where `visible = true` via RLS
and nothing else. Every write (leads, subscribers, messages, admin CRUD) goes
through server code using the service-role key. Files live in a private bucket;
visitors only ever get 1-hour signed URLs, issued after the lead form is saved.

## 3. Admin user

1. Supabase Dashboard → **Authentication → Users → Add user** — create the one
   admin account (your email + a strong password), with auto-confirm on.
2. Set `ADMIN_EMAIL` in `.env.local` to that exact email. Only this account can
   see `/admin`, even if other accounts somehow exist.
3. Recommended: **Authentication → Sign In / Up → disable public sign-ups.**

## 4. Resend (contact notifications + newsletter)

1. Create an account at https://resend.com → **API Keys** → create one → set
   `RESEND_API_KEY`.
2. Set `CONTACT_NOTIFY_EMAIL` to the address that should receive contact-form
   notifications.
3. **Domain verification (needed before newsletters can reach subscribers):**
   Resend → **Domains → Add domain** (e.g. `aiwithrick.com`), add the DNS
   records it shows you, wait for "Verified", then set
   `EMAIL_FROM="AI with Rick <hello@aiwithrick.com>"`.
   - Until then, leave `EMAIL_FROM` unset: the sandbox sender
     (`onboarding@resend.dev`) is used, which can **only deliver to your own
     Resend account email** — fine for contact notifications and for testing
     the newsletter on yourself, but real subscriber sends will fail.
4. Mind Resend's free-tier limits (currently 100 emails/day, 3,000/month) once
   the list grows.

## 5. Newsletter — how it works

- Visitors join via the homepage form, or by ticking "Also email me when new
  resources drop" on any download form. Both paths land in
  `newsletter_subscribers` (duplicates are merged; re-subscribing after an
  unsubscribe re-activates).
- **/admin/newsletter**: write a subject + markdown body, preview it, hit Send.
  The app emails everyone active on the list *at that moment* (batched 100 per
  Resend call), each message carrying a personal `/unsubscribe?token=…` link
  and a `List-Unsubscribe` header. Sends are logged under "Past sends".
- Unsubscribes flip `unsubscribed_at` and drop out of all future sends
  automatically.

## 6. Programmatic publishing (Claude Code → live site)

Generate a secret once and set it as `ADMIN_API_SECRET`:

```bash
openssl rand -hex 32
```

**JSON (link-out resource or pre-uploaded file):**

```bash
curl -X POST "$SITE_URL/api/admin/resources" \
  -H "Authorization: Bearer $ADMIN_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Debugging Agent Loops",
    "description": "A one-page reference for the failure modes that keep agents stuck.",
    "format": "Cheat Sheet",
    "published_date": "2026-07-13",
    "body_content": "## Why loops happen\n\nParagraphs of markdown…",
    "external_url": null,
    "visible": true,
    "featured": false
  }'
```

**Multipart (uploads the file and publishes in one call):**

```bash
curl -X POST "$SITE_URL/api/admin/resources" \
  -H "Authorization: Bearer $ADMIN_API_SECRET" \
  -F title="Prompt Engineering Field Notes" \
  -F description="The patterns that actually move outputs." \
  -F format="PDF Guide" \
  -F published_date="2026-07-13" \
  -F body_content=$'## The short version\n\nMarkdown body here.' \
  -F visible=true \
  -F file=@./field-notes.pdf
```

Fields: `title` (required), `format` (required — one of `PDF Guide`,
`Video Walkthrough`, `Notion Template`, `Cheat Sheet`, `Code Repo`),
`description`, `published_date` (YYYY-MM-DD, defaults to today),
`body_content` (markdown), `external_url`, `visible` (default true),
`featured` (default false — featuring un-features the previous one).
Returns `201` with the row and its `public_url`. The new resource is live on
the next page load — no redeploy.

## 7. Deploy to Vercel

```bash
vercel        # or connect the repo in the Vercel dashboard
```

1. Add every variable from `.env.example` in **Vercel → Project → Settings →
   Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to the production URL).
2. Deploy. The public pages are rendered dynamically from Supabase, so
   publishing content never requires a redeploy.

## 8. Content authoring notes

- **Write-ups** (`body_content`) and **newsletter bodies** support: paragraphs
  (blank line between), `## Heading`, `### Subheading`, `- bullet lists`,
  `**bold**`, `*italic*`, `[link text](https://…)`. Raw HTML is escaped, never
  rendered.
- A resource with an uploaded **file** gets the gated download flow (lead form
  → signed link). A resource with only an **external URL** (e.g. a YouTube
  walkthrough) skips the gate and links out directly. One with neither shows
  just the write-up.
- Social links, the YouTube channel URL, and the public contact email all live
  in `lib/site-config.ts` — edit that one file when handles change.
