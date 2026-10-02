import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { Banner } from '@astryxdesign/core/Banner';
import { List, ListItem } from '@astryxdesign/core/List';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { CtaCard } from '@/components/cta-card';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { servicesByLang } from '@/content/pages';

/**
 * Leistungen (L7, VV4): je Angebot ein Abschnitt mit echten Listen statt „•“-Text und
 * Karten je Ablaufschritt; Demo-Hinweis EINMAL oben statt je Angebot (T1/L10).
 * Anker #beratung/#umsetzung/#begleitung für die Startseite.
 */
export function ServicesContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.leistungen;
  const services = servicesByLang(lang);
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section paddingBlockEnd={0}>
        <VStack maxWidth={640}>
          <Banner status="note" title={dict.demoNoticeTitle} description={services[0]?.openNote} />
        </VStack>
      </Section>
      {services.map((s, i) => (
        <SplitSection
          key={s.slug}
          id={s.slug}
          index={String(i + 1).padStart(2, '0')}
          title={s.title}
          lede={s.problem}
          hasDivider={i > 0}
        >
          <Grid columns={{ minWidth: 260, max: 2 }} gap={6}>
            <List header={<Heading level={3}>{dict.tasksTitle}</Heading>} listStyle="disc" density="compact">
              {s.tasks.map((t) => (
                <ListItem key={t} label={<Text>{t}</Text>} />
              ))}
            </List>
            <List
              header={<Heading level={3}>{dict.deliverablesTitle}</Heading>}
              listStyle="disc"
              density="compact"
            >
              {s.deliverables.map((d) => (
                <ListItem key={d} label={<Text>{d}</Text>} />
              ))}
            </List>
          </Grid>
          <Card variant="muted">
            {/* Kopf auf der Inset-Kante der Einträge (VIS12: ListItem rückt 8px ein) */}
            <List
              header={
                <HStack paddingInline={2}>
                  <Heading level={3}>{dict.processTitle}</Heading>
                </HStack>
              }
              hasDividers
            >
              {s.steps.map((step) => (
                <ListItem
                  key={step.title}
                  label={<Text weight="semibold">{step.title}</Text>}
                  description={<Text color="secondary">{step.text}</Text>}
                />
              ))}
            </List>
          </Card>
        </SplitSection>
      ))}
      <CtaCard
        title={dict.homeContactTitle}
        text={dict.homeContactLede}
        label={dict.contact}
        href={withLang('/kontakt', lang)}
      />
    </>
  );
}
