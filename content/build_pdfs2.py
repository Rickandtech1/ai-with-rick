"""Build PDFs for Prompt Engineering Field Notes and Debugging Agent Loops."""
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
                                  textColor=ACCENT, spaceAfter=10),
        "title": ParagraphStyle("title", fontName="FG-700", fontSize=30, leading=34,
                                textColor=INK, spaceAfter=10),
        "subtitle": ParagraphStyle("subtitle", fontName="FG-400", fontSize=12.5, leading=18,
                                   textColor=SOFT, spaceAfter=6),
        "h2": ParagraphStyle("h2", fontName="FG-700", fontSize=16, leading=20, textColor=INK,
                             spaceBefore=18, spaceAfter=8),
        "h3": ParagraphStyle("h3", fontName="FG-700", fontSize=12, leading=16, textColor=INK,
                             spaceBefore=12, spaceAfter=6),
        "body": ParagraphStyle("body", fontName="FG-400", fontSize=base_size, leading=base_size * 1.55,
                               textColor=INK, spaceAfter=8),
        "bullet": ParagraphStyle("bullet", fontName="FG-400", fontSize=base_size, leading=base_size * 1.5,
                                 textColor=INK, leftIndent=12, bulletIndent=2, spaceAfter=4),
        "code": ParagraphStyle("code", fontName="Courier", fontSize=8.6, leading=12.4, textColor=INK),
        "note": ParagraphStyle("note", fontName="FG-400", fontSize=9.5, leading=14,
                               textColor=SOFT, spaceAfter=8),
    }


def code_block(lines, st, width):
    para = Paragraph("<br/>".join(lines).replace(" ", "&nbsp;"), st["code"])
    table = Table([[para]], colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), 0.75, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
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


def make_doc(path):
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
# Prompt Engineering Field Notes (guide)
# ────────────────────────────────────────────────────────────────────
st = styles()
cw = W - 2 * MARGIN
s = []

s.append(Paragraph("PDF GUIDE · AI WITH RICK", st["eyebrow"]))
s.append(Paragraph("Prompt Engineering Field Notes", st["title"]))
s.append(Paragraph(
    "The patterns that actually move outputs, collected from a year of daily use — ranked by how "
    "often they fix a bad answer in practice.", st["subtitle"]))
s.append(Spacer(1, 4))
s.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceAfter=14))

s.append(Paragraph("1 · The mindset: prompts are interfaces, not incantations", st["h2"]))
s.append(Paragraph(
    "There are no magic words. A prompt is an interface between what you know and what the model "
    "can do — and like any interface, it works when it transmits <b>intent</b> clearly. Every "
    "pattern in these notes is the same move in different clothes: remove a way the model could "
    "misunderstand you.", st["body"]))
s.append(Paragraph(
    "The other mindset shift: treat prompts like code. Keep the ones that work, version the "
    "changes, and when an output goes wrong, debug the prompt instead of re-rolling and hoping.",
    st["body"]))

s.append(Paragraph("2 · The patterns that move outputs", st["h2"]))

s.append(Paragraph("Say who it's for, not just what it is", st["h3"]))
s.append(Paragraph(
    "“Explain how DNS works” produces a textbook page. “Explain how DNS works to a "
    "designer who just wants to know why her site is down” produces something someone actually "
    "reads. Audience is the highest-leverage single sentence in most prompts.", st["body"]))

s.append(Paragraph("Show one example instead of describing ten rules", st["h3"]))
s.append(Paragraph(
    "If you want a specific format, tone, or structure, paste a small example of it. One good "
    "example replaces a paragraph of instructions; two examples that differ in content but match "
    "in shape teach the pattern almost perfectly. This is the closest thing to a cheat code that "
    "exists.", st["body"]))

s.append(Paragraph("Structure the output before asking for it", st["h3"]))
s.append(Paragraph("Decide the shape first, then request it explicitly:", st["body"]))
s.append(code_block([
    "Summarize the meeting notes below.",
    "",
    "Format:",
    "## Decisions",
    "- …",
    "## Open questions",
    "- …",
    "## Action items (owner → task)",
    "- …",
], st, cw))
s.append(Spacer(1, 6))
s.append(Paragraph(
    "Models are excellent at filling in templates and mediocre at inventing the right structure "
    "on their own.", st["body"]))

