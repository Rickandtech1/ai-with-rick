"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveResource } from "@/actions/admin";
import { RESOURCE_FORMATS, type Resource } from "@/lib/types";

export function ResourceForm({ resource }: { resource?: Resource }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await saveResource(formData);
          if (result.ok) {
            router.push("/admin");
            router.refresh();
          } else {
            setError(result.error ?? "Something went wrong.");
          }
        });
      }}
    >
      {resource && <input type="hidden" name="id" value={resource.id} />}

      <div className="field-group">
        <label className="field-label" htmlFor="res-title">
          Title
        </label>
        <input id="res-title" required name="title" defaultValue={resource?.title ?? ""} className="field" />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="res-desc">
          Description <span className="admin-note">(the short blurb on the card and detail lede)</span>
        </label>
        <textarea
          id="res-desc"
          required
          name="description"
          rows={2}
          defaultValue={resource?.description ?? ""}
          className="field"
        />
      </div>

      <div className="admin-form-row">
        <div className="field-group">
          <label className="field-label" htmlFor="res-format">
            Format
          </label>
          <select
            id="res-format"
            name="format"
            defaultValue={resource?.format ?? "PDF Guide"}
            className="field"
          >
            {RESOURCE_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="res-date">
            Published date
          </label>
          <input
            id="res-date"
            required
            type="date"
            name="published_date"
            defaultValue={resource?.published_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
            className="field"
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="res-body">
          Write-up <span className="admin-note">(shown on the detail page — paragraphs, ## headings, - lists, **bold**, [links](https://…))</span>
        </label>
        <textarea
          id="res-body"
          name="body_content"
          rows={12}
          defaultValue={resource?.body_content ?? ""}
          className="field"
          style={{ fontSize: 14.5, lineHeight: 1.6 }}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="res-file">
          File upload{" "}
          <span className="admin-note">
            {resource?.file_path
              ? `(current: ${resource.file_path} — choose a new file to replace it)`
              : "(goes to the private storage bucket; visitors get 1-hour signed links)"}
          </span>
        </label>
        <input id="res-file" type="file" name="file" className="field" />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="res-md-file">
          Markdown version{" "}
          <span className="admin-note">
            {resource?.md_path
              ? `(current: ${resource.md_path} — choose a new file to replace it)`
              : "(optional .md twin of the file — shown as a second download button)"}
          </span>
        </label>
        <input id="res-md-file" type="file" name="md_file" accept=".md,.markdown,text/markdown" className="field" />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="res-url">
          External URL{" "}
          <span className="admin-note">
            (for link-out resources like video walkthroughs — used when no file is uploaded)
          </span>
        </label>
        <input
          id="res-url"
          type="url"
          name="external_url"
          placeholder="https://www.youtube.com/watch?v=…"
          defaultValue={resource?.external_url ?? ""}
          className="field"
        />
      </div>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        <label className="check-row">
          <input type="checkbox" name="visible" defaultChecked={resource?.visible ?? true} />
          Visible (live on the public library)
        </label>
        <label className="check-row">
          <input type="checkbox" name="featured" defaultChecked={resource?.featured ?? false} />
          Featured (the big card)
        </label>
      </div>

      <div>
        <button type="submit" className="btn-dark" disabled={pending}>
          {pending ? "Saving…" : resource ? "Save changes" : "Publish resource"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
