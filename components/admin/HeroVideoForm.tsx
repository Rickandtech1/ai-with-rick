"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateHeroVideo } from "@/actions/admin";

export function HeroVideoForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("url", url);
    startTransition(async () => {
      const res = await updateHeroVideo(formData);
      if (res.ok) {
        setResult({ ok: true, message: "Saved — the hero card is updated on the live site." });
        setUrl("");
        router.refresh();
      } else {
        setResult({ ok: false, message: res.error ?? "Saving failed." });
      }
    });
  };

  return (
    <form className="admin-form" onSubmit={save}>
      <div className="field-group">
        <label className="field-label" htmlFor="hero-url">
          YouTube link{" "}
          <span className="admin-note">
            (paste any watch/share link — title, channel, and thumbnail are fetched automatically)
          </span>
        </label>
        <input
          id="hero-url"
          className="field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          required
        />
      </div>
      <div>
        <button type="submit" className="btn-dark" disabled={pending}>
          {pending ? "Looking up video…" : "Update hero video"}
        </button>
      </div>
      {result && (
        <p className={result.ok ? "form-success" : "form-error"} role="status">
          {result.message}
        </p>
      )}
    </form>
  );
}
