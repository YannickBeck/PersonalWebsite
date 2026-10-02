import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // alte Ghost-URLs (Root vor Cutover) auf neue Routen. Quellen OHNE abschließenden
      // Slash (FUN5): Next normalisiert „/about/“ zuerst auf „/about“ (308) – Quellen mit
      // Slash griffen danach nie. So decken sie beide Schreibweisen ab.
      // OFFEN: ob der Ghost-Beitrag „coming-soon“ live existiert; mit den Mock-Inhalten ist
      // /en/blog/coming-soon 404, daher Ziel /en/blog.
      { source: "/about", destination: "/ueber-mich", permanent: true },
      { source: "/coming-soon", destination: "/en/blog", permanent: true },
      { source: "/tag/news", destination: "/blog", permanent: true },
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
