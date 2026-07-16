"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <section className="solo-section">
      <div className="solo-panel">
        <div className="eyebrow" style={{ display: "block", marginBottom: 14 }}>
          Admin
        </div>
        <h1 className="panel-heading" style={{ marginBottom: 24 }}>
          Sign in
        </h1>
        <form
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError(null);
            const formData = new FormData(e.currentTarget);
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithPassword({
              email: String(formData.get("email") ?? ""),
              password: String(formData.get("password") ?? ""),
            });
            if (error) {
              setError("Wrong email or password.");
              setPending(false);
            } else {
              // Full navigation so the fresh auth cookies reach the server.
              window.location.assign("/admin");
            }
          }}
        >
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <input id="login-email" required type="email" name="email" className="field" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input id="login-password" required type="password" name="password" className="field" />
          </div>
          <div>
            <button type="submit" className="btn-dark" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
        {error && <p className="form-error">{error}</p>}
        <p style={{ marginTop: 18, marginBottom: 0 }}>
          <a href="/forgot-password" className="btn-text">
            Forgot password?
          </a>
        </p>
      </div>
    </section>
  );
}
