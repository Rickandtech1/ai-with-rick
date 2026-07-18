import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactSection } from "@/components/ContactSection";
import { CopyCodeButtons } from "@/components/CopyCodeButtons";
import { DownloadFlow } from "@/components/DownloadFlow";
import { ShareButtons } from "@/components/ShareButtons";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleResource } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import { siteUrl } from "@/lib/site-config";
import { supabaseAdmin, SIGNED_URL_EXPIRY_SECONDS, STORAGE_BUCKET } from "@/lib/supabase/admin";

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
  const db = supabaseAdmin();
  let content = resource.body_content || "";
  if (resource.md_path) {
    const { data } = await db.storage.from(STORAGE_BUCKET).download(resource.md_path);
    if (data) content = await data.text();
  }

  // Ungated resources: sign the download links at render time so both
  // buttons show immediately — no extra click, no form.
  const ungated = !(resource.require_lead ?? true);
  let pdfUrl: string | null = null;
  let mdUrl: string | null = null;
  if (ungated && resource.file_path) {
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
          <div className="reader-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          <CopyCodeButtons />

          <ShareButtons
            title={resource.title}
            url={siteUrl(`/r/${resource.slug ?? resource.id}`)}
          />

          <div className="reader-footer">
            {pdfUrl ? (
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
            ) : (
              <DownloadFlow
                resourceId={resource.id}
                format={resource.format}
                externalOnly={!resource.file_path && !!resource.external_url}
                externalUrl={resource.external_url}
                hasMd={!!resource.md_path}
                showView={false}
              />
            )}
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
