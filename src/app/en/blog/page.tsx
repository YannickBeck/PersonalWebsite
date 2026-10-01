import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { PostList } from '@/components/post-list';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getPostCards } from '@/lib/items';

export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/blog',
  title: getDictionary('en').pages.blog.title,
  description: getDictionary('en').pages.blog.lede,
});

export default async function BlogPageEn() {
  const dict = getDictionary('en');
  const posts = await getPostCards('en');
  return (
    <>
      <PageHero title={dict.pages.blog.title} lede={dict.pages.blog.lede} />
      <Section>
        <PostList lang="en" posts={posts} />
      </Section>
    </>
  );
}
