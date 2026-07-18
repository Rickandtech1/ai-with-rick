"use server";

import { sendContactNotification, sendWelcomeEmail } from "@/lib/email";
import { supabaseAdmin, SIGNED_URL_EXPIRY_SECONDS, STORAGE_BUCKET } from "@/lib/supabase/admin";

/**
 * Upsert a subscriber; send the welcome email only when they weren't
 * already active (so re-submits and dupes never double-send).
 */
async function subscribeAndWelcome(
  db: ReturnType<typeof supabaseAdmin>,
  email: string
): Promise<{ ok: boolean }> {
  const { data: existing } = await db
    .from("newsletter_subscribers")
    .select("unsubscribed_at")
    .eq("email", email)
    .maybeSingle();
  const wasActive = !!existing && existing.unsubscribed_at === null;

  const { data: row, error } = await db
    .from("newsletter_subscribers")
    .upsert({ email, unsubscribed_at: null }, { onConflict: "email" })
    .select("unsubscribe_token")
    .single();
  if (error) return { ok: false };

  if (!wasActive && row?.unsubscribe_token) {
    await sendWelcomeEmail(email, row.unsubscribe_token);
  }
  return { ok: true };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LeadResult {
  ok: boolean;
  error?: string;
  /** Signed download URL or the resource's external link. */
  url?: string;
  /** Signed URL for the markdown version, when the resource has one. */
  mdUrl?: string;
  kind?: "file" | "external";
}

/**
 * Lead-gated download: store the lead, optionally opt them into the
 * newsletter, then return a short-lived signed URL (or external link).
 */
export async function captureLead(resourceId: string, formData: FormData): Promise<LeadResult> {
  // Honeypot — real users never see or fill this field.
  if (String(formData.get("website") ?? "") !== "") return { ok: false, error: "Something went wrong." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const optIn = formData.get("newsletterOptIn") === "on";

  if (!firstName || !lastName) return { ok: false, error: "Please fill in your first and last name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "That email doesn't look right." };

  const db = supabaseAdmin();

  // Only published resources can be downloaded. (select * so the code
  // keeps working whether or not optional columns like md_path exist yet.)
  const { data: resource } = await db
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .eq("visible", true)
    .maybeSingle();
  if (!resource) return { ok: false, error: "This resource is no longer available." };

  const { error: leadError } = await db.from("leads").insert({
    resource_id: resourceId,
    first_name: firstName,
    last_name: lastName,
    email,
    newsletter_opt_in: optIn,
  });
  if (leadError) {
    console.error("[leads] insert failed", leadError);
    return { ok: false, error: "Couldn't save your details — please try again." };
  }

  if (optIn) {
    const { ok } = await subscribeAndWelcome(db, email);
    if (!ok) console.error("[leads] newsletter opt-in failed");
  }

  return signDownloadUrls(resource);
}

/**
 * Instant download for resources whose admin turned the lead gate off
 * (require_lead = false). Refuses gated resources, so the flag stays
 * enforced server-side even if the action is called directly.
 */
export async function getDirectDownload(resourceId: string): Promise<LeadResult> {
  const db = supabaseAdmin();
  const { data: resource } = await db
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .eq("visible", true)
    .maybeSingle();
  if (!resource) return { ok: false, error: "This resource is no longer available." };
  if (resource.require_lead ?? true) return { ok: false, error: "This download needs the form." };
  return signDownloadUrls(resource);
}

async function signDownloadUrls(resource: {
  file_path: string | null;
  md_path?: string | null;
  external_url: string | null;
}): Promise<LeadResult> {
  const db = supabaseAdmin();

  if (resource.file_path) {
    const { data, error } = await db.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(resource.file_path, SIGNED_URL_EXPIRY_SECONDS, {
        download: true,
      });
    if (error || !data?.signedUrl) {
      console.error("[download] signed URL failed", error);
      return { ok: false, error: "Couldn't prepare your download — please try again." };
    }

    let mdUrl: string | undefined;
    if (resource.md_path) {
      const { data: mdData } = await db.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(resource.md_path, SIGNED_URL_EXPIRY_SECONDS, { download: true });
      mdUrl = mdData?.signedUrl;
    }
    return { ok: true, url: data.signedUrl, mdUrl, kind: "file" };
  }

  if (resource.external_url) return { ok: true, url: resource.external_url, kind: "external" };

  return { ok: false, error: "This resource has no download yet — check back soon." };
}

export async function subscribeNewsletter(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (String(formData.get("website") ?? "") !== "") return { ok: false, error: "Something went wrong." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "That email doesn't look right." };

  // Duplicates are fine; a previously-unsubscribed address that signs
  // up again is re-activated (and re-welcomed).
  const { ok } = await subscribeAndWelcome(supabaseAdmin(), email);
  if (!ok) {
    return { ok: false, error: "Couldn't subscribe you — please try again." };
  }
  return { ok: true };
}

export async function submitContact(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (String(formData.get("website") ?? "") !== "") return { ok: false, error: "Something went wrong." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message) return { ok: false, error: "Please fill in every field." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "That email doesn't look right." };

  const { error } = await supabaseAdmin().from("contact_messages").insert({ name, email, message });
  if (error) {
    console.error("[contact] insert failed", error);
    return { ok: false, error: "Couldn't send your message — please try again." };
  }

  await sendContactNotification({ name, email, message });
  return { ok: true };
}
