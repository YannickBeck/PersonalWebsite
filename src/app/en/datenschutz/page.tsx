import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { Gap } from '@/components/gap';

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
];

/**
 * Contact form: describes what the code actually does (src/lib/contact-server.ts,
 * docs/kontaktformular.md). The legal assessment remains OPEN (square brackets).
 */
const CONTACT_FORM: { text: string; open?: string }[] = [
  {
    text: 'The form transmits your name, email address, an optional subject, the message and your consent. The data is sent encrypted to this website’s server and from there to me as an email. Replies go to the email address you entered.',
  },
  {
    text: 'The email is sent by the Resend service via its API.',
    open: '[Add provider, registered office, data processing agreement and, if applicable, the basis for transfers to a third country]',
  },
  {
    text: 'This website stores no messages and writes no content, names or addresses to logs. The message then sits in my email inbox.',
    open: '[Add retention period in the inbox and at the delivery service]',
  },
  {
    text: 'To slow down mass sending, the server counts requests per IP address. For this, the address is only kept in memory as a salted hash for about ten minutes and is never stored. A hidden field and a minimum fill-in time also help against bots.',
  },
  {
    text: 'The processing is based on your consent in the form; you can withdraw it at any time.',
    open: '[Have the legal basis and the withdrawal route legally reviewed]',
  },
  {
    text: 'Without the form, you can reach me on LinkedIn; LinkedIn’s privacy policy applies there.',
  },
];

export default function Page() {
  const page = getDictionary('en').pages.datenschutz;
  const dict = getDictionary('en');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} meta={<Gap id="legal-privacy" lang="en" block />} />
      <Section>
        <VStack gap={8} maxWidth={640}>
          <Banner
            status="note"
            title={dict.templateNoticeTitle}
            description="Editorial template — not legal advice. Complete controller, legal bases and retention periods in brackets."
          />
          <VStack gap={2}>
            <Heading level={2}>Controller</Heading>
            <Text type="code" color="secondary">[Add name, address and email]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Services in use (actual state)</Heading>
            {SERVICES.map((s) => (
              <VStack key={s.name} gap={1}>
                <Heading level={3}>{s.name}</Heading>
                <Text>{s.text}</Text>
              </VStack>
            ))}
          </VStack>
          <VStack gap={3}>
            <Heading level={2}>Contact form</Heading>
            {CONTACT_FORM.map((p) => (
              <VStack key={p.text.slice(0, 32)} gap={1}>
                <Text>{p.text}</Text>
                {p.open ? (
                  <Text type="code" color="secondary">
                    {p.open}
                  </Text>
                ) : null}
              </VStack>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Your rights</Heading>
            <Text type="code" color="secondary">[Describe access, rectification, erasure, restriction, portability, objection and complaint rights — add text module]</Text>
          </VStack>
        </VStack>
      </Section>
    </>
  );
}