s.append(Paragraph("Constraints beat vibes", st["h3"]))
s.append(Paragraph(
    "“Keep it punchy” does almost nothing. “Under 120 words, no bullet points, no "
    "exclamation marks” changes the output every time. Numbers, limits, and bans are "
    "enforceable; adjectives are not.", st["body"]))

s.append(Paragraph("Let it think before it answers", st["h3"]))
s.append(Paragraph(
    "For anything with real reasoning — tradeoffs, math, debugging, planning — ask for the "
    "thinking first: “Work through the options and only then give your recommendation.” "
    "Forcing an early final answer locks in early mistakes.", st["body"]))

s.append(Paragraph("Prefer positive instructions", st["h3"]))
s.append(Paragraph(
    "“Don't be verbose” plants the idea of verbosity. “Answer in three "
    "sentences” replaces it. Whenever you catch yourself writing <i>don't</i>, try rewriting "
    "it as <i>do</i>.", st["body"]))

s.append(Paragraph("Put the question after the material", st["h3"]))
s.append(Paragraph(
    "When pasting a long document, put your instructions <b>after</b> it (or both before and "
    "after). The end of the prompt is what the model attends to most as it starts writing — "
    "don't spend it on the document's appendix.", st["body"]))

s.append(Paragraph("3 · Debugging a prompt that isn't working", st["h2"]))
for i, (head, rest) in enumerate([
    ("Reproduce it small.", "Trim the prompt to the shortest version that still fails — the problem is usually in what's left."),
    ("Change one thing at a time.", "Prompt tweaks interact; two changes at once means you learn nothing."),
    ("Read the output like a diagnosis.", "The way it's wrong tells you what got miscommunicated: wrong format → structure wasn't specified; wrong depth → audience wasn't specified; wrong facts → your context didn't actually contain them."),
    ("Ask the model.", "“Here's what I asked, here's what I got, here's what I wanted — what should I change in the prompt?” is legitimately effective."),
], 1):
    s.append(Paragraph(f"<b>{i}.</b>&nbsp;&nbsp;<b>{head}</b> {rest}", st["bullet"]))
s.append(Spacer(1, 4))

s.append(Paragraph("4 · Anti-patterns that waste your tokens", st["h2"]))
s.extend(bullets([
    "<b>The mega-prompt</b> — twenty rules glued together over months. Nobody knows which rules still matter, and some now conflict. Prune ruthlessly.",
    "<b>Politeness padding</b> — “if you don't mind, could you perhaps” costs tokens and clarity. Direct isn't rude; it's legible.",
    "<b>Conflicting constraints</b> — “be comprehensive but keep it brief” makes the model split the difference and do neither.",
    "<b>“Be creative”</b> — means nothing. Name the flavor: “surprising analogies,” “dry humor,” “no clichés.”",
    "<b>Re-rolling instead of revising</b> — regenerating the same prompt is a slot machine. Change the prompt and it becomes an experiment.",
], st))

s.append(Paragraph("5 · The field checklist", st["h2"]))
for i, item in enumerate([
    "Did I say who the output is for?",
    "Did I show the format instead of describing it?",
    "Are my constraints countable (words, items, sections) rather than adjectives?",
    "Is the instruction after the long material, not buried before it?",
    "On a hard problem — did I ask for reasoning before the answer?",
    "Am I revising the prompt on failure, not just re-rolling?",
], 1):
    s.append(Paragraph(f"<b>{i}.</b>&nbsp;&nbsp;{item}", st["bullet"]))
s.append(Spacer(1, 10))
s.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceAfter=10))
s.append(Paragraph(
    "Want more examples, or a pattern covered in depth? Send a note via the contact form — the "
    "library at ai-with-rick.vercel.app keeps growing.", st["note"]))

make_doc(os.path.join(OUT, "prompt-engineering-field-notes.pdf")).build(s)

