"""Generic branded markdown → PDF converter for AI with Rick resources.

Usage: python md_to_pdf.py <source.md> <out.pdf> "<EYEBROW LABEL>"

Understands the same markdown subset as lib/markdown.ts: # / ## / ###,
paragraphs, - and 1. lists, ``` fences, | tables |, `code`, **bold**,
*italic*, [links](https://…), ---. The first # line becomes the title;
an immediately following *italic* paragraph becomes the subtitle.
"""
import os
import re
import sys

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
CW = W - 2 * MARGIN

ST = {
    "eyebrow": ParagraphStyle("eyebrow", fontName="FG-700", fontSize=9, leading=12,
                              textColor=ACCENT, spaceAfter=10),
    "title": ParagraphStyle("title", fontName="FG-700", fontSize=28, leading=32,
                            textColor=INK, spaceAfter=10),
    "subtitle": ParagraphStyle("subtitle", fontName="FG-400", fontSize=12.5, leading=18,
                               textColor=SOFT, spaceAfter=6),
    "h2": ParagraphStyle("h2", fontName="FG-700", fontSize=15.5, leading=20, textColor=INK,
                         spaceBefore=18, spaceAfter=8),
    "h3": ParagraphStyle("h3", fontName="FG-700", fontSize=12, leading=16, textColor=INK,
                         spaceBefore=12, spaceAfter=6),
    "body": ParagraphStyle("body", fontName="FG-400", fontSize=10.5, leading=16.5,
                           textColor=INK, spaceAfter=8),
    "bullet": ParagraphStyle("bullet", fontName="FG-400", fontSize=10.5, leading=15.5,
                             textColor=INK, leftIndent=12, bulletIndent=2, spaceAfter=4),
    "code": ParagraphStyle("code", fontName="Courier", fontSize=8.6, leading=12.4, textColor=INK),
    "cell": ParagraphStyle("cell", fontName="FG-400", fontSize=9, leading=13, textColor=INK),
    "note": ParagraphStyle("note", fontName="FG-400", fontSize=9.5, leading=14,
                           textColor=SOFT, spaceAfter=8),
}


def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inline(text):
    out = esc(text)
    codes = []

    def stash(m):
        codes.append(m.group(1))
        return f"\x00{len(codes) - 1}\x00"

    out = re.sub(r"`([^`]+)`", stash, out)
    out = re.sub(r"\[([^\]]+)\]\((https?://[^\s)]+)\)",
                 r'<link href="\2" color="#CC785C">\1</link>', out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", out)
    out = re.sub(r"(^|[^*])\*([^*\n]+)\*", r"\1<i>\2</i>", out)
    out = re.sub(r"\x00(\d+)\x00",
                 lambda m: f'<font name="Courier" size="8.6">{codes[int(m.group(1))]}</font>', out)
    return out


def code_block(text):
    para = Paragraph(esc(text).replace("\n", "<br/>").replace(" ", "&nbsp;"), ST["code"])
    t = Table([[para]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM), ("BOX", (0, 0), (-1, -1), 0.75, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def convert(md_path, pdf_path, eyebrow):
    text = open(md_path).read().replace("\r\n", "\n")
    # Familjen Grotesk (and core Courier) lack arrow glyphs — map to '›'.
    text = text.replace("→", "›").replace("↗", "›")
    lines = text.split("\n")
    story = [Paragraph(esc(eyebrow.upper()), ST["eyebrow"])]
    para = []
    seen_title = False

    def flush():
        if para:
            story.append(Paragraph(" ".join(inline(x) for x in para), ST["body"]))
            para.clear()

    i = 0
    while i < len(lines):
        t = lines[i].strip()
        if t.startswith("```"):
            flush()
            buf = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            story.append(code_block("\n".join(buf)))
            story.append(Spacer(1, 6))
            continue
        if not t:
            flush(); i += 1; continue
        if re.fullmatch(r"-{3,}", t):
            flush()
            story.append(HRFlowable(width="100%", thickness=0.75, color=LINE,
                                    spaceBefore=8, spaceAfter=10))
            i += 1
            continue
        if t.startswith("# ") and not seen_title:
            story.append(Paragraph(inline(t[2:]), ST["title"]))
            seen_title = True
            # A following *italic* line becomes the subtitle
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and re.fullmatch(r"\*[^*].*\*", lines[j].strip()):
                story.append(Paragraph(inline(lines[j].strip().strip("*")), ST["subtitle"]))
                i = j
            i += 1
            continue
        for prefix, style in (("### ", "h3"), ("## ", "h2"), ("# ", "h2")):
            if t.startswith(prefix):
                flush()
                story.append(Paragraph(inline(t[len(prefix):]), ST[style]))
                break
        else:
            if t.startswith("|") and i + 1 < len(lines) and \
                    re.fullmatch(r"\|?[\s:|-]+\|?", lines[i + 1].strip()) and "-" in lines[i + 1]:
                flush()
                header = split_row(t)
                i += 2
                rows = []
                while i < len(lines) and lines[i].strip().startswith("|"):
                    rows.append(split_row(lines[i]))
                    i += 1
                data = [[Paragraph(f"<b>{inline(c)}</b>", ST["cell"]) for c in header]]
                data += [[Paragraph(inline(c), ST["cell"]) for c in r] for r in rows]
                tbl = Table(data, colWidths=[CW / len(header)] * len(header))
                tbl.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), CREAM),
                    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]))
                story.append(tbl)
                story.append(Spacer(1, 6))
                continue
            m_ul, m_ol = t.startswith("- "), re.match(r"^\d+\.\s", t)
            if m_ul or m_ol:
                flush()
                is_item = (lambda s: s.startswith("- ")) if m_ul else (lambda s: re.match(r"^\d+\.\s", s))
                strip = (lambda s: s[2:]) if m_ul else (lambda s: re.sub(r"^\d+\.\s", "", s))
                n = 0
                while i < len(lines):
                    cur, curt = lines[i], lines[i].strip()
                    if is_item(curt):
                        n += 1
                        marker = "–" if m_ul else f"{n}."
                        story.append(Paragraph(inline(strip(curt)), ST["bullet"], bulletText=marker))
                        i += 1
                    elif curt and cur[:1].isspace():
                        story[-1] = Paragraph(story[-1].text + " " + inline(curt), ST["bullet"],
                                              bulletText=story[-1].bulletText if hasattr(story[-1], "bulletText") else "–")
                        i += 1
                    else:
                        break
                story.append(Spacer(1, 4))
                continue
            para.append(t)
        i += 1
    flush()

    def on_page(canvas, doc_):
        canvas.saveState()
        canvas.setFillColor(PEACH)
        canvas.rect(0, H - 6 * mm, W, 6 * mm, stroke=0, fill=1)
        canvas.setFont("FG-600", 8.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN, 13 * mm, "AI with Rick · ai-with-rick.vercel.app")
        canvas.drawRightString(W - MARGIN, 13 * mm, f"{doc_.page}")
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, 17 * mm, W - MARGIN, 17 * mm)
        canvas.restoreState()

    doc = BaseDocTemplate(pdf_path, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=20 * mm, bottomMargin=24 * mm,
                          title="AI with Rick", author="Rick — AI with Rick")
    frame = Frame(MARGIN, 24 * mm, CW, H - 44 * mm, id="main")
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=on_page)])
    doc.build(story)


if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2], sys.argv[3])
    print("built", sys.argv[2])
