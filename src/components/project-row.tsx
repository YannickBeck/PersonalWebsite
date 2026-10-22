import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { ProjectVisual, visualShowsTitle } from '@/components/project-visual';
import { MorphSource } from '@/components/morph';
import { TransitionLink } from '@/components/transition-link';
import { ChipList, PlainChip, SkillChipLink } from '@/components/skill-chip';
import { ExternalArrow } from '@/components/icons';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import type { Project } from '@/content/profile';
import { anchor, extraTags, projectHref, skillChips } from '@/content/profile-view';
import styles from './project-row.module.css';

/**
 * Ein Projekt als Zeile (Redesign B4): Nummer in der Display-Schrift, „Art · Jahr“, H2, Satz,
 * Fähigkeiten als Kacheln (Sprung ins Periodensystem), Aktionen; rechts die Projekt-Grafik
 * (project-visual.tsx: Ablauf bzw. Titelblatt, Morph-Quelle zur Detailseite). Sie ist
 * zusätzlich ein Link für die Maus (aria-hidden, nicht fokussierbar) – Tastatur und
 * Screenreader nutzen „Details ansehen“. Pfeile nur an externen Links (↗, DES13).
 */
export function ProjectRow({
  project,
  n,
  lang,
  headingLevel = 2,
}: {
  project: Project;
  n: number;
  lang: Lang;
  /** 2 unter der H1 (/projekte), 3 unter einer H2 (Detailseite: „Weiteres Projekt“). */
  headingLevel?: 2 | 3;
}) {
  const dict = getDictionary(lang);
  const href = projectHref(project, lang);
  const titleId = `project-${project.id}-title`;
  const source = project.links.find((l) => l.kind === 'source');
  const period = project.period.status === 'belegt' ? project.period.value[lang] : null;
  const home = withLang('/', lang);
  return (
    <article className={styles.row} aria-labelledby={titleId}>
      <div className={styles.text}>
        <span className={`${styles.n} yb-display`} aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
        <Text type="supporting" color="secondary" className={styles.meta}>
          {[project.kind[lang], period].filter(Boolean).join(' · ')}
        </Text>
        <Heading level={headingLevel} id={titleId} textWrap="balance" className={styles.title}>
          {project.title[lang]}
        </Heading>
        {/* Steht der volle Titel schon im Titelblatt daneben (Bachelorarbeit), die Kurzfassung wie
            im Akkordeon statt des Teasers, der mit demselben Titel beginnt (Feinschliff) */}
        <Text as="p" textWrap="pretty" className={styles.teaser}>
          {(visualShowsTitle(project) ? (project.brief.summary ?? project.teaser) : project.teaser)[lang]}
        </Text>
        <Text type="supporting" color="secondary" as="p" id={`${titleId}-skills`} className={styles.chipsLabel}>
          {dict.home.projectsSkills}
        </Text>
        <ChipList labelledBy={`${titleId}-skills`}>
          {skillChips(project.skills, lang).map((chip) => (
            <li key={chip.id}>
              <SkillChipLink chip={chip} href={`${home}#${anchor.skill(chip.id)}`} />
            </li>
          ))}
          {extraTags(project).map((t) => (
            <li key={t}>
              <PlainChip label={t} />
            </li>
          ))}
        </ChipList>
        <div className={styles.actions}>
          <Button
            label={dict.home.projectDetails}
            aria-label={`${dict.home.projectDetails}: ${project.shortTitle[lang]}`}
            variant="primary"
            href={href}
          />
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
      <TransitionLink href={href} aria-hidden="true" tabIndex={-1} className={`${styles.cover} yb-card`}>
        <MorphSource morphKey={href}>
          <ProjectVisual project={project} lang={lang} decorative />
        </MorphSource>
      </TransitionLink>
    </article>
  );
}
