"""Build the two launch PDFs for the AI with Rick library."""
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, HRFlowable, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

for weight in ("400", "500", "600", "700"):
    pdfmetrics.registerFont(TTFont(f"FG-{weight}", os.path.join(HERE, "fonts", f"FG-{weight}.ttf")))

INK = colors.HexColor("#1D1D1F")
SOFT = colors.HexColor("#6E6E73")
MUTED = colors.HexColor("#8A8A90")
ACCENT = colors.HexColor("#CC785C")
CREAM = colors.HexColor("#FDF3E7")
PEACH = colors.HexColor("#FBE0C8")
LINE = colors.HexColor("#E8DCCE")

W, H = A4
MARGIN = 22 * mm


def styles(base_size=10.5):
    return {
        "eyebrow": ParagraphStyle("eyebrow", fontName="FG-700", fontSize=9, leading=12,
                                  textColor=ACCENT, spaceAfter=10, tracking=1),
        "title": ParagraphStyle("title", fontName="FG-700", fontSize=30, leading=34,
                                textColor=INK, spaceAfter=10),
        "subtitle": ParagraphStyle("subtitle", fontName="FG-400", fontSize=12.5, leading=18,
                                   textColor=SOFT, spaceAfter=6),
        "h2": ParagraphStyle("h2", fontName="FG-700", fontSize=16, leading=20, textColor=INK,
                             spaceBefore=18, spaceAfter=8),
        "body": ParagraphStyle("body", fontName="FG-400", fontSize=base_size, leading=base_size * 1.55,
                               textColor=INK, spaceAfter=8),
        "bullet": ParagraphStyle("bullet", fontName="FG-400", fontSize=base_size, leading=base_size * 1.5,
                                 textColor=INK, leftIndent=12, bulletIndent=2, spaceAfter=4),
        "code": ParagraphStyle("code", fontName="Courier", fontSize=8.6, leading=12.4,
                               textColor=INK),
        "note": ParagraphStyle("note", fontName="FG-400", fontSize=9.5, leading=14,
                               textColor=SOFT, spaceAfter=8),
    }


def eyebrow(text, st):
    return Paragraph(f'<font name="FG-700">{"&nbsp;".join(c for c in text.upper())}</font>'.replace("&nbsp; &nbsp;", "&nbsp;&nbsp;"), st["eyebrow"])


def code_block(lines, st, width):
    para = Paragraph("<br/>".join(lines).replace(" ", "&nbsp;"), st["code"])
    table = Table([[para]], colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), 0.75, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


def bullets(items, st):
    return [Paragraph(item, st["bullet"], bulletText="–") for item in items]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("FG-600", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 13 * mm, "AI with Rick · ai-with-rick.vercel.app")
    canvas.drawRightString(W - MARGIN, 13 * mm, f"{doc.page}")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 17 * mm, W - MARGIN, 17 * mm)
    canvas.restoreState()


def make_doc(path, first_page_gradient=True):
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=20 * mm, bottomMargin=24 * mm,
                          title="AI with Rick", author="Rick — AI with Rick")

    def on_page(canvas, doc_):
        canvas.saveState()
        canvas.setFillColor(PEACH)
        canvas.rect(0, H - 6 * mm, W, 6 * mm, stroke=0, fill=1)
        canvas.restoreState()
        footer(canvas, doc_)

    frame = Frame(MARGIN, 24 * mm, W - 2 * MARGIN, H - 44 * mm, id="main")
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=on_page)])
    return doc


# ────────────────────────────────────────────────────────────────────
# Guide 1: Claude Code, Locked Down
# ────────────────────────────────────────────────────────────────────
st = styles()
cw = W - 2 * MARGIN
story = []

story.append(eyebrow("PDF Guide · AI with Rick", st))
story.append(Paragraph("Claude Code, Locked Down", st["title"]))
story.append(Paragraph(
    "A security-first setup guide: run an AI coding agent on your own machine while it sees "
    "exactly one folder, touches only what you approve, and never meets your API keys.",
    st["subtitle"]))
story.append(Spacer(1, 4))
story.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceAfter=14))

story.append(Paragraph("1 · Why lock it down at all?", st["h2"]))
story.append(Paragraph(
    "Claude Code is not a chat window — it is an agent that reads your files, edits them, and runs "
    "shell commands. That is what makes it useful, and it is also why you should onboard it the way "
    "you would onboard a very fast intern with a terminal: give it the least access it needs to do "
    "the job. The good news is that Claude Code ships with a permission system designed for exactly "
    "this. Locking it down properly takes about ten minutes, once.", st["body"]))
