import type { Metadata } from 'next';
import type { Lang } from '@/i18n/dictionaries';
import { counterpartPath } from '@/lib/routes';

const SITE = 'https://yannick-beck.de';

function url(lang: Lang, bare: string): string {
  const clean = bare === '/' ? '' : bare;
  return lang === 'en' ? `${SITE}/en${clean}` : `${SITE}${clean === '' ? '/' : clean}`;
}

/**
 * Einheitliche SEO-Angaben: Canonical + hreflang (de/en/x-default) + OG-Basis.
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
}: {
  lang: Lang;
  path: string;
  title: string;
  description?: string;
  noindex?: boolean;
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
      type: 'website',
    },
    ...(noindex ? { robots: { index: false } } : {}),
  };
}
