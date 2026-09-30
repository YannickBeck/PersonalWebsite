import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { NewsletterForm } from '@/components/newsletter-form';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('en').pages.newsletter;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/newsletter',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  const page = getDictionary('en').pages.newsletter;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <NewsletterForm lang="en" />
      </Section>
    </>
  );
}
