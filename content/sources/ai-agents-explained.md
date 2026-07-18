# AI Agents, Explained for Busy People

*Everyone's selling "agents" this year. Here's what the word actually means, what's real today, and how to tell a demo from a product. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## The one-paragraph version

A chatbot answers you. An **agent** acts for you: it can use tools — run commands, browse, edit files, call apps — and it loops: try, look at the result, adjust, try again, until the job is done or it gives up. That loop is the whole magic. Everything else is marketing.

## The anatomy (three parts, no more)

| Part | What it is | Everyday example |
|---|---|---|
| Brain | A language model deciding what to do next | "The tests failed, so I should read the error first" |
| Tools | Things it's allowed to touch | Terminal, browser, your calendar, a code editor |
| Loop | Act → observe result → decide again | Keeps going without you prompting each step |

When a product says "agentic," ask: *what tools, and what loop?* If the answer is "it answers questions really well" — that's a chatbot with a press release.

## What agents are genuinely good at today

- **Coding** — the standout. Agents like Claude Code write, run, test, and fix code in a loop. This is the most mature agent category by far.
- **Research-and-compile** — "compare these 12 products and build me a table." Browsing + patience = agent territory.
- **Repetitive computer chores** — renaming files, reformatting data, moving things between apps — anything you'd explain to an intern once.

## Where they still faceplant

- **Long horizons.** Twenty steps in, small errors compound. Good agents mitigate this; none are immune.
- **Judgment calls.** "Book me a good flight" hides ten preferences you never stated. Agents do best when *done* is checkable — tests pass, file exists, table filled.
- **Unsupervised authority.** An agent with your credit card and no confirmation step isn't automation, it's a slot machine.

## The trust ladder (use this instead of hype)

1. **Watch mode** — agent proposes, you approve every step. Start every new agent here.
2. **Bounded autonomy** — free reign inside a sandbox: one folder, one account, spending cap, step limit.
3. **Trusted routine** — jobs it has done correctly fifty times run unattended, with a log you actually check.

Move one rung at a time, per task — not per product. An agent can be rung 3 for renaming files and rung 1 for sending emails, forever, and that's correct.

## Questions that cut through any agent pitch

1. What tools does it hold, and can I see the list?
2. What does it do when it fails — retry, ask me, or pretend it succeeded?
3. Can I set hard limits (steps, money, scope)?
4. Is there a log of everything it did?

A "no" on 3 or 4 is disqualifying. The vendors building real agents answer these before you ask.

---

*Companion pieces in the library: "Debugging Agent Loops" for when yours gets stuck, and "Claude Code, Locked Down" for giving an agent exactly the access it needs — at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
