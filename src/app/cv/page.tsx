import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { DemoBadge } from '@/components/demo-badge';
import { PrintButton } from '@/components/print-button';
import { getDictionary } from '@/i18n/dictionaries';
import { cvByLang, skillsByLang } from '@/content/pages';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('de').pages.cv;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/cv',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  const page = getDictionary('de').pages.cv;
  const stations = cvByLang('de');
  const skills = skillsByLang('de');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <VStack gap={4}>
          <DemoBadge lang="de" />
          {stations.map((s) => (
            <Card key={s.role}>
              <VStack gap={2}>
                <Text type="label" color="secondary">
                  {s.period}
                </Text>
                <Heading level={3}>{s.role}</Heading>
                <Text weight="semibold">{s.org}</Text>
                <Text color="secondary">{s.text}</Text>
              </VStack>
            </Card>
          ))}
        </VStack>
      </Section>
      <Section variant="muted">
        <VStack gap={3}>
          <Heading level={2}>Kompetenzen (Demo)</Heading>
          {skills.map((skill) => (
            <Text key={skill}>• {skill}</Text>
          ))}
          <HStack gap={2}>
            <PrintButton lang="de" />
          </HStack>
        </VStack>
      </Section>
    </>
  );
}
