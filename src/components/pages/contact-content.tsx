import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { ContactBlock } from '@/components/contact-block';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { FOCUS_AREAS, PERSON } from '@/content/profile';

/**
 * Kontakt (Redesign B4): Kopf wie Abschnitt 06 der Startseite („Schreib *mir*.“), darunter
 * dieselbe Komposition (contact-block.tsx: Formular mit echtem Versand über /api/kontakt +
 * LinkedIn-Karte), ergänzt um „Wer dir antwortet“. Keine öffentliche E-Mail-Adresse
 * (Nutzerentscheidung); ohne Versand-Konfiguration zeigt das Formular den ehrlichen Zustand.
 */
export function ContactContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.kontakt;
  return (
    <>
      <PageHero kicker={page.title} title={dict.home.contactTitle} lede={page.lede} />
      <Section>
        <ContactBlock
          lang={lang}
          headingLevel={2}
          extra={
            <VStack gap={3}>
              <Heading level={2}>{dict.contactWhoTitle}</Heading>
              <MetadataList label={{ position: 'top' }}>
                <MetadataListItem label={dict.contactRole}>
                  <Text>
                    {PERSON.name} · {PERSON.role.value[lang]} · {PERSON.employer.value}
                  </Text>
                </MetadataListItem>
                <MetadataListItem label={dict.home.factPlace}>
                  <Text>{PERSON.location.value[lang]}</Text>
                </MetadataListItem>
                <MetadataListItem label={dict.contactTopics}>
                  <Text>{FOCUS_AREAS.map((a) => a.title[lang]).join(' · ')}</Text>
                </MetadataListItem>
              </MetadataList>
            </VStack>
          }
        />
      </Section>
    </>
  );
}
