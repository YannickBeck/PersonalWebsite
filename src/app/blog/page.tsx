export const revalidate = 60;
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { PostList } from '@/components/post-list';
import { getDictionary } from '@/i18n/dictionaries';
import { getPosts } from '@/lib/ghost';
import type { Metadata } from "next";
const meta = getDictionary('de').pages.blog;
export const metadata: Metadata = { title: meta.title, description: meta.lede };


export default async function BlogPage() {
  const dict = getDictionary('de');
  const posts = await getPosts('de');
  return (
    <>
      <PageHero title={dict.pages.blog.title} lede={dict.pages.blog.lede} />
      <Section variant="muted">
        <PostList
          lang="de"
          posts={posts}
          searchLabel={dict.searchLabel}
          searchPlaceholder={dict.searchPlaceholder}
        />
      </Section>
    </>
  );
}
