import Image from 'next/image';
import type { ReactNode } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { LINKEDIN_URL, PERSON, PHOTOS } from '@/content/profile';
import { ExternalArrow } from '@/components/icons';
import { ContactForm } from '@/components/contact-form';
import { Gap } from '@/components/gap';
import { CONTACT_FORM_ENABLED } from '@/lib/contact-flag';
import styles from './contact-block.module.css';

/**
 * Kontakt (Startseite 06 und /kontakt, Redesign B4 – eine Komposition für beide): Kontaktwege
 * laut Nutzerentscheidung nur Formular (echter Versand über /api/kontakt) und LinkedIn – keine
 * öffentliche E-Mail, kein GitHub. headingLevel: 3 unter einer H2 (Startseite), 2 unter der
 * H1 (/kontakt). extra: zusätzliche Angaben unter der Karte (z. B. „Wer dir antwortet“).
 *
 * Zwei Zustände, beim Build entschieden (NEXT_PUBLIC_CONTACT_FORM, src/lib/contact-flag.ts,
 * Fix-Runde 1 DES6):
 * - Formular freigeschaltet: Formular links (breiter), LinkedIn-Karte rechts (klebt beim
 *   Ausfüllen); mobil Formular zuerst.
 * - Nicht freigeschaltet: nur die LinkedIn-Karte als Hauptweg mit dem ehrlichen Satz „Das
 *   Kontaktformular folgt“ – statt eines ausgegrauten, toten Formulars. Kein Layoutsprung.
 *   (Der Formular-Chunk wird trotzdem mitgeladen – der statische Import hängt im Modulgraphen,
 *   gemessen 39 KB unkomprimiert auf /; nicht weiter optimiert.)
 */
export function ContactBlock({ lang, headingLevel, extra }: { lang: Lang; headingLevel: 2 | 3; extra?: ReactNode }) {
  const dict = getDictionary(lang);
  const card = (
    // Ohne Formular ist die Karte der Hauptweg: Standardkarte (Ring) statt gedämpfter Fläche
    <Card variant={CONTACT_FORM_ENABLED ? 'muted' : 'default'}>
      <VStack gap={CONTACT_FORM_ENABLED ? 3 : 4}>
        <Heading level={headingLevel}>{dict.contactLinkedInTitle}</Heading>
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
  if (!CONTACT_FORM_ENABLED) {
    return (
      <div className={`${styles.grid} ${styles.pending}`}>
        <VStack gap={4} className={styles.form}>
          {card}
          <Gap id="contact-delivery" lang={lang} block />
        </VStack>
        {extra ? <VStack gap={8}>{extra}</VStack> : null}
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      <VStack gap={4} className={styles.form}>
        <ContactForm lang={lang} />
        <Gap id="contact-delivery" lang={lang} block />
      </VStack>
      <VStack gap={8} className={styles.aside}>
        {card}
        {extra}
      </VStack>
    </div>
  );
}
