import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { AboutContent } from '@/components/pages/about-content';

const meta = getDictionary('en').pages['ueber-mich'];
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/ueber-mich',
  title: meta.title,
  description: meta.lede,
  type: 'profile',
});

export default function Page() {
  return <AboutContent lang="en" />;
}
