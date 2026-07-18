import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

/**
 * Branded social-share card: /api/og?title=…&eyebrow=…
 * Used as the OpenGraph/Twitter image for the site and every resource.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || siteConfig.tagline).slice(0, 120);
  const eyebrow = (searchParams.get("eyebrow") || "A growing library of practical AI notes").slice(0, 60);

  const [bold, regular, avatar] = await Promise.all([
    readFile(path.join(process.cwd(), "content/fonts/FG-700.ttf")),
    readFile(path.join(process.cwd(), "content/fonts/FG-400.ttf")),
    readFile(path.join(process.cwd(), "public/avatar.png")).catch(() => null),
  ]);
  const avatarSrc = avatar ? `data:image/png;base64,${avatar.toString("base64")}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #FBE0C8 0%, #FDF3E7 55%, #F8D9C4 100%)",
          fontFamily: "FG",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#CC785C",
              marginBottom: 28,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? 62 : 74,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#1D1D1F",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {avatarSrc && (
            <img
              src={avatarSrc}
              width={72}
              height={72}
              style={{ borderRadius: 999, border: "4px solid rgba(255,255,255,0.85)" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#1D1D1F" }}>{siteConfig.name}</div>
            <div style={{ fontSize: 22, color: "#6E6E73", fontWeight: 400 }}>
              ai-with-rick.vercel.app
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              background: "#CC785C",
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: 100,
            }}
          >
            Free guide inside →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "FG", data: bold, weight: 700 },
        { name: "FG", data: regular, weight: 400 },
      ],
    }
  );
}
