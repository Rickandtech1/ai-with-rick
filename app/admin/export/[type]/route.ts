import { getAdminUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(","));
  // BOM so Excel opens UTF-8 correctly.
  return "﻿" + lines.join("\r\n");
}

/** GET /admin/export/(leads|subscribers|messages) — CSV download, admin only. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await getAdminUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { type } = await params;
  const db = supabaseAdmin();
  let csv: string;

  if (type === "leads") {
    const { data } = await db
      .from("leads")
      .select("*, resources(title)")
      .order("created_at", { ascending: false });
    csv = toCsv(
      ["Date", "First name", "Last name", "Email", "Resource", "Newsletter opt-in"],
      (data ?? []).map((l) => [
        l.created_at,
        l.first_name,
        l.last_name,
        l.email,
        (l.resources as { title: string } | null)?.title ?? "",
        l.newsletter_opt_in ? "yes" : "no",
      ])
    );
  } else if (type === "subscribers") {
    const { data } = await db
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    csv = toCsv(
      ["Since", "Email", "Status"],
      (data ?? []).map((s) => [s.created_at, s.email, s.unsubscribed_at ? "unsubscribed" : "active"])
    );
  } else if (type === "messages") {
    const { data } = await db
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    csv = toCsv(
      ["Date", "Name", "Email", "Message"],
      (data ?? []).map((m) => [m.created_at, m.name, m.email, m.message])
    );
  } else {
    return new Response("Unknown export type", { status: 404 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai-with-rick-${type}-${stamp}.csv"`,
    },
  });
}
