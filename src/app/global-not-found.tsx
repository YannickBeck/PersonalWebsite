import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { BrandMark } from '@/components/brand-mark';
import { THEME_BOOT } from '@/theme/theme-boot';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { FONT_VARIABLES } from './_shell/fonts';
import styles from './global-not-found.module.css';
import nf from '@/components/pages/not-found.module.css';

/**
 * Globale 404 für URLs ohne passende Route (next.config experimental.globalNotFound) – nötig,
 * weil es zwei Root-Layouts gibt ((de) und en, root-shell.tsx). notFound() innerhalb einer
 * Sprache rendert dagegen (de)/not-found.tsx bzw. en/not-found.tsx im normalen Rahmen.
 *
 * EIN statisches HTML für beide Sprachen: Jeder Text steht zweimal (Spans mit lang), CSS zeigt
 * die passende Fassung über html[data-yb-404="en"] – das Boot-Script setzt das Attribut und
 * lang="en" vor dem ersten Paint. Kein DOM-Austausch per Script: Next hydriert auch diese Seite,
 * geänderter Text ergäbe einen Hydration-Fehler (React #418, gemessen). Genau eine H1.
 * Ohne JS: deutsche Fassung plus eine englische Zeile mit Link. Status 404 setzt Next. Agenten
 * mit Accept: text/markdown bekommen eine Markdown-404 (next.config rewrites → /api/md).
 */
// Zweisprachig: Next/React setzen <title> beim Hydrieren zurück, ein Austausch per Script hält nicht
export const metadata: Metadata = {
  title: 'Seite nicht gefunden · Page not found · Yannick Beck',
  description: 'Die angefragte Seite gibt es auf yannick-beck.de nicht. The requested page does not exist.',
};

const NOT_FOUND_BOOT = `${THEME_BOOT}(function(){if(!/^\\/en(\\/|$)/.test(location.pathname))return;var d=document.documentElement;d.lang='en';d.setAttribute('data-yb-404','en');})();`;

/** Zwei Sprachfassungen eines Inhalts; sichtbar ist eine (global-not-found.module.css). */
function Both({ de, en }: { de: ReactNode; en: ReactNode }) {
  return (
    <>
      <span lang="de" className={styles.de}>
        {de}
      </span>
      <span lang="en" className={styles.en}>
        {en}
      </span>
    </>
  );
}

const LINKS = ['/', '/projekte', '/cv', '/kontakt'] as const;

function label(href: (typeof LINKS)[number], lang: Lang): string {
  const dict = getDictionary(lang);
  return href === '/'
    ? dict.notFoundHome
    : href === '/projekte'
      ? dict.pages.projekte.title
      : href === '/cv'
        ? dict.pages.cv.title
        : dict.pages.kontakt.title;
}

export default function GlobalNotFound() {
  const de = getDictionary('de');
  const en = getDictionary('en');
  return (
    <html lang="de" data-astryx-theme="yb" suppressHydrationWarning className={FONT_VARIABLES}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NOT_FOUND_BOOT }} />
      </head>
      <body>
        <Section className={styles.frame}>
          <VStack gap={10} maxWidth={720}>
            <Both
              de={
                // eslint-disable-next-line @next/next/no-html-link-for-pages -- globale 404: bewusst ein Dokument-Link
                <a href="/" className={styles.brand}>
                  <BrandMark />
                  <Text weight="semibold">Yannick Beck</Text>
                </a>
              }
              en={
                <a href="/en" className={styles.brand}>
                  <BrandMark />
                  <Text weight="semibold">Yannick Beck</Text>
                </a>
              }
            />
            <main id="main">
              <VStack gap={6}>
                <VStack gap={4}>
                  {/* Blasse Display-Ziffern wie der Namenszug (dekorativ, wie not-found-content.tsx) */}
                  <span className={`${nf.code} yb-display`} aria-hidden="true">
                    404
                  </span>
                  <Heading level={1} textWrap="balance" className={nf.title}>
                    <Both de={de.notFoundTitle} en={en.notFoundTitle} />
                  </Heading>
                  <Text type="large" color="secondary" textWrap="pretty" className={styles.lede}>
                    <Both de={de.notFoundText} en={en.notFoundText} />
                  </Text>
                </VStack>
                <HStack as="ul" gap={2} wrap="wrap" className={styles.links}>
                  {LINKS.map((href, i) => (
                    <li key={href}>
                      <Both
                        de={
                          <a href={withLang(href, 'de')} className={`${styles.pill} ${i === 0 ? styles.primary : ''}`}>
                            {label(href, 'de')}
                          </a>
                        }
                        en={
                          <a href={withLang(href, 'en')} className={`${styles.pill} ${i === 0 ? styles.primary : ''}`}>
                            {label(href, 'en')}
                          </a>
                        }
                      />
                    </li>
                  ))}
                </HStack>
              </VStack>
            </main>
            <Text as="p" color="secondary" className={styles.otherLang}>
              <span lang="en">
                {en.notFoundTitle} –{' '}
                <a href="/en" className={styles.link}>
                  {en.otherLangHome}
                </a>
              </span>
            </Text>
          </VStack>
        </Section>
      </body>
    </html>
  );
}
