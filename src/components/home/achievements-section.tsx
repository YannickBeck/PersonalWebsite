import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { ACHIEVEMENTS } from '@/content/profile';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';

/**
 * 05 Erfolge: nur mit belegten Einträgen (ACHIEVEMENTS, profile.ts) – sonst rendert die
 * Startseite den Abschnitt gar nicht (homeSections). In der Vorschau ohne Einträge: Lücke.
 * Das Laufband (Pause-Schalter, Klone inert, reduce statisch) ersetzt die Liste.
 */
export function AchievementsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const h = getDictionary(lang).home;
  return (
    <HomeSection id={id} number={number} title={h.achievementsTitle}>
      {ACHIEVEMENTS.length === 0 ? (
        <Gap id="achievements" lang={lang} block />
      ) : (
        <VStack as="ul" gap={3}>
          {ACHIEVEMENTS.map((a) => (
            <li key={a.id}>
              <Text weight="semibold">{a.title[lang]}</Text>
              {a.detail ? <Text color="secondary"> – {a.detail[lang]}</Text> : null}
            </li>
          ))}
        </VStack>
      )}
    </HomeSection>
  );
}
