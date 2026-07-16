# Handoff: AI with Rick — Resource Library Landing Page

## Overview
A single-page, gated-content-download landing page for "AI with Rick," a creator sharing AI/tech tutorials and guides on social media. It is the one link-in-bio destination: visitors browse a growing library of resources (PDF guides, video walkthroughs, Notion templates, cheat sheets, code repos), open a resource to read a short write-up, then trade a first name / last name / email for a download. No sales pressure, no urgency tactics — a straightforward value exchange. The library is designed to grow indefinitely, so the resource card must be a true repeatable component driven by data, not hardcoded per item.

## About the Design Files
The file in this bundle (`AI with Rick Library - Glass v3.dc.html`) is a **design reference built in a proprietary HTML templating format** — it is a working, click-through prototype showing intended look, content, and behavior, but it is **not production code to copy directly**. Do not attempt to run its custom tags (`<x-dc>`, `<sc-if>`, `<sc-for>`, the `data-props` script block) as-is. Treat it purely as a visual/behavioral spec and **recreate the design in the target codebase's existing environment** (React, Vue, plain JS, etc.) using its established component patterns, state management, and styling approach. If no frontend framework exists yet in the target repo, React is a safe default given the design's component-driven, stateful nature.

## Fidelity
**High-fidelity.** Every color, font, spacing value, and copy string below is final and pulled directly from the working prototype. Recreate pixel-accurately.

## Screens / Views
The page is a single HTML document with three mutually-exclusive top-level views, controlled by one piece of state (`view: 'library' | 'detail'`), plus two always-visible sections (Contact, Footer) that appear below both views.

### 1. Library View (default)
**Purpose:** Browse the growing resource library; entry point for everything else.

**Layout (top to bottom, all sections `max-width: 1240px`, centered, `padding: 0 48px`):**

- **Header** — sticky (`position: sticky; top: 0; z-index: 10`), full-width frosted bar constrained to 1240px, flex row, `justify-content: space-between`, `padding: 18px 48px`.
  - Left: wordmark "AI with Rick", 17px / weight 700 / letter-spacing -0.01em, clickable → returns to library view.
  - Right: nav, flex row `gap: 28px`: "Resources" (14px/600, color `#CC785C`, links to `#resources`) and "Contact" (14px/600, color `#1D1D1F`, links to `#contact`). In Detail view this nav is replaced by a single "← Back to library" text button in the same style.

- **Hero** — `padding: 88px 48px 130px`, two-column grid `1.15fr 0.85fr`, `gap: 56px`, vertically centered.
  - Left column: pill eyebrow "A growing library of notes" (12.5px/700, uppercase, letter-spacing 0.06em, color `#CC785C`, background `rgba(204,120,92,0.1)`, `padding: 8px 16px`, `border-radius: 100px`). Below it, H1 "Practical AI knowledge, minus the hype." (58px/700, line-height 1.08, letter-spacing -0.02em, max-width 600px). Below that, intro paragraph (18px/400, color `#6E6E73`, line-height 1.6, max-width 500px): "I'm Rick — I write and record what I'm actually learning about AI and modern tooling, then package the useful parts into guides you can keep." CTA button "Browse the library ↓" — dark pill button (bg `#1D1D1F`, text white, 15px/600, `padding: 16px 28px`, `border-radius: 14px`, shadow `0 10px 24px rgba(29,29,31,0.22)`), scrolls to `#resources`.
  - Right column: a decorative, **functional** floating "video card" — an `<a>` tag linking out to `https://www.youtube.com/@aiwithrick` (opens in new tab). 280×340px frosted glass panel, tilted in 3D (`transform: rotate3d(0.4, -0.6, 0.08, 18deg)`, parent has `perspective: 1200px`). Contains: label "Video Walkthrough · YouTube" (11px/700 uppercase, color `#CC785C`), title "Building Your First RAG Pipeline" (20px/700, underlines on hover — it behaves like a clickable YouTube video title), caption "A practical walkthrough, no hand-waving." (13px, color `#8A8A90`), and a circular play button (44px circle, bg `#CC785C`, white CSS-triangle "play" glyph) pinned to the bottom.

