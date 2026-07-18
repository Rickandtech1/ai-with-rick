# Run a Local LLM on Your Laptop Tonight

*Private, free, offline AI on your own machine in about 15 minutes — what to install, which model fits your RAM, and what to realistically expect. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

## Why bother when cloud models are smarter

Three honest reasons: **privacy** (nothing leaves your machine — sensitive notes, contracts, journals), **cost** (unlimited use, $0), and **understanding** (nothing demystifies AI like running one). If none of those apply to you, keep using the cloud — local is a complement, not a replacement.

## The 15-minute setup

1. Install **Ollama** (ollama.com — Mac/Windows/Linux, it's the de-facto standard)
2. Open a terminal and pull a model sized for your RAM (table below)
3. Chat:

```bash
ollama run llama3.2        # swap for your chosen model
```

Want a ChatGPT-style window instead of a terminal? Add **Open WebUI** or use **LM Studio** (a friendlier all-in-one app; skips the terminal entirely).

## Which model fits your machine

| Your RAM | Run this class | Experience |
|---|---|---|
| 8 GB | 3B models (llama3.2 class) | Fast; fine for summaries, drafts, Q&A |
| 16 GB | 7–8B models | The sweet spot — genuinely useful daily driver |
| 32 GB | 13–14B models | Noticeably sharper reasoning |
| 64 GB+ / Mac Studio class | 30–70B models | Approaches last-gen cloud quality |

Rules of thumb: Apple Silicon punches above its weight (unified memory). The `q4` quantized versions Ollama serves by default are the right call — bigger model at q4 beats smaller model at full precision.

## What locals are honestly good and bad at

**Good:** summarizing and rewriting your documents, private journaling companion, drafting, extraction and reformatting, offline use on planes, tinkering via the local API (Ollama exposes one — your scripts can call it like any cloud API).

**Bad:** deep multi-step reasoning, niche facts (small models confabulate more — keep them grounded in text you paste), very long documents, and speed on big models with modest hardware.

## Three upgrades when the basics feel good

1. **Give it your files:** LM Studio and Open WebUI both do local RAG — point them at a folder, ask questions about your own documents. Nothing uploads.
2. **Wire it into scripts:** `curl localhost:11434/api/generate` — automation with zero API bills.
3. **Try a coding model** (qwen-coder class) in your editor for private autocomplete.

---

*One page, printable. Companion: "Claude Code, Locked Down" for the security side of local AI tooling — at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
