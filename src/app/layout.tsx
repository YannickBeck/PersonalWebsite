import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HtmlLang } from "@/components/html-lang";
import { Analytics } from "@/components/analytics";
import { PortalScript } from "@/components/portal-script";

const figtree = Figtree({
  variable: "--font-family-body",
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
    <html lang="de" className={figtree.variable}>
      <body>
        <Providers>
          <HtmlLang />
          <a href="#main" className="skip-link">
            Zum Inhalt springen
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <Analytics />
          <PortalScript />
        </Providers>
      </body>
    </html>
  );
}
