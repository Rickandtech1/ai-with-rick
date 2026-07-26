import Image from "next/image";
import { youtubeThumbnail, type HeroVideo } from "@/lib/site-config";

export function Hero({ video }: { video: HeroVideo }) {
  const thumbnail = youtubeThumbnail(video.url);

  return (
    <section className="hero">
      {/* Decorative depth layer. `data-depth` sets how far each layer travels
          against the pointer — wired up in components/DepthMotion.tsx. */}
      <div className="hero-depth" aria-hidden="true">
        <div className="hero-layer" data-depth="8">
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
        </div>
        <div className="hero-layer" data-depth="14">
          <div className="hero-shard hero-shard--1" />
          <div className="hero-shard hero-shard--3" />
        </div>
        <div className="hero-layer" data-depth="26">
          <div className="hero-shard hero-shard--2" />
        </div>
      </div>

      <div data-depth="4">
        <div className="hero-pill">A growing library of notes</div>
        <h1 className="hero-title hero-rise">
          <span>
            <i>Practical AI knowledge,</i>
          </span>{" "}
          <span>
            <i>minus the hype.</i>
          </span>
        </h1>
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
          href={video.url}
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
            <div className="video-card-title">{video.title}</div>
            <div className="video-card-caption">{video.caption}</div>
          </div>
        </a>
      </div>
    </section>
  );
}
