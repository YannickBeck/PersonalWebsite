import type { Metadata } from "next";
import { Fustat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HtmlLang } from "@/components/html-lang";
import { Analytics } from "@/components/analytics";
import { PortalScript } from "@/components/portal-script";
import { Layout } from "@astryxdesign/core/Layout";

const fustat = Fustat({
  variable: "--font-family-body",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-family-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Yannick Beck",
    template: "%s · Yannick Beck",
  },
  description:
    "Persönliche Website von Yannick Beck — Projekte, Blog und Kontakt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${fustat.variable} ${jetbrains.variable}`}>
      <body>
        <Providers>
          <HtmlLang />
          <a href="#main" className="skip-link">
            Zum Inhalt springen
          </a>
          <Layout
            contentWidth={960}
            header={<SiteHeader />}
            footer={<SiteFooter />}
          >
            <main id="main">{children}</main>
          </Layout>
          <Analytics />
          <PortalScript />
        </Providers>
      </body>
    </html>
  );
}
