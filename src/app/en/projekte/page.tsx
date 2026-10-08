import type { Metadata } from 'next';
import { Section } from '@astryxdesign/core/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { PageHero } from '@/components/page-hero';
import { ContentCard } from '@/components/content-card';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMeta } from '@/lib/seo';
import { PROJECTS } from '@/content/profile';
import { projectCard } from '@/content/profile-view';

const page = getDictionary('en').pages.projekte;

export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/projekte',
  title: page.title,
  description: page.lede,
});

/** Projekte (Nutzerentscheidung: genau zwei, aus dem Content-Modell) – ohne Filter. */
export default function ProjektePage() {
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <Grid columns={{ minWidth: 300, max: 2 }} gap={4}>
          {PROJECTS.map((p, i) => (
            <ContentCard key={p.id} item={projectCard(p, 'en')} lang="en" headingAccessibilityLevel={2} eager={i < 2} />
          ))}
        </Grid>
      </Section>
    </>
  );
}
