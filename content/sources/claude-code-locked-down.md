# Claude Code, Locked Down

*A security-first setup guide: run an AI coding agent on your own machine while it sees exactly one folder, touches only what you approve, and never meets your API keys.*

*From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

---

## 1 · Why lock it down at all?

Claude Code is not a chat window — it is an agent that reads your files, edits them, and runs shell commands. That is what makes it useful, and it is also why you should onboard it the way you would onboard a very fast intern with a terminal: give it the least access it needs to do the job. The good news is that Claude Code ships with a permission system designed for exactly this. Locking it down properly takes about ten minutes, once.

Three principles drive everything in this guide: **scope** (it works in one folder), **consent** (it asks before acting), and **secrets hygiene** (keys live where agents can't read them).

## 2 · Install cleanly

Install only from the official source — either the native installer or npm:

```bash
# macOS / Linux (native installer)
curl -fsSL https://claude.ai/install.sh | bash

# or via npm
npm install -g @anthropic-ai/claude-code
```

Skip unofficial forks and wrapper tools — an agent with shell access is the last place to run unaudited third-party code. Keep it current (updates ship security fixes) with `claude update`.

## 3 · The one-folder rule

Claude Code's workspace is **the folder you launch it from**. That single fact is your biggest security lever:

- Create a dedicated folder per project, `cd` into it, and run `claude` there.
- Never launch it from your home folder — that would make your entire user directory, documents and all, its working area.
- Anything outside the workspace requires an explicit permission grant, and you can hard-ban paths with deny rules (section 5) so even a confused agent can't read them.
- Need a second folder for one session? Grant it deliberately with `/add-dir <path>` in-session or `claude --add-dir <path>` at launch — it lasts only as long as you need it.

```bash
mkdir -p ~/Projects/my-app && cd ~/Projects/my-app
claude          # workspace = ~/Projects/my-app, nothing above it
```

## 4 · Know your permission modes

Claude Code has distinct permission modes; **Shift+Tab** cycles between them mid-session and **Esc** interrupts the agent at any moment.

| Mode | What it does | Use it for |
|---|---|---|
| Default | Asks before every file edit and shell command | Day-to-day work |
| Plan Mode | Read-only: explores and proposes, changes nothing | Starting any task you don't fully trust yet |
| Accept Edits | Auto-approves file edits in the workspace; still asks for commands | Trusted, repetitive work you're watching |
| Bypass permissions | No prompts at all (`--dangerously-skip-permissions`) | Only inside a container or VM — never on your main machine (section 8) |

## 5 · Permission rules: allow little, deny hard

Rules live in three settings files, and the more specific file wins — **deny always beats allow**:

- `~/.claude/settings.json` — your personal defaults, every project.
- `<project>/.claude/settings.json` — shared with the team, committed to git.
- `<project>/.claude/settings.local.json` — personal, per-project, gitignored.

A deny-first starting point worth copying into any project:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(~/.ssh/**)",
      "Read(~/.aws/**)",
      "Bash(sudo:*)",
      "Bash(rm -rf:*)"
    ],
    "allow": [
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(npm run lint)",
      "Bash(npm run test:*)"
    ]
  }
}
```

How to read the patterns: `Bash(npm run test:*)` allows any command starting with *npm run test*; `Read(./.env)` blocks reads of a path (gitignore-style globs like `./secrets/**` work too). The allow-list removes approval prompts for commands you'd always say yes to; the deny-list makes the dangerous ones impossible rather than merely prompted. Review what's active any time with `/permissions` in a session.

## 6 · Keep secrets where agents can't read them

The order of operations matters when you start a new project — protection goes in *before* the secret exists:

1. **First** create `.gitignore` with `.env` in it — so a key can never be committed.
2. **Then** create `.env` and lock its file permissions: `chmod 600 .env`.
3. Add the `Read(./.env)` deny rules from section 5 so the agent can't read it either.
4. Better still: keep keys in the OS keychain, not plaintext. On macOS:
   `security add-generic-password -a "$USER" -s MY_API_KEY -w`, then load it into an environment variable in your shell profile.
5. Never paste a secret into the prompt itself — refer to it by env-var name and let the code read it at runtime.

## 7 · Vet the add-ons: MCP servers and skills

MCP servers and community skills run with the same access as Claude Code itself — installing one is code execution, full stop. Vet them like production dependencies:

- Prefer official publishers (anthropics, major vendors) over unknown authors.
- Check adoption signals: install counts, GitHub stars, recent commits, open issues.
- Run the package past a security scanner (Socket, Snyk) before installing; treat any high-risk rating as a no until proven otherwise.
- Read what tools an MCP server actually exposes before connecting it — a "calendar" server that wants shell access is answering a question you didn't ask.
- Add one at a time, so you always know which addition changed your risk surface.

## 8 · When you need real isolation

Permissions govern the agent; sometimes you want walls around the whole machine instead. For long unattended runs, experiments with unfamiliar code, or anything where you're tempted by bypass-permissions mode, move to a disposable environment:

- A **devcontainer or Docker container** holding only the project — no personal files exist inside it, so nothing personal can leak.
- Scoped credentials only: a git token limited to the one repo, test API keys with low limits.
- This is the one legitimate home of `--dangerously-skip-permissions`: the "YOLO mode" flag is fine when the blast radius is a throwaway container, and reckless anywhere else.

## 9 · The ten-point checklist

1. Installed from the official source, and kept updated
2. One dedicated folder per project; always launch from inside it
3. Never run from the home directory
4. Unknown or risky tasks start in Plan Mode
5. Deny rules for .env, secrets folders, ~/.ssh and ~/.aws in place
6. Allow-list covers only commands you'd always approve
7. .gitignore before .env, chmod 600 after — every new project
8. API keys in the keychain, referenced by env var, never pasted in prompts
9. Every MCP server and skill vetted before install
10. Bypass-permissions only ever inside a container or VM

---

*Questions, or a lockdown topic you want covered next? Write to me via the contact form — and if this guide saved you a headache, the library at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app) keeps growing.*
