import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { CERTIFICATIONS, EDUCATION, STATIONS, projectById } from '@/content/profile';
import { projectHref } from '@/content/profile-view';
import { formatPeriod } from '@/lib/period';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';
import styles from './home.module.css';

/**
 * 04 Werdegang & Weiterbildung – Gerüst (B1): Stationen, Ausbildung und Zertifikate als
 * ruhige Liste mit Zeiträumen. Die Fassung mit aufklappbaren Einträgen (dunkler Balken mit
 * Stichpunkten aus LinkedIn) ersetzt diese Darstellung.
 */
export function CareerSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const thesis = projectById('bachelorarbeit');
  return (
    <HomeSection
      id={id}
      number={number}
      title={h.careerTitle}
      lede={h.careerLede}
      aside={<Link href={withLang('/cv', lang)} hasUnderline color="primary">{dict.pages.cv.title}</Link>}
    >
      <VStack gap={10}>
        <VStack gap={3}>
          <Text type="label" color="secondary" id={`${id}-stations`}>
            {h.careerStations}
          </Text>
          <ol className={styles.timeline} aria-labelledby={`${id}-stations`}>
            {STATIONS.map((s) => (
              <li key={s.id} className={styles.timelineItem}>
                <Text type="supporting" color="secondary" className={styles.timelineWhen}>
                  {formatPeriod(s.start, s.end, lang)}
                </Text>
                <VStack gap={0.5}>
                  <Text weight="semibold">{s.role[lang]}</Text>
                  <Text color="secondary">
                    {s.org}
                    {s.place ? ` · ${s.place[lang]}` : ''}
                  </Text>
                  {s.thesis ? (
                    <Text type="supporting" color="secondary">
                      {h.careerThesis}:{' '}
                      <Link href={projectHref(thesis, lang)} color="primary" hasUnderline>
                        {s.thesis.title[lang]}
                      </Link>
                    </Text>
                  ) : null}
                </VStack>
              </li>
            ))}
          </ol>
        </VStack>
        <VStack gap={3}>
          <Text type="label" color="secondary" id={`${id}-education`}>
            {h.careerEducation}
          </Text>
          <ol className={styles.timeline} aria-labelledby={`${id}-education`}>
            {EDUCATION.map((e) => (
              <li key={e.id} className={styles.timelineItem}>
                <Text type="supporting" color="secondary" className={styles.timelineWhen}>
                  {formatPeriod(e.start, e.end, lang)}
                </Text>
                <VStack gap={0.5}>
                  <Text weight="semibold">{e.degree[lang]}</Text>
                  <Text color="secondary">{e.school}</Text>
                </VStack>
              </li>
            ))}
          </ol>
        </VStack>
        <VStack gap={3}>
          <Text type="label" color="secondary" id={`${id}-certs`}>
            {h.careerCerts}
          </Text>
          <ul className={styles.timeline} aria-labelledby={`${id}-certs`}>
            {CERTIFICATIONS.map((c) => (
              <li key={c.id} className={styles.timelineItem}>
                <HStack className={styles.timelineWhen}>
                  <Gap id="cert-dates" lang={lang} />
                </HStack>
                <VStack gap={0.5}>
                  <Text weight="semibold">
                    <span lang={c.nameLang[lang]}>{c.name[lang]}</span>
                  </Text>
                  <Text color="secondary">{c.issuer}</Text>
                  {lang === 'en' && c.enTitle ? <Gap id={c.enTitle.gap} lang={lang} /> : null}
                </VStack>
              </li>
            ))}
          </ul>
        </VStack>
      </VStack>
    </HomeSection>
  );
}
