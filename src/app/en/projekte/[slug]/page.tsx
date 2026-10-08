import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { detailOr404 } from '@/components/detail-page';
import { ProjectDetail } from '@/components/project-detail';
import { getBySlug, getProjectSlugs } from '@/lib/ghost';
import { PROJECTS, projectBySlug } from '@/content/profile';

/**
 * Projekt-Details: die zwei Projekte aus dem Content-Modell; Ghost-Beiträge mit Tag
 * „project“ bleiben unter ihrer URL erreichbar (noindex, nicht gelistet – Nutzerentscheidung).
 */
/**
 * Nur die beim Build bekannten Slugs (dynamicParams = false): Unbekannte Slugs liefern die
 * statische 404 statt der leeren __next_error__-Hülle eines Laufzeit-notFound().
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const ghost = await getProjectSlugs('en');
  const own = PROJECTS.map((p) => p.slug.en);
  return [...own, ...ghost.filter((s) => !own.includes(s))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug, 'en');
  if (project) {
    return pageMeta({
      lang: 'en',
      path: '/projekte/' + slug,
      title: project.title.en,
      description: project.teaser.en,
      type: 'article',
    });
  }
  const post = await getBySlug(slug, 'en');
  if (!post) {
    return {};
  }
  return {
    ...pageMeta({
      lang: 'en',
      path: '/projekte/' + slug,
      title: post.title ?? slug,
      description: post.custom_excerpt || post.excerpt || undefined,
      noindex: true,
    }),
  };
}

export default async function ProjektDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug, 'en');
  if (project) {
    return <ProjectDetail lang="en" project={project} />;
  }
  return detailOr404(await getBySlug(slug, 'en'), 'en');
}
