import { notFound } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { PageHero } from '@/components/page-hero';
import { GhostHtml } from '@/components/ghost-html';
import { ItemCover } from '@/components/item-cover';
import { coverMeta, coverSeed, formatDate } from '@/components/content-card';
import { RelatedCarousel } from '@/components/carousel-row';
import { MorphTarget } from '@/components/morph';
import { BackLink, ReadingLayout, tocFromHtml } from '@/components/reading-layout';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getPostCards, getProjectCards, ghostCategory, ghostTopics } from '@/lib/items';
import { TOPIC_LABELS } from '@/content/demo';
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
  const related = pool.filter((p) => p.slug !== item.slug).slice(0, 6);
  // Gleiche Kategorie-Marke wie auf der Karte (getProjectCards, FUN6) – sonst morpht das Cover
  // in eine andere Marke.
  const category = project ? ghostCategory(item) : undefined;
  const cover = coverMeta(
    {
      kind: project ? 'project' : 'post',
      slug: item.slug,
      title: item.title ?? item.slug,
      href: '',
      topics,
      category,
      categoryLabel: category ? TOPIC_LABELS[lang][category] : undefined,
    },
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
      <ReadingLayout
        toc={tocFromHtml(item.html)}
        tocTitle={dict.tocTitle}
        cover={
          <MorphTarget morphKey={withLang(`/${kindPath}/${item.slug}`, lang)}>
            <ItemCover
              src={item.feature_image}
              alt={item.feature_image_alt ?? ''}
              seed={coverSeed(item.slug, lang)}
              label={cover.label}
              motif={cover.motif}
              variant="hero"
              eager
            />
          </MorphTarget>
        }
      >
        {item.html && <GhostHtml html={item.html} lang={lang} />}
      </ReadingLayout>
      <RelatedCarousel title={dict.relatedTitle} items={related} lang={lang} />
    </>
  );
}

export async function detailOr404(item: GhostItem | undefined, lang: Lang) {
  if (!item) {
    notFound();
  }
  return <DetailBody lang={lang} item={item} />;
}