# ────────────────────────────────────────────────────────────────────
# Debugging Agent Loops (one-page cheat sheet)
# ────────────────────────────────────────────────────────────────────
st2 = styles(base_size=9)
st2["title"].fontSize = 21
st2["title"].leading = 25
st2["title"].spaceAfter = 4
st2["subtitle"].fontSize = 10.5
st2["h2"].fontSize = 12
st2["h2"].leading = 15
st2["h2"].spaceBefore = 10
st2["h2"].spaceAfter = 5
st2["bullet"].spaceAfter = 2.5

cs = []
cs.append(Paragraph("CHEAT SHEET · AI WITH RICK", st2["eyebrow"]))
cs.append(Paragraph("Debugging Agent Loops", st2["title"]))
cs.append(Paragraph("The failure modes that keep agents stuck in circles — and the one-line fixes.",
                    st2["subtitle"]))
cs.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceBefore=6, spaceAfter=6))

cs.append(Paragraph("Symptom → cause → fix", st2["h2"]))
rows = [[Paragraph(f"<b>{h}</b>", st2["body"]) for h in ("Symptom", "Likely cause", "Fix")]]
for sym, cause, fix in [
    ("Repeats the same failing action", "The error never reaches the model", "Feed stderr / tool errors back into context, loudly"),
    ("Endless reading, never acts", "No definition of done", "Restate the task with concrete acceptance criteria"),
    ("Same tool, same arguments, again", "No memory of what was tried", "Keep an attempt log; force a strategy change after 2 failures"),
    ("Calls tools/files that don't exist", "Missing inventory", "List the real tools, files, and commands up front"),
    ("“Fixes” code that isn't broken", "The feedback signal is wrong", "Verify the test/check itself before trusting its verdict"),
    ("Runs forever, burns budget", "No stop condition", "Hard-cap steps, tokens, and time; fail loudly at the cap"),
    ("Declares success, task not done", "Self-report instead of verification", "Require an observable check (test passes, URL returns 200)"),
]:
    rows.append([Paragraph(sym, st2["body"]), Paragraph(cause, st2["body"]), Paragraph(fix, st2["body"])])
t = Table(rows, colWidths=[cw * 0.30, cw * 0.30, cw * 0.40])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), CREAM),
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
cs.append(t)

cs.append(Paragraph("The golden rules", st2["h2"]))
for i, item in enumerate([
    "<b>Errors must be louder than successes.</b> An agent that can't see its failures repeats them forever.",
    "<b>One change per step.</b> Five edits per iteration means nobody knows what helped.",
    "<b>Log every attempt where the agent can see it.</b> Loops usually mean the context has amnesia.",
    "<b>Define done as something observable.</b> “Tests pass” beats “seems complete.”",
    "<b>Every loop needs an exit.</b> Step and time limits — and at the limit: stop and report, don't retry harder.",
], 1):
    cs.append(Paragraph(f"<b>{i}.</b>&nbsp;&nbsp;{item}", st2["bullet"]))

cs.append(Paragraph("Three-step triage", st2["h2"]))
for i, item in enumerate([
    "<b>Read the last three iterations.</b> Loops are visible: same action, same result, same “next step.”",
    "<b>Find what the agent can't see.</b> Nine times out of ten it's missing feedback — an error, a diff, a test result that never entered context.",
    "<b>Add the smallest missing signal and re-run.</b> Don't redesign the agent for what is usually one absent line of feedback.",
], 1):
    cs.append(Paragraph(f"<b>{i}.</b>&nbsp;&nbsp;{item}", st2["bullet"]))

cs.append(Spacer(1, 8))
cs.append(HRFlowable(width="100%", thickness=0.75, color=LINE, spaceAfter=6))
cs.append(Paragraph("Companion guide: “Claude Code, Locked Down” — free in the library at ai-with-rick.vercel.app",
                    st2["note"]))

make_doc(os.path.join(OUT, "debugging-agent-loops.pdf")).build(cs)

from pypdf import PdfReader  # noqa: E402
for f in ("prompt-engineering-field-notes.pdf", "debugging-agent-loops.pdf"):
    p = os.path.join(OUT, f)
    print(f, len(PdfReader(p).pages), "pages,", os.path.getsize(p) // 1024, "KB")
