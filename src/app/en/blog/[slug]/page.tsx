import { detailOr404 } from '@/components/detail-page';
import { getBySlug, getPostSlugs } from '@/lib/ghost';

export async function generateStaticParams() {
  return (await getPostSlugs('en')).map((slug) => ({ slug }));
}

export default async function BlogDetailEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return detailOr404(await getBySlug(slug, 'en'), 'en');
}
