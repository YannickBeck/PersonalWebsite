import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { List, ListItem } from '@astryxdesign/core/List';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { ItemCover } from '@/components/item-cover';
import { coverMeta, coverSeed } from '@/components/content-card';
import { GalleryCarousel, RelatedCarousel } from '@/components/carousel-row';
import { MorphTarget } from '@/components/morph';
import { BackLink, ReadingLayout } from '@/components/reading-layout';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getProjectCards } from '@/lib/items';
import { realImage } from '@/lib/images';
import type { DemoProject } from '@/content/demo';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <VStack gap={3}>
      <Heading level={2}>{title}</Heading>
      {children}
    </VStack>
  );
}

/**
 * Demo-Projekt als Fallstudie: Lesespalte mit Abschnitten, Fakten in der Randspalte
 * (mobil vor dem Text). Statt Card je Schritt/Entscheidung echte Listen (L7/VV4).
 * Galerie nur mit echten Bildern – Platzhalter-SVGs gelten als „kein Bild“ (V6).
 * B3: Galerie und „Das könnte dich auch interessieren“ als Karussell, Hero-Cover ist
 * Ziel des Morphs von der geklickten Karte.
 */
export async function ProjectDetail({ lang, item }: { lang: Lang; item: DemoProject }) {
  const dict = getDictionary(lang);
  const related = (await getProjectCards(lang)).filter((p) => p.slug !== item.slug).slice(0, 6);
  const cover = coverMeta(
    { kind: 'project', slug: item.slug, title: item.title, href: '', category: item.category, categoryLabel: item.categoryLabel },
    lang,
  );
  const gallery = item.gallery.filter((g) => realImage(g.src));

  return (
    <>
      <PageHero
        eyebrow={<BackLink href={withLang('/projekte', lang)} label={dict.backToProjects} />}
        title={item.title}
        lede={item.excerpt}
        meta={
          <HStack gap={1.5} wrap="wrap">
            <Token label={dict.demoToken} size="sm" className="print-hide" />
            <Token label={item.categoryLabel} size="sm" />
          </HStack>
        }
      />
      <ReadingLayout
        tocTitle={dict.tocTitle}
        cover={
          <MorphTarget morphKey={withLang(`/projekte/${item.slug}`, lang)}>
            <ItemCover src={item.cover} seed={coverSeed(item.slug, lang)} label={cover.label} motif={cover.motif} variant="hero" eager />
          </MorphTarget>
        }
        aside={
          <Card>
            <MetadataList label={{ position: 'top' }}>
              <MetadataListItem label={dict.factsRole}>
                <Text>{item.role}</Text>
              </MetadataListItem>
              <MetadataListItem label={dict.factsTimeframe}>
                <Text>{item.timeframe}</Text>
              </MetadataListItem>
              <MetadataListItem label={dict.factsStack}>
                <HStack gap={1.5} wrap="wrap">
                  {item.technologies.map((t) => (
                    <Token key={t} label={t} size="sm" />
                  ))}
                </HStack>
              </MetadataListItem>
            </MetadataList>
          </Card>
        }
      >
        <Block title={dict.sectionSituation}>
          {item.situation.map((p, i) => (
            <Text key={i} as="p" textWrap="pretty">
              {p}
            </Text>
          ))}
        </Block>
        <Block title={dict.sectionGoal}>
          <List listStyle="disc" density="compact">
            {item.goal.map((g) => (
              <ListItem key={g} label={<Text>{g}</Text>} />
            ))}
          </List>
        </Block>
        <Block title={dict.sectionApproach}>
          <Card padding={2}>
            <List hasDividers density="spacious">
              {item.approach.map((a) => (
                <ListItem
                  key={a.title}
                  label={<Text weight="semibold">{a.title}</Text>}
                  description={<Text color="secondary">{a.text}</Text>}
                />
              ))}
            </List>
          </Card>
        </Block>
        <Block title={dict.sectionDecisions}>
          <Card padding={2}>
            <List hasDividers density="spacious">
              {item.decisions.map((d) => (
                <ListItem
                  key={d.decision}
                  label={<Text weight="semibold">{d.decision}</Text>}
                  description={<Text color="secondary">{d.reason}</Text>}
                />
              ))}
            </List>
          </Card>
        </Block>
        <Block title={dict.sectionChallenges}>
          <List listStyle="disc" density="compact">
            {item.challenges.map((c) => (
              <ListItem key={c} label={<Text>{c}</Text>} />
            ))}
          </List>
        </Block>
        <Block title={dict.sectionOutcome}>
          {item.outcomeOpen ? (
            <HStack>
              <Token label={dict.outcomeOpenLabel} size="sm" className="print-hide" />
            </HStack>
          ) : null}
          <Text as="p" textWrap="pretty">
            {item.outcome}
          </Text>
        </Block>
      </ReadingLayout>

      <GalleryCarousel title={dict.galleryTitle} images={gallery} lang={lang} />
      <RelatedCarousel title={dict.relatedTitle} items={related} lang={lang} />
    </>
  );
}
