"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { captureLead } from "@/actions/public";

interface Props {
  resourceId: string;
  format: string;
  /** Link-out resources (e.g. video walkthroughs with no file) skip the lead gate. */
  externalOnly: boolean;
  externalUrl: string | null;
}

export function DownloadFlow({ resourceId, format, externalOnly, externalUrl }: Props) {
  const [step, setStep] = useState<"cta" | "form" | "ready">("cta");
  const [firstName, setFirstName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mdUrl, setMdUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<"file" | "external">("file");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Video walkthroughs (and other link-outs) with no gated file: link out directly.
  if (externalOnly && externalUrl) {
    return (
      <div className="download-zone">
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="btn-accent">
          Watch the {format} <span>→</span>
        </a>
      </div>
    );
  }

  return (
    <div className="download-zone">
      {step === "cta" && (
        <button type="button" className="btn-dark" onClick={() => setStep("form")}>
          Download {format} <span>↓</span>
        </button>
      )}

      {step === "form" && (
        <div>
          <h2 className="download-form-title">A few details, then it&apos;s yours</h2>
          <form
            className="download-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setFirstName(String(formData.get("firstName") ?? "").trim());
              startTransition(async () => {
                const result = await captureLead(resourceId, formData);
                if (result.ok && result.url) {
                  setDownloadUrl(result.url);
                  setMdUrl(result.mdUrl ?? null);
                  setKind(result.kind ?? "file");
                  setError(null);
                  setStep("ready");
                } else {
                  setError(result.error ?? "Something went wrong — please try again.");
                }
              });
            }}
          >
            <input
              type="text"
              name="website"
              className="hp-field"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div className="field-group">
              <label className="field-label" htmlFor="lead-first">
                First name
              </label>
              <input id="lead-first" required name="firstName" placeholder="Ada" className="field" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="lead-last">
                Last name
              </label>
              <input id="lead-last" required name="lastName" placeholder="Lovelace" className="field" />
            </div>
            <div className="field-group full">
              <label className="field-label" htmlFor="lead-email">
                Email
              </label>
              <input
                id="lead-email"
                required
                type="email"
                name="email"
                placeholder="ada@example.com"
                className="field"
              />
            </div>
            <label className="optin-row full">
              <input type="checkbox" name="newsletterOptIn" />
              <span>Also email me when new resources drop — one note per release, unsubscribe anytime.</span>
            </label>
            <div className="full">
              <button type="submit" className="btn-dark" disabled={pending}>
                {pending ? "One moment…" : "Send me the download"}
              </button>
            </div>
          </form>
          {error && <p className="form-error">{error}</p>}
        </div>
      )}

      {step === "ready" && downloadUrl && (
        <div>
          <div className="download-ready-label">Download ready</div>
          <p className="download-ready-copy">Thanks, {firstName} — your copy is ready below.</p>
          <div className="download-ready-actions">
            <a
              href={downloadUrl}
              className="btn-accent"
              {...(kind === "external"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {kind === "external" ? <>Open {format}</> : <>Download {format}</>} <span>↓</span>
            </a>
            {mdUrl && (
              <a href={mdUrl} className="btn-dark">
                Download Markdown <span>↓</span>
              </a>
            )}
            <Link href="/" className="btn-text">
              Browse more resources
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
