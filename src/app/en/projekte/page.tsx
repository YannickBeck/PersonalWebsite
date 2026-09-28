export const revalidate = 60;
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { ProjectList } from '@/components/project-list';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from "next";
const meta = getDictionary('en').pages.projekte;
export const metadata: Metadata = { title: meta.title, description: meta.lede };


export default function ProjectsPage() {
  const page = getDictionary('en').pages.projekte;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <ProjectList lang="en" />
      </Section>
    </>
  );
}
