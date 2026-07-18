import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactSection } from "@/components/ContactSection";
import { DownloadFlow } from "@/components/DownloadFlow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleResource } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Reader pages aren't for search engines — the library page is.
export const metadata = { robots: { index: false } };

export default async function ResourceReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getVisibleResource(id);
  if (!resource) notFound();

  // Prefer the full markdown edition; fall back to the write-up.
  let content = resource.body_content || "";
  if (resource.md_path) {
    const { data } = await supabaseAdmin().storage.from(STORAGE_BUCKET).download(resource.md_path);
    if (data) content = await data.text();
  }

  return (
    <div>
      <SiteHeader variant="detail" />

      <section className="detail-section">
        <div className="detail-panel">
          <div className="reader-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />

          <div className="reader-footer">
            <DownloadFlow
              resourceId={resource.id}
              format={resource.format}
              externalOnly={!resource.file_path && !!resource.external_url}
              externalUrl={resource.external_url}
              requireLead={resource.require_lead ?? true}
              showView={false}
            />
            <Link href={`/r/${resource.id}`} className="btn-text">
              ← Back to the resource page
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
