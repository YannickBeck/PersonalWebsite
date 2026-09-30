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

const meta = getDictionary('en').pages.datenschutz;
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/datenschutz',
  title: meta.title,
  description: meta.lede,
});

const SERVICES = [
  {
    name: 'Hosting & delivery',
    text: 'This website runs on its own server (Hetzner, Germany), managed with Coolify. Retrieving pages technically transmits IP address and time (server logs, 7 days).',
  },
  {
    name: 'Cloudflare (CDN, protection & tunnel)',
    text: 'Traffic passes through Cloudflare (edge and tunnel services) for abuse protection and delivery. Connection data is processed on Cloudflare systems.',
  },
  {
    name: 'Ghost (CMS at cms.yannick-beck.de)',
    text: 'Content and newsletter signups are processed in the self-operated Ghost CMS. Newsletter signup is currently invite-only.',
  },
  {
    name: 'CDN libraries (jsDelivr)',
    text: 'The Ghost portal script was temporarily loaded via jsDelivr (currently disabled). On reactivation: IP address to jsDelivr.',
  },
  {
    name: 'Analytics',
    text: 'No analytics service is active currently (placeholder for Cloudflare Web Analytics). No tracking cookies are set. [Verify and complete]',
  },
  {
    name: 'Contact form (demo)',
    text: 'The form currently sends and stores nothing — input stays in the browser. [On activation: add processor and retention details]',
  },
];

export default function Page() {
  const page = getDictionary('en').pages.datenschutz;
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
            description="Editorial template — not legal advice. Complete controller, legal bases and retention periods in brackets."
          />
          <VStack gap={2}>
            <Heading level={2}>Controller</Heading>
            <Text>[Add name, address and email]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Services in use (actual state)</Heading>
            {SERVICES.map((s) => (
              <VStack key={s.name} gap={1}>
                <Heading level={3}>{s.name}</Heading>
                <Text color="secondary">{s.text}</Text>
              </VStack>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Your rights</Heading>
            <Text>[Describe access, rectification, erasure, restriction, portability, objection and complaint rights — add text module]</Text>
          </VStack>
        </VStack>
      </Section>
    </>
  );
}
