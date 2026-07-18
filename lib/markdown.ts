/**
 * Minimal, dependency-free markdown → HTML renderer for trusted,
 * admin-authored content (resource write-ups, newsletter bodies, and
 * the full-text reader pages). Supports: paragraphs, # / ## / ###
 * headings, - bullet and 1. numbered lists, ``` fenced code blocks,
 * | tables |, `inline code`, ---, **bold**, *italic*, [links](https://…).
 * Everything is HTML-escaped first, so raw HTML in the source is
 * displayed, not executed.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  let out = escapeHtml(text);

  // Pull inline code out first so bold/italic markers inside it survive.
  const codes: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });

  // [text](url) — http(s) only
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  out = out.replace(/\u0000(\d+)\u0000/g, (_, n: string) => `<code>${codes[Number(n)]}</code>`);
  return out;
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      html.push(`<p>${para.map(renderInline).join("<br />")}</p>`);
      para.length = 0;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    // Fenced code block
    if (t.startsWith("```")) {
      flushPara();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      html.push(`<pre><code>${escapeHtml(buf.join("\n"))}</code></pre>`);
      continue;
    }

    if (!t) {
      flushPara();
      i++;
      continue;
    }

    if (/^-{3,}$/.test(t)) {
      flushPara();
      html.push("<hr />");
      i++;
      continue;
    }

    if (t.startsWith("### ")) {
      flushPara();
      html.push(`<h3>${renderInline(t.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (t.startsWith("## ")) {
      flushPara();
      html.push(`<h2>${renderInline(t.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (t.startsWith("# ")) {
      flushPara();
      html.push(`<h1>${renderInline(t.slice(2))}</h1>`);
      i++;
      continue;
    }

    // Table: header row, then a |---|---| separator row
    if (
      t.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim()) &&
      lines[i + 1].includes("-")
    ) {
      flushPara();
      const header = splitTableRow(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[i].trim()));
        i++;
      }
      const thead = `<thead><tr>${header.map((c) => `<th>${renderInline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      html.push(`<div class="table-wrap"><table>${thead}${tbody}</table></div>`);
      continue;
    }

    // Bullet / numbered lists (indented continuation lines join the item)
    const listMatch = t.startsWith("- ") ? "ul" : /^\d+\.\s/.test(t) ? "ol" : null;
    if (listMatch) {
      flushPara();
      const items: string[] = [];
      const isItem = (s: string) => (listMatch === "ul" ? s.startsWith("- ") : /^\d+\.\s/.test(s));
      const strip = (s: string) => (listMatch === "ul" ? s.slice(2) : s.replace(/^\d+\.\s/, ""));
      while (i < lines.length) {
        const cur = lines[i];
        const curT = cur.trim();
        if (isItem(curT)) {
          items.push(strip(curT));
          i++;
        } else if (curT && /^\s/.test(cur) && items.length > 0) {
          items[items.length - 1] += ` ${curT}`;
          i++;
        } else {
          break;
        }
      }
      html.push(
        `<${listMatch}>${items.map((x) => `<li>${renderInline(x)}</li>`).join("")}</${listMatch}>`
      );
      continue;
    }

    para.push(t);
    i++;
  }
  flushPara();

  return html.join("\n");
}
