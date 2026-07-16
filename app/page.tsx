import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { NewsletterPanel } from "@/components/NewsletterPanel";
import { ResourceCard } from "@/components/ResourceCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleResources } from "@/lib/data";

// Always render from the live database so a publish in /admin shows up
// on the very next page load — no redeploy, no stale cache.
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const resources = await getVisibleResources();

  return (
    <div>
      <SiteHeader variant="library" />
      <Hero />

      <section className="resources-section" id="resources">
        <div className="resources-heading">
          <div>
            <div className="eyebrow">The library</div>
            <h2 className="resources-title">Resources</h2>
          </div>
          <p className="resources-blurb">
            Everything I&apos;ve put together so far. Pick one to read and download.
          </p>
        </div>
        <div className="resource-grid">
          {resources.length === 0 ? (
            <div className="resources-empty">
              The first resources are on their way — subscribe below and you&apos;ll hear the moment
              they land.
            </div>
          ) : (
            resources.map((r) => <ResourceCard key={r.id} resource={r} />)
          )}
        </div>
      </section>

      <NewsletterPanel />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
