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
  /**
   * Fallback for the hero video card (right side of the hero). The live
   * value is managed in /admin → Hero video and stored in site_settings;
   * this is only used until that row exists.
   */
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

export interface HeroVideo {
  url: string;
  title: string;
  caption: string;
}

/** The 11-character video id from any YouTube watch/share/shorts/embed URL. */
export function youtubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * YouTube thumbnail for a watch/short URL. hqdefault always exists; its 4:3
 * letterbox bars are cropped away by the card's 16:9 `object-fit: cover` frame.
 */
export function youtubeThumbnail(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Absolute site URL, used for unsubscribe links in newsletter emails. */
export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}${path}`;
}
