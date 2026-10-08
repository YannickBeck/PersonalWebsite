import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { Button } from '@astryxdesign/core/Button';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { Gap } from '@/components/gap';
import { ExternalArrow } from '@/components/icons';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { ABOUT, EDUCATION, FOCUS_LIST, INTERESTS, LANGUAGES, LINKEDIN_URL, PERSON, PHOTOS, STATIONS } from '@/content/profile';
import { formatYears } from '@/lib/period';
import styles from './about-content.module.css';

/**
 * Über mich (ausführlich): LinkedIn-Zusammenfassung im Wortlaut (Yannicks eigene Worte),
 * Porträt mit Fakten, Schwerpunkte, Werdegang in Kürze. Alles aus dem Content-Modell.
 */
export function AboutContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const page = dict.pages['ueber-mich'];
  const study = EDUCATION.find((e) => e.id === 'dhbw-wi')!;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <div className={styles.grid}>
          <VStack gap={4} className={styles.text}>
            {ABOUT.value[lang].map((p) => (
              <Text key={p.slice(0, 32)} as="p" textWrap="pretty" className={styles.paragraph}>
                {p}
              </Text>
            ))}
            <Gap id="interests-private" lang={lang} block />
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
          <VStack gap={5} className={styles.side}>
            <Image
              src={PHOTOS.card.src}
              width={PHOTOS.card.width}
              height={PHOTOS.card.height}
              alt={PHOTOS.card.alt[lang]}
              sizes="(max-width: 767px) 80vw, 320px"
              className={`${styles.photo} yb-image-outline`}
            />
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
                <Text>{LANGUAGES.value.map((l) => `${l.name[lang]} (${l.level[lang]})`).join(' · ')}</Text>
              </MetadataListItem>
            </MetadataList>
          </VStack>
        </div>
      </Section>
      <SplitSection title={dict.aboutFocusTitle} hasDivider>
        <HStack gap={2} wrap="wrap">
          {FOCUS_LIST.value.map((s) => (
            <Token key={s} label={s} size="lg" />
          ))}
        </HStack>
      </SplitSection>
      <SplitSection title={dict.aboutInterestsTitle} hasDivider>
        <HStack gap={2} wrap="wrap">
          {INTERESTS.value[lang].map((s) => (
            <Token key={s} label={s} size="lg" />
          ))}
        </HStack>
      </SplitSection>
      <SplitSection
        title={dict.aboutPathTitle}
        hasDivider
        aside={
          <HStack>
            <Button label={dict.pages.cv.title} variant="secondary" href={withLang('/cv', lang)} />
          </HStack>
        }
      >
        <ol className={styles.path}>
          {STATIONS.map((s) => (
            <li key={s.id} className={styles.pathItem}>
              <Text type="supporting" color="secondary">
                {formatYears(s.start, s.end, lang)}
              </Text>
              <Text>
                <Text weight="semibold">{s.role[lang]}</Text> · {s.org}
              </Text>
            </li>
          ))}
        </ol>
      </SplitSection>
    </>
  );
}
