import { detailOr404 } from '@/components/detail-page';
import { getBySlug, getProjectSlugs } from '@/lib/ghost';

export async function generateStaticParams() {
  return (await getProjectSlugs('en')).map((slug) => ({ slug }));
}

export default async function ProjektDetailEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return detailOr404(await getBySlug(slug, 'en'), 'en');
}
