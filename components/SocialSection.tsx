import { SocialIcon } from "@/components/SocialIcon";
import { siteConfig } from "@/lib/site-config";

export function SocialSection() {
  return (
    <section className="social-section" id="social">
      <div className="resources-heading">
        <div>
          <div className="eyebrow">Follow along</div>
          <h2 className="resources-title">Follow Social Media</h2>
        </div>
        <p className="resources-blurb">
          Daily notes, clips, and works-in-progress — the library is the highlight reel.
        </p>
      </div>
      <div className="social-tiles">
        {siteConfig.social.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-tile"
          >
            <span className="social-tile-name">
              <SocialIcon name={s.name} />
              {s.name}
            </span>
            <span className="social-tile-handle">
              {s.handle} <span>→</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
