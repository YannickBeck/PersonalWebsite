import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Banner } from '@astryxdesign/core/Banner';
import { DemoBadge } from '@/components/demo-badge';
import { getDictionary } from '@/i18n/dictionaries';
import { servicesByLang } from '@/content/pages';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('en').pages.leistungen;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/leistungen',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  const page = getDictionary('en').pages.leistungen;
  const dict = getDictionary('en');
  const services = servicesByLang('en');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      {services.map((s, i) => (
        <Section key={s.slug} variant={i % 2 === 1 ? 'muted' : undefined}>
          <VStack gap={4}>
            <DemoBadge lang="en" />
            <Heading level={2}>{s.title}</Heading>
            <Text type="large">{s.problem}</Text>
            <VStack gap={2}>
              <Heading level={3}>{dict.tasksTitle}</Heading>
              {s.tasks.map((t) => (
                <Text key={t}>• {t}</Text>
              ))}
            </VStack>
            <VStack gap={2}>
              <Heading level={3}>{dict.deliverablesTitle}</Heading>
              {s.deliverables.map((d) => (
                <Text key={d}>• {d}</Text>
              ))}
            </VStack>
            <VStack gap={2}>
              <Heading level={3}>{dict.processTitle}</Heading>
              {s.steps.map((step) => (
                <Card key={step.title}>
                  <VStack gap={1}>
                    <Heading level={3}>{step.title}</Heading>
                    <Text color="secondary">{step.text}</Text>
                  </VStack>
                </Card>
              ))}
            </VStack>
            <Banner status="warning" title={dict.demoNoticeTitle} description={s.openNote} />
            <HStack gap={2}>
              <Button label={dict.contact} variant="primary" href="/en/kontakt" />
            </HStack>
          </VStack>
        </Section>
      ))}
    </>
  );
}
