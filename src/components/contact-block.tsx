import Image from 'next/image';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { FOCUS_AREAS, LINKEDIN_URL, PERSON, PHOTOS } from '@/content/profile';
import { ExternalArrow } from '@/components/icons';
import { FactList } from '@/components/fact-list';
import { Gap } from '@/components/gap';
import { ContactFormLazy } from '@/components/contact-form-lazy';
import { CONTACT_FORM_ENABLED } from '@/lib/contact-flag';
import styles from './contact-block.module.css';

/**
 * Kontakt (Startseite, letzter Abschnitt, und /kontakt – EINE Komposition für beide, B4):
 * Kontaktwege laut Nutzerentscheidung nur Formular (echter Versand über /api/kontakt) und
 * LinkedIn – keine öffentliche E-Mail, kein GitHub. headingLevel: 3 unter einer H2
 * (Startseite), 2 unter der H1 (/kontakt).
 *
 * Fix-Runde 3: „Wer dir antwortet“ gehört jetzt zur Komposition (vorher nur auf /kontakt; die
 * Startseite endete mit einer halbbreiten LinkedIn-Karte vor einer leeren rechten Hälfte).
 * Name, Rolle und Arbeitgeber stehen nur noch dort, mit Porträt – nicht zusätzlich in der
 * Karte und nicht als „Rolle: Yannick Beck · …“.
 *
 * Zwei Zustände, beim Build entschieden (NEXT_PUBLIC_CONTACT_FORM, src/lib/contact-flag.ts,
 * Fix-Runde 1 DES6):
 * - Formular freigeschaltet: Formular links (breiter), rechts LinkedIn-Karte und „Wer dir
 *   antwortet“ (klebt beim Ausfüllen); mobil Formular zuerst.
 * - Nicht freigeschaltet: LinkedIn-Karte als Hauptweg | „Wer dir antwortet“, gleich breit; der
 *   Satz „Das Kontaktformular folgt noch“ steht einmal in der Lede, nicht noch in der Karte.
 *   Der Formular-Code lädt dann gar nicht (contact-form-lazy.tsx, Fix-Runde 3).
 */
export function ContactBlock({ lang, headingLevel }: { lang: Lang; headingLevel: 2 | 3 }) {
  const dict = getDictionary(lang);
  const card = (
    // Ohne Formular ist die Karte der Hauptweg: Standardkarte (Ring) statt gedämpfter Fläche
    <Card variant={CONTACT_FORM_ENABLED ? 'muted' : 'default'}>
      <VStack gap={CONTACT_FORM_ENABLED ? 3 : 4}>
        <Heading level={headingLevel}>{dict.contactLinkedInTitle}</Heading>
        <Text color="secondary" textWrap="pretty">
          {CONTACT_FORM_ENABLED ? dict.contactLinkedInText : dict.contactPendingText}
        </Text>
        <HStack>
          {CONTACT_FORM_ENABLED ? (
            <Button
              label={dict.home.aboutLinkedIn}
              aria-label={dict.linkedinExternal}
              variant="secondary"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              endContent={<ExternalArrow />}
            />
          ) : (
            // Hauptweg ohne Formular: Tinten-Pille wie „Kontakt“ im Einstieg
            <Button
              label={dict.contactLinkedInAction}
              aria-label={`${dict.contactLinkedInAction} (${dict.newTab})`}
              variant="primary"
              size="lg"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              endContent={<ExternalArrow />}
            />
          )}
        </HStack>
      </VStack>
    </Card>
  );
  const who = (
    <VStack gap={4} className={styles.who}>
      <Heading level={headingLevel}>{dict.contactWhoTitle}</Heading>
      <HStack gap={3} vAlign="center">
        <Image
          src={PHOTOS.avatar.src}
          width={PHOTOS.avatar.width}
          height={PHOTOS.avatar.height}
          alt=""
          sizes="48px"
          className={`${styles.avatar} yb-image-outline`}
        />
        <VStack gap={0.5}>
          <Text weight="semibold">{PERSON.name}</Text>
          <Text type="supporting" color="secondary">
            {PERSON.role.value[lang]} · {PERSON.employer.value}
          </Text>
        </VStack>
      </HStack>
      <MetadataList label={{ position: 'top' }}>
        <MetadataListItem label={dict.home.factPlace}>
          <Text>{PERSON.location.value[lang]}</Text>
        </MetadataListItem>
        {/* als kurze Liste statt ·-Kette (DES12: „KI &“ hing am Zeilenende) */}
        <MetadataListItem label={dict.contactTopics}>
          <FactList items={FOCUS_AREAS.map((a) => ({ main: a.title[lang] }))} />
        </MetadataListItem>
      </MetadataList>
    </VStack>
  );
  if (!CONTACT_FORM_ENABLED) {
    return (
      <div className={`${styles.grid} ${styles.pending}`}>
        <VStack gap={4} className={styles.form}>
          {card}
          <Gap id="contact-delivery" lang={lang} block />
        </VStack>
        {who}
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      <VStack gap={4} className={styles.form}>
        <ContactFormLazy lang={lang} />
        <Gap id="contact-delivery" lang={lang} block />
      </VStack>
      <VStack gap={8} className={styles.aside}>
        {card}
        {who}
      </VStack>
    </div>
  );
}
