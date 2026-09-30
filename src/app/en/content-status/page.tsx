import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import type { Metadata } from 'next';

interface Gap {
  where: string;
  need: string;
  format: string;
  state: string;
}

const GAPS: Gap[] = [
  { where: 'Homepage, about page', need: 'Own portrait photo', format: 'JPG/PNG, min. 800 × 1000, dark background', state: 'open' },
  { where: 'All project and article cards', need: 'Real cover images', format: '16:10, min. 1280 × 800', state: 'open (placeholders active)' },
  { where: 'Homepage, about page', need: 'Bio, positioning, claim (DE+EN)', format: 'Bio 3–4 sentences, claim 1 line', state: 'open (demo texts active)' },
  { where: 'CV page', need: 'Real stations, skills, talks', format: 'Per station: period, role, org, 1 sentence', state: 'open (demo stations active)' },
  { where: 'Services', need: 'Pricing, audiences, availability', format: 'Clarify and enter per offer', state: 'open (marked “open”)' },
  { where: 'Contact page', need: 'Confirmed email address', format: 'Address + permission to publish', state: 'open (notice active)' },
  { where: 'Contact form', need: 'Delivery integration (e.g. Resend or own API route)', format: 'API key + target address', state: 'open (demo mode active)' },
  { where: 'Newsletter', need: 'Enablement in Ghost (currently invite-only)', format: 'Ghost setting members_signup_access', state: 'open (invite notice active)' },
  { where: 'Imprint, privacy', need: 'Name, address, contact, legal modules', format: 'Replace all [brackets]', state: 'open (template active)' },
  { where: 'Ghost CMS', need: 'Replace sample content with real content', format: 'Posts/pages with tags project, #lang-de, #lang-en', state: 'open' },
  { where: 'Analytics', need: 'Cloudflare Web Analytics token (optional)', format: 'NEXT_PUBLIC_CF_BEACON_TOKEN as env', state: 'open (inactive)' },
];

function StatusPage({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  return (
    <>
      <PageHero title={dict.statusTitle} lede={dict.statusLede} />
      <Section>
        <VStack gap={3}>
          {GAPS.map((g) => (
            <Card key={g.where + g.need}>
              <VStack gap={1}>
                <Heading level={3}>{g.need}</Heading>
                <Text color="secondary">
                  {dict.statusColWhere}: {g.where}
                </Text>
                <Text color="secondary">
                  {dict.statusColFormat}: {g.format}
                </Text>
                <Text weight="semibold">
                  {dict.statusColState}: {g.state}
                </Text>
              </VStack>
            </Card>
          ))}
        </VStack>
      </Section>
    </>
  );
}

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <StatusPage lang="en" />;
}
