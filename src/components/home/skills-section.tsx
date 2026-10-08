import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Grid } from '@astryxdesign/core/Grid';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { SKILLS, SKILL_CATEGORIES } from '@/content/profile';
import { HomeSection } from './home-section';
import styles from './home.module.css';

/**
 * 02 Fähigkeiten – Gerüst (B1): Kacheln mit Kürzel je Kategorie als statische Liste (ohne JS
 * vollständig lesbar). Das interaktive Periodensystem mit Filter-Pillen, Tastatur-Auswahl und
 * Detailfeld („belegt durch“) ersetzt diese Darstellung; die Daten (Kürzel, Kategorie,
 * Belege) kommen schon jetzt aus SKILLS (profile.ts).
 */
export function SkillsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const h = getDictionary(lang).home;
  return (
    <HomeSection id={id} number={number} title={h.skillsTitle} lede={h.skillsLede}>
      <Grid columns={{ minWidth: 300, max: 3 }} gap={8}>
        {SKILL_CATEGORIES.map((cat) => (
          <VStack key={cat.id} gap={3}>
            <Text type="label" color="secondary" id={`${id}-${cat.id}`}>
              {cat.label[lang]}
            </Text>
            <ul className={styles.skillList} aria-labelledby={`${id}-${cat.id}`} data-category={cat.id}>
              {SKILLS.filter((s) => s.category === cat.id).map((s) => (
                <li key={s.id} className={styles.skillItem}>
                  <span className={`${styles.skillSymbol} yb-display`} aria-hidden="true">
                    {s.symbol}
                  </span>
                  <Text type="supporting" color="primary">
                    {s.name[lang]}
                  </Text>
                </li>
              ))}
            </ul>
          </VStack>
        ))}
      </Grid>
    </HomeSection>
  );
}
