import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Token } from '@astryxdesign/core/Token';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { PrintButton } from '@/components/print-button';
import { Gap } from '@/components/gap';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { CERTIFICATIONS, EDUCATION, FOCUS_LIST, LANGUAGES, LINKEDIN_URL, PERSON, STATIONS, projectById } from '@/content/profile';
import { projectHref } from '@/content/profile-view';
import { formatPeriod } from '@/lib/period';
import styles from './cv-content.module.css';

/**
 * Lebenslauf aus dem Content-Modell (LinkedIn-Export): Stationen mit Stichpunkten,
 * Ausbildung, Zertifikate, Sprachen, Schwerpunkte. Druckbar (globals.css @media print:
 * Header/Footer/Buttons aus, helles Schema). Anker je Eintrag (#bechtle-studium …) für die
 * „belegt durch“-Links der Fähigkeiten.
 */
export function CvContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.cv;
  const thesis = projectById('bachelorarbeit');
  return (
    <>
      <PageHero
        title={page.title}
        lede={page.lede}
        meta={
          <VStack gap={3}>
            <Text color="secondary">
              {PERSON.name} · {PERSON.role.value[lang]} · {PERSON.location.value[lang]} ·{' '}
              <Link href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" color="primary" hasUnderline>
                linkedin.com/in/yannickbeck
              </Link>
            </Text>
            <HStack className="print-hide">
              <PrintButton lang={lang} />
            </HStack>
          </VStack>
        }
      />
      <SplitSection title={dict.cvStationsTitle}>
        <ol className={styles.list}>
          {STATIONS.map((s) => (
            <li key={s.id} id={s.id} className={styles.entry}>
              <Text type="supporting" color="secondary" className={styles.when}>
                {formatPeriod(s.start, s.end, lang)}
              </Text>
              <VStack gap={2}>
                <VStack gap={0.5}>
                  <Heading level={3}>{s.role[lang]}</Heading>
                  <Text color="secondary">
                    {s.org}
                    {s.place ? ` · ${s.place[lang]}` : ''}
                  </Text>
                </VStack>
                {s.summary ? (
                  <Text as="p" textWrap="pretty">
                    {s.summary[lang]}
                  </Text>
                ) : null}
                {s.points[lang].length > 0 ? (
                  <List listStyle="disc" density="compact">
                    {s.points[lang].map((pt) => (
                      <ListItem key={pt} label={<Text textWrap="pretty">{pt}</Text>} />
                    ))}
                  </List>
                ) : null}
                {s.closing ? (
                  <Text as="p" color="secondary" textWrap="pretty">
                    {s.closing[lang]}
                  </Text>
                ) : null}
                {s.thesis ? (
                  <VStack gap={1} className={styles.thesis}>
                    <Text type="label" color="secondary">
                      {dict.cvThesisLabel}
                    </Text>
                    <Link href={projectHref(thesis, lang)} color="primary" hasUnderline>
                      {s.thesis.title[lang]}
                    </Link>
                    <Text type="supporting" color="secondary">
                      {dict.cvThesisFocus}: {s.thesis.focus[lang].join(', ')}
                    </Text>
                  </VStack>
                ) : null}
              </VStack>
            </li>
          ))}
        </ol>
      </SplitSection>
      <SplitSection title={dict.cvEducationTitle} hasDivider>
        <ol className={styles.list}>
          {EDUCATION.map((e) => (
            <li key={e.id} id={e.id} className={styles.entry}>
              <Text type="supporting" color="secondary" className={styles.when}>
                {formatPeriod(e.start, e.end, lang)}
              </Text>
              <VStack gap={0.5}>
                <Heading level={3}>{e.degree[lang]}</Heading>
                <Text color="secondary">{e.school}</Text>
              </VStack>
            </li>
          ))}
        </ol>
      </SplitSection>
      <SplitSection title={dict.cvCertsTitle} hasDivider>
        <ul className={styles.list}>
          {CERTIFICATIONS.map((c) => (
            <li key={c.id} id={c.id} className={styles.entry}>
              <span className={styles.when}>
                <Gap id="cert-dates" lang={lang} />
              </span>
              <VStack gap={0.5}>
                <Heading level={3}>
                  <span lang={c.nameLang[lang]}>{c.name[lang]}</span>
                </Heading>
                <Text color="secondary">{c.issuer}</Text>
                {lang === 'en' && c.enTitle ? <Gap id={c.enTitle.gap} lang={lang} /> : null}
              </VStack>
            </li>
          ))}
        </ul>
      </SplitSection>
      <SplitSection title={dict.cvLanguagesTitle} hasDivider>
        <ul className={styles.list}>
          {LANGUAGES.value.map((l) => (
            <li key={l.code} className={styles.entry}>
              <Text weight="semibold" className={styles.when}>
                {l.name[lang]}
              </Text>
              <Text color="secondary">{l.level[lang]}</Text>
            </li>
          ))}
        </ul>
      </SplitSection>
      <SplitSection title={dict.cvSkillsTitle} hasDivider>
        <HStack gap={2} wrap="wrap">
          {FOCUS_LIST.value.map((s) => (
            <Token key={s} label={s} size="lg" />
          ))}
        </HStack>
      </SplitSection>
    </>
  );
}
