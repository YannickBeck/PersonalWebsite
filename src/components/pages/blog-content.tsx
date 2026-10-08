import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { PageHero } from '@/components/page-hero';
import { PostList } from '@/components/post-list';
import { Gap } from '@/components/gap';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getPostCards } from '@/lib/items';

/**
 * Blog (DE + EN, Redesign B4): Kopf wie alle Unterseiten, Beiträge aus Ghost (Demo-Artikel nur
 * in der Vorschau). Suche und Themenfilter erst ab vier Beiträgen (post-list.tsx) – bei ein,
 * zwei Beiträgen wären es Bedienelemente ohne Nutzen. RSS-Feed als Dokument-Link.
 */
export async function BlogContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.blog;
  const posts = await getPostCards(lang);
  return (
    <>
      <PageHero
        kicker={page.title}
        title={dict.blogTitle}
        lede={page.lede}
        meta={
          <Text color="secondary">
            <Link href={withLang('/rss.xml', lang)} color="primary" hasUnderline>
              {dict.blogRss}
            </Link>
          </Text>
        }
      />
      <Section>
        <VStack gap={6}>
          <Gap id="blog-posts" lang={lang} block />
          <PostList lang={lang} posts={posts} />
        </VStack>
      </Section>
    </>
  );
}
