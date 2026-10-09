import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { GAPS } from '@/content/profile';
import styles from './content-status-content.module.css';

const SOURCES: Record<Lang, { name: string; text: string }[]> = {
  de: [
    { name: 'LinkedIn-Export (Profile.pdf, 08.10.2026)', text: 'Headline, Ort, Zusammenfassung, Stationen, Ausbildung, Sprachen, Zertifikate, Top-Kenntnisse, Schwerpunkte, Bachelorarbeit.' },
    { name: 'GitHub: YannickBeck/Abgabe_Orbitalis, YannickBeck/OrbitalisTicketSystem', text: 'README und Eigenleistungen/SUMMARY.md: Ausgangslage, neu gebaute Teile, Ablauf und Ergebnis von Orbitalis. Wer welche Teile gebaut hat, ist offen.' },
    { name: 'Fotos (vom Inhaber, ohne Metadaten)', text: 'Porträt, freigestellte Fassung, Ausschnitte für Karte und Avatar.' },
    { name: 'Logos im Periodensystem (Simple Icons über Better Icons)', text: 'Nur PHP (Colin Viebrock, CC BY-SA 4.0, einfarbig angepasst) und FastAPI (Sebastián Ramírez, MIT). Alle anderen Fähigkeiten zeigen ihr Kürzel; die Begründung steht in docs/skill-logos.md.' },
    { name: 'Ghost (cms.yannick-beck.de)', text: 'Blogbeiträge – die Website zeigt, was dort veröffentlicht ist, und erfindet keine Beiträge.' },
  ],
  en: [
    { name: 'LinkedIn export (Profile.pdf, 8 Oct 2026)', text: 'Headline, location, summary, positions, education, languages, certifications, top skills, focus list, bachelor’s thesis.' },
    { name: 'GitHub: YannickBeck/Abgabe_Orbitalis, YannickBeck/OrbitalisTicketSystem', text: 'README and Eigenleistungen/SUMMARY.md: starting point, added components, flow and outcome of Orbitalis. Who built which part is still open.' },
    { name: 'Photos (supplied by the owner, metadata removed)', text: 'Portrait, cut-out version, crops for card and avatar.' },
    { name: 'Logos in the periodic table (Simple Icons via Better Icons)', text: 'Only PHP (Colin Viebrock, CC BY-SA 4.0, single-colour adaptation) and FastAPI (Sebastián Ramírez, MIT). All other skills show their symbol; the reasoning is in docs/skill-logos.md.' },
    { name: 'Ghost (cms.yannick-beck.de)', text: 'Blog posts – the website shows what is published there and does not invent posts.' },
  ],
};

/**
 * Content-Status (noindex, Redesign B4): offene Angaben aus dem Content-Modell (GAPS) als
 * nummerierte Zeilen (Fundstelle, was gebraucht wird) und die Quellen der veröffentlichten
 * Angaben. Zeilen statt Karte je Eintrag (L7). Rechtstexte zeigen ihre offenen Angaben auch in
 * Produktion (legal.ts) – hier stehen sie als Lücken legal-imprint/legal-privacy.
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
                <Text color="secondary" textWrap="pretty">
                  <span className={styles.key}>{dict.statusColFormat}:</span> {g.need[lang]}
                </Text>
              </span>
            </li>
          ))}
        </ol>
      </Section>
      <SplitSection title={dict.statusSources} hasDivider>
        <ul className={styles.list}>
          {SOURCES[lang].map((s) => (
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
    </>
  );
}
