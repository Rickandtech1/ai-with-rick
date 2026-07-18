"use client";

import { track } from "@vercel/analytics";
import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/actions/public";

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
            if (result.ok) {
              setSubmitted(true);
              track("newsletter_subscribed");
            } else setError(result.error ?? "Something went wrong.");
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
      <div className="newsletter-panel newsletter-panel--solo">
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
      </div>
    </section>
  );
}
