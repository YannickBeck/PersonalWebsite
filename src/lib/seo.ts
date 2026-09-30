import type { Metadata } from 'next';
import type { Lang } from '@/i18n/dictionaries';

const SITE = 'https://yannick-beck.de';

/**
 * Einheitliche SEO-Angaben: Canonical + hreflang (de/en/x-default) + OG-Basis.
 * path ohne Sprachpräfix, z. B. '/', '/projekte', '/blog/mein-artikel'.
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
  const clean = path === '/' ? '' : path;
  const deUrl = `${SITE}${clean === '' ? '/' : clean}`;
  const enUrl = `${SITE}/en${clean}`;
  const canonical = lang === 'en' ? enUrl : deUrl;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { de: deUrl, en: enUrl, 'x-default': deUrl },
    },
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
