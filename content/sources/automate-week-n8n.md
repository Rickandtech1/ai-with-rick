# Automate Your Week with n8n + AI

*The automation stack all over YouTube right now — what n8n actually is, the five automations worth building first, and the mistakes that turn "set and forget" into "babysit and apologize." From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## What n8n is, in one breath

n8n is a visual pipeline builder: boxes (a trigger, then steps) connected by lines, where each box is an app action — "email arrived," "add row to sheet," "ask an AI model," "post to Slack." The AI box is what changed the game: your pipelines can now *read, judge, and write*, not just move data. You can run n8n free on your own machine or pay for their cloud.

(Zapier and Make are the same idea — n8n won the tinkerer crowd on price and flexibility. Everything below applies to all three.)

## The five best first automations

Ranked by payoff-to-effort, from a lot of trial and error:

1. **The inbox triager.** New email → AI classifies (client / invoice / newsletter / junk) → labels it, drafts replies for the top category into your drafts folder. You still hit send — that's a feature, not a limitation.
2. **The content repurposer.** New YouTube video or blog post → transcript → AI writes a newsletter draft + three social posts *in your voice* (paste two examples of your writing into the prompt) → saves to a review doc.
3. **The morning brief.** 7 am: pull your calendar, top emails, and 2–3 feeds → AI writes a 10-line brief → one message in your DMs. Replaces 30 minutes of app-checking.
4. **The lead greeter.** Form submission on your site → AI writes a personalized first reply referencing what they asked → into drafts (or auto-send once you trust it — see the ladder below).
5. **The receipt filer.** Email attachment that looks like an invoice → AI extracts vendor / amount / date → row in a sheet. Tax season becomes a sort, not an archaeology dig.

## The rules that keep automations trustworthy

- **Human-in-the-loop first.** Every new automation writes to drafts/pending for two weeks. Promote to auto-send only after you'd have approved ~50 in a row unchanged.
- **One automation, one job.** The 40-box mega-workflow is unmaintainable by December. Build five small ones instead.
- **Let AI judge, not act.** The sturdy pattern: AI classifies/extracts/drafts → dumb, predictable boxes do the acting.
- **Budget the failure path.** Every workflow needs an "if this step fails → tell me" branch. Silent failures are how you discover in March that nothing ran since January.
- **Keys in credentials, never in prompts.** n8n has a credentials vault; use it, and never paste API keys into prompt text.

## What this realistically saves

The honest math from my own stack: 4–6 hours a week, after a weekend of setup and an hour a month of maintenance. The YouTube thumbnails promising "I automated my whole business" are selling courses. Five boring, reliable automations that each save 30 minutes a week — that's the real, compounding win.

---

*The download packages this guide as a PDF plus a markdown edition. More at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
