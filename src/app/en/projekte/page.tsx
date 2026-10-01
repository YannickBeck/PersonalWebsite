import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { ProjectGrid } from '@/components/project-grid';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getProjectCards } from '@/lib/items';

export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/projekte',
  title: getDictionary('en').pages.projekte.title,
  description: getDictionary('en').pages.projekte.lede,
});

export default async function ProjectsPage() {
  const page = getDictionary('en').pages.projekte;
  const items = await getProjectCards('en');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <ProjectGrid lang="en" items={items} />
      </Section>
    </>
  );
}
