import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let success = false;

  if (token) {
    const { data } = await supabaseAdmin()
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("id")
      .maybeSingle();
    success = !!data;
  }

  return (
    <div>
      <SiteHeader variant="detail" />
      <section className="solo-section">
        <div className="solo-panel">
          {success ? (
            <>
              <h1 className="panel-heading">You&apos;re unsubscribed.</h1>
              <p className="newsletter-copy" style={{ marginBottom: 24 }}>
                No more emails from the library. If you change your mind, the signup box on the
                homepage will put you right back on the list.
              </p>
            </>
          ) : (
            <>
              <h1 className="panel-heading">That link didn&apos;t work.</h1>
              <p className="newsletter-copy" style={{ marginBottom: 24 }}>
                This unsubscribe link looks incomplete or expired. Try the link at the bottom of the
                most recent email.
              </p>
            </>
          )}
          <Link href="/" className="nav-link nav-link--accent">
            ← Back to the library
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
