import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Banner } from '@astryxdesign/core/Banner';
import { Token } from '@astryxdesign/core/Token';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { skillsByLang } from '@/content/pages';
import { PORTRAIT_SRC } from '@/lib/images';

/** Über mich (E1, LV2, VV4): kein Porträt-Platzhalter – Text + Fakten; Bild nur mit echter Quelle. */
export function AboutContent({ lang, bio, workstyle }: { lang: Lang; bio: string[]; workstyle: string }) {
  const dict = getDictionary(lang);
  const page = dict.pages['ueber-mich'];
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="start">
          <VStack gap={4} maxWidth={640}>
            {bio.map((p, i) => (
              <Text key={i} as="p" textWrap="pretty">
                {p}
              </Text>
            ))}
          </VStack>
          <VStack gap={4}>
            <Card>
              <HStack gap={5} vAlign="start">
                {PORTRAIT_SRC ? (
                  <Image
                    src={PORTRAIT_SRC}
                    alt={dict.portraitAlt}
                    width={120}
                    height={150}
                    style={{ borderRadius: 'var(--radius-container)', flexShrink: 0 }}
                  />
                ) : null}
                <MetadataList label={{ position: 'top' }}>
                  {dict.aboutFacts.map((f) => (
                    <MetadataListItem key={f.label} label={f.label}>
                      <Text>{f.value}</Text>
                    </MetadataListItem>
                  ))}
                </MetadataList>
              </HStack>
            </Card>
            <Banner status="note" title={dict.demoNoticeTitle} description={workstyle} />
          </VStack>
        </Grid>
      </Section>
      <SplitSection title={dict.skillsTitle} hasDivider>
        <HStack gap={2} wrap="wrap">
          {skillsByLang(lang).map((s) => (
            <Token key={s} label={s} size="lg" />
          ))}
        </HStack>
      </SplitSection>
    </>
  );
}
