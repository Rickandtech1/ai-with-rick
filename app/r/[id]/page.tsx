import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactSection } from "@/components/ContactSection";
import { DownloadFlow } from "@/components/DownloadFlow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleResource } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import { supabaseAdmin, SIGNED_URL_EXPIRY_SECONDS, STORAGE_BUCKET } from "@/lib/supabase/admin";
import { formatResourceDate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getVisibleResource(id);
  if (!resource) notFound();

  const bodyHtml = markdownToHtml(resource.body_content || "");
  const externalOnly = !resource.file_path && !!resource.external_url;

  // Ungated resources: sign the links at render time so all three
  // buttons work immediately — no reveal click, no form.
  const ungated = !(resource.require_lead ?? true);
  let pdfUrl: string | null = null;
  let mdUrl: string | null = null;
  if (ungated && resource.file_path) {
    const db = supabaseAdmin();
    const { data } = await db.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(resource.file_path, SIGNED_URL_EXPIRY_SECONDS, { download: true });
    pdfUrl = data?.signedUrl ?? null;
    if (resource.md_path) {
      const { data: mdData } = await db.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(resource.md_path, SIGNED_URL_EXPIRY_SECONDS, { download: true });
      mdUrl = mdData?.signedUrl ?? null;
    }
  }

  return (
    <div>
      <SiteHeader variant="detail" />

      <section className="detail-section">
        <div className="detail-panel">
          <div className="detail-eyebrow">
            {resource.format} · {formatResourceDate(resource.published_date)}
          </div>
          <h1 className="detail-title">{resource.title}</h1>
          <p className="detail-lede">{resource.description}</p>

          {bodyHtml && (
            <div className="detail-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          )}

          {pdfUrl ? (
            <div className="download-zone">
              <div className="view-row">
                <Link href={`/r/${resource.id}/view`} className="btn-green">
                  View {resource.format} <span>→</span>
                </Link>
              </div>
              <div className="download-ready-actions">
                <a href={pdfUrl} className="btn-accent">
                  Download {resource.format} <span>↓</span>
                </a>
                {mdUrl && (
                  <a href={mdUrl} className="btn-dark">
                    Download Markdown <span>↓</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <DownloadFlow
              resourceId={resource.id}
              format={resource.format}
              externalOnly={externalOnly}
              externalUrl={resource.external_url}
              hasMd={!!resource.md_path}
            />
          )}
        </div>
      </section>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
