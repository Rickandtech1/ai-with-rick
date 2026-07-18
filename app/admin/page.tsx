import Link from "next/link";
import {
  DeleteResourceButton,
  EditResourceLink,
  FeaturedSwitch,
  RequireLeadSwitch,
  VisibleSwitch,
} from "@/components/admin/ResourceRowActions";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatResourceDate, type Resource } from "@/lib/types";

export default async function AdminResourcesPage() {
  const { data } = await supabaseAdmin()
    .from("resources")
    .select("*")
    .order("published_date", { ascending: false });
  const resources = (data as Resource[]) ?? [];

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-h1">Resources</h1>
        <Link href="/admin/resources/new" className="btn-dark" style={{ padding: "12px 22px" }}>
          + New resource
        </Link>
      </div>

      <div className="admin-panel admin-table-scroll">
        {resources.length === 0 ? (
          <p className="admin-note">
            Nothing here yet — hit “New resource” to publish your first one.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Format</th>
                <th>Date</th>
                <th>File / link</th>
                <th>Visible</th>
                <th>Featured</th>
                <th>Email gate</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>
                    {r.title}{" "}
                    {r.featured && <span className="pill pill--featured">Featured</span>}
                  </td>
                  <td>{r.format}</td>
                  <td>{formatResourceDate(r.published_date)}</td>
                  <td>
                    {r.file_path ? (
                      <span className="pill pill--live">File</span>
                    ) : r.external_url ? (
                      <span className="pill pill--hidden">Link-out</span>
                    ) : (
                      <span className="pill pill--hidden">None</span>
                    )}
                  </td>
                  <td>
                    <VisibleSwitch resource={r} />
                  </td>
                  <td>
                    <FeaturedSwitch resource={r} />
                  </td>
                  <td>
                    <RequireLeadSwitch resource={r} />
                  </td>
                  <td style={{ whiteSpace: "nowrap", display: "flex", gap: 14 }}>
                    <EditResourceLink resource={r} />
                    <DeleteResourceButton resource={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="admin-note">
        Visible = live on the public library. Featured = the large two-column card (only one at a
        time). Email gate = visitors give name &amp; email before downloading; off = instant
        download.
      </p>
    </>
  );
}
