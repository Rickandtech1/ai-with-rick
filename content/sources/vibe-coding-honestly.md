# Vibe Coding, Honestly: Ship Your First App with AI

*What actually happens when a non-programmer builds software by describing it — where it works, where it collapses, and how to ship anyway. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## What vibe coding actually is

You describe what you want in plain language, an AI coding agent writes the code, you react to the result, it adjusts. Repeat until it works. You never read the code — you steer by *vibes*: does the app do the thing or not?

The demos on your feed are real. So are the abandoned projects behind them. The difference is almost never talent — it's scope and workflow.

## The three rules that decide whether you ship

### 1 · Pick a one-sentence app

Every successful first vibe-coded project fits in one sentence with no "and": *a page that turns a YouTube link into a summary*. *A tracker for my gym lifts.* If your idea needs "and" — accounts *and* payments *and* a feed — you're building three apps, and the second one kills you. Ship the one-sentence version first; ask for the "and" next week.

### 2 · Demand something visible every session

The failure mode is an hour of the agent "restructuring" with nothing to look at. End every request with a checkpoint you can see: "…and show me the page working." If you can't see progress, you can't steer, and steering is your entire job.

### 3 · When it breaks, describe symptoms — don't guess causes

You're the patient, not the doctor. "When I click Save, nothing happens and the button goes gray" gets a fix in one round. "I think the database is broken" sends the agent hunting in the wrong forest. Copy exact error text, say what you clicked, say what you expected.

## The parts nobody's video shows

- **Secrets and keys.** The moment your app talks to a real service, you have API keys. Never let them be pasted into the code itself — ask the agent to "keep keys in an environment file that stays out of git." (This one sentence prevents the classic beginner disaster.)
- **Going live is its own step.** "Works on my machine" to "works at a URL" is 30 minutes of hosting setup (Vercel and similar make it painless). Budget for it; ask the agent to walk you through it.
- **Understanding enough.** You don't need to read code, but ask, once per project: "Explain what you built like I'm a new manager on this project." You'll catch bad decisions early, and you'll learn faster than any tutorial.

## A realistic first-project ladder

1. **A single page** that transforms text (summarizer, rewriter, extractor) — one evening
2. **A page with memory** (saves entries to a real database) — a weekend
3. **A page other people use** (deployed, with a form and a list) — the next weekend
4. Only then: accounts, payments, mobile

Each rung teaches the vocabulary the next rung needs.

## When vibe coding is the wrong tool

Anything holding other people's money, health data, or credentials — the cost of an invisible mistake is too high to steer by vibes alone. And anything you'll maintain for years: at some point, someone has to actually understand the code. For prototypes, personal tools, and small public apps? It's legitimately the fastest path that has ever existed.

---

*The download packages this guide as a PDF plus a markdown edition. More practical AI notes at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
