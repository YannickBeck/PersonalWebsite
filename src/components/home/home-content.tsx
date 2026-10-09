import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { homeSections, type HomeSectionKey } from '@/content/profile-view';
import { PersonJsonLd } from '@/components/json-ld';
import { Hero } from './hero';
import { SectionNav } from './section-nav';
import { AboutSection } from './about-section';
import { SkillsSection } from './skills-section';
import { ProjectsSection } from './projects-section';
import { CareerSection } from './career-section';
import { AchievementsSection } from './achievements-section';
import { ContactSection } from './contact-section';
import { HomeJump } from './home-jump';
import styles from './home.module.css';

const SECTION: Record<Exclude<HomeSectionKey, 'start'>, typeof AboutSection> = {
  about: AboutSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  career: CareerSection,
  achievements: AchievementsSection,
  contact: ContactSection,
};

/**
 * Startseite als lange Scrollseite mit nummerierten Abschnitten (00 Einstieg … Kontakt).
 * Die Abschnittsnavigation steht nach dem Einstieg und klebt ab dort unter dem Header
 * (Sticky im Container der Abschnitte 01 ff.). Reihenfolge, Anker und Nummern: homeSections
 * (profile-view.ts) – „Erfolge“ nur mit belegten Einträgen.
 */
export function HomeContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const sections = homeSections(lang);
  const [start, ...rest] = sections;
  return (
    <>
      <PersonJsonLd lang={lang} />
      <Hero id={start.id} lang={lang} />
      <div className={styles.sections}>
        <SectionNav
          items={sections.map(({ id, label, number }) => ({ id, label, number }))}
          label={dict.home.sectionNavLabel}
          hint={dict.home.sectionNavHint}
        />
        {rest.map((s) => {
          const Component = SECTION[s.key as Exclude<HomeSectionKey, 'start'>];
          return <Component key={s.key} id={s.id} number={s.number} lang={lang} />;
        })}
      </div>
      {/* Nach den Abschnitten: deren Sprung-Listener stehen dann schon (home-jump.tsx) */}
      <HomeJump />
    </>
  );
}
