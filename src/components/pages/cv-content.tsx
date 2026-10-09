import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Link } from '@astryxdesign/core/Link';
import { Button } from '@astryxdesign/core/Button';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { PrintButton } from '@/components/print-button';
import { LabelChipList } from '@/components/skill-chip';
import { ExternalArrow } from '@/components/icons';
import { Gap } from '@/components/gap';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { CERTIFICATIONS, EDUCATION, FOCUS_LIST, LANGUAGES, LINKEDIN_URL, PERSON, STATIONS, projectById } from '@/content/profile';
import { labelChips, projectHref, stationPlace } from '@/content/profile-view';
import { formatPeriod, formatYears, sentenceList } from '@/lib/period';
import styles from './cv-content.module.css';

/**
 * Lebenslauf aus dem Content-Modell (LinkedIn-Export), Redesign B4: Kopf mit dem Namen in der
 * Display-Schrift (wie der Namenszug der Startseite, aber in Tinte), darunter nummerierte
 * Abschnitte wie auf der Startseite. Linke Spalte je Eintrag: Jahre in der Display-Schrift plus
 * genauer Zeitraum (Stationen, Ausbildung) bzw. Aussteller (Zertifikate) bzw. Sprache.
 *
 * Druckbar (globals.css + cv-content.module.css @media print): Header, Footer und Bedienelemente
 * fallen weg, helles Schema, Einträge brechen nicht über Seiten. Anker je Eintrag
 * (#bechtle-studium …).
 */
export function CvContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.cv;
  const thesis = projectById('bachelorarbeit');
  return (
    <>
      <PageHero
        size="display"
        kicker={page.title}
        title={PERSON.name}
        lede={`${PERSON.role.value[lang]} · ${PERSON.focusLine.value[lang].join(' · ')}`}
        meta={
          <VStack gap={4}>
            <Text color="secondary" className={styles.contactLine}>
              {PERSON.location.value[lang]} ·{' '}
              <Link href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" color="primary" hasUnderline>
                linkedin.com/in/yannickbeck
                <span className="yb-sr-only"> ({dict.newTab})</span>
              </Link>
            </Text>
            <HStack gap={2} wrap="wrap" className="print-hide">
              <PrintButton lang={lang} />
              <Button
                label={dict.home.aboutLinkedIn}
                aria-label={dict.linkedinExternal}
                variant="ghost"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                endContent={<ExternalArrow />}
              />
            </HStack>
          </VStack>
        }
      />

      <SplitSection index="01" title={dict.cvStationsTitle}>
        <ol className={styles.list}>
          {STATIONS.map((s) => (
            <li key={s.id} id={s.id} className={styles.entry}>
              <div className={styles.when}>
                <span className={`${styles.years} yb-display`}>{formatYears(s.start, s.end, lang)}</span>
                <Text type="supporting" color="secondary">
                  {formatPeriod(s.start, s.end, lang)}
                </Text>
              </div>
              <VStack gap={3}>
                <VStack gap={0.5}>
                  <Heading level={3} className={styles.role}>
                    {s.role[lang]}
                  </Heading>
                  <Text color="secondary">
                    {s.org}
                    {stationPlace(s, lang) ? ` · ${stationPlace(s, lang)}` : ''}
                  </Text>
                  {lang === 'en' && s.enRole ? <Gap id={s.enRole.gap} lang={lang} /> : null}
                </VStack>
                {s.summary ? (
                  <Text as="p" textWrap="pretty">
                    {s.summary[lang]}
                  </Text>
                ) : null}
                {s.points[lang].length > 0 ? (
                  <ul className={styles.points}>
                    {s.points[lang].map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                ) : null}
                {s.closing ? (
                  <Text as="p" color="secondary" textWrap="pretty">
                    {s.closing[lang]}
                  </Text>
                ) : null}
                {s.thesis ? (
                  <div className={styles.thesis}>
                    <Text type="label" color="secondary">
                      {dict.cvThesisLabel}
                    </Text>
                    <Link href={projectHref(thesis, lang)} color="primary" hasUnderline>
                      {s.thesis.title[lang]}
                    </Link>
                    <Text type="supporting" color="secondary">
                      {dict.cvThesisFocus}: {sentenceList(s.thesis.focus[lang], lang)}
                    </Text>
                  </div>
                ) : null}
              </VStack>
            </li>
          ))}
        </ol>
      </SplitSection>

      <SplitSection index="02" title={dict.cvEducationTitle} hasDivider>
        <ol className={styles.list}>
          {EDUCATION.map((e) => (
            <li key={e.id} id={e.id} className={styles.entry}>
              <div className={styles.when}>
                <span className={`${styles.years} yb-display`}>{formatYears(e.start, e.end, lang)}</span>
                <Text type="supporting" color="secondary">
                  {formatPeriod(e.start, e.end, lang)}
                </Text>
              </div>
              <VStack gap={0.5}>
                <Heading level={3} className={styles.role}>
                  {e.degree[lang]}
                </Heading>
                <Text color="secondary">{e.school[lang]}</Text>
              </VStack>
            </li>
          ))}
        </ol>
      </SplitSection>

      <SplitSection index="03" title={dict.cvCertsTitle} hasDivider>
        <ul className={styles.list}>
          {CERTIFICATIONS.map((c) => (
            <li key={c.id} id={c.id} className={styles.entry}>
              <div className={styles.when}>
                <span className={`${styles.years} yb-display`}>{c.issuer}</span>
              </div>
              <VStack gap={1}>
                <Heading level={3} className={styles.role}>
                  <span lang={c.nameLang[lang] !== lang ? c.nameLang[lang] : undefined}>{c.name[lang]}</span>
                </Heading>
                {/* Datum offen: in Produktion keine Zeile, in der Vorschau die Lücke */}
                <Gap id="cert-dates" lang={lang} />
                {lang === 'en' && c.enTitle ? <Gap id={c.enTitle.gap} lang={lang} /> : null}
              </VStack>
            </li>
          ))}
        </ul>
      </SplitSection>

      <SplitSection index="04" title={dict.cvLanguagesTitle} hasDivider>
        <ul className={styles.list}>
          {LANGUAGES.value.map((l) => (
            <li key={l.code} className={`${styles.entry} ${styles.compact}`}>
              <div className={styles.when}>
                <span className={`${styles.years} yb-display`}>{l.name[lang]}</span>
              </div>
              <Text className={styles.level}>{l.level[lang]}</Text>
            </li>
          ))}
        </ul>
      </SplitSection>

      <SplitSection index="05" title={dict.cvSkillsTitle} hasDivider>
        <LabelChipList chips={labelChips(FOCUS_LIST.value)} lang={lang} />
      </SplitSection>
    </>
  );
}
