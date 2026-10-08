import { Grid } from '@astryxdesign/core/Grid';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { PROJECTS } from '@/content/profile';
import { projectCard } from '@/content/profile-view';
import { ContentCard } from '@/components/content-card';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';

/**
 * 03 Projekte – Gerüst (B1): die zwei Projekte aus dem Content-Modell als Karten mit
 * Detailseite. Das horizontale Akkordeon (Ausgangslage, Beitrag, Ergebnis, Links) ersetzt
 * diese Darstellung.
 */
export function ProjectsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const h = getDictionary(lang).home;
  return (
    <HomeSection id={id} number={number} title={h.projectsTitle} lede={h.projectsLede}>
      <Grid columns={{ minWidth: 300, max: 2 }} gap={4}>
        {PROJECTS.map((p) => (
          <ContentCard key={p.id} item={projectCard(p, lang)} lang={lang} />
        ))}
      </Grid>
      <Gap id="orbitalis-media" lang={lang} block />
    </HomeSection>
  );
}
