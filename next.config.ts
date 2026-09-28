import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "yannick-beck.de" },
      { protocol: "https", hostname: "cms.yannick-beck.de" },
      { protocol: "https", hostname: "static.ghost.org" },
    ],
  },
};

export default nextConfig;
