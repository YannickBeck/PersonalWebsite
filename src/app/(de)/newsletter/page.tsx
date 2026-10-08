import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { NewsletterContent } from '@/components/pages/newsletter-content';

const meta = getDictionary('de').pages.newsletter;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/newsletter',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  return <NewsletterContent lang="de" />;
}
