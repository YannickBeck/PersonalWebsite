import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import './globals.css';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { BrandMark } from '@/components/brand-mark';
import { THEME_BOOT } from '@/theme/theme-boot';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { LANG_HEADER } from '@/lib/not-found-lang';
import { FONT_VARIABLES } from './_shell/fonts';
import styles from './global-not-found.module.css';
import nf from '@/components/pages/not-found.module.css';

/**
 * Globale 404 für URLs ohne passende Route (next.config experimental.globalNotFound) – nötig,
 * weil es zwei Root-Layouts gibt ((de) und en, root-shell.tsx). notFound() innerhalb einer
 * Sprache rendert dagegen (de)/not-found.tsx bzw. en/not-found.tsx im normalen Rahmen.
 *
 * EIN HTML für beide Sprachen: Jeder Text steht zweimal (Spans mit lang), CSS zeigt die
 * passende Fassung über html[data-yb-404="en"]. Kein DOM-Austausch per Script: Next hydriert
 * auch diese Seite, geänderter Text ergäbe einen Hydration-Fehler (React #418, gemessen). Genau
 * eine H1. Status 404 setzt Next. Agenten mit Accept: text/markdown bekommen eine Markdown-404
 * (next.config rewrites → /api/md).
 *
 * Sprache (Rest-Feinschliff): Next ruft diese Seite ohne Pfad auf; src/proxy.ts setzt für /en/*
 * den Anfrage-Header x-yb-lang (src/lib/not-found-lang.ts). Daraus kommen lang und
 * data-yb-404 schon im Server-HTML – auch ohne JavaScript die englische Fassung, Agenten lesen
 * lang="en". Dafür wird die Seite je Abruf gerendert (ƒ, ~5 statt ~2,5 ms lokal gemessen);
 * gecacht wurde sie auch statisch nie (no-store). Vorher: statisches HTML mit lang="de", das
 * Boot-Script schaltete unter /en vor dem ersten Paint um; ohne JavaScript blieb sie deutsch.
 * Das Boot-Script setzt beides weiter (gleicher Wert, Rückfall ohne Proxy).
 *
 * Fix-Runde 1: Marke im <header>, Gegensprache und Rechtliches im <footer> (A125: nichts
 * außerhalb von Landmarks); die englische Fassung bekommt die Spiegelzeile zur deutschen
 * Startseite (FUN5); Impressum und Datenschutz als statische Links. Inhaltslinie wie die übrigen
 * Seiten (Rahmen 1120px, DES9).
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

/**
 * Feste Mindestbreite je Pille (em, gemessen: Fustat und ihre Ersatzschrift, jeweils der größere
 * Wert, Fix-Runde 1): Diese Seite bekommt von Next keine Schrift-Preloads, beim Schrifttausch
 * wurden die Pillen sonst 2–4px breiter und schoben die folgenden an (CLS). Text linksbündig.
 */
const PILL_EM: Record<Lang, Record<(typeof LINKS)[number], number>> = {
  de: { '/': 8.6, '/projekte': 6.22, '/cv': 7.49, '/kontakt': 6.02 },
  en: { '/': 11.84, '/projekte': 6.18, '/cv': 3.9, '/kontakt': 6.17 },
};

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

export default async function GlobalNotFound() {
  const de = getDictionary('de');
  const en = getDictionary('en');
  const lang: Lang = (await headers()).get(LANG_HEADER) === 'en' ? 'en' : 'de';
  return (
    <html
      lang={lang}
      data-yb-404={lang === 'en' ? 'en' : undefined}
      data-astryx-theme="yb"
      suppressHydrationWarning
      className={FONT_VARIABLES}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NOT_FOUND_BOOT }} />
      </head>
      <body>
        <Section className={styles.frame}>
          <VStack gap={10} maxWidth={720}>
            <header>
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
            </header>
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
                          <a
                            href={withLang(href, 'de')}
                            className={`${styles.pill} ${i === 0 ? styles.primary : ''}`}
                            style={{ minWidth: `${PILL_EM.de[href]}em` }}
                          >
                            {label(href, 'de')}
                          </a>
                        }
                        en={
                          <a
                            href={withLang(href, 'en')}
                            className={`${styles.pill} ${i === 0 ? styles.primary : ''}`}
                            style={{ minWidth: `${PILL_EM.en[href]}em` }}
                          >
                            {label(href, 'en')}
                          </a>
                        }
                      />
                    </li>
                  ))}
                </HStack>
              </VStack>
            </main>
            <footer className={styles.footer}>
              {/* Gegensprache: DE-Fassung → englische Zeile, EN-Fassung → deutsche Zeile (FUN5) */}
              {/* Hinweis und Link je eine Zeile, beide linksbündig: Ihre Lage hängt nicht von der
                  Breite des anderen ab (die Schrift lädt hier ohne Preload nach; Text in derselben
                  Zeile rutschte beim Schriftwechsel um 3px – CLS) */}
              <Text as="p" color="secondary">
                <span lang="en" className={styles.de}>
                  {en.notFoundTitle}.
                  <br />
                  <a href="/en" className={styles.link}>
                    {en.otherLangHome}
                  </a>
                </span>
                <span lang="de" className={styles.en}>
                  {de.notFoundTitle}.
                  <br />
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- globale 404: bewusst ein Dokument-Link */}
                  <a href="/" className={styles.link}>
                    {de.otherLangHome}
                  </a>
                </span>
              </Text>
              {/* Rechtliches untereinander (gleicher Grund wie oben: keine Lage, die von der Breite des
                  Nachbarn abhängt) */}
              <ul className={styles.legal}>
                <li>
                  <Both
                    de={
                      <a href="/impressum" className={styles.link}>
                        {de.pages.impressum.title}
                      </a>
                    }
                    en={
                      <a href="/en/impressum" className={styles.link}>
                        {en.pages.impressum.title}
                      </a>
                    }
                  />
                </li>
                <li>
                  <Both
                    de={
                      <a href="/datenschutz" className={styles.link}>
                        {de.pages.datenschutz.title}
                      </a>
                    }
                    en={
                      <a href="/en/datenschutz" className={styles.link}>
                        {en.pages.datenschutz.title}
                      </a>
                    }
                  />
                </li>
              </ul>
            </footer>
          </VStack>
        </Section>
      </body>
    </html>
  );
}
