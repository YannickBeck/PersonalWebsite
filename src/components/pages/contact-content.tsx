import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { PageHero } from '@/components/page-hero';
import { ContactForm } from '@/components/contact-form';
import { Faq } from '@/components/faq';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

/** Kontakt (L8): Formular höchstens 640px breit, daneben E-Mail-Hinweis und FAQ. */
export function ContactContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.kontakt;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="start">
          <VStack maxWidth={640}>
            <ContactForm lang={lang} />
          </VStack>
          <VStack gap={8}>
            <Card variant="muted">
              <VStack gap={2}>
                <Heading level={2}>{dict.contactEmailLabel}</Heading>
                <Text color="secondary">{dict.contactEmailPending}</Text>
              </VStack>
            </Card>
            <Faq lang={lang} />
          </VStack>
        </Grid>
      </Section>
    </>
  );
}