- **Resources** (`id="resources"`) — section heading row: eyebrow "The library" (12.5px/700 uppercase, `#CC785C`) + H2 "Resources" (36px/700) on the left, supporting copy "Everything I've put together so far. Pick one to read and download." (15px, `#8A8A90`, max-width 340px) on the right. Below: a 3-column CSS grid (`grid-template-columns: repeat(3, 1fr)`, `gap: 20px`) of **resource cards** — see Component: Resource Card below.

- **Newsletter & Social** — one large frosted glass panel (`border-radius: 28px`, `padding: 52px`), two-column grid `1.1fr 1fr`, `gap: 60px`.
  - Left: eyebrow "Stay in the loop", H2 "Get new resources by email" (26px/700), copy "One note when something new lands in the library. No spam, unsubscribe anytime." Email-only form (input + "Subscribe" button); on submit, form is replaced by confirmation text "You're on the list — thanks." in `#CC785C`.
  - Right: eyebrow "Follow along", H2 "Find more on social" (26px/700), then 4 rows (Instagram, TikTok, YouTube, LinkedIn) each: platform name (16px/600) left, `@handle →` (13px, `#8A8A90`) right, separated by `1px solid rgba(0,0,0,0.08)` bottom borders. All `href="#"` placeholders — wire to real profile URLs.

### 2. Detail / Read View
**Purpose:** Read a resource's write-up, then optionally start the download flow. Reached by clicking any open (non-locked) resource card; replaces the whole library view (conceptually "navigates to a new page" — implemented as a client-side view swap, with the page scrolled to top on entry).

**Layout:** single frosted glass panel, `max-width: 760px`, centered, `padding: 52px`.
- Eyebrow: `{format} · {date}` (12px/700 uppercase, `#CC785C`).
- H1: resource title (40px/700, line-height 1.12).
- Lede paragraph: resource's short description (17.5px, `#6E6E73`).
- Divider (`border-top: 1px solid rgba(0,0,0,0.08)`), then two placeholder body paragraphs (15.5px, line-height 1.75, `#3A3A3E`) — these stand in for the resource's real write-up content, to be replaced per-resource.
- Second divider, then one of three states (see Interactions below): a "Download {format} ↓" button → a lead-capture form (First name, Last name, Email) → a "Download ready" confirmation with the real download button.

### 3. Contact (always visible, below both views)
`max-width: 640px`, centered. Eyebrow "Contact" (`#CC785C`), H2 "Questions, ideas, or a topic you want covered?" (26px/700), copy "Send a note below, or email hello@aiwithrick.com directly." (email is a real `mailto:` link). Below: a form with Name, Email, Message (textarea, 4 rows) and a "Send message" button. On submit, form is replaced by "Thanks — I'll get back to you soon." in `#CC785C`.

### 4. Footer (always visible, last element)
`max-width: 1240px`, `padding: 36px 48px`, flex row `justify-content: space-between`. Left: "AI with Rick" (15px/700). Right: "© 2026 · Practical notes on AI and modern tooling." (13px, `#8A8A90`).

## Components

### Resource Card (repeatable — the core reusable unit)
Renders once per item in a `resources` array. Each resource has: `id`, `title`, `desc`, `format` (e.g. "PDF Guide", "Video Walkthrough", "Notion Template", "Cheat Sheet", "Code Repo"), `date`, `visible` (boolean), `featured` (boolean, at most one item). The card has **three visual variants** depending on state:

1. **Normal** (visible, not featured) — 1 grid column. Frosted panel (`background: rgba(255,255,255,0.22)`, `backdrop-filter: blur(26px)`, `border: 1px solid rgba(255,255,255,0.4)`, `border-radius: 20px`, `padding: 26px`, shadow `0 14px 30px rgba(31,41,89,0.08)`). Header row: `{format} · {date}` label (11.5px/700 uppercase, `#CC785C`) plus a small toggle switch (see below) pinned top-right. Title (19px/700). Description (14px, `#6E6E73`). Footer link "Read & download →" (13.5px/600, `#CC785C`). Whole card is clickable → opens Detail view. Hover: lifts 2px (`transform: translateY(-2px)`).

