import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { GhostHtml } from '@/components/ghost-html';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { CoverArt } from '@/components/cover-art';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getPosts, getProjects, type GhostItem } from '@/lib/ghost';

const DATE_LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };

function isProject(item: GhostItem): boolean {
  return (item.tags ?? []).some((t) => t.slug === 'project');
}

export async function DetailBody({ lang, item }: { lang: Lang; item: GhostItem }) {
  const dict = getDictionary(lang);
  const date = item.published_at
    ? new Intl.DateTimeFormat(DATE_LOCALE[lang], {
        dateStyle: 'long',
      }).format(new Date(item.published_at))
    : null;
  const pool = isProject(item) ? await getProjects(lang) : await getPosts(lang);
  const related = pool.filter((p) => p.slug !== item.slug).slice(0, 2);
  const kindPath = isProject(item) ? 'projekte' : 'blog';

  return (
    <>
      <PageHero title={item.title ?? item.slug} lede={date ?? ''} />
      <Section>
        <VStack gap={4}>
          <CoverArt seed={item.slug} />
          {item.html && <GhostHtml html={item.html} />}
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
                  label={p.title ?? p.slug}
                  href={withLang(`/${kindPath}/${p.slug}`, lang)}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <CoverArt seed={p.slug} />
                    <Heading level={3}>{p.title}</Heading>
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
          </VStack>
        </Section>
      )}
    </>
  );
}

export async function detailOr404(
  item: GhostItem | undefined,
  lang: Lang,
) {
  if (!item) {
    notFound();
  }
  return <DetailBody lang={lang} item={item} />;
}
