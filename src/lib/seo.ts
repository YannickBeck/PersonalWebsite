import type { Metadata } from 'next';
import type { Lang } from '@/i18n/dictionaries';
import { counterpartPath } from '@/lib/routes';
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
    alternates: { canonical, languages },
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
    ...(noindex ? { robots: { index: false } } : {}),
  };
}
