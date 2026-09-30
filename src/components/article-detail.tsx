import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Link } from '@astryxdesign/core/Link';
import { DemoBadge } from '@/components/demo-badge';
import { ArticleBody } from '@/components/article-body';
import { ItemCover } from '@/components/item-cover';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { demoArticlesByLang, type DemoArticle } from '@/content/demo-articles';

const DATE_LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };

export function ArticleDetail({ lang, item }: { lang: Lang; item: DemoArticle }) {
  const dict = getDictionary(lang);
  const date = new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    dateStyle: 'long',
  }).format(new Date(item.date));
  const related = demoArticlesByLang(lang)
    .filter((a) => a.slug !== item.slug)
    .slice(0, 2);

  return (
    <>
      <PageHero title={item.title} lede={item.excerpt} />
      <Section>
        <VStack gap={3}>
          <DemoBadge lang={lang} />
          <Text color="secondary" type="supporting">
            {date} · {item.readingMinutes} Min.
          </Text>
          <ArticleBody lang={lang} article={item} />
        </VStack>
      </Section>

      {related.length > 0 && (
        <Section variant="muted">
          <VStack gap={3}>
            <Heading level={2}>{dict.relatedTitle}</Heading>
            <Grid columns={{ minWidth: 260 }} gap={3}>
              {related.map((p) => (
                <ClickableCard
                  key={p.slug}
                  label={p.title}
                  href={withLang(`/blog/${p.slug}`, lang)}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <ItemCover src={p.image} alt={p.title} seed={p.slug} />
                    <DemoBadge lang={lang} />
                    <Heading level={3}>{p.title}</Heading>
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
          </VStack>
        </Section>
      )}

      <Section>
        <Link href={withLang('/blog', lang)}>{dict.backToBlog}</Link>
      </Section>
    </>
  );
}
