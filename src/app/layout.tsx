import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";

const figtree = Figtree({
  variable: "--font-family-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yannick Beck",
  description: "Persönliche Website von Yannick Beck — Projekte, Blog und Kontakt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={figtree.variable}>
      <body>
        <Providers>
          <SiteHeader />
          {children}
          <Section variant="muted">
            <Text>© 2026 Yannick Beck — im Aufbau mit Next.js, Astryx und Ghost.</Text>
          </Section>
        </Providers>
      </body>
    </html>
  );
}
