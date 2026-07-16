import Image from "next/image";
import { siteConfig, youtubeThumbnail } from "@/lib/site-config";

export function Hero() {
  const thumbnail = youtubeThumbnail(siteConfig.heroVideo.url);

  return (
    <section className="hero">
      <div>
        <div className="hero-pill">A growing library of notes</div>
        <h1 className="hero-title">Practical AI knowledge, minus the hype.</h1>
        <p className="hero-copy">
          I&apos;m Rick — I write and record what I&apos;m actually learning about AI and modern
          tooling, then package the useful parts into guides you can keep.
        </p>
        <a href="#resources" className="btn-dark">
          Browse the library <span>↓</span>
        </a>
      </div>
      <div className="hero-visual">
        <a
          href={siteConfig.heroVideo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="video-card"
        >
          {thumbnail && (
            <div className="video-card-media">
              <Image
                src={thumbnail}
                alt=""
                fill
                sizes="248px"
                className="video-card-thumb"
              />
              <div className="play-button">
                <span className="play-glyph" />
              </div>
            </div>
          )}
          <div className="video-card-body">
            <div className="video-card-label">Video Walkthrough · YouTube</div>
            <div className="video-card-title">{siteConfig.heroVideo.title}</div>
            <div className="video-card-caption">{siteConfig.heroVideo.caption}</div>
          </div>
        </a>
      </div>
    </section>
  );
}
