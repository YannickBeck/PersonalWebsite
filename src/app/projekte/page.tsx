import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { ProjectGrid } from '@/components/project-grid';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getProjectCards } from '@/lib/items';

export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/projekte',
  title: getDictionary('de').pages.projekte.title,
  description: getDictionary('de').pages.projekte.lede,
});

export default async function ProjektePage() {
  const page = getDictionary('de').pages.projekte;
  const items = await getProjectCards('de');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <ProjectGrid lang="de" items={items} />
      </Section>
    </>
  );
}
