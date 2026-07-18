import "server-only";
import { Resend } from "resend";
import { markdownToHtml } from "./markdown";
import { siteConfig, siteUrl } from "./site-config";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function fromAddress(): string {
  // Before a domain is verified in Resend, the sandbox sender works,
  // but can only deliver to the Resend account owner's own email.
  return process.env.EMAIL_FROM || "AI with Rick <onboarding@resend.dev>";
}

/** Notify Rick when a contact-form message lands. Best-effort. */
export async function sendContactNotification(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const resend = getResend();
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!resend || !to) {
    console.warn("[email] RESEND_API_KEY or CONTACT_NOTIFY_EMAIL missing — contact notification skipped");
    return;
  }
  try {
    await resend.emails.send({
      from: fromAddress(),
      to,
      replyTo: input.email,
      subject: `New contact message from ${input.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px">
          <p><strong>${escape(input.name)}</strong> (${escape(input.email)}) wrote:</p>
          <blockquote style="border-left:3px solid #CC785C;margin:0;padding:8px 16px;color:#3A3A3E">
            ${escape(input.message).replace(/\n/g, "<br />")}
          </blockquote>
        </div>`,
    });
  } catch (err) {
    console.error("[email] contact notification failed", err);
  }
}

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Branded newsletter shell — warm cream background, terracotta accents. */
export function renderNewsletterHtml(bodyMd: string, unsubscribeUrl: string): string {
  const bodyHtml = markdownToHtml(bodyMd);
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#FDF3E7;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:'Familjen Grotesk',-apple-system,'Segoe UI',sans-serif;color:#1D1D1F;">
    <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#CC785C;margin-bottom:20px;">${siteConfig.name}</div>
    <div style="background:#FFFFFF;border-radius:20px;padding:32px;box-shadow:0 14px 30px rgba(31,41,89,0.08);font-size:15.5px;line-height:1.7;color:#3A3A3E;">
      ${bodyHtml}
    </div>
    <div style="padding:24px 8px 0;font-size:12.5px;color:#8A8A90;line-height:1.6;">
      You're getting this because you asked for notes from ${siteConfig.name}.<br />
      <a href="${unsubscribeUrl}" style="color:#8A8A90;">Unsubscribe</a> ·
      <a href="${siteUrl()}" style="color:#8A8A90;">${siteUrl().replace(/^https?:\/\//, "")}</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * One-time welcome for new subscribers. Best-effort: in Resend sandbox
 * mode this only delivers to the account owner, so failures are logged
 * and swallowed — it starts working for everyone once a domain is verified.
 */
export async function sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const body = [
    `Hey — Rick here. Thanks for joining.`,
    ``,
    `You'll get **one short note** whenever something new lands in the library — no schedule-filler, no spam.`,
    ``,
    `While you're here, three good places to start:`,
    ``,
    `- [Vibe Coding, Honestly](${siteUrl("/")}) — ship your first app with AI, no code`,
    `- [AI Agents, Explained for Busy People](${siteUrl("/")}) — cut through this year's buzzword`,
    `- [Run a Local LLM Tonight](${siteUrl("/")}) — private, free AI on your own laptop`,
    ``,
    `Everything is free to read and download: [browse the library](${siteUrl("/")}).`,
    ``,
    `— Rick`,
  ].join("\n");
  try {
    await resend.emails.send({
      from: fromAddress(),
      to: email,
      subject: "Welcome — here's where to start",
      html: renderNewsletterHtml(body, siteUrl(`/unsubscribe?token=${unsubscribeToken}`)),
    });
  } catch (err) {
    console.error("[email] welcome email failed (non-fatal)", err);
  }
}

export interface NewsletterRecipient {
  email: string;
  unsubscribe_token: string;
}

/**
 * Send a newsletter to every recipient via Resend's batch API
 * (max 100 emails per call). Returns the number of accepted emails.
 */
export async function sendNewsletterBatch(
  subject: string,
  bodyMd: string,
  recipients: NewsletterRecipient[]
): Promise<number> {
  const resend = getResend();
  if (!resend) throw new Error("RESEND_API_KEY is not set — cannot send newsletters.");

  const from = fromAddress();
  let sent = 0;

  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const { data, error } = await resend.batch.send(
      chunk.map((r) => {
        const unsubscribeUrl = siteUrl(`/unsubscribe?token=${r.unsubscribe_token}`);
        return {
          from,
          to: r.email,
          subject,
          html: renderNewsletterHtml(bodyMd, unsubscribeUrl),
          headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
        };
      })
    );
    if (error) throw new Error(`Resend batch failed after ${sent} emails: ${error.message}`);
    sent += data?.data?.length ?? chunk.length;
  }

  return sent;
}
