"use client";

import { useState, useTransition } from "react";
import { sendNewsletter } from "@/actions/admin";
import { markdownToHtml } from "@/lib/markdown";

export function NewsletterComposer({ recipientCount }: { recipientCount: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () => {
    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("body", body);
    startTransition(async () => {
      const res = await sendNewsletter(formData);
      setConfirming(false);
      if (res.ok) {
        setResult({ ok: true, message: `Sent to ${res.sent} subscriber${res.sent === 1 ? "" : "s"}.` });
        setSubject("");
        setBody("");
        setShowPreview(false);
      } else {
        setResult({ ok: false, message: res.error ?? "Sending failed." });
      }
    });
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-h2">Compose</h2>
      <div className="admin-form" style={{ maxWidth: "none" }}>
        <div className="field-group">
          <label className="field-label" htmlFor="nl-subject">
            Subject
          </label>
          <input
            id="nl-subject"
            className="field"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="New in the library: …"
          />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="nl-body">
            Body{" "}
            <span className="admin-note">
              (markdown: paragraphs, ## headings, - lists, **bold**, [links](https://…) — an
              unsubscribe link is added automatically)
            </span>
          </label>
          <textarea
            id="nl-body"
            className="field"
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"This week I published…"}
            style={{ fontSize: 14.5, lineHeight: 1.6 }}
          />
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-dark"
            style={{ padding: "12px 22px" }}
            disabled={pending || !subject.trim() || !body.trim() || recipientCount === 0}
            onClick={() => setConfirming(true)}
          >
            {pending ? "Sending…" : `Send to ${recipientCount} subscriber${recipientCount === 1 ? "" : "s"}`}
          </button>
          <button type="button" className="btn-text" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>

        {recipientCount === 0 && (
          <p className="admin-note">No active subscribers yet — the send button unlocks once someone signs up.</p>
        )}

        {confirming && (
          <div className="admin-panel" style={{ marginBottom: 0, background: "rgba(255,255,255,0.5)" }}>
            <p style={{ margin: "0 0 14px", fontSize: 14.5, fontWeight: 600 }}>
              Send “{subject}” to {recipientCount} subscriber{recipientCount === 1 ? "" : "s"} now?
              This can&apos;t be undone.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <button type="button" className="btn-accent" style={{ padding: "10px 20px" }} disabled={pending} onClick={send}>
                {pending ? "Sending…" : "Yes, send it"}
              </button>
              <button type="button" className="btn-text" disabled={pending} onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <p className={result.ok ? "form-confirmation" : "form-error"} style={{ margin: 0 }}>
            {result.message}
          </p>
        )}

        {showPreview && (
          <div className="newsletter-preview">
            <div className="admin-note" style={{ marginBottom: 12 }}>
              Subject: <strong>{subject || "(no subject yet)"}</strong>
            </div>
            <div
              className="newsletter-preview-card"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(body || "*Nothing to preview yet.*") }}
            />
            <div className="admin-note" style={{ marginTop: 12 }}>
              …followed by the automatic footer: “You&apos;re getting this because you asked for
              notes from AI with Rick. Unsubscribe · site link”
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