story.append(Paragraph(
    "Three principles drive everything in this guide: <b>scope</b> (it works in one folder), "
    "<b>consent</b> (it asks before acting), and <b>secrets hygiene</b> (keys live where agents "
    "can't read them).", st["body"]))

story.append(Paragraph("2 · Install cleanly", st["h2"]))
story.append(Paragraph(
    "Install only from the official source — either the native installer or npm:", st["body"]))
story.append(code_block([
    "# macOS / Linux (native installer)",
    "curl -fsSL https://claude.ai/install.sh | bash",
    "",
    "# or via npm",
    "npm install -g @anthropic-ai/claude-code",
], st, cw))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Skip unofficial forks and wrapper tools — an agent with shell access is the last place to "
    "run unaudited third-party code. Keep it current (updates ship security fixes) with "
    "<b>claude update</b>.", st["body"]))

story.append(Paragraph("3 · The one-folder rule", st["h2"]))
story.append(Paragraph(
    "Claude Code's workspace is <b>the folder you launch it from</b>. That single fact is your "
    "biggest security lever:", st["body"]))
story.extend(bullets([
    "Create a dedicated folder per project, <b>cd</b> into it, and run <b>claude</b> there.",
    "Never launch it from your home folder — that would make your entire user directory, "
    "documents and all, its working area.",
    "Anything outside the workspace requires an explicit permission grant, and you can hard-ban "
    "paths with deny rules (section 5) so even a confused agent can't read them.",
    "Need a second folder for one session? Grant it deliberately with <b>/add-dir &lt;path&gt;</b> "
    "in-session or <b>claude --add-dir &lt;path&gt;</b> at launch — it lasts only as long as you need it.",
], st))
story.append(Spacer(1, 4))
story.append(code_block([
    "mkdir -p ~/Projects/my-app && cd ~/Projects/my-app",
    "claude          # workspace = ~/Projects/my-app, nothing above it",
], st, cw))

story.append(Paragraph("4 · Know your permission modes", st["h2"]))
story.append(Paragraph(
    "Claude Code has distinct permission modes; <b>Shift+Tab</b> cycles between them mid-session "
    "and <b>Esc</b> interrupts the agent at any moment.", st["body"]))
mode_rows = [
    [Paragraph("<b>Mode</b>", st["body"]), Paragraph("<b>What it does</b>", st["body"]),
     Paragraph("<b>Use it for</b>", st["body"])],
    [Paragraph("Default", st["body"]),
     Paragraph("Asks before every file edit and shell command", st["body"]),
     Paragraph("Day-to-day work", st["body"])],
    [Paragraph("Plan Mode", st["body"]),
     Paragraph("Read-only: explores and proposes, changes nothing", st["body"]),
     Paragraph("Starting any task you don't fully trust yet", st["body"])],
    [Paragraph("Accept Edits", st["body"]),
     Paragraph("Auto-approves file edits in the workspace; still asks for commands", st["body"]),
     Paragraph("Trusted, repetitive work you're watching", st["body"])],
    [Paragraph("Bypass permissions", st["body"]),
     Paragraph("No prompts at all (<font name='Courier' size='8.4'>--dangerously-skip-permissions</font>)", st["body"]),
     Paragraph("Only inside a container or VM — never on your main machine (section 8)", st["body"])],
]
mt = Table(mode_rows, colWidths=[cw * 0.18, cw * 0.44, cw * 0.38])
mt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), CREAM),
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(mt)

story.append(Paragraph("5 · Permission rules: allow little, deny hard", st["h2"]))
story.append(Paragraph(
    "Rules live in three settings files, and the more specific file wins — <b>deny always beats "
    "allow</b>:", st["body"]))
story.extend(bullets([
    "<b>~/.claude/settings.json</b> — your personal defaults, every project.",
    "<b>&lt;project&gt;/.claude/settings.json</b> — shared with the team, committed to git.",
    "<b>&lt;project&gt;/.claude/settings.local.json</b> — personal, per-project, gitignored.",
], st))
story.append(Spacer(1, 4))
story.append(Paragraph("A deny-first starting point worth copying into any project:", st["body"]))
story.append(code_block([
    '{',
    '  "permissions": {',
    '    "deny": [',
    '      "Read(./.env)",',
    '      "Read(./.env.*)",',
    '      "Read(./secrets/**)",',
    '      "Read(~/.ssh/**)",',
    '      "Read(~/.aws/**)",',
    '      "Bash(sudo:*)",',
    '      "Bash(rm -rf:*)"',
    '    ],',
    '    "allow": [',
    '      "Bash(git status)",',
    '      "Bash(git diff:*)",',
    '      "Bash(npm run lint)",',
    '      "Bash(npm run test:*)"',
    '    ]',
    '  }',
    '}',
], st, cw))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "How to read the patterns: <b>Bash(npm run test:*)</b> allows any command starting with "
    "<i>npm run test</i>; <b>Read(./.env)</b> blocks reads of a path (gitignore-style globs like "
    "<b>./secrets/**</b> work too). The allow-list removes approval prompts for commands you'd "
    "always say yes to; the deny-list makes the dangerous ones impossible rather than merely "
    "prompted. Review what's active any time with <b>/permissions</b> in a session.", st["body"]))

