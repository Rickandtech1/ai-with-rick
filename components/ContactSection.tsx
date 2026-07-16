"use client";

import { useState, useTransition } from "react";
import { submitContact } from "@/actions/public";
import { siteConfig } from "@/lib/site-config";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="contact-section" id="contact">
      <div className="eyebrow">Contact</div>
      <h2 className="contact-title">Questions, ideas, or a topic you want covered?</h2>
      <p className="contact-copy">
        Send a note below, or email{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> directly.
      </p>

      {submitted ? (
        <div className="form-confirmation">Thanks — I&apos;ll get back to you soon.</div>
      ) : (
        <>
          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(async () => {
                const result = await submitContact(formData);
                if (result.ok) setSubmitted(true);
                else setError(result.error ?? "Something went wrong.");
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
              <label className="field-label" htmlFor="contact-name">
                Name
              </label>
              <input id="contact-name" required name="name" placeholder="Ada Lovelace" className="field" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                required
                type="email"
                name="email"
                placeholder="ada@example.com"
                className="field"
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                name="message"
                placeholder="What's on your mind?"
                rows={4}
                className="field"
              />
            </div>
            <div>
              <button type="submit" className="btn-dark" disabled={pending}>
                {pending ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
          {error && <p className="form-error">{error}</p>}
        </>
      )}
    </section>
  );
}
