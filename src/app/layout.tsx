import type { Metadata } from "next";
import { Fustat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HtmlLang, SkipLink } from "@/components/html-lang";
import { Analytics } from "@/components/analytics";
import { DemoNotice } from "@/components/demo-notice";
import { RouteTransition } from "@/components/route-transition";
import { HStack } from "@astryxdesign/core/HStack";
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@astryxdesign/core/Layout";
import { THEME_BOOT } from "@/theme/theme-boot";
import { InlineScript } from "@/components/inline-script";
import frame from "./frame.module.css";

// Eigene Variablennamen: --font-family-body/-code gehören dem Theme (yb.css) und binden
// diese Variablen ein (var(--font-fustat) …, COD5) – die Variablen enthalten auch die
// metrisch angepassten Fallbacks von next/font (V5).
const fustat = Fustat({
  variable: "--font-fustat",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Yannick Beck",
    template: "%s · Yannick Beck",
  },
  description:
    "Persönliche Website von Yannick Beck — Projekte, Blog und Kontakt.",
  metadataBase: new URL("https://yannick-beck.de"),
  // Kein canonical/hreflang im Root-Layout (FUN4): sonst erbten 404-Seiten die der
  // Startseite. Jede Seite setzt sie über pageMeta (src/lib/seo.ts), die Startseite in page.tsx.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      data-astryx-theme="yb"
      suppressHydrationWarning
      className={`${fustat.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Blockierend vor dem ersten Paint: gespeichertes Farbschema + lang setzen (theme-boot.ts) */}
        <InlineScript html={THEME_BOOT} />
      </head>
      <body>
        <Providers>
          <HtmlLang />
          <SkipLink />
          {/*
            Seitenrahmen (E7, L2/MV2/M7): Header, Inhalt und Footer teilen EINE Inhaltslinie
            (contentWidth 1120, Innenabstand 16px). Header-Formel (container_inset = content_line −
            intrinsic_inset): LayoutHeader padding 0 + TopNav-Inset 8px + Inset der TopNavHeading 8px
            = 16px = Padding von LayoutContent bzw. Section-Text. Hinweiszeile: 8px + 8px.
            height="auto" + .print-area (Grid, min-height 100dvh) = Sticky-Footer (L9).
          */}
          <div className="print-area">
            <Layout
              height="auto"
              contentWidth={1120}
              header={
                <>
                  <LayoutHeader padding={2} className={`${frame.notice} yb-vt-notice print-hide`}>
                    <HStack paddingInline={2}>
                      <DemoNotice />
                    </HStack>
                  </LayoutHeader>
                  <LayoutHeader hasDivider padding={0} className={`${frame.header} yb-vt-header print-hide`}>
                    <SiteHeader />
                  </LayoutHeader>
                </>
              }
              footer={
                <LayoutFooter hasDivider className="yb-vt-footer print-hide">
                  <SiteFooter />
                </LayoutFooter>
              }
            >
              <LayoutContent isScrollable={false} className={frame.content}>
                {/* Seitenübergang (B3): Boundary je Pfad, Header/Footer stehen außerhalb (motion.css §2) */}
                <RouteTransition>
                  <main id="main" tabIndex={-1}>
                    {children}
                  </main>
                </RouteTransition>
              </LayoutContent>
            </Layout>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
