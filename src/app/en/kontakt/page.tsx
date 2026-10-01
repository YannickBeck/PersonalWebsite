import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { ContactContent } from '@/components/pages/contact-content';

const meta = getDictionary('en').pages.kontakt;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/kontakt',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  return <ContactContent lang="en" />;
}
