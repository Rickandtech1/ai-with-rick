import type { Metadata } from "next";
import { Familjen_Grotesk } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

// Familjen Grotesk tops out at weight 700 — never request 800/900.
const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description:
    "A growing library of practical AI guides, walkthroughs, templates and cheat sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={familjen.variable}>
      <body>{children}</body>
    </html>
  );
}
