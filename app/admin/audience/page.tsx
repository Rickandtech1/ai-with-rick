import { DeleteRowButton } from "@/components/admin/AudienceRowActions";
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
        <div className="admin-section-head">
          <h2 className="admin-h2">Recent leads ({leads?.length ?? 0})</h2>
          <a href="/admin/export/leads" className="admin-link">Export CSV (Excel) ↓</a>
        </div>
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
                <th></th>
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
                  <td>
                    <DeleteRowButton table="leads" id={l.id} label={`the lead ${l.email}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-panel admin-table-scroll">
        <div className="admin-section-head">
          <h2 className="admin-h2">Newsletter subscribers ({subscribers?.length ?? 0})</h2>
          <a href="/admin/export/subscribers" className="admin-link">Export CSV (Excel) ↓</a>
        </div>
        {!subscribers?.length ? (
          <p className="admin-note">No subscribers yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Since</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
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
                  <td>
                    <DeleteRowButton
                      table="newsletter_subscribers"
                      id={s.id}
                      label={`the subscriber ${s.email}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-panel admin-table-scroll">
        <div className="admin-section-head">
          <h2 className="admin-h2">Contact messages ({messages?.length ?? 0})</h2>
          <a href="/admin/export/messages" className="admin-link">Export CSV (Excel) ↓</a>
        </div>
        {!messages?.length ? (
          <p className="admin-note">No messages yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>From</th>
                <th>Message</th>
                <th></th>
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
                  <td>
                    <DeleteRowButton
                      table="contact_messages"
                      id={m.id}
                      label={`the message from ${m.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
