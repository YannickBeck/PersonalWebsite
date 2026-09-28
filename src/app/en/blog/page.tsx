import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { PostList } from '@/components/post-list';
import { getDictionary } from '@/i18n/dictionaries';
import { getPosts } from '@/lib/ghost';

export default async function BlogPageEn() {
  const dict = getDictionary('en');
  const posts = await getPosts('en');
  return (
    <>
      <PageHero title={dict.pages.blog.title} lede={dict.pages.blog.lede} />
      <Section variant="muted">
        <PostList
          lang="en"
          posts={posts}
          searchLabel={dict.searchLabel}
          searchPlaceholder={dict.searchPlaceholder}
        />
      </Section>
    </>
  );
}