2. **Featured** (visible + `featured: true`) — spans 2 grid columns, otherwise same structure as Normal but larger (36px padding, 26px title, more opaque glass at `rgba(255,255,255,0.28)` / `blur(30px)`, deeper shadow). Only intended for the single most-recent/flagship item.

3. **Locked / Premium** (visible: false) — same 1-column footprint as Normal. More transparent/dimmed glass (`background: rgba(255,255,255,0.12)`, greyscale text `#8A8A90`/`#A0A0A6`), a small lock icon (simple rect + arc, built from CSS borders, not an icon font), and a "Premium" pill badge (dark bg, white text, top-right) instead of the "Read & download" link. **Not clickable** — no navigation on click. This state represents members-only content and is how a real gating/visibility toggle should render when an item is hidden from the public list.

**Visibility toggle:** every card (all three variants) has a small pill switch (26×15px, colored track + white circular thumb) in its top-right corner. In this prototype, clicking it flips that resource's `visible` flag locally and instantly re-renders the card between its Normal/Featured and Locked appearance — **it does not call any backend**. In the real app this should become the actual admin control for publishing/unpublishing a resource (likely a CMS/admin panel toggle, not exposed on the public page as built here — flag this to your PM before shipping the toggle to end users).

### Buttons
- **Primary/dark button** (CTA, "Send me the download", "Send message", download-trigger buttons): bg `#1D1D1F`, white text, 15px/600, `border-radius: 14px`, `padding: 15–16px 26–30px`, shadow `0 10px 24px rgba(29,29,31,0.2)`. Hover: bg lightens to `#33333A`.
- **Accent/terracotta button** (final "Download {format}" CTA once unlocked): bg `#CC785C`, white text, same sizing, shadow `0 12px 24px rgba(204,120,92,0.3)`. Hover: bg darkens to `#B3634A`.
- **Text/link button** ("Choose a different resource", "Browse more resources"): no background, `#8A8A90`, underlined, 13–14px.

