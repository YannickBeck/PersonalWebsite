import { TRANSLATION_MAP } from '@/i18n/translations';

/**
 * Statische Routen, die es in beiden Sprachen gibt (ohne /en-Präfix) – eine Quelle für
 * Sitemap, Sprachwechsel und hreflang (COD13). Neue statische Seite → hier eintragen.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/projekte',
  '/blog',
  '/leistungen',
  '/cv',
  '/ueber-mich',
  '/uses',
  '/kontakt',
  '/newsletter',
  '/impressum',
  '/datenschutz',
] as const;

/** In beiden Sprachen vorhanden, aber nicht in der Sitemap (noindex). */
export const NOINDEX_ROUTES = ['/content-status'] as const;

export const KNOWN_ROUTES: ReadonlySet<string> = new Set<string>([...PUBLIC_ROUTES, ...NOINDEX_ROUTES]);

/**
 * Pfad ohne Sprachpräfix in der Zielsprache – Detailseiten über die Übersetzungszuordnung,
 * statische Seiten gespiegelt. null = kein Gegenstück (unbekannter Pfad, Detail ohne
 * Übersetzung). Ergebnis ohne /en-Präfix, z. B. "/blog/hello-world-why-this-website".
 */
export function counterpartPath(bare: string): string | null {
  const segs = bare.split('/').filter(Boolean);
  if ((segs[0] === 'projekte' || segs[0] === 'blog') && segs.length === 2) {
    const other = TRANSLATION_MAP[segs[1]];
    return other ? `/${segs[0]}/${other}` : null;
  }
  const clean = `/${segs.join('/')}`;
  return KNOWN_ROUTES.has(clean) ? clean : null;
}
