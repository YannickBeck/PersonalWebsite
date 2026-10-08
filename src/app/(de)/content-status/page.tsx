import type { Metadata } from 'next';
import { ContentStatusContent } from '@/components/pages/content-status-content';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMeta } from '@/lib/seo';

const dict = getDictionary('de');
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/content-status',
  title: dict.statusTitle,
  description: dict.statusLede,
  noindex: true,
});

export default function Page() {
  return <ContentStatusContent lang="de" />;
}
