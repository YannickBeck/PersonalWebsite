import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { Emphasis } from '@/components/emphasis';
import { ExternalArrow } from '@/components/icons';
import {
  EDUCATION,
  GREETING,
  INTERESTS,
  INTRO,
  LANGUAGES,
  LINKEDIN_URL,
  PERSON,
  PHOTOS,
} from '@/content/profile';
import styles from './home.module.css';

/**
 * 01 Über mich – Gerüst (B1): links Begrüßung, Kurzvorstellung (LinkedIn-Zusammenfassung,
 * gekürzt) und Links; Mitte die Ausweiskarte (statisch – die dreh-/schwenkbare Fassung am
 * Band folgt als eigene Client-Komponente); rechts kompakte Angaben. Mobil gestapelt.
 * Überschrift des Abschnitts ist die Begrüßung (H2), damit kein zweiter Titel nötig ist.
 */
export function AboutSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const study = EDUCATION.find((e) => e.id === 'dhbw-wi')!;
  return (
    <section id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className={styles.section}>
      <Section>
        <div className={styles.aboutGrid}>
          <VStack gap={5} className={styles.aboutIntro}>
            <Text type="label" color="secondary" className={styles.sectionNumber}>
              <span className="yb-display" aria-hidden="true">
                {number}
              </span>
            </Text>
            <Heading level={2} id={`${id}-title`} textWrap="balance" className={styles.sectionTitle}>
              <Emphasis text={GREETING[lang]} />
            </Heading>
            {INTRO.value[lang].map((p) => (
              <Text key={p.slice(0, 24)} as="p" textWrap="pretty">
                {p}
              </Text>
            ))}
            <HStack gap={2} wrap="wrap">
              <Button
                label={h.aboutLinkedIn}
                variant="secondary"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                endContent={<ExternalArrow />}
              />
              <Button label={h.aboutCv} variant="ghost" href={withLang('/cv', lang)} />
            </HStack>
          </VStack>

          {/* Ausweiskarte (statisch). Ersetzt durch die interaktive Karte am Band. */}
          <figure className={styles.idCard} aria-label={`${PERSON.name}, ${PERSON.role.value[lang]}`}>
            <Image
              src={PHOTOS.card.src}
              width={PHOTOS.card.width}
              height={PHOTOS.card.height}
              alt={PHOTOS.card.alt[lang]}
              sizes="(max-width: 767px) 70vw, 280px"
              className={`${styles.idCardPhoto} yb-image-outline`}
            />
            <figcaption className={styles.idCardCaption}>
              <Text weight="semibold">{PERSON.name}</Text>
              <Text type="supporting" color="secondary">
                {PERSON.role.value[lang]} · {PERSON.employer.value}
              </Text>
            </figcaption>
          </figure>

          <VStack gap={4} className={styles.aboutFacts}>
            <Text type="label" color="secondary">
              {h.factsTitle}
            </Text>
            <MetadataList label={{ position: 'top' }}>
              <MetadataListItem label={h.factPlace}>
                <Text>{PERSON.location.value[lang]}</Text>
              </MetadataListItem>
              <MetadataListItem label={h.factIndustry}>
                <Text>{h.factIndustryValue(PERSON.inIndustrySince.value)}</Text>
              </MetadataListItem>
              <MetadataListItem label={h.factStudy}>
                <Text>
                  {study.degree[lang]} ({study.school})
                </Text>
              </MetadataListItem>
              <MetadataListItem label={h.factLanguages}>
                <Text>
                  {LANGUAGES.value.map((l) => `${l.name[lang]} (${l.level[lang]})`).join(' · ')}
                </Text>
              </MetadataListItem>
              <MetadataListItem label={h.factInterests}>
                <Text>{INTERESTS.value[lang].join(' · ')}</Text>
              </MetadataListItem>
            </MetadataList>
          </VStack>
        </div>
      </Section>
    </section>
  );
}
