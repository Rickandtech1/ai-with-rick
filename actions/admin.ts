"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth";
import { sendNewsletterBatch } from "@/lib/email";
import { youtubeVideoId } from "@/lib/site-config";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase/admin";
import { RESOURCE_FORMATS, type ResourceFormat } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function revalidatePublic(id?: string) {
  revalidatePath("/");
  if (id) revalidatePath(`/r/${id}`);
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "file";
}

/** Create or update a resource from the admin form (multipart FormData). */
export async function saveResource(formData: FormData): Promise<ActionResult> {
  await requireAdminAction();
  const db = supabaseAdmin();

  const id = String(formData.get("id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const format = String(formData.get("format") ?? "") as ResourceFormat;
  const publishedDate = String(formData.get("published_date") ?? "").trim();
  const bodyContent = String(formData.get("body_content") ?? "");
  const externalUrl = String(formData.get("external_url") ?? "").trim() || null;
  const visible = formData.get("visible") === "on";
  const featured = formData.get("featured") === "on";
  const file = formData.get("file");

  if (!title) return { ok: false, error: "Title is required." };
  if (!RESOURCE_FORMATS.includes(format)) return { ok: false, error: "Pick a valid format." };
  if (!publishedDate) return { ok: false, error: "Published date is required." };

  // Upload new file (if any) before touching the row.
  let filePath: string | undefined;
  if (file instanceof File && file.size > 0) {
    const path = `${randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "application/octet-stream",
      });
    if (error) return { ok: false, error: `File upload failed: ${error.message}` };
    filePath = path;
  }

  // "At most one featured": clear the old one first (a partial unique
  // index backs this up at the database level).
  if (featured) {
    await db.from("resources").update({ featured: false }).eq("featured", true);
  }

  const row = {
    title,
    description,
    format,
    published_date: publishedDate,
    body_content: bodyContent,
    external_url: externalUrl,
    visible,
    featured,
    ...(filePath ? { file_path: filePath } : {}),
  };

  if (id) {
    // Replace an old stored file if a new one was uploaded.
    let oldPath: string | null = null;
    if (filePath) {
      const { data: existing } = await db.from("resources").select("file_path").eq("id", id).maybeSingle();
      oldPath = existing?.file_path ?? null;
    }
    const { error } = await db.from("resources").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (filePath && oldPath && oldPath !== filePath) {
      await db.storage.from(STORAGE_BUCKET).remove([oldPath]);
    }
    revalidatePublic(id);
    return { ok: true, id };
  }

  const { data, error } = await db.from("resources").insert(row).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePublic(data.id);
  return { ok: true, id: data.id };
}

export async function setResourceVisible(id: string, visible: boolean): Promise<ActionResult> {
  await requireAdminAction();
  const { error } = await supabaseAdmin().from("resources").update({ visible }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic(id);
  revalidatePath("/admin");
  return { ok: true };
}

export async function setResourceFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdminAction();
  const db = supabaseAdmin();
  if (featured) {
    await db.from("resources").update({ featured: false }).eq("featured", true);
  }
  const { error } = await db.from("resources").update({ featured }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic(id);
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  await requireAdminAction();
  const db = supabaseAdmin();

  const { data: existing } = await db.from("resources").select("file_path").eq("id", id).maybeSingle();
  const { error } = await db.from("resources").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (existing?.file_path) {
    await db.storage.from(STORAGE_BUCKET).remove([existing.file_path]);
  }
  revalidatePublic(id);
  revalidatePath("/admin");
  return { ok: true };
}

export interface SendNewsletterResult {
  ok: boolean;
  error?: string;
  sent?: number;
}

/** Compose-and-send: emails every active subscriber as of right now. */
export async function sendNewsletter(formData: FormData): Promise<SendNewsletterResult> {
  await requireAdminAction();
  const db = supabaseAdmin();

  const subject = String(formData.get("subject") ?? "").trim();
  const bodyMd = String(formData.get("body") ?? "").trim();
  if (!subject) return { ok: false, error: "Subject is required." };
  if (!bodyMd) return { ok: false, error: "Write something first." };

  const { data: recipients, error } = await db
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .is("unsubscribed_at", null);
  if (error) return { ok: false, error: error.message };
  if (!recipients || recipients.length === 0) {
    return { ok: false, error: "No active subscribers yet — nothing was sent." };
  }

  let sent: number;
  try {
    sent = await sendNewsletterBatch(subject, bodyMd, recipients);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Sending failed." };
  }

  await db.from("newsletters").insert({ subject, body_md: bodyMd, recipient_count: sent });
  revalidatePath("/admin/newsletter");
  return { ok: true, sent };
}

/**
 * Point the hero card at a different YouTube video. Title and channel
 * come from YouTube's oEmbed endpoint, so the admin only pastes a URL.
 */
export async function updateHeroVideo(formData: FormData): Promise<ActionResult> {
  await requireAdminAction();

  const url = String(formData.get("url") ?? "").trim();
  const videoId = youtubeVideoId(url);
  if (!videoId) {
    return { ok: false, error: "That doesn't look like a YouTube video link." };
  }
  // Canonical watch URL — drops playlist/radio params from pasted links.
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

  let title: string;
  let caption: string;
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`
    );
    if (!res.ok) {
      return { ok: false, error: "YouTube didn't recognize that link — is the video public?" };
    }
    const meta = (await res.json()) as { title?: string; author_name?: string };
    title = meta.title ?? "";
    caption = meta.author_name ? `${meta.author_name} on YouTube` : "";
  } catch {
    return { ok: false, error: "Couldn't reach YouTube to look up the video. Try again." };
  }
  if (!title) return { ok: false, error: "YouTube returned no title for that video." };

  const { error } = await supabaseAdmin()
    .from("site_settings")
    .upsert({
      key: "hero_video",
      value: { url: cleanUrl, title, caption },
      updated_at: new Date().toISOString(),
    });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
