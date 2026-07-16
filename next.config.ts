import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin file uploads go through a server action; default is 1 MB.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
