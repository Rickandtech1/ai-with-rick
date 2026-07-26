import { ContactSection } from "@/components/ContactSection";
import { DepthMotion } from "@/components/DepthMotion";
import { Hero } from "@/components/Hero";
import { NewsletterPanel } from "@/components/NewsletterPanel";
import { ResourceGrid } from "@/components/ResourceGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SocialSection } from "@/components/SocialSection";
import { SiteHeader } from "@/components/SiteHeader";
import { getHeroVideo, getVisibleResources } from "@/lib/data";

// Always render from the live database so a publish in /admin shows up
// on the very next page load — no redeploy, no stale cache.
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [resources, heroVideo] = await Promise.all([getVisibleResources(), getHeroVideo()]);

  return (
    <div>
      <SiteHeader variant="library" />
      <DepthMotion />
      <Hero video={heroVideo} />

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
        {resources.length === 0 ? (
          <div className="resource-grid">
            <div className="resources-empty">
              The first resources are on their way — subscribe below and you&apos;ll hear the moment
              they land.
            </div>
          </div>
        ) : (
          <ResourceGrid resources={resources} />
        )}
      </section>

      <SocialSection />
      <NewsletterPanel />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
