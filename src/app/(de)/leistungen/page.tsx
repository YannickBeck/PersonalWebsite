import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { ServicesContent } from '@/components/pages/services-content';

const meta = getDictionary('de').pages.leistungen;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/leistungen',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  return <ServicesContent lang="de" />;
}
