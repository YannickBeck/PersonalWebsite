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

/**
 * Erreichbar, aber nicht gelistet: nicht in Hauptnavigation, Footer, Sitemap und llms.txt,
 * dazu noindex (HTML über pageMeta, Markdown per X-Robots-Tag) – gilt auch für Unterseiten
 * (/blog/<slug>), siehe isUnlisted().
 * - /uses: noch keine belegte Werkzeugliste (Nutzerentscheidung „URL erreichbar, aus
 *   Navigation/Sitemap nehmen“).
 * - /blog und /newsletter (Fix-Runde 2, JURY1-4): Ghost enthält bisher nur Beispielbeiträge
 *   („Hallo Welt“ DE/EN, Ghost-Standardbeitrag „Coming soon“ EN). Die Hauptnavigation soll nicht
 *   auf einen Testbeitrag führen. Sobald eigene Beiträge veröffentlicht sind: beide Einträge
 *   hier streichen und neu bauen (Lücke blog-posts, docs/content-guide.md).
 */
export const UNLISTED_ROUTES: ReadonlySet<string> = new Set<string>(['/uses', '/blog', '/newsletter']);

/**
 * Pfad (mit oder ohne /en-Präfix) liegt in einem nicht gelisteten Bereich – auch Unterseiten
 * wie /blog/<slug> bzw. /en/blog/<slug>.
 */
export function isUnlisted(path: string): boolean {
  const segs = path.split('/').filter(Boolean);
  const first = segs[0] === 'en' ? segs[1] : segs[0];
  return first !== undefined && UNLISTED_ROUTES.has(`/${first}`);
}

/** Blog gelistet? Steuert RSS-Verweis im <head>, Blogbeiträge in der Sitemap und llms.txt. */
export const BLOG_LISTED = !isUnlisted('/blog');

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
