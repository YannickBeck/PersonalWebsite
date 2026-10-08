import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { AboutContent } from '@/components/pages/about-content';

const meta = getDictionary('de').pages['ueber-mich'];
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/ueber-mich',
  title: meta.title,
  description: meta.lede,
  type: 'profile',
});

export default function Page() {
  return <AboutContent lang="de" />;
}
