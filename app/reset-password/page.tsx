"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LinkState = "checking" | "ok" | "invalid";

export default function ResetPasswordPage() {
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabaseRef.current = supabase;

    // Supabase appends error params when a link is expired or already used.
    const search = new URLSearchParams(window.location.search);
    if (search.get("error") || window.location.hash.includes("error=")) {
      setLinkState("invalid");
      return;
    }

    // The recovery code in the URL is exchanged for a session automatically;
    // wait for that session to appear.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setLinkState("ok");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLinkState("ok");
    });
    const timeout = setTimeout(
      () => setLinkState((s) => (s === "checking" ? "invalid" : s)),
      5000
    );
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="solo-section">
      <div className="solo-panel">
        <div className="eyebrow" style={{ display: "block", marginBottom: 14 }}>
          Admin
        </div>
        <h1 className="panel-heading" style={{ marginBottom: 24 }}>
          Choose a new password
        </h1>

        {linkState === "checking" && <p className="admin-note">Checking your reset link…</p>}

        {linkState === "invalid" && (
          <p className="form-error" style={{ margin: 0 }}>
            This reset link is invalid or has expired.{" "}
            <Link href="/forgot-password" style={{ color: "inherit" }}>
              Request a new one
            </Link>
            .
          </p>
        )}

        {linkState === "ok" && (
          <form
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              const formData = new FormData(e.currentTarget);
              const password = String(formData.get("password") ?? "");
              const confirm = String(formData.get("confirm") ?? "");
              if (password.length < 8) {
                setError("Use at least 8 characters.");
                return;
              }
              if (password !== confirm) {
                setError("Passwords don't match.");
                return;
              }
              setPending(true);
              const { error } = await supabaseRef.current!.auth.updateUser({ password });
              if (error) {
                setError(error.message);
                setPending(false);
              } else {
                // Full navigation so the fresh auth cookies reach the server.
                window.location.assign("/admin");
              }
            }}
          >
            <div className="field-group">
              <label className="field-label" htmlFor="rp-password">
                New password
              </label>
              <input
                id="rp-password"
                required
                type="password"
                name="password"
                className="field"
                autoComplete="new-password"
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="rp-confirm">
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                required
                type="password"
                name="confirm"
                className="field"
                autoComplete="new-password"
              />
            </div>
            <div>
              <button type="submit" className="btn-dark" disabled={pending}>
                {pending ? "Saving…" : "Save and sign in"}
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
