# Claude Code Permissions, On One Page

*Modes, rule syntax, settings files, and the flags that keep an agent on a leash. From the [AI with Rick](https://ai-with-rick.vercel.app) library.*

## Modes — Shift+Tab cycles, Esc interrupts

| Mode | Behavior |
|---|---|
| **Default** | asks before every edit & command — daily driver |
| **Plan Mode** | read-only, proposes a plan — start here when unsure |
| **Accept Edits** | auto-approves workspace edits, still asks for commands |
| **Bypass** | no prompts at all — container/VM only, never bare-metal |

## Rule syntax — deny always beats allow

- `"Bash(npm run test:*)"` — any command starting with *npm run test*
- `"Bash(git diff:*)"` — prefix match; bare `"Bash(git status)"` = exact
- `"Read(./.env)"` / `"Read(./secrets/**)"` — gitignore-style paths
- `"WebFetch"` — a bare tool name covers every use of that tool
- Check what's live in any session with `/permissions`

## Settings files — most specific wins

- `~/.claude/settings.json` — you, all projects
- `<repo>/.claude/settings.json` — team, committed
- `<repo>/.claude/settings.local.json` — you, this repo, gitignored

## Starter deny-first block

```json
{ "permissions": {
    "deny":  ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)",
              "Read(~/.ssh/**)", "Read(~/.aws/**)", "Bash(sudo:*)", "Bash(rm -rf:*)"],
    "allow": ["Bash(git status)", "Bash(git diff:*)", "Bash(npm run test:*)"] } }
```

## Scope & session controls

- Workspace = the folder you launch `claude` from — one project folder, never `$HOME`
- `/add-dir <path>` or `claude --add-dir <path>` — grant an extra folder deliberately
- `claude --permission-mode plan` — open straight into read-only Plan Mode
- `--dangerously-skip-permissions` — bypass everything: disposable containers only
- Secrets: `.gitignore` first, then `.env`, then `chmod 600 .env` — and keys in the OS keychain

---

*Full walkthrough: "Claude Code, Locked Down" — free in the library at [ai-with-rick.vercel.app](https://ai-with-rick.vercel.app).*
