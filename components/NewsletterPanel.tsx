"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/actions/public";
import { siteConfig } from "@/lib/site-config";

function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return <div className="form-confirmation">You&apos;re on the list — thanks.</div>;
  }

  return (
    <>
      <form
        className="newsletter-form"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await subscribeNewsletter(formData);
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
        <input
          required
          type="email"
          name="email"
          placeholder="you@example.com"
          className="newsletter-input"
          aria-label="Email address"
        />
        <button type="submit" className="newsletter-submit" disabled={pending}>
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </>
  );
}

export function NewsletterPanel() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-panel">
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Stay in the loop
          </div>
          <h2 className="panel-heading">Get new resources by email</h2>
          <p className="newsletter-copy">
            One note when something new lands in the library. No spam, unsubscribe anytime.
          </p>
          <NewsletterForm />
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Follow along
          </div>
          <h2 className="panel-heading" style={{ marginBottom: 20 }}>
            Find more on social
          </h2>
          <div className="social-list">
            {siteConfig.social.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer">
                <span className="social-name">{s.name}</span>
                <span className="social-handle">{s.handle} →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
