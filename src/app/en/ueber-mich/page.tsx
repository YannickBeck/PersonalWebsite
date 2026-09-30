import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { DemoBadge } from '@/components/demo-badge';
import { getDictionary } from '@/i18n/dictionaries';
import { skillsByLang } from '@/content/pages';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('en').pages['ueber-mich'];
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/ueber-mich',
  title: meta.title,
  description: meta.lede,
});

const BIO = [
  'Demo bio (fictional): I have been building websites and web applications for over ten years — from the first static page to multilingual portals with their own design system.',
  'Demo bio (fictional): Technology should disappear into the background: fast pages, understandable copy, barriers removed wherever possible. This website is my showroom and my notebook.',
  'Demo bio (fictional): When I am not programming, I read specialist books, maintain my toolbox, or write — for example here on the blog.',
];

const WORKSTYLE = ['Demo workflow: small steps, visible progress, honest estimates.'];

export default function Page() {
  const page = getDictionary('en').pages['ueber-mich'];
  const dict = getDictionary('en');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <Grid columns={{ minWidth: 260 }} gap={4}>
          <VStack gap={2}>
            <Image
              src="/placeholders/portrait.svg"
              alt={dict.portraitAlt}
              width={800}
              height={1000}
              sizes="(max-width: 768px) 100vw, 440px"
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
            />
          </VStack>
          <VStack gap={3}>
            <DemoBadge lang="en" />
            {BIO.map((p, i) => (
              <Text key={i}>{p}</Text>
            ))}
            <Banner status="info" title={dict.demoNoticeTitle} description={WORKSTYLE[0]} />
          </VStack>
        </Grid>
      </Section>
      <Section variant="muted">
        <VStack gap={3}>
          <Heading level={2}>Skills (demo)</Heading>
          {skillsByLang('en').map((s) => (
            <Text key={s}>• {s}</Text>
          ))}
        </VStack>
      </Section>
    </>
  );
}
