# RAG vs Fine-Tuning vs Long Context

*The three ways to make an AI know* your *stuff — and the 60-second decision between them. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

## The three options, plainly

| Approach | What it really is | Best when |
|---|---|---|
| Long context | Paste the documents into the prompt | The material fits and changes per question |
| RAG | Search your library first, paste only the relevant chunks | Library too big to paste; facts change often; you need citations |
| Fine-tuning | Train the model on examples until behavior sticks | You need a *style or format* by default, not new facts |

## The decision in 60 seconds

1. **Does it all fit in the prompt?** (Modern models take hundreds of pages.) → **Just paste it.** Long context wins on simplicity, and most projects end here.
2. **Too big, or updated daily, or needs "where did that come from"?** → **RAG.** It's search stapled to a prompt: retrieve the right 5 pages, answer from those, cite them.
3. **The problem is *how it answers*, not *what it knows* — your support tone, your JSON schema, every single time?** → **Fine-tune** (or honestly: first try 3 good examples in the prompt — it gets you 80% of the way for 0% of the cost).

**The one-line rule: knowledge → context or RAG · behavior → examples or fine-tuning.** Teaching facts by fine-tuning is the classic expensive mistake — models memorize style readily and facts unreliably.

## What each one costs you

- **Long context** — highest per-question token cost, zero infrastructure. Watch for "lost in the middle": put the key material near the start or end, ask precise questions.
- **RAG** — infrastructure (chunking, embeddings, vector store) + a new failure mode: retrieval misses → confident answers from the wrong pages. Test retrieval separately from answering; it's where 80% of RAG failures live.
- **Fine-tuning** — needs hundreds of clean examples, money, and re-training whenever things change. Facts learned this way go stale silently — no citations, no updates.

## They stack

The strongest production pattern is boring: **RAG for the facts + a few-shot prompt (or light fine-tune) for the voice + long context for the current conversation.** Not a battle — a stack.

---

*One page, printable. Longer walkthroughs live in the library at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
