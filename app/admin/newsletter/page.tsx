import { NewsletterComposer } from "@/components/admin/NewsletterComposer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Newsletter } from "@/lib/types";

export default async function AdminNewsletterPage() {
  const db = supabaseAdmin();

  const [{ count }, { data: past }] = await Promise.all([
    db
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .is("unsubscribed_at", null),
    db.from("newsletters").select("*").order("sent_at", { ascending: false }).limit(20),
  ]);

  const newsletters = (past as Newsletter[]) ?? [];

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-h1">Newsletter</h1>
        <span className="admin-note">
          {count ?? 0} active subscriber{(count ?? 0) === 1 ? "" : "s"} right now — each send goes
          to whoever is on the list at that moment.
        </span>
      </div>

      <NewsletterComposer recipientCount={count ?? 0} />

      <div className="admin-panel admin-table-scroll">
        <h2 className="admin-h2">Past sends</h2>
        {newsletters.length === 0 ? (
          <p className="admin-note">Nothing sent yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sent</th>
                <th>Subject</th>
                <th>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {newsletters.map((n) => (
                <tr key={n.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(n.sent_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td style={{ fontWeight: 600 }}>{n.subject}</td>
                  <td>{n.recipient_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
