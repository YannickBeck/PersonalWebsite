import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { PageHero } from '@/components/page-hero';
import { ArticleBody, tocFromArticle } from '@/components/article-body';
import { ItemCover } from '@/components/item-cover';
import { CARD_COLUMNS, ContentCard, coverMeta, formatDate } from '@/components/content-card';
import { SectionHeader } from '@/components/section-header';
import { BackLink, ReadingLayout } from '@/components/reading-layout';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getPostCards } from '@/lib/items';
import { TOPIC_LABELS } from '@/content/demo';
import type { DemoArticle } from '@/content/demo-articles';

/** Demo-Artikel: gleiche Lesespalte wie Ghost-Artikel, Inhaltsverzeichnis in der Randspalte. */
export async function ArticleDetail({ lang, item }: { lang: Lang; item: DemoArticle }) {
  const dict = getDictionary(lang);
  const topics = item.topics.map((t) => ({ slug: t, label: TOPIC_LABELS[lang][t] ?? t }));
  const related = (await getPostCards(lang)).filter((a) => a.slug !== item.slug).slice(0, 3);
  const cover = coverMeta({ kind: 'post', slug: item.slug, title: item.title, href: '', topics }, lang);

  return (
    <>
      <PageHero
        eyebrow={<BackLink href={withLang('/blog', lang)} label={dict.backToBlog} />}
        title={item.title}
        lede={item.excerpt}
        meta={
          <HStack gap={3} wrap="wrap" vAlign="center">
            <Text type="supporting">
              {formatDate(item.date, lang, 'long')} · {item.readingMinutes} {dict.readingMinutes}
            </Text>
            <HStack gap={1.5} wrap="wrap">
              <Token label={dict.demoToken} size="sm" className="print-hide" />
              {topics.map((t) => (
                <Token key={t.slug} label={t.label} size="sm" />
              ))}
            </HStack>
          </HStack>
        }
      />
      <ReadingLayout toc={tocFromArticle(item)} tocTitle={dict.tocTitle}>
        <ItemCover src={item.image} seed={item.slug} label={cover.label} motif={cover.motif} variant="hero" priority />
        <ArticleBody article={item} />
      </ReadingLayout>

      {related.length > 0 && (
        <Section>
          <VStack gap={6}>
            <SectionHeader title={dict.relatedTitle} />
            <Grid columns={CARD_COLUMNS} gap={4}>
              {related.map((p) => (
                <ContentCard key={p.slug} item={p} lang={lang} />
              ))}
            </Grid>
          </VStack>
        </Section>
      )}
    </>
  );
}
