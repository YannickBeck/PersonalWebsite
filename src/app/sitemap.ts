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
    for (const slug of await getPostSlugs(lang)) {
      entries.push({ url: `${base}/blog/${slug}`, lastModified: new Date() });
    }
    for (const slug of await getProjectSlugs(lang)) {
      entries.push({ url: `${base}/projekte/${slug}`, lastModified: new Date() });
    }
  }
  return entries;
}
