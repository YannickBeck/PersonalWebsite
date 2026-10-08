import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { ItemCover } from '@/components/item-cover';
import { coverMeta, coverSeed } from '@/components/content-card';
import { RelatedCarousel } from '@/components/carousel-row';
import { MorphTarget } from '@/components/morph';
import { BackLink, ReadingLayout } from '@/components/reading-layout';
import { Gap } from '@/components/gap';
import { SHOW_GAPS } from '@/lib/gaps';
import { ExternalArrow } from '@/components/icons';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { PROJECTS, type Project } from '@/content/profile';
import { projectCard } from '@/content/profile-view';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <VStack gap={3}>
      <Heading level={2}>{title}</Heading>
      {children}
    </VStack>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn',
  'github:YannickBeck/Abgabe_Orbitalis': 'GitHub · Abgabe_Orbitalis',
  'github:YannickBeck/OrbitalisTicketSystem': 'GitHub · OrbitalisTicketSystem',
};

/**
 * Projekt-Detailseite aus dem Content-Modell (Orbitalis, Bachelorarbeit): Lesespalte mit
 * Ausgangslage, Beitrag, Ergebnis; Fakten und Quellcode-Links in der Randspalte (mobil vor
 * dem Text). Offene Angaben erscheinen nur in der Vorschau. Cover generativ (kein echtes Bild),
 * Ziel des Morphs von der Karte.
 */
export function ProjectDetail({ lang, project }: { lang: Lang; project: Project }) {
  const dict = getDictionary(lang);
  const card = projectCard(project, lang);
  const cover = coverMeta(card, lang);
  const related = PROJECTS.filter((p) => p.id !== project.id).map((p) => projectCard(p, lang));
  const period = project.period.status === 'belegt' ? project.period.value[lang] : null;
  const context = project.context.status === 'belegt' ? project.context.value[lang] : null;

  return (
    <>
      <PageHero
        eyebrow={<BackLink href={withLang('/projekte', lang)} label={dict.backToProjects} />}
        title={project.title[lang]}
        lede={project.teaser[lang]}
        meta={
          <HStack gap={1.5} wrap="wrap">
            <Token label={project.kind[lang]} size="sm" />
            {period ? <Token label={period} size="sm" /> : null}
          </HStack>
        }
      />
      <ReadingLayout
        tocTitle={dict.tocTitle}
        cover={
          <MorphTarget morphKey={card.href}>
            <ItemCover src={null} seed={coverSeed(card.slug, lang)} label={cover.label} motif={cover.motif} variant="hero" eager />
          </MorphTarget>
        }
        aside={
          <Card>
            <MetadataList label={{ position: 'top' }}>
              <MetadataListItem label={dict.factsKind}>
                <Text>{project.kind[lang]}</Text>
              </MetadataListItem>
              {/* Offene Fakten: in Produktion ohne Zeile (kein leeres Label), in der Vorschau als Lücke */}
              {period || SHOW_GAPS ? (
                <MetadataListItem label={dict.factsPeriod}>
                  {project.period.status === 'belegt' ? (
                    <Text>{project.period.value[lang]}</Text>
                  ) : (
                    <Gap id={project.period.gap} lang={lang} />
                  )}
                </MetadataListItem>
              ) : null}
              {context || SHOW_GAPS ? (
                <MetadataListItem label={dict.factsContext}>
                  {project.context.status === 'belegt' ? (
                    <Text>{project.context.value[lang]}</Text>
                  ) : (
                    <Gap id={project.context.gap} lang={lang} />
                  )}
                </MetadataListItem>
              ) : null}
              <MetadataListItem label={dict.factsStack}>
                <HStack gap={1.5} wrap="wrap">
                  {project.tags.map((t) => (
                    <Token key={t} label={t} size="sm" />
                  ))}
                </HStack>
              </MetadataListItem>
              {project.links.length > 0 ? (
                <MetadataListItem label={dict.factsCode}>
                  <VStack gap={1}>
                    {project.links.map((l) => (
                      <Link key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" color="primary" hasUnderline>
                        <HStack gap={1} vAlign="center" as="span">
                          {l.label[lang]}
                          <ExternalArrow />
                        </HStack>
                      </Link>
                    ))}
                  </VStack>
                </MetadataListItem>
              ) : null}
            </MetadataList>
          </Card>
        }
      >
        <Block title={dict.sectionSituation}>
          {project.situation.value[lang].map((p) => (
            <Text key={p.slice(0, 32)} as="p" textWrap="pretty">
              {p}
            </Text>
          ))}
        </Block>
        <Block title={dict.sectionContribution}>
          <List listStyle="disc" density="compact">
            {project.contribution.value[lang].map((c) => (
              <ListItem key={c.slice(0, 32)} label={<Text textWrap="pretty">{c}</Text>} />
            ))}
          </List>
        </Block>
        {project.result.status === 'belegt' ? (
          <Block title={dict.sectionOutcome}>
            {project.result.value[lang].map((p) => (
              <Text key={p.slice(0, 32)} as="p" textWrap="pretty">
                {p}
              </Text>
            ))}
            {project.gaps
              .filter((g) => g === 'orbitalis-result' || g === 'orbitalis-media')
              .map((g) => (
                <Gap key={g} id={g} lang={lang} block />
              ))}
          </Block>
        ) : (
          // Ergebnis offen: in Produktion entfällt der Block ganz (keine leere Überschrift)
          <Gap id={project.result.gap} lang={lang} block />
        )}
        {project.gaps.includes('thesis-link') ? <Gap id="thesis-link" lang={lang} block /> : null}
        <Text type="supporting" color="secondary">
          {dict.factsSource}: {project.quellen.map((q) => SOURCE_LABEL[q] ?? q).join(' · ')}
        </Text>
      </ReadingLayout>
      <RelatedCarousel title={dict.relatedTitle} items={related} lang={lang} />
    </>
  );
}
