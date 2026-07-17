# Prompt Engineering Field Notes

*The patterns that actually move outputs, collected from a year of daily use. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## 1 · The mindset: prompts are interfaces, not incantations

There are no magic words. A prompt is an interface between what you know and what the model can do — and like any interface, it works when it transmits *intent* clearly. Every pattern in these notes is really the same move in different clothes: remove a way the model could misunderstand you.

The other mindset shift: treat prompts like code. Keep the ones that work, version the changes, and when an output goes wrong, debug the prompt instead of re-rolling and hoping.

## 2 · The patterns that move outputs

These are ranked roughly by how often they fix a bad output in practice.

### Say who it's for, not just what it is

"Explain how DNS works" produces a textbook page. "Explain how DNS works to a designer who just wants to know why her site is down" produces something someone actually reads. Audience is the highest-leverage single sentence in most prompts.

### Show one example instead of describing ten rules

If you want a specific format, tone, or structure, paste a small example of it. One good example replaces a paragraph of instructions, and two examples that differ in content but match in shape teach the pattern almost perfectly. This is the closest thing to a cheat code that exists.

### Structure the output before asking for it

Decide the shape first, then request it explicitly:

```text
Summarize the meeting notes below.

Format:
## Decisions
- …
## Open questions
- …
## Action items (owner → task)
- …
```

Models are excellent at filling in templates and mediocre at inventing the right structure on their own.

### Constraints beat vibes

"Keep it punchy" does almost nothing. "Under 120 words, no bullet points, no exclamation marks" changes the output every time. Numbers, limits, and bans are enforceable; adjectives are not.

### Let it think before it answers

For anything with real reasoning — tradeoffs, math, debugging, planning — ask for the thinking first: "Work through the options and only then give your recommendation." Forcing an early final answer locks in early mistakes.

### Prefer positive instructions

"Don't be verbose" plants the idea of verbosity. "Answer in three sentences" replaces it. Whenever you catch yourself writing *don't*, try rewriting it as *do*.

### Put the question after the material

When pasting a long document, put your instructions **after** it (or both before and after). The end of the prompt is what the model attends to most as it starts writing — don't spend it on the document's appendix.

## 3 · Debugging a prompt that isn't working

1. **Reproduce it small.** Trim the prompt to the shortest version that still fails — the problem is usually in what's left.
2. **Change one thing at a time.** Prompt tweaks interact; two changes at once means you learn nothing.
3. **Read the output like a diagnosis.** The *way* it's wrong tells you what got miscommunicated: wrong format → structure wasn't specified; wrong depth → audience wasn't specified; wrong facts → your context didn't actually contain them.
4. **Ask the model.** "Here's what I asked, here's what I got, here's what I wanted — what should I change in the prompt?" is legitimately effective.

## 4 · Anti-patterns that waste your tokens

- **The mega-prompt** — twenty rules glued together over months. Nobody knows which rules still matter, and some now conflict. Prune ruthlessly.
- **Politeness padding** — "if you don't mind, could you perhaps" costs tokens and clarity. Direct isn't rude; it's legible.
- **Conflicting constraints** — "be comprehensive but keep it brief" makes the model split the difference and do neither.
- **"Be creative"** — means nothing. Name the flavor: "surprising analogies," "dry humor," "no clichés."
- **Re-rolling instead of revising** — regenerating the same prompt is a slot machine. Change the prompt and it becomes an experiment.

## 5 · The field checklist

Before sending anything that matters:

1. Did I say who the output is for?
2. Did I show the format instead of describing it?
3. Are my constraints countable (words, items, sections) rather than adjectives?
4. Is the instruction after the long material, not buried before it?
5. On a hard problem — did I ask for reasoning before the answer?
6. Am I revising the prompt on failure, not just re-rolling?

---

*Want the walkthrough version with more examples? The library at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app) keeps growing — subscribe on the homepage and you'll hear when new notes land.*
