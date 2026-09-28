import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { ProjectList } from '@/components/project-list';
import { getDictionary } from '@/i18n/dictionaries';

export default function ProjektePage() {
  const page = getDictionary('de').pages.projekte;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <ProjectList lang="de" />
      </Section>
    </>
  );
}
