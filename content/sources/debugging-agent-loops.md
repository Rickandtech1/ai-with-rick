# Debugging Agent Loops

*A one-page reference for the failure modes that keep agents stuck in circles. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

## Symptom → cause → fix

| Symptom | Likely cause | Fix |
|---|---|---|
| Repeats the same failing action | The error never reaches the model | Feed stderr / tool errors back into context, loudly |
| Endless reading & searching, never acts | No definition of done | Restate the task with concrete acceptance criteria |
| Same tool called with same arguments | No memory of what was tried | Keep an attempt log in context; force a strategy change after 2 failures |
| Calls tools or files that don't exist | Missing inventory | List the real tools, files, and commands up front |
| "Fixes" code that was never broken | The feedback signal is wrong | Verify the test/check itself before trusting its verdict |
| Runs forever, burns budget | No stop condition | Hard-cap steps, tokens, and wall-clock time; fail loudly at the cap |
| Confidently declares success, task not done | Self-report instead of verification | Require an observable check (test passes, file exists, URL returns 200) |

## The golden rules

1. **Errors must be louder than successes.** An agent that can't see its failures will repeat them forever.
2. **One change per step.** If the agent edits five things per iteration, no one — including the agent — knows what helped.
3. **Log every attempt where the agent can see it.** The loop usually exists because the context has amnesia.
4. **Define done as something observable.** "The tests pass" beats "the task seems complete."
5. **Every loop needs an exit.** Step limits, time limits, and a rule for what to do at the limit (stop and report, not retry harder).

## Three-step triage

1. **Read the last three iterations.** Loops are visible: same action, same result, same "next step."
2. **Find what the agent can't see.** Nine times out of ten the missing ingredient is feedback — an error message, a diff, a test result that never made it into context.
3. **Add the smallest missing signal and re-run.** Don't redesign the whole agent for what is usually one absent line of feedback.

---

*Companion guide: "Claude Code, Locked Down" — how to give an agent exactly the access it needs. Free in the library at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
