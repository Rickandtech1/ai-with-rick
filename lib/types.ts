export const RESOURCE_FORMATS = [
  "PDF Guide",
  "Video Walkthrough",
  "Notion Template",
  "Cheat Sheet",
  "Code Repo",
] as const;

export type ResourceFormat = (typeof RESOURCE_FORMATS)[number];

export interface Resource {
  id: string;
  title: string;
  description: string;
  format: ResourceFormat;
  published_date: string;
  body_content: string;
  file_path: string | null;
  /** Optional markdown twin of the main file, offered as a second download. */
  md_path: string | null;
  /** When false, the download skips the name/email form entirely. */
  require_lead: boolean;
  /** Speakable URL segment (/r/<slug>); falls back to the id when null. */
  slug: string | null;
  /** The matching YouTube video, shown as "Watch the video version". */
  youtube_url: string | null;
  external_url: string | null;
  visible: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  resource_id: string;
  first_name: string;
  last_name: string;
  email: string;
  newsletter_opt_in: boolean;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Newsletter {
  id: string;
  subject: string;
  body_md: string;
  recipient_count: number;
  sent_at: string;
}

/** "Jul 2026" — the date style used across the design. */
export function formatResourceDate(isoDate: string): string {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
