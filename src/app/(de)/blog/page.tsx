import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMeta } from '@/lib/seo';
import { BlogContent } from '@/components/pages/blog-content';

const page = getDictionary('de').pages.blog;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/blog',
  title: page.title,
  description: page.lede,
});

export default function BlogPage() {
  return <BlogContent lang="de" />;
}
