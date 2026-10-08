import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { CvContent } from '@/components/pages/cv-content';

const meta = getDictionary('de').pages.cv;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/cv',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  return <CvContent lang="de" />;
}
