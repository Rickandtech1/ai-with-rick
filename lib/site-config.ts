/**
 * All outward-facing links and identity strings live here.
 * Edit this one file when handles / URLs are final — nothing else
 * in the codebase hardcodes them.
 */
export const siteConfig = {
  name: "AI with Rick",
  tagline: "Practical AI knowledge, minus the hype.",
  contactEmail: "aiwithrick@gmail.com",
  youtubeChannel: "https://www.youtube.com/@aiwithrick",
  /** The featured video on the hero card (right side of the hero). */
  heroVideo: {
    url: "https://www.youtube.com/watch?v=I9RZlnD4H88",
    title: "Relaxing Smooth Jazz | Soft Female Vocals & Tender Love Lyrics to Relax Your Soul",
    caption: "Milesora Lounge on YouTube",
  },
  social: [
    { name: "Instagram", handle: "@aiwithrick", href: "https://www.instagram.com/aiwithrick" },
    { name: "TikTok", handle: "@aiwithrick", href: "https://www.tiktok.com/@aiwithrick" },
    { name: "YouTube", handle: "/aiwithrick", href: "https://www.youtube.com/@aiwithrick" },
    { name: "LinkedIn", handle: "/in/aiwithrick", href: "https://www.linkedin.com/in/aiwithrick" },
  ],
} as const;

/** Absolute site URL, used for unsubscribe links in newsletter emails. */
export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}${path}`;
}
