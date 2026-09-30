import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { DemoBadge } from '@/components/demo-badge';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('en').pages.impressum;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/impressum',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  const page = getDictionary('en').pages.impressum;
  const dict = getDictionary('en');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <VStack gap={4}>
          <DemoBadge lang="en" />
          <Banner
            status="warning"
            title={dict.demoNoticeTitle}
            description="Editorial template — not legal advice. Replace all bracketed items with real data before publishing."
          />
          <VStack gap={2}>
            <Heading level={2}>Information according to § 5 TMG</Heading>
            <Text>[Add full name]</Text>
            <Text>[Add street and number]</Text>
            <Text>[Add postal code and city]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Contact</Heading>
            <Text>[Add email address]</Text>
            <Text>[Add phone number — optional but recommended]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Responsible for content (§ 55 II RStV)</Heading>
            <Text>[Add name and address]</Text>
          </VStack>
        </VStack>
      </Section>
    </>
  );
}
