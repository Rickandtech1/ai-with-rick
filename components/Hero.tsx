import { siteConfig } from "@/lib/site-config";

export function Hero() {
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
          href={siteConfig.youtubeChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="video-card"
        >
          <div>
            <div className="video-card-label">Video Walkthrough · YouTube</div>
            <div className="video-card-title">Building Your First RAG Pipeline</div>
            <div className="video-card-caption">A practical walkthrough, no hand-waving.</div>
          </div>
          <div className="play-button">
            <span className="play-glyph" />
          </div>
        </a>
      </div>
    </section>
  );
}
