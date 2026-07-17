Claude Code is the most useful tool I've added to my workflow this year — and the first one I set up with genuine caution, because it doesn't just chat. It reads your files, edits them, and runs commands on your machine.

The answer isn't to avoid it. It's a ten-minute setup that gives the agent exactly the access it needs and nothing more. That's what this guide walks through, step by step.

## What's inside

- **The one-folder rule** — why the folder you launch from is your biggest security lever, and how to keep the agent inside a single project directory (and out of your home folder)
- **Permission modes explained** — Default, Plan Mode, Accept Edits, and the one mode you should only ever use inside a container
- **A deny-first permissions file you can copy** — block your **.env** files, SSH keys, and cloud credentials from ever being read, while pre-approving the harmless commands so you're not clicking "yes" all day
- **Secrets hygiene** — the exact order to create **.gitignore**, **.env**, and file permissions so a key can't leak, and how to keep keys in the OS keychain instead of plaintext
- **Vetting MCP servers and skills** — the checklist to run before letting any third-party add-on near your machine
- **Real isolation** — when permissions aren't enough and a disposable container is the right answer

It ends with a ten-point checklist you can run against your own setup in two minutes.

## Who it's for

Anyone using — or about to use — Claude Code or any coding agent on a machine that also holds real work: client projects, credentials, a life. No security background needed; every step is copy-pasteable.

The download packages all of it as a clean four-page PDF you can keep next to your terminal.
