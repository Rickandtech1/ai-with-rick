# AI Video Generation: A No-Hype Field Guide

*Text-to-video is the most viral AI category on every feed — and the gap between the showreel and your first attempt is enormous. Here's how to actually get good output. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## The state of play, honestly

Today's top video models (the Sora / Veo class of tools) produce shots that pass for filmed footage — *sometimes*, for *seconds at a time*, after *several attempts*. The three limits that shape everything you make:

- **Clips are short.** Think in shots (3–10 seconds), not scenes. Everything good you've seen was assembled from many generations.
- **Consistency is fragile.** The same character across two shots remains the hard problem. Products are improving via reference images, but plan around it.
- **Physics wobbles.** Hands, liquids, text on signs, crowds — the tells live there. Choose subjects that hide them.

## Prompting video is directing, not describing

The single biggest quality jump: stop writing *what exists* and start writing *what the camera does*. A video prompt has four layers:

```text
[SHOT]     slow dolly-in, low angle, 35mm, shallow depth of field
[SUBJECT]  an old fisherman coiling rope on a dock
[WORLD]    dawn fog, golden backlight, calm harbor
[MOTION]   he pauses, looks up toward a distant horn sound
```

- Name **one** camera move per clip. Two moves = mush.
- Give the subject **one** action with a beginning and end. "Walking" wanders; "stops and turns toward the window" cuts cleanly.
- Reuse the same style words across every shot in a project — that's your look.
- Expect to generate 3–6 takes per shot and keep one. That ratio is normal, not failure.

## The workflow that looks professional

1. **Write a shot list first** — like a real shoot. Ten deliberate 5-second shots beat one rambling minute.
2. **Generate stills first** where the tool allows — approve the look in images (cheap), then animate the approved frame (expensive).
3. **Cut on action.** Trim each clip to its best 2–4 seconds and cut mid-motion; the edit hides the seams between generations.
4. **Sound is half the realism.** Room tone, footsteps, and music cover visual wobble remarkably well. Silent AI video reads fake instantly.

## What to make (and skip) while the tech is here

**Plays to the strengths:** b-roll and mood shots, product beauty shots, abstract visuals for music, storyboards and previz, historical/impossible shots no budget could film.

**Fights the weaknesses:** dialogue scenes, continuous characters, anything requiring readable text in-frame, long single takes.

## Disclosure isn't optional

Label generated footage in monetized and journalistic contexts, never fabricate real people or events, and check each platform's synthetic-media policy — they now have teeth. Beyond ethics, the audience penalty for *discovered* undisclosed AI is far worse than the reach penalty for a label.

---

*The download packages this guide as a PDF plus a markdown edition. More at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
