# MCP, Explained: The USB-C Port for AI

*Model Context Protocol is the acronym suddenly in every AI video title. Here's the plain-language version: what it is, why it won, and what to check before you plug anything in. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## The problem it solves

Before MCP, connecting an AI assistant to your apps meant custom integrations: one for Notion, one for GitHub, one for your database — rebuilt separately for every AI app. N assistants × M tools = madness.

MCP (Model Context Protocol, open-sourced by Anthropic and since adopted across the industry) standardizes the plug. A tool exposes itself once as an **MCP server**; any MCP-capable assistant — Claude, desktop apps, editors, agents — can use it. Hence the nickname that stuck: **USB-C for AI**. One port, everything connects.

## The mental model in 30 seconds

- An **MCP server** is a small program that says: "I offer these tools" — *search_email*, *create_page*, *query_database* — each with typed inputs the AI can call.
- Your **assistant** is the client. Connect it to a server and those tools appear in its toolbox; it decides when to use them mid-conversation.
- Ask "summarize this week's Linear issues" → the model calls the Linear server's tools, gets structured data back, answers with real facts instead of vibes.

That's it. Not magic — a plug standard. The excitement is what standardization unlocks: an ecosystem of thousands of ready-made connectors instead of waiting for official integrations.

## What this makes possible today

- Claude reading and updating your **Notion**, **calendar**, or **CRM** mid-chat
- Coding agents that see your **GitHub issues**, **database schema**, and **error logs** — not just your code
- One custom server for *your* internal tools, written once, usable by every AI app your team runs
- Chaining: an agent that reads a support ticket, checks the database, and drafts the fix — three servers, one conversation

## The security section (read this one twice)

An MCP server is **code running with real access to your stuff**. Treat connecting one like hiring a contractor with keys:

1. **Source first.** Prefer servers from the official org or the tool's own vendor. A random "supercharged-gmail-mcp" from an unknown author is exactly as safe as it sounds.
2. **Read the tool list before connecting.** A weather server that wants file-system access is answering a question you didn't ask.
3. **Scope the credentials.** Give a server a token limited to what it needs — read-only where possible, never your master API key.
4. **One at a time.** Add a server, use it a week, then add the next — so you always know what changed your risk surface.
5. **Watch for prompt-injection.** A malicious document can contain text that tries to steer your AI into misusing its tools. Fewer, better-scoped servers shrink that blast radius.

## Do you need to care?

**Using AI apps?** You already benefit — "connectors" in your assistant are largely MCP under the hood. Just apply the checklist when adding one.
**Building anything?** Learn it now. Wrapping your product or internal API in an MCP server is a weekend project that makes it AI-accessible everywhere at once — the integration work of a dozen partnerships, for free.

---

*Companion: "Claude Code, Locked Down" covers agent permissions end-to-end. The download packages this guide as PDF + markdown — at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
