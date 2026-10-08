import type { Metadata } from 'next';
import { ogImageUrl, pageMeta } from '@/lib/seo';
import { detailOr404 } from '@/components/detail-page';
import { ArticleDetail } from '@/components/article-detail';
import { getBySlug, getPostSlugs } from '@/lib/ghost';
import { demoArticleBySlug, demoArticlesByLang } from '@/content/demo-articles';
import { SHOW_GAPS } from '@/lib/gaps';

export async function generateStaticParams() {
  const ghost = await getPostSlugs('de');
  // Demo-Artikel nur in der Vorschau (NEXT_PUBLIC_SHOW_GAPS=1)
  const demo = SHOW_GAPS ? demoArticlesByLang('de').map((a) => a.slug) : [];
  return [...ghost, ...demo].map((slug) => ({ slug }));
}

async function metaFor(slug: string): Promise<Metadata> {
  const demo = SHOW_GAPS ? demoArticleBySlug(slug, 'de') : undefined;
  if (demo) {
    return {
      title: demo.title,
      description: demo.excerpt,
      robots: { index: false },
      ...pageMeta({
        lang: 'de',
        path: '/blog/' + slug,
        title: demo.title,
        description: demo.excerpt,
      }),
    };
  }
  const post = await getBySlug(slug, 'de');
  if (!post) {
    return {};
  }
  const canonical = pageMeta({
    type: 'article',
    lang: 'de',
    path: '/blog/' + slug,
    title: post.title ?? slug,
    description: post.custom_excerpt || post.excerpt || undefined,
  });
  return {
    title: post.title,
    description: post.custom_excerpt || post.excerpt || undefined,
    alternates: canonical.alternates,
    openGraph: {
      title: post.title,
      description: post.custom_excerpt || post.excerpt || undefined,
      type: 'article',
      images: post.feature_image ? [post.feature_image] : [ogImageUrl('de')],
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metaFor(slug);
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = SHOW_GAPS ? demoArticleBySlug(slug, 'de') : undefined;
  if (demo) {
    return <ArticleDetail lang="de" item={demo} />;
  }
  return detailOr404(await getBySlug(slug, 'de'), 'de');
}
