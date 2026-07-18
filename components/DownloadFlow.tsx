"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { captureLead } from "@/actions/public";

/** Remembered after the first form submit — no visitor is asked twice. */
const CONTACT_KEY = "awr-contact";

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  optIn: boolean;
}

function storedContact(): Contact | null {
  try {
    const raw = window.localStorage.getItem(CONTACT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Contact;
    return c.firstName && c.email ? c : null;
  } catch {
    return null;
  }
}

function contactFormData(c: Contact): FormData {
  const fd = new FormData();
  fd.set("firstName", c.firstName);
  fd.set("lastName", c.lastName);
  fd.set("email", c.email);
  if (c.optIn) fd.set("newsletterOptIn", "on");
  fd.set("website", "");
  return fd;
}

type Action = "view" | "pdf" | "md";

interface Props {
  resourceId: string;
  format: string;
  /** Link-out resources (e.g. video walkthroughs with no file) skip everything. */
  externalOnly: boolean;
  externalUrl: string | null;
  /** Whether a markdown edition exists (shows the third button). */
  hasMd: boolean;
  /** Hidden on the reader page, where you're already viewing. */
  showView?: boolean;
}

/**
 * Gated download flow. All buttons are visible immediately; the first
 * click anywhere asks for contact details once. Returning visitors are
 * recognized and never asked again — each unlock still records a lead
 * for the specific resource.
 */
export function DownloadFlow({
  resourceId,
  format,
  externalOnly,
  externalUrl,
  hasMd,
  showView = true,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"locked" | "form" | "ready">("locked");
  const [urls, setUrls] = useState<{ url: string; mdUrl?: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [pendingAction, setPendingAction] = useState<Action>("pdf");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (externalOnly && externalUrl) {
    return (
      <div className="download-zone">
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="btn-accent">
          Watch the {format} <span>→</span>
        </a>
      </div>
    );
  }

  const perform = (action: Action, url: string, mdUrl?: string) => {
    if (action === "view") router.push(`/r/${resourceId}/view`);
    else if (action === "md" && mdUrl) window.location.assign(mdUrl);
    else window.location.assign(url);
  };

  const capture = (contact: Contact, action: Action, remember: boolean) => {
    startTransition(async () => {
      const result = await captureLead(resourceId, contactFormData(contact));
      if (result.ok && result.url) {
        track("lead_captured", { resource: resourceId, silent: !remember });
        if (remember) {
          try {
            window.localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
          } catch {}
        }
        setUrls({ url: result.url, mdUrl: result.mdUrl });
        setFirstName(contact.firstName);
        setError(null);
        setStep("ready");
        perform(action, result.url, result.mdUrl);
      } else {
        setError(result.error ?? "Something went wrong — please try again.");
        setStep("form");
      }
    });
  };

  const unlock = (action: Action) => {
    setPendingAction(action);
    const known = storedContact();
    if (known) capture(known, action, false);
    else setStep("form");
  };

  const buttonRows = (asLinks: boolean) => (
    <>
      {showView && (
        <div className="view-row">
          {asLinks ? (
            <Link href={`/r/${resourceId}/view`} className="btn-green">
              View {format} <span>→</span>
            </Link>
          ) : (
            <button type="button" className="btn-green" disabled={pending} onClick={() => unlock("view")}>
              View {format} <span>→</span>
            </button>
          )}
        </div>
      )}
      <div className="download-ready-actions">
        {asLinks && urls ? (
          <a href={urls.url} className="btn-accent">
            Download {format} <span>↓</span>
          </a>
        ) : (
          <button type="button" className="btn-accent" disabled={pending} onClick={() => unlock("pdf")}>
            Download {format} <span>↓</span>
          </button>
        )}
        {hasMd &&
          (asLinks && urls?.mdUrl ? (
            <a href={urls.mdUrl} className="btn-dark">
              Download Markdown <span>↓</span>
            </a>
          ) : (
            <button type="button" className="btn-dark" disabled={pending} onClick={() => unlock("md")}>
              Download Markdown <span>↓</span>
            </button>
          ))}
        {asLinks && (
          <Link href="/" className="btn-text">
            Browse more resources
          </Link>
        )}
      </div>
    </>
  );

  return (
    <div className="download-zone">
      {step === "locked" && (
        <div>
          {buttonRows(false)}
          {pending && <p className="admin-note" style={{ marginTop: 12 }}>One moment…</p>}
          {error && <p className="form-error">{error}</p>}
        </div>
      )}

      {step === "form" && (
        <div>
          <h2 className="download-form-title">A few details, then it&apos;s yours</h2>
          <form
            className="download-form"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              if (String(fd.get("website") ?? "") !== "") return;
              capture(
                {
                  firstName: String(fd.get("firstName") ?? "").trim(),
                  lastName: String(fd.get("lastName") ?? "").trim(),
                  email: String(fd.get("email") ?? "").trim(),
                  optIn: fd.get("newsletterOptIn") === "on",
                },
                pendingAction,
                true
              );
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
                {pending ? "One moment…" : "Unlock my downloads"}
              </button>
            </div>
          </form>
          {error && <p className="form-error">{error}</p>}
        </div>
      )}

      {step === "ready" && urls && (
        <div>
          <div className="download-ready-label">Download ready</div>
          <p className="download-ready-copy">
            {firstName ? <>Thanks, {firstName} — your downloads are unlocked below.</> : <>Your downloads are unlocked below.</>}
          </p>
          {buttonRows(true)}
        </div>
      )}
    </div>
  );
}
