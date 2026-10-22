import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { GAPS } from '@/content/profile';
import { SHOW_GAPS } from '@/lib/gaps';
import { STATUS_SOURCES } from '@/content/status-sources';
import styles from './content-status-content.module.css';


/**
 * Content-Status (noindex, Redesign B4): offene Angaben aus dem Content-Modell (GAPS) als
 * nummerierte Zeilen (Fundstelle, was gebraucht wird) und die Quellen der veröffentlichten
 * Angaben. Zeilen statt Karte je Eintrag (L7). Rechtstexte zeigen ihre offenen Angaben auch in
 * Produktion (legal.ts) – hier stehen sie als Lücken legal-imprint/legal-privacy.
 *
 * Produktion (Abschluss-Fixes TEX2): nur Kennung, Titel, Lede und je Lücke Bezeichnung und
 * Fundstelle. „Benötigt“ und die Quellen sind Arbeitsanweisungen an Yannick (Variablennamen,
 * Abstimmungen, Fragen in der zweiten Person) – Besucher bezogen das „dir“ auf sich. Sie stehen
 * nur im Vorschau-Build (NEXT_PUBLIC_SHOW_GAPS=1). Die URL bleibt in beiden Builds erreichbar.
 */
export function ContentStatusContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  return (
    <>
      <PageHero kicker={dict.statusKicker} title={dict.statusTitle} lede={dict.statusLede} size="lg" />
      <Section>
        <ol className={styles.list}>
          {GAPS.map((g, i) => (
            <li key={g.id} id={`gap-${g.id}`} className={styles.row}>
              <span className={`${styles.n} yb-display`} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.what}>
                <Heading level={2} className={styles.label}>
                  {g.label[lang]}
                </Heading>
                <Text color="secondary">
                  <span className={styles.key}>{dict.statusColWhere}:</span> {g.where[lang]}
                </Text>
                {SHOW_GAPS ? (
                  <Text color="secondary" textWrap="pretty">
                    <span className={styles.key}>{dict.statusColFormat}:</span> {g.need[lang]}
                  </Text>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </Section>
      {SHOW_GAPS ? (
        <SplitSection title={dict.statusSources} hasDivider>
          <ul className={styles.list}>
            {STATUS_SOURCES[lang].map((s) => (
              <li key={s.name} className={`${styles.row} ${styles.rowPlain}`}>
                <span className={styles.what}>
                  <Text weight="semibold">{s.name}</Text>
                  <Text color="secondary" textWrap="pretty">
                    {s.text}
                  </Text>
                </span>
              </li>
            ))}
          </ul>
        </SplitSection>
      ) : null}
    </>
  );
}
