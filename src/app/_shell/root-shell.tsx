import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';
import { Providers } from '../providers';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SkipLink } from '@/components/html-lang';
import { Analytics } from '@/components/analytics';
import { PreviewNotice } from '@/components/preview-notice';
import { RouteTransition } from '@/components/route-transition';
import { HStack } from '@astryxdesign/core/HStack';
import { Layout, LayoutContent, LayoutFooter, LayoutHeader } from '@astryxdesign/core/Layout';
import { THEME_BOOT } from '@/theme/theme-boot';
import { InlineScript } from '@/components/inline-script';
import { SHOW_GAPS } from '@/lib/gaps';
import type { Lang } from '@/i18n/dictionaries';
import { FONT_VARIABLES } from './fonts';
import frame from '../frame.module.css';

const DESCRIPTION: Record<Lang, string> = {
  de: 'Yannick Beck, IT Consultant aus Sandhausen: Microsoft Cloud & AI, Modern Workplace, Identity & Security. Werdegang, Projekte und Kontakt.',
  en: 'Yannick Beck, IT consultant from Sandhausen, Germany: Microsoft Cloud & AI, Modern Workplace, identity & security. Career, projects and contact.',
};

/**
 * Basis-Metadaten je Root-Layout. Kein canonical/hreflang hier (FUN4): sonst erbten
 * 404-Seiten die der Startseite – jede Seite setzt sie über pageMeta (src/lib/seo.ts).
 */
export function rootMetadata(lang: Lang): Metadata {
  return {
    title: { default: 'Yannick Beck', template: '%s · Yannick Beck' },
    description: DESCRIPTION[lang],
    metadataBase: new URL('https://yannick-beck.de'),
    applicationName: 'Yannick Beck',
    authors: [{ name: 'Yannick Beck', url: 'https://yannick-beck.de' }],
  };
}

/**
 * Seitenrahmen für BEIDE Root-Layouts (src/app/(de)/layout.tsx, src/app/en/layout.tsx).
 *
 * Zwei Root-Layouts statt einem (Agenten-Lesbarkeit, A116/COD12): <html lang> steht so schon
 * im Server-HTML richtig („en“ unter /en) – vorher setzte erst das Boot-Script lang, Crawler
 * ohne JS sahen überall „de“. Folge laut Next-Doku (route-groups.md): Ein Wechsel DE ↔ EN ist
 * ein vollständiger Seitenaufruf (kein Client-Übergang); innerhalb einer Sprache bleibt alles
 * wie gehabt. Unbekannte URLs: src/app/global-not-found.tsx.
 *
 * Rahmen (E7): Header, Inhalt und Footer teilen EINE Inhaltslinie (contentWidth 1120,
 * Innenabstand 16px): LayoutHeader padding 0 + TopNav-Inset 8px + Inset der TopNavHeading 8px
 * = 16px. height="auto" + .print-area (Grid, min-height 100dvh) = Sticky-Footer (L9).
 * Vorschau-Hinweiszeile nur mit NEXT_PUBLIC_SHOW_GAPS=1 (Produktion ohne Demo-/Lückenhinweis).
 */
export function RootShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} data-astryx-theme="yb" suppressHydrationWarning className={FONT_VARIABLES}>
      <head>
        {/* Blockierend vor dem ersten Paint: gespeichertes Farbschema setzen (theme-boot.ts) */}
        <InlineScript html={THEME_BOOT} />
      </head>
      <body>
        <Providers lang={lang}>
          <SkipLink />
          <div className="print-area">
            <Layout
              height="auto"
              contentWidth={1120}
              header={
                <>
                  {SHOW_GAPS ? (
                    <LayoutHeader padding={2} className={`${frame.notice} yb-vt-notice print-hide`}>
                      <HStack paddingInline={2}>
                        <PreviewNotice />
                      </HStack>
                    </LayoutHeader>
                  ) : null}
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
