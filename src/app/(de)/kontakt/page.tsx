import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { ContactContent } from '@/components/pages/contact-content';
import { contactPageLede } from '@/lib/contact-flag';

const meta = getDictionary('de').pages.kontakt;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/kontakt',
  title: meta.title,
  description: contactPageLede('de'),
});

export default function Page() {
  return <ContactContent lang="de" />;
}
