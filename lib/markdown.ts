/**
 * Minimal, dependency-free markdown → HTML renderer for trusted,
 * admin-authored content (resource write-ups and newsletter bodies).
 * Supports: paragraphs, ## / ### headings, - bullet lists,
 * **bold**, *italic*, [links](https://…). Everything is HTML-escaped
 * first, so raw HTML in the source is displayed, not executed.
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
  // [text](url) — http(s) only
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return out;
}

export function markdownToHtml(md: string): string {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim());

    if (lines.every((l) => l.startsWith("- "))) {
      const items = lines.map((l) => `<li>${renderInline(l.slice(2))}</li>`).join("");
      html.push(`<ul>${items}</ul>`);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    html.push(`<p>${lines.map(renderInline).join("<br />")}</p>`);
  }

  return html.join("\n");
}
