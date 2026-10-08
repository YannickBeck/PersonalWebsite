import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { ACHIEVEMENTS } from '@/content/profile';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';
import { AchievementTicker } from './achievement-ticker';

/**
 * 05 Erfolge: nur mit belegten Einträgen (ACHIEVEMENTS, profile.ts) – sonst rendert die
 * Startseite den Abschnitt gar nicht (homeSections, auch nicht in der Navigation). In der
 * Vorschau ohne Einträge: Lücke. Mit Einträgen: Laufband (achievement-ticker.tsx); neue
 * Einträge brauchen nur das Content-Modell.
 */
export function AchievementsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const h = getDictionary(lang).home;
  return (
    <HomeSection id={id} number={number} title={h.achievementsTitle}>
      {ACHIEVEMENTS.length === 0 ? (
        <Gap id="achievements" lang={lang} block />
      ) : (
        <AchievementTicker
          items={ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title[lang], detail: a.detail?.[lang] }))}
          label={h.achievementsTitle}
          pauseLabel={h.achievementsPause}
          playLabel={h.achievementsPlay}
        />
      )}
    </HomeSection>
  );
}
