"use client";

import { useTransition } from "react";
import { deleteAudienceRow, type AudienceTable } from "@/actions/admin";

export function DeleteRowButton({
  table,
  id,
  label,
}: {
  table: AudienceTable;
  id: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="admin-link admin-link--danger"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete ${label}? This can't be undone.`)) return;
        startTransition(async () => {
          await deleteAudienceRow(table, id);
        });
      }}
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
