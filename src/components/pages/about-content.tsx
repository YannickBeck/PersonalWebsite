import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { CtaCard } from '@/components/cta-card';
import { LabelChipList } from '@/components/skill-chip';
import { Gap } from '@/components/gap';
import { FactList } from '@/components/fact-list';
import { contactLede } from '@/lib/contact-flag';
import { ExternalArrow } from '@/components/icons';
import { plain } from '@/components/emphasis';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { ABOUT, EDUCATION, FOCUS_LIST, GREETING, INTERESTS, LANGUAGES, LINKEDIN_URL, PERSON, PHOTOS, STATIONS } from '@/content/profile';
import { labelChips } from '@/content/profile-view';
import { formatYears } from '@/lib/period';
import styles from './about-content.module.css';

/**
 * Über mich (ausführlich, Redesign B4): Begrüßung als H1 wie im Abschnitt 01 der Startseite,
 * die LinkedIn-Zusammenfassung im Wortlaut (Yannicks eigene Worte), daneben das Porträt mit den
 * kompakten Angaben. Darunter nummerierte Abschnitte: Schwerpunkte und Interessen als Marken
 * (Fähigkeiten springen ins Periodensystem der Startseite), Werdegang in Kürze mit Verweisen in
 * den Lebenslauf, Abschluss mit Kontakt. Alles aus dem Content-Modell.
 */
export function AboutContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const page = dict.pages['ueber-mich'];
  const study = EDUCATION.find((e) => e.id === 'dhbw-wi')!;
  const cv = withLang('/cv', lang);
  return (
    <>
      <PageHero kicker={page.title} title={GREETING[lang]} lede={page.lede} />
      <Section>
        <div className={styles.grid}>
          <VStack gap={5} className={styles.text}>
            {ABOUT.value[lang].map((p) => (
              <Text key={p.slice(0, 32)} as="p" textWrap="pretty" className={styles.paragraph}>
                {p}
              </Text>
            ))}
            <Gap id="interests-private" lang={lang} block />
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
              <Button label={h.aboutCv} variant="ghost" href={cv} />
            </HStack>
          </VStack>
          <VStack gap={6} className={styles.side}>
            <Image
              src={PHOTOS.full.src}
              width={PHOTOS.full.width}
              height={PHOTOS.full.height}
              alt={PHOTOS.full.alt[lang]}
              sizes="(max-width: 899px) min(100vw, 26rem), 22rem"
              className={`${styles.photo} yb-image-outline`}
            />
            <VStack gap={3}>
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
                <MetadataListItem label={h.factLanguages}>
                  <FactList items={LANGUAGES.value.map((l) => ({ main: l.name[lang], note: l.level[lang] }))} />
                </MetadataListItem>
              </MetadataList>
            </VStack>
          </VStack>
        </div>
      </Section>

      <SplitSection
        index="01"
        title={dict.aboutFocusTitle}
        hasDivider
        aside={
          <HStack>
            <Button label={dict.aboutFocusMore} variant="secondary" href={withLang('/leistungen', lang)} />
          </HStack>
        }
      >
        <LabelChipList chips={labelChips(FOCUS_LIST.value)} lang={lang} />
      </SplitSection>

      <SplitSection index="02" title={dict.aboutInterestsTitle} hasDivider>
        <LabelChipList chips={labelChips(INTERESTS.value[lang])} lang={lang} />
      </SplitSection>

      <SplitSection
        index="03"
        title={dict.aboutPathTitle}
        hasDivider
        aside={
          <HStack>
            <Button label={dict.pages.cv.title} variant="secondary" href={cv} />
          </HStack>
        }
      >
        <ol className={styles.path}>
          {STATIONS.map((s) => (
            <li key={s.id} className={styles.pathItem}>
              <span className={`${styles.pathYears} yb-display`}>{formatYears(s.start, s.end, lang)}</span>
              <span className={styles.pathWhat}>
                <Link href={`${cv}#${s.id}`} color="primary" className={styles.pathLink}>
                  {s.role[lang]}
                </Link>
                <Text color="secondary">{s.org}</Text>
              </span>
            </li>
          ))}
        </ol>
      </SplitSection>

      <CtaCard
        title={plain(h.contactTitle)}
        text={contactLede(lang)}
        label={dict.contact}
        href={withLang('/kontakt', lang)}
      />
    </>
  );
}
