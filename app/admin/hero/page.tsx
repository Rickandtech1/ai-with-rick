import Image from "next/image";
import { HeroVideoForm } from "@/components/admin/HeroVideoForm";
import { getHeroVideo } from "@/lib/data";
import { youtubeThumbnail } from "@/lib/site-config";

export default async function AdminHeroVideoPage() {
  const video = await getHeroVideo();
  const thumbnail = youtubeThumbnail(video.url);

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-h1">Hero video</h1>
      </div>

      <div className="admin-panel">
        <h2 className="admin-h2">Currently on the homepage</h2>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {thumbnail && (
            <Image
              src={thumbnail}
              alt=""
              width={192}
              height={108}
              style={{ borderRadius: 12, objectFit: "cover" }}
            />
          )}
          <div style={{ minWidth: 240, flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{video.title}</div>
            <div className="admin-note" style={{ marginBottom: 8 }}>
              {video.caption}
            </div>
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="admin-note">
              {video.url} ↗
            </a>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2 className="admin-h2">Change it</h2>
        <HeroVideoForm />
      </div>

      <p className="admin-note">
        The card on the homepage links to this video and shows its thumbnail, title, and channel.
        Changes are live immediately — no redeploy.
      </p>
    </>
  );
}
