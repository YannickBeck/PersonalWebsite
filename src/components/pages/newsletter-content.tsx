import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { PageHero } from '@/components/page-hero';
import { NewsletterForm } from '@/components/newsletter-form';
import { Gap } from '@/components/gap';
import { ExternalArrow } from '@/components/icons';
import { SHOW_GAPS } from '@/lib/gaps';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { LINKEDIN_URL } from '@/content/profile';

/**
 * Newsletter (Redesign B4): Die Anmeldung ist in Ghost nur auf Einladung möglich
 * (members_signup_access, Lücke newsletter). Produktion: ehrlicher Stand und zwei Wege, die
 * wirklich funktionieren (RSS-Feed, LinkedIn) – kein Formular, das nichts überträgt.
 * Vorschau (NEXT_PUBLIC_SHOW_GAPS=1): zusätzlich das Demo-Formular mit Zustands-Vorschau,
 * damit die spätere Anmeldung gestaltet bleibt (Demo-System nur in der Vorschau).
 */
export function NewsletterContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.newsletter;
  return (
    <>
      <PageHero
        kicker={page.title}
        title={dict.newsletterTitle}
        lede={page.lede}
        meta={<Gap id="newsletter" lang={lang} block />}
      />
      <Section>
        <VStack gap={8} maxWidth={640}>
          <VStack gap={4}>
            <Text as="p" type="large" textWrap="pretty">
              {dict.newsletterAlternatives}
            </Text>
            <HStack gap={2} wrap="wrap">
              <Button label={dict.newsletterRss} variant="primary" href={withLang('/rss.xml', lang)} />
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
          {SHOW_GAPS ? (
            <>
              <Divider />
              <NewsletterForm lang={lang} />
            </>
          ) : null}
        </VStack>
      </Section>
    </>
  );
}
