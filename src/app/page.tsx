import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { List, ListItem } from '@astryxdesign/core/List';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { getPostCards, getProjectCards } from '@/lib/items';
import { servicesByLang } from '@/content/pages';
import { PORTRAIT_SRC } from '@/lib/images';
import { CARD_COLUMNS, ContentCard } from '@/components/content-card';
import { SectionHeader } from '@/components/section-header';
import { TerminalCard } from '@/components/terminal-card';
import { CtaCard } from '@/components/cta-card';
import { ArrowRight } from '@/components/icons';
import home from './home.module.css';

export async function HomeContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [projects, posts] = await Promise.all([getProjectCards(lang), getPostCards(lang)]);
  const topProjects = projects.slice(0, 3);
  const topPosts = posts.slice(0, 3);
  const services = servicesByLang(lang);
  const arrow = <ArrowRight />;

  return (
    <>
      {/* Hero (E4): links Text, rechts Terminal-Karte; asymmetrisch ab 1024px (home.module.css) */}
      <Section className={home.heroSection}>
        <Grid columns={{ minWidth: 400, max: 2 }} gap={10} align="center" className={home.hero}>
          <VStack gap={5}>
            <HStack gap={2} vAlign="center">
              {/* dekorativ: der Text daneben trägt die Aussage (X10, keine Doppelansage, kein Puls) */}
              <StatusDot variant="accent" label={dict.homeEyebrow} aria-hidden="true" />
              <Text type="label" color="secondary">
                {dict.homeEyebrow}
              </Text>
            </HStack>
            <Heading level={1} type="display-2" textWrap="balance">
              {dict.homeTitle}
            </Heading>
            <Text type="large" color="secondary" textWrap="pretty">
              {dict.homeLede}
            </Text>
            <HStack gap={3} wrap="wrap">
              <Button
                label={dict.viewProjects}
                variant="primary"
                size="lg"
                href={withLang('/projekte', lang)}
                endContent={arrow}
              />
              <Button label={dict.contact} variant="secondary" size="lg" href={withLang('/kontakt', lang)} />
            </HStack>
          </VStack>
          <TerminalCard title={dict.homeTerminalTitle} lines={dict.homeTerminal} label={dict.homeTerminalLabel} />
        </Grid>
      </Section>

      {topProjects.length > 0 && (
        <Section>
          <VStack gap={6}>
            <SectionHeader
              title={dict.homeProjectsTitle}
              action={
                <Button
                  label={dict.homeAllProjects}
                  variant="secondary"
                  href={withLang('/projekte', lang)}
                  endContent={arrow}
                />
              }
            />
            <Grid columns={CARD_COLUMNS} gap={4}>
              {topProjects.map((p) => (
                <ContentCard key={p.slug} item={p} lang={lang} />
              ))}
            </Grid>
          </VStack>
        </Section>
      )}

      {/* Leistungen als Zeilen mit Weiterführung wie die anderen Sections (LV3) */}
      <Section>
        <VStack gap={6}>
          <SectionHeader
            title={dict.homeServicesTitle}
            lede={dict.homeServicesLede}
            action={
              <Button
                label={dict.homeAllServices}
                variant="secondary"
                href={withLang('/leistungen', lang)}
                endContent={arrow}
              />
            }
          />
          <Card padding={2}>
            <List hasDividers density="spacious">
              {services.map((s, i) => (
                <ListItem
                  key={s.slug}
                  href={`${withLang('/leistungen', lang)}#${s.slug}`}
                  startContent={
                    <Text type="code" color="accent" weight="semibold">
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                  }
                  label={<Text weight="semibold">{s.title}</Text>}
                  description={<Text color="secondary">{s.problem}</Text>}
                  endContent={<ArrowRight color="secondary" />}
                />
              ))}
            </List>
          </Card>
        </VStack>
      </Section>

      {/* Kurzporträt ohne Bild (E1/LV2): Text + Fakten; Porträt nur mit echter Bildquelle */}
      <Section>
        <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="start">
          <VStack gap={4}>
            <Heading level={2}>{dict.homeAboutTitle}</Heading>
            <Text color="secondary" textWrap="pretty">
              {dict.homeAboutLede}
            </Text>
            <HStack gap={2}>
              <Button
                label={dict.homeAboutCta}
                variant="secondary"
                href={withLang('/ueber-mich', lang)}
                endContent={arrow}
              />
            </HStack>
          </VStack>
          <Card>
            <HStack gap={5} vAlign="start">
              {PORTRAIT_SRC ? (
                <Image
                  src={PORTRAIT_SRC}
                  alt=""
                  width={96}
                  height={96}
                  style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
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
        </Grid>
      </Section>

      {topPosts.length > 0 && (
        <Section>
          <VStack gap={6}>
            <SectionHeader
              title={dict.homePostsTitle}
              action={
                <Button
                  label={dict.homeAllPosts}
                  variant="secondary"
                  href={withLang('/blog', lang)}
                  endContent={arrow}
                />
              }
            />
            <Grid columns={CARD_COLUMNS} gap={4}>
              {topPosts.map((p) => (
                <ContentCard key={p.slug} item={p} lang={lang} />
              ))}
            </Grid>
          </VStack>
        </Section>
      )}

      {/* Kontakt-CTA als ruhige Card */}
      <CtaCard
        title={dict.homeContactTitle}
        text={dict.homeContactLede}
        label={dict.contact}
        href={withLang('/kontakt', lang)}
      />
    </>
  );
}

export default function Home() {
  return <HomeContent lang="de" />;
}
