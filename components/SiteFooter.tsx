import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">{siteConfig.name}</div>
      <div className="footer-note">© 2026 · Practical notes on AI and modern tooling.</div>
    </footer>
  );
}
