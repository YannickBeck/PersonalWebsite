import { notFound } from 'next/navigation';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { PageHero } from '@/components/page-hero';
import { GhostHtml } from '@/components/ghost-html';
import { ItemCover } from '@/components/item-cover';
import { CARD_COLUMNS, ContentCard, coverMeta, formatDate } from '@/components/content-card';
import { SectionHeader } from '@/components/section-header';
import { BackLink, ReadingLayout, tocFromHtml } from '@/components/reading-layout';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getPostCards, getProjectCards, ghostTopics } from '@/lib/items';
import type { GhostItem } from '@/lib/ghost';

function isProject(item: GhostItem): boolean {
  return (item.tags ?? []).some((t) => t.slug === 'project');
}

/** Ghost-Detailseite (echte Projekte/Posts): Lesespalte, echtes feature_image oder CoverArt. */
export async function DetailBody({ lang, item }: { lang: Lang; item: GhostItem }) {
  const dict = getDictionary(lang);
  const project = isProject(item);
  const kindPath = project ? 'projekte' : 'blog';
  const topics = ghostTopics(item, lang);
  const pool = project ? await getProjectCards(lang) : await getPostCards(lang);
  const related = pool.filter((p) => p.slug !== item.slug).slice(0, 3);
  const cover = coverMeta(
    { kind: project ? 'project' : 'post', slug: item.slug, title: item.title ?? item.slug, href: '', topics },
    lang,
  );
  const meta = [
    item.published_at ? formatDate(item.published_at, lang, 'long') : null,
    !project && item.reading_time ? `${item.reading_time} ${dict.readingMinutes}` : null,
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={
          <BackLink
            href={withLang(`/${kindPath}`, lang)}
            label={project ? dict.backToProjects : dict.backToBlog}
          />
        }
        title={item.title ?? item.slug}
        lede={item.custom_excerpt || undefined}
        meta={
          meta.length > 0 || topics.length > 0 ? (
            <HStack gap={3} wrap="wrap" vAlign="center">
              {meta.length > 0 ? <Text type="supporting">{meta.join(' · ')}</Text> : null}
              {topics.length > 0 ? (
                <HStack gap={1.5} wrap="wrap">
                  {topics.map((t) => (
                    <Token key={t.slug} label={t.label} size="sm" />
                  ))}
                </HStack>
              ) : null}
            </HStack>
          ) : undefined
        }
      />
      <ReadingLayout toc={tocFromHtml(item.html)} tocTitle={dict.tocTitle}>
        <ItemCover
          src={item.feature_image}
          alt={item.feature_image_alt ?? ''}
          seed={item.slug}
          label={cover.label}
          motif={cover.motif}
          variant="hero"
          priority
        />
        {item.html && <GhostHtml html={item.html} />}
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

export async function detailOr404(item: GhostItem | undefined, lang: Lang) {
  if (!item) {
    notFound();
  }
  return <DetailBody lang={lang} item={item} />;
}
