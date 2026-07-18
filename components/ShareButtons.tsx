"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} — ${url}`)}` },
  ];

  const nativeShare = async () => {
    track("shared", { title });
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user closed the sheet */
      }
    } else {
      await copy();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("shared", { title, via: "copy" });
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="share-row">
      <span className="share-label">Found this useful? Share it:</span>
      <button type="button" className="share-btn" onClick={nativeShare}>
        Share ↗
      </button>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
          onClick={() => track("shared", { title, via: l.name })}
        >
          {l.name}
        </a>
      ))}
      <button type="button" className="share-btn" onClick={copy}>
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
