import type { Metadata } from "next";
import { Fustat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HtmlLang } from "@/components/html-lang";
import { Analytics } from "@/components/analytics";
import { Layout } from "@astryxdesign/core/Layout";
import { THEME_BOOT } from "@/theme/theme-boot";

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
          <a href="#main" className="skip-link">
            Zum Inhalt springen
          </a>
          <div className="print-area">
            <Layout
              contentWidth={1120}
              header={
                <div className="print-hide">
                  <SiteHeader />
                </div>
              }
              footer={
                <div className="print-hide">
                  <SiteFooter />
                </div>
              }
            >
              <main id="main">{children}</main>
            </Layout>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