### Form fields
All inputs/textarea: 15px, `'Familjen Grotesk', sans-serif` (or your codebase's closest equivalent, see Design Tokens), `padding: 12px 14px`, `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 12px`, `background: rgba(255,255,255,0.6–0.9)` (semi-opaque so the glass panel still shows through slightly), text color `#1D1D1F`. Labels: 13px/600, `#1D1D1F`, sit directly above their field with 8px gap.

## Interactions & Behavior

- **Browse → Read:** clicking any non-locked resource card sets `view = 'detail'`, records the selected resource id, resets any in-progress form state, and scrolls the window to `(0,0)` (simulating a full page navigation, though implemented as a client-side view swap — no real route change or backend call in this prototype).
- **Read → Download unlock:** the Detail view's content (title + description + placeholder body copy) is visible immediately with no gate. A "Download {format} ↓" button reveals the lead-capture form in place (no navigation).
- **Lead capture → Download ready:** submitting the First/Last/Email form (client-side only, no real submission) swaps the form for a "Download ready" confirmation with a working-styled download button and a "Browse more resources" link back to the library. Required fields: First name, Last name, Email (`type="email"`) — keep friction minimal, no other fields.
- **Back to library:** the wordmark, and a dedicated "← Back to library" header button in Detail view, return to `view = 'library'` and scroll to top.
- **Newsletter form:** single required email field; submitting swaps the form for "You're on the list — thanks." (client-side only).
- **Contact form:** required Name, Email, Message; submitting swaps the form for "Thanks — I'll get back to you soon." (client-side only).
- **Visibility toggle:** per-card, client-side only, flips `resources[i].visible`; re-renders that card between open and locked appearance. No backend call.
- **Hover states:** cards lift 2px; primary/accent buttons darken their background; nav links and the video-card title fade/underline; see exact values above and in Design Tokens.
- **No animations beyond simple hover transitions** — no page-load animations, no scroll-triggered reveals, no countdown/urgency UI of any kind (intentional — the brief explicitly avoids sales-funnel tropes).
- **Responsive behavior:** not implemented in the prototype (fixed max-widths, no mobile breakpoints defined) — the developer should add standard responsive breakpoints (e.g. collapse the 3-column resource grid to 1 column, and the 2-column hero/newsletter grids to 1 column, under ~768px) using the codebase's existing responsive conventions.

## State Management
Minimal local/component state is sufficient — no server state in this prototype:
- `resources: Resource[]` — `{ id, title, desc, format, date, visible, featured }`. In production this should be fetched from a CMS/database instead of hardcoded, since the brief specifies the library grows indefinitely.
- `view: 'library' | 'detail'`
- `selectedId: string | null`
- `showDownloadForm: boolean`, `submitted: boolean`, `formValues: { firstName, lastName, email }` — the Detail view's download flow.
- `newsletterEmail: string`, `newsletterSubmitted: boolean`
- `contactName, contactEmail, contactMessage: string`, `contactSubmitted: boolean`

**Real-world wiring needed:** the lead-capture form, newsletter form, and contact form all need real submit handlers (email/CRM integration, e.g. a serverless function or form service) in place of the client-side `setState` calls used here. The download button needs a real file URL per resource once the lead is captured. The visibility toggle should move to an authenticated admin surface rather than being live on the public page.

## Design Tokens

**Colors**
- Background: `linear-gradient(135deg, #FBE0C8 0%, #FDF3E7 50%, #F8D9C4 100%)` — warm peach → cream → soft orange, fixed diagonal gradient on the page root.
- Ink (primary text): `#1D1D1F`
- Ink soft (secondary text): `#6E6E73`
- Muted (tertiary/locked text): `#8A8A90` and `#A0A0A6`
- Accent (terracotta): `#CC785C`; hover/darker: `#B3634A`; tint background: `rgba(204,120,92,0.1)`
- Success (download-ready label): `#2FA36B`
- Glass surfaces: white at low opacity (`rgba(255,255,255,0.12)` to `rgba(255,255,255,0.8)` depending on element — see each component above) + `backdrop-filter: blur(22–34px)` + a light `rgba(255,255,255,0.28–0.5)` border for the "edge highlight" glass look.
- Borders (non-glass, e.g. under form fields/list rows): `rgba(0,0,0,0.08)`

**Typography**
- Font family: **Familjen Grotesk** (Google Fonts), weights 400/500/600/700 loaded. This family tops out at weight 700 — do not request 800/900, the browser will synthesize a fake bold that looks off. If unavailable in the target codebase's type system, use its closest existing clean geometric sans-serif (avoid re-adding Inter/Roboto/Arial if the brief's "avoid boring/overused fonts" preference should carry over).
- Scale used: 58px/40px/36px/26px (headings) · 19–20px (card/video titles) · 14–18px (body) · 11–13px (labels/eyebrows/meta).
- Eyebrows/labels: uppercase, letter-spacing 0.04–0.08em, weight 600–700.
- Headings: letter-spacing -0.01 to -0.02em, weight 700.

**Spacing / Radius**
- Section horizontal padding: 48px. Section max-width: 1240px (1240 for library sections, 760px for the Detail panel, 640px for Contact).
- Card/panel radius: 20px (normal card) / 22px (locked card) / 24px (featured card, Detail panel top-level) / 28px (large panels: header, newsletter panel) / 12–14px (buttons, inputs).
- Grid gaps: 20px (resource grid), 56–60px (two-column hero/newsletter grids).

**Shadows**
- Cards: `0 14px 30px rgba(31,41,89,0.08)` (normal) up to `0 24px 48px rgba(31,41,89,0.14)` (featured).
- Buttons: `0 10px 24px rgba(29,29,31,0.2)` (dark) / `0 12px 24px rgba(204,120,92,0.3)` (accent).
- All shadows use a cool navy tint (`rgba(31,41,89,*)`), not pure black, to stay consistent with the glass aesthetic.

## Assets
No image or icon assets — the design deliberately avoids icon sets, emoji, and illustrated imagery. The only "graphic" elements are CSS-drawn: a lock glyph (rect + border-radius arc) on locked cards, a play-button triangle (CSS border trick) on the hero video card, and simple circular/pill toggle switches. Recreate these as CSS/SVG shapes rather than importing icon assets, to preserve the restrained, non-icon-heavy look.

## Files
- `AI with Rick Library - Glass v3.dc.html` — the full design reference described above (single file, includes all three views, all states, and the mock interaction logic).
