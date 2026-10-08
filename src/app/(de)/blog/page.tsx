import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { PostList } from '@/components/post-list';
import { VStack } from '@astryxdesign/core/VStack';
import { Gap } from '@/components/gap';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getPostCards } from '@/lib/items';

export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/blog',
  title: getDictionary('de').pages.blog.title,
  description: getDictionary('de').pages.blog.lede,
});

export default async function BlogPage() {
  const dict = getDictionary('de');
  const posts = await getPostCards('de');
  return (
    <>
      <PageHero title={dict.pages.blog.title} lede={dict.pages.blog.lede} />
      <Section>
        <VStack gap={6}>
          <Gap id="blog-posts" lang="de" block />
          <PostList lang="de" posts={posts} />
        </VStack>
      </Section>
    </>
  );
}
