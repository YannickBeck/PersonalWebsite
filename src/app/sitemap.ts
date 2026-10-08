import type { MetadataRoute } from 'next';
import { getPostSlugs } from '@/lib/ghost';
import { PUBLIC_ROUTES, UNLISTED_ROUTES } from '@/lib/routes';
import { PROJECTS } from '@/content/profile';

const SITE = 'https://yannick-beck.de';

/**
 * Sitemap: statische Seiten beider Sprachen (ohne /uses, UNLISTED_ROUTES), die zwei Projekte
 * aus dem Content-Modell und Ghost-Artikel. Ghost-Beiträge mit Tag „project“ und Demo-Inhalte
 * stehen nicht drin.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const p of PUBLIC_ROUTES) {
    if (UNLISTED_ROUTES.has(p)) {
      continue;
    }
    entries.push({ url: `${SITE}${p}`, lastModified: new Date() });
    entries.push({ url: `${SITE}/en${p === '/' ? '' : p}`, lastModified: new Date() });
  }
  for (const lang of ['de', 'en'] as const) {
    const base = lang === 'en' ? `${SITE}/en` : SITE;
    for (const project of PROJECTS) {
      entries.push({ url: `${base}/projekte/${project.slug[lang]}`, lastModified: new Date() });
    }
    for (const slug of await getPostSlugs(lang)) {
      entries.push({ url: `${base}/blog/${slug}`, lastModified: new Date() });
    }
  }
  return entries;
}
