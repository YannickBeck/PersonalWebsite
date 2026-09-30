import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { DemoBadge } from '@/components/demo-badge';
import { getDictionary } from '@/i18n/dictionaries';
import { usesByLang } from '@/content/pages';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('en').pages.uses;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/uses',
  title: meta.title,
  description: meta.lede,
});

const IMAGES = [
  '/placeholders/uses-hardware.svg',
  '/placeholders/uses-software.svg',
  '/placeholders/uses-flow.svg',
];

export default function Page() {
  const page = getDictionary('en').pages.uses;
  const groups = usesByLang('en');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      {groups.map((g, gi) => (
        <Section key={g.title} variant={gi % 2 === 1 ? 'muted' : undefined}>
          <VStack gap={3}>
            <Heading level={2}>{g.title}</Heading>
            {g.items.map((item) => (
              <Card key={item.name}>
                <HStack gap={3}>
                  <Image
                    src={IMAGES[gi % IMAGES.length]}
                    alt=""
                    width={400}
                    height={400}
                    loading="lazy"
                    sizes="120px"
                    style={{ width: 120, height: 120, borderRadius: 'var(--radius-container)', flexShrink: 0 }}
                  />
                  <VStack gap={1}>
                    <Heading level={3}>{item.name}</Heading>
                    <Text color="secondary">{item.text}</Text>
                    <DemoBadge lang="en" />
                  </VStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        </Section>
      ))}
    </>
  );
}
