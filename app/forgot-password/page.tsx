"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <section className="solo-section">
      <div className="solo-panel">
        <div className="eyebrow" style={{ display: "block", marginBottom: 14 }}>
          Admin
        </div>
        <h1 className="panel-heading" style={{ marginBottom: 24 }}>
          Reset your password
        </h1>

        {sent ? (
          <p className="form-success" style={{ margin: 0 }}>
            If that address has an account, a reset link is on its way. Open the email and follow
            the link — it brings you back here to pick a new password.
          </p>
        ) : (
          <form
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const email = String(new FormData(e.currentTarget).get("email") ?? "");
              const supabase = createSupabaseBrowserClient();
              await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              // Always confirm — never reveal whether an email has an account.
              setSent(true);
            }}
          >
            <div className="field-group">
              <label className="field-label" htmlFor="fp-email">
                Email
              </label>
              <input id="fp-email" required type="email" name="email" className="field" />
            </div>
            <div>
              <button type="submit" className="btn-dark" disabled={pending}>
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
