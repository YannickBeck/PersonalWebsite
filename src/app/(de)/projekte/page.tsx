import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { ProjectsContent } from '@/components/pages/projects-content';

const page = getDictionary('de').pages.projekte;

export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/projekte',
  title: page.title,
  description: page.lede,
});

/** Projekte (Nutzerentscheidung: genau zwei, aus dem Content-Modell) – ohne Filter. */
export default function ProjektePage() {
  return <ProjectsContent lang="de" />;
}
