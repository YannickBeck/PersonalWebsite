import type { Metadata } from "next";
import { Fustat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HtmlLang, SkipLink } from "@/components/html-lang";
import { Analytics } from "@/components/analytics";
import { DemoNotice } from "@/components/demo-notice";
import { HStack } from "@astryxdesign/core/HStack";
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@astryxdesign/core/Layout";
import { THEME_BOOT } from "@/theme/theme-boot";
import frame from "./frame.module.css";

// Eigene Variablennamen: --font-family-body/-code gehören dem Theme (yb.css) und
// nennen dort "Fustat"/"JetBrains Mono" samt metrisch angepasster Fallbacks (V5).
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
  alternates: {
    canonical: "https://yannick-beck.de/",
    languages: {
      de: "https://yannick-beck.de/",
      en: "https://yannick-beck.de/en",
      "x-default": "https://yannick-beck.de/",
    },
  },
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
        {/* Blockierend vor dem ersten Paint: gespeichertes Farbschema setzen (theme-boot.ts) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
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
                  <LayoutHeader padding={2} className={`${frame.notice} print-hide`}>
                    <HStack paddingInline={2}>
                      <DemoNotice />
                    </HStack>
                  </LayoutHeader>
                  <LayoutHeader hasDivider padding={0} className={`${frame.header} print-hide`}>
                    <SiteHeader />
                  </LayoutHeader>
                </>
              }
              footer={
                <LayoutFooter hasDivider className="print-hide">
                  <SiteFooter />
                </LayoutFooter>
              }
            >
              <LayoutContent isScrollable={false}>
                <main id="main" tabIndex={-1}>
                  {children}
                </main>
              </LayoutContent>
            </Layout>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
