import type { NextConfig } from "next";

/**
 * Alte Demo-Adressen des Live-Stands 2d636c6 (Inhalte eines anderen Agenten, im Redesign
 * entfernt). Sie standen in Navigation, Listen und teils in Suchmaschinen – statt einer 404
 * führen sie dauerhaft (308) auf die passende Übersicht. Exakte Slugs statt Muster, damit
 * künftige Ghost-Beiträge nie versehentlich umgeleitet werden. Übersicht: docs/urls.md.
 * Demo-Artikel gibt es im Vorschau-Build (NEXT_PUBLIC_SHOW_GAPS=1) weiterhin – dort keine
 * Umleitung für sie.
 */
const DEMO_PROJECTS = {
  de: ["demo-projekt-webseite", "demo-projekt-cms-migration", "demo-projekt-deploy-pipeline"],
  en: ["demo-project-website", "demo-project-cms-migration", "demo-project-deploy-pipeline"],
};
const DEMO_ARTICLES = {
  de: [
    "demo-warum-eigene-website",
    "demo-ghost-headless",
    "demo-automatisierung-alltag",
    "demo-nextjs-rendering",
    "demo-content-modellierung",
    "demo-ci-cd-sideprojects",
  ],
  en: [
    "demo-why-own-website",
    "demo-ghost-headless-en",
    "demo-automation-everyday",
    "demo-nextjs-rendering-en",
    "demo-content-modeling",
    "demo-ci-cd-sideprojects-en",
  ],
};
const SHOW_GAPS = process.env.NEXT_PUBLIC_SHOW_GAPS === "1";

function legacy(prefix: string, slugs: string[], destination: string) {
  return { source: `${prefix}/:slug(${slugs.join("|")})`, destination, permanent: true };
}

const LEGACY_REDIRECTS = [
  legacy("/projekte", DEMO_PROJECTS.de, "/projekte"),
  legacy("/en/projekte", DEMO_PROJECTS.en, "/en/projekte"),
  ...(SHOW_GAPS
    ? []
    : [legacy("/blog", DEMO_ARTICLES.de, "/blog"), legacy("/en/blog", DEMO_ARTICLES.en, "/en/blog")]),
];

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
      // erfasst werden. Nur Seitenpfade (PER1): Pfade mit Dateiendung (llms.txt, robots.txt,
      // sitemap.xml, rss.xml, Bilder, favicon) sowie _next, api und og bleiben unberührt –
      // sonst bekam, wer Markdown bevorzugt, für /llms.txt eine Markdown-404. „/“ passt weiter
      // ([^.]* darf leer sein). Browser senden text/markdown nie.
      // Accept-Gewichte (PER8): ausdrücklich abgelehnt (text/markdown;q=0) → HTML. Eine volle
      // q-Auswertung (z. B. text/html;q=1, text/markdown;q=0.1 → HTML) geht in rewrites nicht,
      // nur in Code; bekannte Einschränkung (AGENTS.md).
      // Gemessen (Next 16.3.6): Für vorgerenderte HTML-Seiten überschreibt Next die Vary-Liste –
      // weder headers() noch ein Proxy bringen „Accept“ in die HTML-Antwort. Deshalb ist die
      // Markdown-Antwort „private“ (PER4, OFFEN: CDN-Regel, falls HTML je am Edge gecacht wird).
      beforeFiles: [
        {
          source: "/:path((?!_next/|api/|og/)[^.]*)",
          has: [
            {
              type: "header",
              key: "accept",
              value: "(?!.*text/markdown\\s*;\\s*q\\s*=\\s*0(?:\\.0{0,3})?\\s*(?:[,;]|$)).*text/markdown.*",
            },
          ],
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
      // /coming-soon: Ghost-Standardbeitrag, live unter /en/blog/coming-soon (geprüft
      // 2026-10-09). Ziel bleibt die Liste /en/blog – der Beitrag kann jederzeit verschwinden.
      { source: "/about", destination: "/ueber-mich", permanent: true },
      { source: "/coming-soon", destination: "/en/blog", permanent: true },
      { source: "/tag/news", destination: "/blog", permanent: true },
      // Übliche englische Pfade, die Agenten/Crawler als Vertrauensanker prüfen
      // (Is-Agentic „trust anchors“): auf die echten Seiten.
      { source: "/contact", destination: "/kontakt", permanent: true },
      { source: "/privacy", destination: "/datenschutz", permanent: true },
      { source: "/imprint", destination: "/impressum", permanent: true },
      ...LEGACY_REDIRECTS,
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
