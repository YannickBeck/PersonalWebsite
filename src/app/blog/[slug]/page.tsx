import { detailOr404 } from '@/components/detail-page';
import { getBySlug, getPostSlugs } from '@/lib/ghost';

export async function generateStaticParams() {
  return (await getPostSlugs('de')).map((slug) => ({ slug }));
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return detailOr404(await getBySlug(slug, 'de'), 'de');
}
