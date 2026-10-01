import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Link } from '@astryxdesign/core/Link';
import { DemoBadge } from '@/components/demo-badge';
import { ItemCover } from '@/components/item-cover';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { demoProjectsByLang, type DemoProject } from '@/content/demo';

export function ProjectDetail({ lang, item }: { lang: Lang; item: DemoProject }) {
  const dict = getDictionary(lang);
  const related = demoProjectsByLang(lang)
    .filter((p) => p.slug !== item.slug)
    .slice(0, 2);

  return (
    <>
      <PageHero title={item.title} lede={item.excerpt} />
      <Section>
        <VStack gap={4}>
          <DemoBadge lang={lang} />
          <Image
            src={item.cover}
            alt={item.title}
            width={1280}
            height={800}
            sizes="(max-width: 768px) 100vw, 960px"
            style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
          />
          <Grid columns={{ minWidth: 220 }} gap={3}>
            <VStack gap={1}>
              <Text type="label">{dict.factsRole}</Text>
              <Text>{item.role}</Text>
            </VStack>
            <VStack gap={1}>
              <Text type="label">{dict.factsTimeframe}</Text>
              <Text>{item.timeframe}</Text>
            </VStack>
            <VStack gap={1}>
              <Text type="label">{dict.factsStack}</Text>
              <Text>{item.technologies.join(' · ')}</Text>
            </VStack>
          </Grid>
        </VStack>
      </Section>

      <Section variant="muted">
        <VStack gap={4}>
          <VStack gap={2}>
            <Heading level={2}>{dict.sectionSituation}</Heading>
            {item.situation.map((p, i) => (
              <Text key={i}>{p}</Text>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>{dict.sectionGoal}</Heading>
            {item.goal.map((p, i) => (
              <Text key={i}>{p}</Text>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>{dict.sectionApproach}</Heading>
            {item.approach.map((a) => (
              <Card key={a.title}>
                <VStack gap={1}>
                  <Heading level={3}>{a.title}</Heading>
                  <Text color="secondary">{a.text}</Text>
                </VStack>
              </Card>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>{dict.sectionDecisions}</Heading>
            {item.decisions.map((d) => (
              <Card key={d.decision} variant="muted">
                <VStack gap={1}>
                  <Text weight="semibold">{d.decision}</Text>
                  <Text color="secondary">{d.reason}</Text>
                </VStack>
              </Card>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>{dict.sectionChallenges}</Heading>
            {item.challenges.map((c, i) => (
              <Text key={i}>{c}</Text>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>{dict.sectionOutcome}</Heading>
            {item.outcomeOpen && <DemoBadge lang={lang} />}
            <Text>{item.outcome}</Text>
          </VStack>
        </VStack>
      </Section>

      <Section>
        <VStack gap={3}>
          <Heading level={2}>{dict.galleryTitle}</Heading>
          <Grid columns={{ minWidth: 260 }} gap={3}>
            {item.gallery.map((g) => (
              <Image
                key={g.src}
                src={g.src}
                alt={g.alt}
                width={1280}
                height={800}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
              />
            ))}
          </Grid>
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
                  href={withLang(`/projekte/${p.slug}`, lang)}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <ItemCover src={p.cover} alt={p.title} seed={p.slug} />
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
        <Link href={withLang('/projekte', lang)}>{dict.backToProjects}</Link>
      </Section>
    </>
  );
}
