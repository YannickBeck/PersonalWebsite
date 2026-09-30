import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { detailOr404 } from '@/components/detail-page';
import { ArticleDetail } from '@/components/article-detail';
import { getBySlug, getPostSlugs } from '@/lib/ghost';
import { demoArticleBySlug, demoArticlesByLang } from '@/content/demo-articles';

export async function generateStaticParams() {
  const ghost = await getPostSlugs('en');
  const demo = demoArticlesByLang('en').map((a) => a.slug);
  return [...ghost, ...demo].map((slug) => ({ slug }));
}

async function metaFor(slug: string): Promise<Metadata> {
  const demo = demoArticleBySlug(slug, 'en');
  if (demo) {
    return {
      title: demo.title,
      description: demo.excerpt,
      robots: { index: false },
      ...pageMeta({
        lang: 'en',
        path: '/blog/' + slug,
        title: demo.title,
        description: demo.excerpt,
      }),
    };
  }
  const post = await getBySlug(slug, 'en');
  if (!post) {
    return {};
  }
  const canonical = pageMeta({
    lang: 'en',
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
      images: post.feature_image ? [post.feature_image] : undefined,
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

export default async function BlogDetailEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = demoArticleBySlug(slug, 'en');
  if (demo) {
    return <ArticleDetail lang="en" item={demo} />;
  }
  return detailOr404(await getBySlug(slug, 'en'), 'en');
}
