import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // alte Ghost-URLs (Root vor Cutover) auf neue Routen
      { source: "/about/", destination: "/ueber-mich", permanent: true },
      { source: "/coming-soon/", destination: "/en/blog/coming-soon", permanent: true },
      { source: "/tag/news/", destination: "/blog", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "yannick-beck.de" },
      { protocol: "https", hostname: "cms.yannick-beck.de" },
      { protocol: "https", hostname: "static.ghost.org" },
    ],
  },
};

export default nextConfig;
