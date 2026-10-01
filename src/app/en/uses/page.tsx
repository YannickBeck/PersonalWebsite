import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { UsesContent } from '@/components/pages/uses-content';

const meta = getDictionary('en').pages.uses;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/uses',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  return <UsesContent lang="en" />;
}
