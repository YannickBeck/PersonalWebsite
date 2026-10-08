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
import styles from './contact-block.module.css';

/**
 * Kontakt (Startseite 06 und /kontakt, Redesign B4 – eine Komposition für beide): Kontaktwege
 * laut Nutzerentscheidung nur Formular (echter Versand über /api/kontakt) und LinkedIn – keine
 * öffentliche E-Mail, kein GitHub. Formular links (breiter), LinkedIn-Karte rechts (klebt beim
 * Ausfüllen); mobil Formular zuerst. Ohne Versand-Konfiguration zeigt das Formular selbst den
 * ehrlichen Zustand mit LinkedIn-Weg. headingLevel: 3 unter einer H2 (Startseite), 2 unter der
 * H1 (/kontakt). extra: zusätzliche Angaben unter der Karte (z. B. „Wer dir antwortet“).
 */
export function ContactBlock({ lang, headingLevel, extra }: { lang: Lang; headingLevel: 2 | 3; extra?: ReactNode }) {
  const dict = getDictionary(lang);
  return (
    <div className={styles.grid}>
      <VStack gap={4} className={styles.form}>
        <ContactForm lang={lang} />
        <Gap id="contact-delivery" lang={lang} block />
      </VStack>
      <VStack gap={8} className={styles.aside}>
        <Card variant="muted">
          <VStack gap={3}>
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
              {dict.contactLinkedInText}
            </Text>
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
        {extra}
      </VStack>
    </div>
  );
}