story.append(Paragraph("6 · Keep secrets where agents can't read them", st["h2"]))
story.append(Paragraph(
    "The order of operations matters when you start a new project — protection goes in "
    "<i>before</i> the secret exists:", st["body"]))
story.extend(bullets([
    "<b>First</b> create <b>.gitignore</b> with <b>.env</b> in it — so a key can never be committed.",
    "<b>Then</b> create <b>.env</b> and lock its file permissions: <b>chmod 600 .env</b>.",
    "Add the <b>Read(./.env)</b> deny rules from section 5 so the agent can't read it either.",
    "Better still: keep keys in the OS keychain, not plaintext. On macOS: "
    "<font name='Courier' size='8.4'>security add-generic-password -a \"$USER\" -s MY_API_KEY -w</font>, "
    "then load it into an environment variable in your shell profile.",
    "Never paste a secret into the prompt itself — refer to it by env-var name and let the "
    "code read it at runtime.",
], st))

story.append(Paragraph("7 · Vet the add-ons: MCP servers and skills", st["h2"]))
story.append(Paragraph(
    "MCP servers and community skills run with the same access as Claude Code itself — installing "
    "one is code execution, full stop. Vet them like production dependencies:", st["body"]))
story.extend(bullets([
    "Prefer official publishers (anthropics, major vendors) over unknown authors.",
    "Check adoption signals: install counts, GitHub stars, recent commits, open issues.",
    "Run the package past a security scanner (Socket, Snyk) before installing; treat any "
    "high-risk rating as a no until proven otherwise.",
    "Read what tools an MCP server actually exposes before connecting it — a \"calendar\" server "
    "that wants shell access is answering a question you didn't ask.",
    "Add one at a time, so you always know which addition changed your risk surface.",
], st))

story.append(Paragraph("8 · When you need real isolation", st["h2"]))
story.append(Paragraph(
    "Permissions govern the agent; sometimes you want walls around the whole machine instead. For "
    "long unattended runs, experiments with unfamiliar code, or anything where you're tempted by "
    "bypass-permissions mode, move to a disposable environment:", st["body"]))
story.extend(bullets([
    "A <b>devcontainer or Docker container</b> holding only the project — no personal files exist "
    "inside it, so nothing personal can leak.",
    "Scoped credentials only: a git token limited to the one repo, test API keys with low limits.",
    "This is the one legitimate home of <b>--dangerously-skip-permissions</b>: the \"YOLO mode\" "
    "flag is fine when the blast radius is a throwaway container, and reckless anywhere else.",
], st))

story.append(Paragraph("9 · The ten-point checklist", st["h2"]))
checklist = [
    "Installed from the official source, and kept updated",
    "One dedicated folder per project; always launch from inside it",
    "Never run from the home directory",
    "Unknown or risky tasks start in Plan Mode",
    "Deny rules for .env, secrets folders, ~/.ssh and ~/.aws in place",
    "Allow-list covers only commands you'd always approve",
    ".gitignore before .env, chmod 600 after — every new project",
    "API keys in the keychain, referenced by env var, never pasted in prompts",
    "Every MCP server and skill vetted before install",
    "Bypass-permissions only ever inside a container or VM",
]
for i, item in enumerate(checklist, 1):
    story.append(Paragraph(f"<b>{i:>2}.</b>&nbsp;&nbsp;{item}", st["bullet"]))
story.append(Spacer(1, 10))
story.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceAfter=10))
story.append(Paragraph(
    "Questions, or a lockdown topic you want covered next? Write to me via the contact form — "
    "and if this guide saved you a headache, the library at ai-with-rick.vercel.app keeps growing.",
    st["note"]))

make_doc(os.path.join(OUT, "claude-code-locked-down.pdf")).build(story)

# ────────────────────────────────────────────────────────────────────
# Guide 2: Permissions cheat sheet (one page)
# ────────────────────────────────────────────────────────────────────
st2 = styles(base_size=9)
st2["title"].fontSize = 21
st2["title"].leading = 25
st2["title"].spaceAfter = 4
st2["subtitle"].fontSize = 10.5
st2["subtitle"].leading = 15
st2["h2"].fontSize = 12
st2["h2"].leading = 15
st2["h2"].spaceBefore = 10
st2["h2"].spaceAfter = 5
st2["code"].fontSize = 7.8
st2["code"].leading = 11
st2["bullet"].spaceAfter = 2.5

