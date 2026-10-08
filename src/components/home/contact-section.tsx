import { HStack } from '@astryxdesign/core/HStack';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { LINKEDIN_URL } from '@/content/profile';
import { ExternalArrow } from '@/components/icons';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';

/**
 * 06 Kontakt – Gerüst (B1): Kontaktwege laut Nutzerentscheidung nur LinkedIn und
 * Kontaktformular (keine öffentliche E-Mail, kein GitHub). Das Formular selbst (mit echtem
 * Versand) wird hier eingebettet, sobald es angebunden ist.
 */
export function ContactSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  return (
    <HomeSection id={id} number={number} title={h.contactTitle} lede={h.contactLede}>
      <HStack gap={3} wrap="wrap">
        <Button label={h.contactForm} variant="primary" size="lg" href={withLang('/kontakt', lang)} />
        <Button
          label={dict.linkedinLabel}
          aria-label={dict.linkedinExternal}
          variant="secondary"
          size="lg"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          endContent={<ExternalArrow />}
        />
      </HStack>
      <Gap id="contact-delivery" lang={lang} block />
    </HomeSection>
  );
}
