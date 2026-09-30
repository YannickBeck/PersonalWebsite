import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ContactForm } from '@/components/contact-form';
import { Faq } from '@/components/faq';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('de').pages.kontakt;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/kontakt',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  const page = getDictionary('de').pages.kontakt;
  const dict = getDictionary('de');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <VStack gap={4}>
          <Card>
            <VStack gap={2}>
              <Heading level={2}>{dict.contactEmailLabel}</Heading>
              <Text color="secondary">{dict.contactEmailPending}</Text>
            </VStack>
          </Card>
          <ContactForm lang="de" />
          <Faq lang="de" />
        </VStack>
      </Section>
    </>
  );
}
