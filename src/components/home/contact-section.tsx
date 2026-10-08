import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import Image from 'next/image';
import { LINKEDIN_URL, PERSON, PHOTOS } from '@/content/profile';
import { ExternalArrow } from '@/components/icons';
import { ContactForm } from '@/components/contact-form';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';
import styles from './home.module.css';

/**
 * 06 Kontakt: Kontaktwege laut Nutzerentscheidung nur Formular (echter Versand über
 * /api/kontakt) und LinkedIn – keine öffentliche E-Mail, kein GitHub. Formular links (breiter),
 * LinkedIn rechts; mobil Formular zuerst. Ohne Versand-Konfiguration zeigt das Formular selbst
 * den ehrlichen Zustand mit LinkedIn-Weg.
 */
export function ContactSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  return (
    <HomeSection id={id} number={number} title={h.contactTitle} lede={h.contactLede}>
      <div className={styles.contactGrid}>
        <VStack gap={4} className={styles.contactForm}>
          <ContactForm lang={lang} />
          <Gap id="contact-delivery" lang={lang} block />
        </VStack>
        <Card variant="muted" className={styles.contactAside}>
          <VStack gap={3}>
            <Heading level={3}>{dict.contactLinkedInTitle}</Heading>
            <HStack gap={3} vAlign="center">
              <Image
                src={PHOTOS.avatar.src}
                width={PHOTOS.avatar.width}
                height={PHOTOS.avatar.height}
                alt=""
                sizes="48px"
                className={`${styles.contactAvatar} yb-image-outline`}
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
      </div>
    </HomeSection>
  );
}
