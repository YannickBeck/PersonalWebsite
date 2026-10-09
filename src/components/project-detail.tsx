import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { PageHero } from '@/components/page-hero';
import { ProjectVisual } from '@/components/project-visual';
import { Section } from '@astryxdesign/core/Section';
import { Divider } from '@astryxdesign/core/Divider';
import { ProjectRow } from '@/components/project-row';
import { MorphTarget } from '@/components/morph';
import { BackLink, ReadingLayout } from '@/components/reading-layout';
import { Gap } from '@/components/gap';
import { SHOW_GAPS } from '@/lib/gaps';
import { InlineExternalArrow } from '@/components/icons';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { PROJECTS, type Project } from '@/content/profile';
import { anchor, extraTags, projectHref, skillChips } from '@/content/profile-view';
import { ChipList, PlainChip, SkillChipLink } from '@/components/skill-chip';
import styles from './project-detail.module.css';
import rowStyles from './project-row.module.css';

/** Abschnitt der Lesespalte: Nummer in der Display-Schrift (dekorativ) + H2, wie die Abschnitte. */
function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <VStack gap={3}>
      <VStack gap={2}>
        <Text type="label" color="secondary" className={styles.n}>
          <span className="yb-display" aria-hidden="true">
            {String(n).padStart(2, '0')}
          </span>
        </Text>
        <Heading level={2} className={styles.blockTitle}>
          {title}
        </Heading>
      </VStack>
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
 * dem Text). Offene Angaben erscheinen nur in der Vorschau.
 *
 * Fix-Runde 1: Orbitalis zeigt den Ablauf laut README als Linienzeichnung (Morph-Ziel aus
 * Akkordeon und Projektzeile), die Bachelorarbeit kein Bild – ihr voller Titel steht in der
 * Lede, ein Titelblatt wiederholte ihn nur (DES1, DES8). Die Art steht nur noch als Kennung
 * über der H1, nicht zusätzlich in der Randspalte.
 */
export function ProjectDetail({ lang, project }: { lang: Lang; project: Project }) {
  const dict = getDictionary(lang);
  const href = projectHref(project, lang);
  const others = PROJECTS.filter((p) => p.id !== project.id);
  const period = project.period.status === 'belegt' ? project.period.value[lang] : null;
  const context = project.context.status === 'belegt' ? project.context.value[lang] : null;

  return (
    <>
      <PageHero
        eyebrow={<BackLink href={withLang('/projekte', lang)} label={dict.backToProjects} />}
        // nur die Art – das Jahr steht als „Abgabe“ bzw. „Zeitraum“ in der Randspalte (DES8)
        kicker={project.kind[lang]}
        title={project.title[lang]}
        lede={project.teaser[lang]}
        size="lg"
      />
      <ReadingLayout
        tocTitle={dict.tocTitle}
        cover={
          project.id === 'orbitalis' ? (
            <MorphTarget morphKey={href}>
              <ProjectVisual project={project} lang={lang} />
            </MorphTarget>
          ) : undefined
        }
        aside={
          <Card>
            <MetadataList label={{ position: 'top' }}>
              {/* Offene Fakten: in Produktion ohne Zeile (kein leeres Label), in der Vorschau als Lücke.
                  „Abgabe“ statt „Zeitraum“, wo nur das Abgabejahr belegt ist (TEX8) */}
              {period || SHOW_GAPS ? (
                <MetadataListItem label={project.periodKind === 'submitted' ? dict.factsSubmitted : dict.factsPeriod}>
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
              {/* Fähigkeiten als kleine Kacheln mit Sprung ins Periodensystem der Startseite;
                  Tags ohne eigene Kachel (z. B. „Debian 13“) neutral daneben */}
              <MetadataListItem label={dict.factsStack}>
                <ChipList>
                  {skillChips(project.skills, lang).map((chip) => (
                    <li key={chip.id}>
                      <SkillChipLink chip={chip} href={`${withLang('/', lang)}#${anchor.skill(chip.id)}`} />
                    </li>
                  ))}
                  {extraTags(project).map((t) => (
                    <li key={t}>
                      <PlainChip label={t} />
                    </li>
                  ))}
                </ChipList>
              </MetadataListItem>
              {project.links.length > 0 ? (
                <MetadataListItem label={dict.factsCode}>
                  <VStack gap={1}>
                    {project.links.map((l) => (
                      <Link key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" color="primary" hasUnderline>
                        {/* Pfeil inline nach dem letzten Wort (in einer HStack rutschte er bei
                            Zeilenumbruch an den rechten Rand) */}
                        {l.label[lang]}
                        <span className="yb-sr-only"> ({dict.newTab})</span>
                        <InlineExternalArrow />
                      </Link>
                    ))}
                  </VStack>
                </MetadataListItem>
              ) : null}
            </MetadataList>
          </Card>
        }
      >
        <Block n={1} title={dict.sectionSituation}>
          {project.situation.value[lang].map((p) => (
            <Text key={p.slice(0, 32)} as="p" textWrap="pretty">
              {p}
            </Text>
          ))}
        </Block>
        <Block n={2} title={project.brief.pointsLabel === 'focus' ? dict.cvThesisFocus : dict.sectionContribution}>
          {/* Bachelorarbeit: Schwerpunkte als Liste (THESIS.focus); Orbitalis: eigener Beitrag */}
          <List listStyle="disc" density="compact">
            {(project.brief.pointsLabel === 'focus' ? project.brief.points[lang] : project.contribution.value[lang]).map((c) => (
              <ListItem key={c.slice(0, 32)} label={<Text textWrap="pretty">{c}</Text>} />
            ))}
          </List>
        </Block>
        {project.result.status === 'belegt' ? (
          <Block n={3} title={dict.sectionOutcome}>
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
      {/* Statt Karussell (nur ein weiteres Projekt): das andere Projekt als Zeile wie auf /projekte */}
      <Section>
        <VStack gap={6}>
          <Divider />
          <Heading level={2} className={styles.blockTitle}>
            {dict.otherProjectTitle}
          </Heading>
          <div className={rowStyles.list}>
            {others.map((p) => (
              <ProjectRow key={p.id} project={p} n={PROJECTS.indexOf(p) + 1} lang={lang} headingLevel={3} />
            ))}
          </div>
        </VStack>
      </Section>
    </>
  );
}
