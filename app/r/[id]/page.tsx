import { notFound } from "next/navigation";
import { ContactSection } from "@/components/ContactSection";
import { DownloadFlow } from "@/components/DownloadFlow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleResource } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
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

          <DownloadFlow
            resourceId={resource.id}
            format={resource.format}
            externalOnly={externalOnly}
            externalUrl={resource.external_url}
            requireLead={resource.require_lead ?? true}
          />
        </div>
      </section>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
