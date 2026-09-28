import type { Metadata } from "next";
import { detailOr404 } from '@/components/detail-page';
import { getBySlug, getProjectSlugs } from '@/lib/ghost';

export async function generateStaticParams() {
  return (await getProjectSlugs('de')).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBySlug(slug, 'de');
  if (!post) {
    return {};
  }
  return {
    title: post.title,
    description: post.custom_excerpt || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.custom_excerpt || post.excerpt || undefined,
      images: post.feature_image ? [post.feature_image] : undefined,
    },
  };
}

export default async function ProjektDetail({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return detailOr404(await getBySlug(slug, 'de'), 'de');
}
