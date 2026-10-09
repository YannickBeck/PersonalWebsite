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
  STATIONS,
  type Station,
} from '@/content/profile';
import { FactList } from '@/components/fact-list';
import { formatYears } from '@/lib/period';
import { IdBadge, type IdBadgeData } from './id-badge';
import styles from './home.module.css';

const BADGE_STATIONS: Station['id'][] = ['bechtle-consultant', 'bechtle-studium', 'bechtle-ausbildung'];

/** Daten der Ausweiskarte (nur Serialisierbares an die Client-Komponente, kein Content-Modell im Bundle). */
function badgeData(lang: Lang): IdBadgeData {
  const dict = getDictionary(lang);
  return {
    photo: { src: PHOTOS.card.src, width: PHOTOS.card.width, height: PHOTOS.card.height, alt: PHOTOS.card.alt[lang] },
    name: PERSON.name,
    role: PERSON.role.value[lang],
    org: PERSON.employer.value,
    // Rückseite (DES7, A115): drei Stationen bei Bechtle, Arbeitgeber einmal im Label; der
    // volle Werdegang steht direkt darunter in Abschnitt 04
    stations: STATIONS.filter((s) => BADGE_STATIONS.includes(s.id)).map((s) => ({
      id: s.id,
      years: formatYears(s.start, s.end, lang),
      title: s.short[lang],
    })),
    languages: LANGUAGES.value.map((l) => ({ name: l.name[lang], level: l.level[lang] })),
    linkedin: LINKEDIN_URL,
    labels: {
      group: `${dict.home.badgeLabel}: ${PERSON.name}`,
      flip: dict.home.badgeFlip,
      hint: dict.home.badgeHint,
      stations: `${dict.home.badgeStations} · ${PERSON.employer.value}`,
      languages: dict.home.badgeLanguages,
      linkedin: dict.linkedinLabel,
      linkedinExternal: dict.linkedinExternal,
    },
  };
}

/**
 * 01 Über mich: links Begrüßung, Kurzvorstellung (LinkedIn-Zusammenfassung, gekürzt) und
 * Links; Mitte die Ausweiskarte am Band (Client-Blatt, Vorderseite Foto/Name/Rolle, Rückseite
 * Stationen kurz, Sprachen, LinkedIn); rechts kompakte Angaben. Tablet: Text | Karte, Angaben
 * darunter; mobil gestapelt. Überschrift des Abschnitts ist die Begrüßung (H2).
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
                aria-label={dict.linkedinExternal}
                variant="secondary"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                endContent={<ExternalArrow />}
              />
              <Button label={h.aboutCv} variant="ghost" href={withLang('/cv', lang)} />
            </HStack>
          </VStack>

          {/* Ausweiskarte am Band: dreh-/schwenkbar (Ziehen, Tippen, Tastatur), id-badge.tsx */}
          <IdBadge data={badgeData(lang)} />

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
                {/* Hochschule als eigene Zeile: EN-Name trägt selbst Klammern („(DHBW)“) */}
                <Text>
                  {study.degree[lang]}
                  <br />
                  <Text as="span" color="secondary">
                    {study.school[lang]}
                  </Text>
                </Text>
              </MetadataListItem>
              {/* Sprachen und Interessen als kurze Listen statt ·-Kette über mehrere Zeilen (DES12) */}
              <MetadataListItem label={h.factLanguages}>
                <FactList items={LANGUAGES.value.map((l) => ({ main: l.name[lang], note: l.level[lang] }))} />
              </MetadataListItem>
              <MetadataListItem label={h.factInterests}>
                <FactList items={INTERESTS.value[lang].map((i) => ({ main: i }))} />
              </MetadataListItem>
            </MetadataList>
          </VStack>
        </div>
      </Section>
    </section>
  );
}
