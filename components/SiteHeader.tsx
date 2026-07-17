import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader({ variant }: { variant: "library" | "detail" }) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        <Image src="/avatar.png" alt="" width={34} height={34} className="wordmark-avatar" />
        {siteConfig.name}
      </Link>
      {variant === "library" ? (
        <nav className="site-nav">
          <a href="#resources" className="nav-link nav-link--accent">
            Resources
          </a>
          <a href="#contact" className="nav-link nav-link--ink">
            Contact
          </a>
        </nav>
      ) : (
        <Link href="/" className="nav-link nav-link--accent">
          ← Back to library
        </Link>
      )}
    </header>
  );
}
