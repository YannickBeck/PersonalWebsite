import type { Metadata } from 'next';
import { ogImageUrl, pageMeta } from '@/lib/seo';
import { detailOr404 } from '@/components/detail-page';
import { ArticleDetail } from '@/components/article-detail';
import { getPostBySlug, getPostSlugs } from '@/lib/ghost';
import { demoArticleBySlug, demoArticlesByLang } from '@/content/demo-articles';
import { SHOW_GAPS } from '@/lib/gaps';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateStaticParams() {
  const ghost = await getPostSlugs('en');
  // Demo-Artikel nur in der Vorschau (NEXT_PUBLIC_SHOW_GAPS=1)
  const demo = SHOW_GAPS ? demoArticlesByLang('en').map((a) => a.slug) : [];
  return [...ghost, ...demo].map((slug) => ({ slug }));
}

async function metaFor(slug: string): Promise<Metadata> {
  const demo = SHOW_GAPS ? demoArticleBySlug(slug, 'en') : undefined;
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
  const post = await getPostBySlug(slug, 'en');
  if (!post) {
    // Unbekannter Slug: Den fängt src/proxy.ts ab (statische globale 404). Hierher kommt er nur,
    // wenn der Proxy Ghost nicht erreicht – dann gilt wenigstens der 404-Titel.
    return { title: getDictionary('en').notFoundTitle, robots: { index: false } };
  }
  const canonical = pageMeta({
    type: 'article',
    lang: 'en',
    path: '/blog/' + slug,
    title: post.title ?? slug,
    description: post.custom_excerpt || post.excerpt || undefined,
  });
  return {
    title: post.title,
    description: post.custom_excerpt || post.excerpt || undefined,
    alternates: canonical.alternates,
    // noindex, solange der Blog nicht gelistet ist (routes.ts UNLISTED_ROUTES, JURY1-4)
    robots: canonical.robots,
    openGraph: {
      title: post.title,
      description: post.custom_excerpt || post.excerpt || undefined,
      type: 'article',
      images: post.feature_image ? [post.feature_image] : [ogImageUrl('en')],
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
  const demo = SHOW_GAPS ? demoArticleBySlug(slug, 'en') : undefined;
  if (demo) {
    return <ArticleDetail lang="en" item={demo} />;
  }
  return detailOr404(await getPostBySlug(slug, 'en'), 'en');
}
