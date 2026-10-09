import type { Metadata } from 'next';
import type { Lang } from '@/i18n/dictionaries';
import { BLOG_LISTED, counterpartPath, isUnlisted } from '@/lib/routes';
import { OG_ALT, OG_SIZE } from '@/lib/og';

/** Vorschaubild je Sprache (src/app/og/[lang]/route.ts). */
export function ogImageUrl(lang: Lang): string {
  return `${SITE}/og/${lang}`;
}

const SITE = 'https://yannick-beck.de';

function url(lang: Lang, bare: string): string {
  const clean = bare === '/' ? '' : bare;
  return lang === 'en' ? `${SITE}/en${clean}` : `${SITE}${clean === '' ? '/' : clean}`;
}

/**
 * Einheitliche SEO-Angaben: Canonical + hreflang (de/en/x-default) + OG-Basis. og:image kommt
 * aus src/app/og/[lang]/route.ts (stabile URL je Sprache).
 * path ohne Sprachpräfix in der Sprache der Seite, z. B. '/', '/projekte',
 * '/blog/mein-artikel' (EN: '/blog/my-article').
 *
 * hreflang zeigt nur auf existierende Gegenstücke (FUN4): Detailseiten über die
 * Übersetzungszuordnung (TRANSLATION_MAP); ohne Gegenstück nur die eigene Sprache.
 *
 * Nicht gelistete Bereiche (routes.ts UNLISTED_ROUTES, z. B. /uses, /blog/…) sind immer noindex;
 * der RSS-Verweis im <head> steht nur, solange der Blog gelistet ist (JURY1-4).
 */
export function pageMeta({
  lang,
  path,
  title,
  description,
  noindex = false,
  type = 'website',
}: {
  lang: Lang;
  path: string;
  title: string;
  description?: string;
  noindex?: boolean;
  /** og:type – 'profile' für die Startseite (Person), 'article' für Beiträge. */
  type?: 'website' | 'profile' | 'article';
}): Metadata {
  const canonical = url(lang, path);
  const hidden = noindex || isUnlisted(path);
  const otherLang: Lang = lang === 'de' ? 'en' : 'de';
  const other = counterpartPath(path);
  const languages: Record<string, string> = { [lang]: canonical };
  if (other) {
    languages[otherLang] = url(otherLang, other);
  }
  const deUrl = languages.de;
  if (deUrl) {
    languages['x-default'] = deUrl;
  }
  return {
    title,
    description,
    // RSS-Feed der Sprache auffindbar (B4: Blog und Newsletter verweisen darauf) – nur mit
    // gelistetem Blog; der Feed selbst bleibt erreichbar
    alternates: {
      canonical,
      languages,
      ...(BLOG_LISTED
        ? { types: { 'application/rss+xml': [{ url: url(lang, '/rss.xml'), title: lang === 'de' ? 'Yannick Beck – Blog' : 'Yannick Beck – Blog (English)' }] } }
        : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Yannick Beck',
      locale: lang === 'de' ? 'de_DE' : 'en_GB',
      type,
      images: [{ url: ogImageUrl(lang), width: OG_SIZE.width, height: OG_SIZE.height, alt: OG_ALT[lang] }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl(lang)] },
    ...(hidden ? { robots: { index: false } } : {}),
  };
}