cs = []
cs.append(eyebrow("Cheat Sheet · AI with Rick", st2))
cs.append(Paragraph("Claude Code Permissions, On One Page", st2["title"]))
cs.append(Paragraph("Modes, rule syntax, settings files, and the flags that keep an agent on a leash.",
                    st2["subtitle"]))
cs.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceBefore=6, spaceAfter=4))

cs.append(Paragraph("Modes — Shift+Tab cycles, Esc interrupts", st2["h2"]))
rows = [
    [Paragraph("<b>Default</b>", st2["body"]), Paragraph("asks before every edit &amp; command — daily driver", st2["body"])],
    [Paragraph("<b>Plan Mode</b>", st2["body"]), Paragraph("read-only, proposes a plan — start here when unsure", st2["body"])],
    [Paragraph("<b>Accept Edits</b>", st2["body"]), Paragraph("auto-approves workspace edits, still asks for commands", st2["body"])],
    [Paragraph("<b>Bypass</b>", st2["body"]), Paragraph("no prompts at all — container/VM only, never bare-metal", st2["body"])],
]
t = Table(rows, colWidths=[(W - 2 * MARGIN) * 0.2, (W - 2 * MARGIN) * 0.8])
t.setStyle(TableStyle([
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
cs.append(t)

cs.append(Paragraph("Rule syntax — deny always beats allow", st2["h2"]))
cs.extend(bullets([
    "<font name='Courier' size='8'>\"Bash(npm run test:*)\"</font> — any command starting with <i>npm run test</i>",
    "<font name='Courier' size='8'>\"Bash(git diff:*)\"</font> — prefix match; bare <font name='Courier' size='8'>\"Bash(git status)\"</font> = exact",
    "<font name='Courier' size='8'>\"Read(./.env)\"</font> / <font name='Courier' size='8'>\"Read(./secrets/**)\"</font> — gitignore-style paths",
    "<font name='Courier' size='8'>\"WebFetch\"</font> — a bare tool name covers every use of that tool",
    "Check what's live in any session with <font name='Courier' size='8'>/permissions</font>",
], st2))

cs.append(Paragraph("Settings files — most specific wins", st2["h2"]))
cs.extend(bullets([
    "<font name='Courier' size='8'>~/.claude/settings.json</font> — you, all projects",
    "<font name='Courier' size='8'>&lt;repo&gt;/.claude/settings.json</font> — team, committed",
    "<font name='Courier' size='8'>&lt;repo&gt;/.claude/settings.local.json</font> — you, this repo, gitignored",
], st2))

cs.append(Paragraph("Starter deny-first block", st2["h2"]))
cs.append(code_block([
    '{ "permissions": {',
    '    "deny":  ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)",',
    '              "Read(~/.ssh/**)", "Read(~/.aws/**)", "Bash(sudo:*)", "Bash(rm -rf:*)"],',
    '    "allow": ["Bash(git status)", "Bash(git diff:*)", "Bash(npm run test:*)"] } }',
], st2, W - 2 * MARGIN))

cs.append(Paragraph("Scope & session controls", st2["h2"]))
cs.extend(bullets([
    "Workspace = the folder you launch <font name='Courier' size='8'>claude</font> from — one project folder, never $HOME",
    "<font name='Courier' size='8'>/add-dir &lt;path&gt;</font> or <font name='Courier' size='8'>claude --add-dir &lt;path&gt;</font> — grant an extra folder deliberately",
    "<font name='Courier' size='8'>claude --permission-mode plan</font> — open straight into read-only Plan Mode",
    "<font name='Courier' size='8'>--dangerously-skip-permissions</font> — bypass everything: disposable containers only",
    "Secrets: .gitignore first, then .env, then <font name='Courier' size='8'>chmod 600 .env</font> — and keys in the OS keychain",
], st2))

cs.append(Spacer(1, 8))
cs.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceAfter=6))
cs.append(Paragraph("Full walkthrough: “Claude Code, Locked Down” — free in the library at ai-with-rick.vercel.app",
                    st2["note"]))

make_doc(os.path.join(OUT, "claude-code-permissions-cheat-sheet.pdf")).build(cs)

from pypdf import PdfReader  # noqa: E402
for f in ("claude-code-locked-down.pdf", "claude-code-permissions-cheat-sheet.pdf"):
    p = os.path.join(OUT, f)
    print(f, len(PdfReader(p).pages), "pages,", os.path.getsize(p) // 1024, "KB")
