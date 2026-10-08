import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { HStack } from '@astryxdesign/core/HStack';
import { Button } from '@astryxdesign/core/Button';
import { PageHero } from '@/components/page-hero';
import { ContactForm } from '@/components/contact-form';
import { Gap } from '@/components/gap';
import { ExternalArrow } from '@/components/icons';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { FOCUS_AREAS, LINKEDIN_URL, PERSON } from '@/content/profile';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';

/**
 * Kontakt: Formular (höchstens 640px) und LinkedIn als zweiter Weg (Nutzerentscheidung –
 * keine öffentliche E-Mail-Adresse). Versand über /api/kontakt (Resend); ohne Konfiguration
 * zeigt das Formular den ehrlichen Zustand (Lücke contact-delivery).
 */
export function ContactContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.kontakt;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="start">
          <VStack maxWidth={640} gap={4}>
            <ContactForm lang={lang} />
            <Gap id="contact-delivery" lang={lang} block />
          </VStack>
          <VStack gap={8}>
          <Card variant="muted">
            <VStack gap={3}>
              <Heading level={2}>{dict.contactLinkedInTitle}</Heading>
              <Text color="secondary">{dict.contactLinkedInText}</Text>
              <HStack>
                <Button
                  label={dict.home.aboutLinkedIn}
                  aria-label={dict.linkedinExternal}
                  variant="secondary"
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  endContent={<ExternalArrow />}
                />
              </HStack>
            </VStack>
          </Card>
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
          </VStack>
        </Grid>
      </Section>
    </>
  );
}
