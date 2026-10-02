import type { Metadata } from 'next';
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
import { pageMeta } from '@/lib/seo';
import { CardCarousel } from '@/components/carousel-row';
import { SectionHeader } from '@/components/section-header';
import { TerminalCard } from '@/components/terminal-card';
import { CtaCard } from '@/components/cta-card';
import { PAGE_TOP } from '@/components/page-hero';
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
      {/* Hero (E4): links Text, rechts Terminal-Karte; asymmetrisch ab 1024px (home.module.css).
          Einstieg (B3): .yb-enter staffelt Eyebrow, H1, Lede, CTAs, dann die Terminal-Karte –
          nur beim ersten Laden des Dokuments (motion.css §3). */}
      <Section className={`${home.heroSection} ${PAGE_TOP}`}>
        <Grid columns={{ minWidth: 400, max: 2 }} gap={10} align="center" className={home.hero}>
          <VStack gap={5} className="yb-enter">
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

      {/* Teaser-Reihen als Karussell (VIS9): Desktop 3 nebeneinander wie ein Raster (kein
          Überlauf, keine Pfeile), Tablet 2 + Anschnitt, mobil 1 + Anschnitt – statt eines
          ~1300px hohen Kartenstapels. */}
      <CardCarousel
        title={dict.homeProjectsTitle}
        items={topProjects}
        lang={lang}
        action={
          <Button label={dict.homeAllProjects} variant="secondary" href={withLang('/projekte', lang)} endContent={arrow} />
        }
      />

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
          <Card padding={2} className={`${home.services} yb-reveal`}>
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

      {/* Kurzporträt (VIS18): Kopf wie alle Sections, Fakten als eine ruhige Zeile in voller
          Breite statt dünner Textspalte neben einer Faktenkarte. Porträt (E1) erst mit echter
          Bildquelle und echter Bio – dann hier auf 3–4 Zeilen Text auslegen. */}
      <Section>
        <VStack gap={6}>
          <SectionHeader
            title={dict.homeAboutTitle}
            lede={dict.homeAboutLede}
            action={
              <Button label={dict.homeAboutCta} variant="secondary" href={withLang('/ueber-mich', lang)} endContent={arrow} />
            }
          />
          <Card className="yb-reveal">
            <HStack gap={5} vAlign="center">
              {PORTRAIT_SRC ? (
                <Image
                  src={PORTRAIT_SRC}
                  alt=""
                  width={96}
                  height={96}
                  style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
                />
              ) : null}
              <MetadataList orientation="horizontal" label={{ position: 'top' }}>
                {dict.aboutFacts.map((f) => (
                  <MetadataListItem key={f.label} label={f.label}>
                    <Text>{f.value}</Text>
                  </MetadataListItem>
                ))}
              </MetadataList>
            </HStack>
          </Card>
        </VStack>
      </Section>

      <CardCarousel
        title={dict.homePostsTitle}
        items={topPosts}
        lang={lang}
        action={<Button label={dict.homeAllPosts} variant="secondary" href={withLang('/blog', lang)} endContent={arrow} />}
      />

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

export const metadata: Metadata = {
  ...pageMeta({
    lang: 'de',
    path: '/',
    title: 'Yannick Beck',
    description: 'Persönliche Website von Yannick Beck — Projekte, Blog und Kontakt.',
  }),
  title: { absolute: 'Yannick Beck' },
};

export default function Home() {
  return <HomeContent lang="de" />;
}
