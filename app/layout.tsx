import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Familjen_Grotesk } from "next/font/google";
import { siteConfig, siteUrl } from "@/lib/site-config";
import "./globals.css";

// Familjen Grotesk tops out at weight 700 — never request 800/900.
const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const description =
  "A growing library of practical AI guides, walkthroughs, templates and cheat sheets.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description,
    siteName: siteConfig.name,
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description,
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={familjen.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
