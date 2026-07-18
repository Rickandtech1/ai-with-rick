# Publishing New Content — the Claude Code Workflow

This is the playbook for adding a new resource (guide / cheat sheet / video) to the
AI with Rick library with Claude Code. Any Claude session that reads this file has
everything it needs.

## The one-line way (for Rick)

Open a terminal in this project folder, run `claude`, and say something like:

> Write a new resource for my library: **[topic]**. Follow CONTENT.md — full
> markdown edition, branded PDF, web write-up, publish via the API, verify live.

That's it. Details below are for Claude.

---

## Pipeline (what Claude does)

1. **Write the content** — a full markdown edition in `content/sources/<slug>.md`
   (this is what the on-site reader page at `/r/<id>/view` renders, and what the
   "Download Markdown" button serves). Style reference: the existing files in
   `content/sources/`. Voice: practical, no hype, first-person Rick.
   Put copy-worthy prompts/commands in ``` fenced blocks — the reader page
   gives every fence a Copy button automatically.
2. **Write the web write-up** — `content/sources/<slug>-body.md`, ~250–350 words:
   2 intro paragraphs, `## What's inside` bullets, `## Who it's for`. Renderer
   supports: paragraphs, ##/###, -, 1., **bold**, *italic*, `code`, [links](https://…),
   tables, ``` fences.
3. **Build the branded PDF** — one command via the generic converter:

   ```bash
   python content/md_to_pdf.py content/sources/<slug>.md content/out/<slug>.pdf "PDF Guide · AI with Rick"
   ```

   (venv with `reportlab`; fonts ship in `content/fonts/`. It renders the same
   markdown subset as the site. `build_pdfs*.py` are older bespoke examples.)
4. **Publish in one call** — multipart POST to the live API:

   ```bash
   source .env.local  # or export the two vars below
   curl -X POST https://ai-with-rick.vercel.app/api/admin/resources \
     -H "Authorization: Bearer $ADMIN_API_SECRET" \
     -F "title=..." \
     -F "description=..." \            # card blurb, one sentence
     -F "format=PDF Guide" \           # or: Cheat Sheet, Video Walkthrough, Notion Template, Code Repo
     -F "published_date=YYYY-MM-DD" \
     -F "body_content=<content/sources/<slug>-body.md" \
     -F "visible=true" -F "featured=false" \
     -F "require_lead=false" \         # default false = instant download; true = email form first
     -F "file=@content/out/<slug>.pdf;type=application/pdf" \
     -F "md_file=@content/out/<slug>.md;type=text/markdown"
   ```

   (`md_file`: copy the markdown edition into `content/out/` or reference
   `content/sources/<slug>.md` directly.)

   Video walkthroughs: skip `file`/`md_file`, pass `external_url=https://youtube…` instead.

5. **Verify live** — the resource appears on https://ai-with-rick.vercel.app
   immediately (no deploy). Check: card on homepage, detail write-up, View reader
   page, and that the download buttons return a working signed URL.

## Conventions

- **Featured**: at most one resource; setting it via API/admin unfeatures the previous one.
- **Gating**: flagship guides gated (`require_lead=true`), quick references ungated — Rick's call per resource.
- Card descriptions ≤ ~140 chars, no trailing period needed, benefit-first.
- Commit new `content/sources/*.md` files to git afterwards — they're the canonical sources.

## Other admin surfaces (no code)

- **Admin UI**: https://ai-with-rick.vercel.app/admin (login: ADMIN_EMAIL in .env.local)
  — create/edit resources, upload files, toggle visible/featured/gating, hero video,
  newsletter composer, audience tables.
- **Secrets**: everything needed is in `.env.local` (never committed).
