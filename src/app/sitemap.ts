import type { MetadataRoute } from 'next';
import { getPostSlugs, getProjectSlugs } from '@/lib/ghost';

const SITE = 'https://yannick-beck.de';

const STATIC_DE = [
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const p of STATIC_DE) {
    entries.push({ url: `${SITE}${p}`, lastModified: new Date() });
    entries.push({ url: `${SITE}/en${p === '/' ? '' : p}`, lastModified: new Date() });
  }
  for (const lang of ['de', 'en'] as const) {
    const base = lang === 'en' ? `${SITE}/en` : SITE;
    const [postSlugs, projectSlugs] = await Promise.all([
      getPostSlugs(lang),
      getProjectSlugs(lang),
    ]);
    for (const slug of postSlugs) {
      entries.push({ url: `${base}/blog/${slug}`, lastModified: new Date() });
    }
    for (const slug of projectSlugs) {
      entries.push({ url: `${base}/projekte/${slug}`, lastModified: new Date() });
    }
  }
  return entries;
}
