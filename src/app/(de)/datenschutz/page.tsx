import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { LegalContent } from '@/components/pages/legal-content';

const meta = getDictionary('de').pages.datenschutz;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/datenschutz',
  title: meta.title,
  description: meta.lede,
});

/** Inhalt aus src/content/legal.ts (DE + EN, auch für die Markdown-Fassung). */
export default function Page() {
  return <LegalContent kind="datenschutz" lang="de" />;
}
