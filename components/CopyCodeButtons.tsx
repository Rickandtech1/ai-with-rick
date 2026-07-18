"use client";

import { useEffect } from "react";

/**
 * Attaches a Copy button to every code block inside .reader-body.
 * Works on any current or future content — no per-article setup.
 */
export function CopyCodeButtons() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLElement>(".reader-body pre");
    pres.forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.replaceWith(wrap);
      wrap.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText);
          btn.textContent = "Copied ✓";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 1600);
        } catch {
          btn.textContent = "Select & copy";
        }
      });
      wrap.appendChild(btn);
    });
  }, []);

  return null;
}
