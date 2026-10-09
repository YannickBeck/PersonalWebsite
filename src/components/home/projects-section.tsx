import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { PROJECTS, type Project } from '@/content/profile';
import { anchor, extraTags, projectHref, skillChips } from '@/content/profile-view';
import { ProjectVisual } from '@/components/project-visual';
import { MorphSource } from '@/components/morph';
import { ExternalArrow } from '@/components/icons';
import { Gap } from '@/components/gap';
import { ChipList, PlainChip, SkillChipLink } from '@/components/skill-chip';
import { HomeSection } from './home-section';
import { ProjectAccordion, type AccordionItem } from './project-accordion';
import styles from './projects.module.css';

/**
 * Inhalt eines Projekts im Akkordeon (Server): Projekt-Grafik (Ablauf bzw. Titelblatt,
 * project-visual.tsx – Morph-Quelle zur Detailseite), Links, Ausgangslage, neu gebaute Teile
 * bzw. Schwerpunkte, Ergebnis (nur wenn belegt),
 * Fähigkeiten als kleine Kacheln mit Sprung ins Periodensystem. Kurzfassung aus
 * project.brief (gekürzt, nichts ergänzt); die Langfassung steht auf der Detailseite.
 */
function ProjectPanel({ project, lang }: { project: Project; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const href = projectHref(project, lang);
  const source = project.links.find((l) => l.kind === 'source');
  const brief = project.brief;
  const extra = extraTags(project);
  return (
    <div className={styles.panelGrid}>
      <div className={styles.cover}>
        <MorphSource morphKey={href}>
          <ProjectVisual project={project} lang={lang} />
        </MorphSource>
        {project.id === 'orbitalis' ? <Gap id="orbitalis-media" lang={lang} block /> : null}
      </div>
      <div className={styles.blocks}>
        <div className={styles.block}>
          <Heading level={4} className={styles.blockTitle}>
            {dict.sectionSituation}
          </Heading>
          {brief.situation[lang].map((p) => (
            <Text key={p.slice(0, 24)} as="p" textWrap="pretty">
              {p}
            </Text>
          ))}
        </div>
        <div className={styles.block}>
          <Heading level={4} className={styles.blockTitle}>
            {brief.pointsLabel === 'focus' ? dict.cvThesisFocus : dict.sectionContribution}
          </Heading>
          <ul className={styles.points}>
            {brief.points[lang].map((p) => (
              <li key={p.slice(0, 24)}>
                <Text textWrap="pretty">{p}</Text>
              </li>
            ))}
          </ul>
        </div>
        {brief.result ? (
          <div className={styles.block}>
            <Heading level={4} className={styles.blockTitle}>
              {dict.sectionOutcome}
            </Heading>
            <Text as="p" textWrap="pretty">
              {brief.result[lang]}
            </Text>
          </div>
        ) : project.result.status === 'offen' ? (
          <Gap id={project.result.gap} lang={lang} block />
        ) : null}
      </div>
      <div className={`${styles.block} ${styles.chips}`}>
        <Text type="supporting" color="secondary" as="p" id={`${anchor.project(project.id)}-skills`}>
          {h.projectsSkills}
        </Text>
        <ChipList labelledBy={`${anchor.project(project.id)}-skills`}>
          {skillChips(project.skills, lang).map((chip) => (
            <li key={chip.id}>
              <SkillChipLink chip={chip} href={`#${anchor.skill(chip.id)}`} jump />
            </li>
          ))}
          {extra.map((t) => (
            <li key={t}>
              <PlainChip label={t} />
            </li>
          ))}
        </ChipList>
      </div>
      <div className={styles.actions}>
        <Button label={h.projectDetails} variant="primary" href={href} />
        {source ? (
          <Button
            label={dict.factsCode}
            aria-label={`${dict.factsCode}: ${source.label[lang]} (GitHub, ${dict.newTab})`}
            variant="secondary"
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            endContent={<ExternalArrow />}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * 03 Projekte: die zwei Projekte (Nutzerentscheidung) als Akkordeon – nebeneinander mit
 * schmalem Streifen für das geschlossene Projekt, mobil untereinander. Detailseiten unter
 * /projekte/<slug>.
 */
export function ProjectsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const h = getDictionary(lang).home;
  const items: AccordionItem[] = PROJECTS.map((p, i) => ({
    id: p.id,
    anchor: anchor.project(p.id),
    number: String(i + 1).padStart(2, '0'),
    kind: p.kind[lang],
    period: p.period.status === 'belegt' ? p.period.value[lang] : null,
    title: p.title[lang],
    shortTitle: p.shortTitle[lang],
    href: projectHref(p, lang),
    metaExtra: p.period.status === 'offen' ? <Gap id={p.period.gap} lang={lang} /> : null,
    panel: <ProjectPanel project={p} lang={lang} />,
  }));
  return (
    <HomeSection id={id} number={number} title={h.projectsTitle} lede={h.projectsLede}>
      <ProjectAccordion items={items} label={h.projectsListLabel} />
    </HomeSection>
  );
}
