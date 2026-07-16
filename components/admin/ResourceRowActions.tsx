"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteResource, setResourceFeatured, setResourceVisible } from "@/actions/admin";
import type { Resource } from "@/lib/types";

export function VisibleSwitch({ resource }: { resource: Resource }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="switch"
      data-on={resource.visible}
      disabled={pending}
      title={resource.visible ? "Published — click to unpublish" : "Hidden — click to publish"}
      aria-label={`Toggle visibility for ${resource.title}`}
      onClick={() =>
        startTransition(async () => {
          await setResourceVisible(resource.id, !resource.visible);
        })
      }
    />
  );
}

export function FeaturedSwitch({ resource }: { resource: Resource }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="switch"
      data-on={resource.featured}
      disabled={pending}
      title={resource.featured ? "Featured — click to unfeature" : "Make this the featured resource"}
      aria-label={`Toggle featured for ${resource.title}`}
      onClick={() =>
        startTransition(async () => {
          await setResourceFeatured(resource.id, !resource.featured);
        })
      }
    />
  );
}

export function DeleteResourceButton({ resource }: { resource: Resource }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="admin-link admin-link--danger"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete “${resource.title}”? This also deletes its file and leads.`)) return;
        startTransition(async () => {
          await deleteResource(resource.id);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function EditResourceLink({ resource }: { resource: Resource }) {
  return (
    <Link href={`/admin/resources/${resource.id}`} className="admin-link">
      Edit
    </Link>
  );
}
