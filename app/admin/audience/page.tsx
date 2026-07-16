import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ContactMessage, Lead, NewsletterSubscriber } from "@/lib/types";

type LeadWithResource = Lead & { resources: { title: string } | null };

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminAudiencePage() {
  const db = supabaseAdmin();

  const [{ data: leads }, { data: subscribers }, { data: messages }] = await Promise.all([
    db
      .from("leads")
      .select("*, resources(title)")
      .order("created_at", { ascending: false })
      .limit(100),
    db.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-h1">Audience</h1>
      </div>

      <div className="admin-panel admin-table-scroll">
        <h2 className="admin-h2">Recent leads ({leads?.length ?? 0})</h2>
        {!leads?.length ? (
          <p className="admin-note">No downloads yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Name</th>
                <th>Email</th>
                <th>Resource</th>
                <th>Newsletter</th>
              </tr>
            </thead>
            <tbody>
              {(leads as LeadWithResource[]).map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{when(l.created_at)}</td>
                  <td style={{ fontWeight: 600 }}>
                    {l.first_name} {l.last_name}
                  </td>
                  <td>{l.email}</td>
                  <td>{l.resources?.title ?? "—"}</td>
                  <td>
                    {l.newsletter_opt_in ? (
                      <span className="pill pill--live">Opted in</span>
                    ) : (
                      <span className="pill pill--hidden">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-panel admin-table-scroll">
        <h2 className="admin-h2">Newsletter subscribers ({subscribers?.length ?? 0})</h2>
        {!subscribers?.length ? (
          <p className="admin-note">No subscribers yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Since</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(subscribers as NewsletterSubscriber[]).map((s) => (
                <tr key={s.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{when(s.created_at)}</td>
                  <td style={{ fontWeight: 600 }}>{s.email}</td>
                  <td>
                    {s.unsubscribed_at ? (
                      <span className="pill pill--hidden">Unsubscribed</span>
                    ) : (
                      <span className="pill pill--live">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-panel admin-table-scroll">
        <h2 className="admin-h2">Contact messages ({messages?.length ?? 0})</h2>
        {!messages?.length ? (
          <p className="admin-note">No messages yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>From</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {(messages as ContactMessage[]).map((m) => (
                <tr key={m.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{when(m.created_at)}</td>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {m.name}
                    <br />
                    <span className="admin-note">{m.email}</span>
                  </td>
                  <td style={{ maxWidth: 420, lineHeight: 1.5 }}>{m.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
