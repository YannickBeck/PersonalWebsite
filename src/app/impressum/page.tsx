import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('de').pages.impressum;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/impressum',
  title: meta.title,
  description: meta.lede,
});

export default function Page() {
  const page = getDictionary('de').pages.impressum;
  const dict = getDictionary('de');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <VStack gap={8} maxWidth={680}>
          <Banner
            status="note"
            title={dict.demoNoticeTitle}
            description="Redaktionelle Vorlage — keine Rechtsberatung. Alle Angaben in eckigen Klammern müssen vor Veröffentlichung durch echte Daten ersetzt werden."
          />
          <VStack gap={2}>
            <Heading level={2}>Angaben gemäß § 5 TMG</Heading>
            <Text>[Vorname Nachname ergänzen]</Text>
            <Text>[Straße Hausnummer ergänzen]</Text>
            <Text>[PLZ Ort ergänzen]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Kontakt</Heading>
            <Text>[E-Mail-Adresse ergänzen]</Text>
            <Text>[Telefonnummer ergänzen — Angabe freiwillig, aber empfohlen]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Verantwortlich für den Inhalt nach § 55 II RStV</Heading>
            <Text>[Name und Anschrift ergänzen]</Text>
          </VStack>
        </VStack>
      </Section>
    </>
  );
}
