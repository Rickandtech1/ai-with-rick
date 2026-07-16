import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // YouTube thumbnails on the hero video card
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  experimental: {
    serverActions: {
      // Admin file uploads go through a server action; default is 1 MB.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
