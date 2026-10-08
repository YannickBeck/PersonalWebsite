import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Zwei Root-Layouts ((de) und en, src/app/_shell/root-shell.tsx) → eine globale 404 für
    // URLs ohne Route (src/app/global-not-found.tsx, not-found.md).
    globalNotFound: true,
  },
  async rewrites() {
    return {
      // Accept: text/markdown → Markdown-Fassung bzw. Markdown-404 (src/app/api/md, mit
      // Vary: Accept). Vor dem Dateisystem, damit auch statische Seiten und unbekannte Pfade
      // erfasst werden; _next und api bleiben unberührt. Browser senden text/markdown nie.
      // Gemessen (Next 16.3.6): Für vorgerenderte HTML-Seiten überschreibt Next die Vary-Liste –
      // weder headers() noch ein Proxy bringen „Accept“ in die HTML-Antwort (OFFEN: CDN-Regel,
      // falls HTML je am Edge gecacht wird).
      beforeFiles: [
        {
          source: "/:path((?!_next/|api/).*)",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/api/md/:path",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
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
      // Übliche englische Pfade, die Agenten/Crawler als Vertrauensanker prüfen
      // (Is-Agentic „trust anchors“): auf die echten Seiten.
      { source: "/contact", destination: "/kontakt", permanent: true },
      { source: "/privacy", destination: "/datenschutz", permanent: true },
      { source: "/imprint", destination: "/impressum", permanent: true },
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
