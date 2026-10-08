import { Section } from '@astryxdesign/core/Section';
import { PageHero } from '@/components/page-hero';
import { ProjectRow } from '@/components/project-row';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { PROJECTS } from '@/content/profile';
import styles from '@/components/project-row.module.css';

/** /projekte (DE + EN): genau die zwei Projekte aus dem Content-Modell (Nutzerentscheidung). */
export function ProjectsContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.projekte;
  return (
    <>
      <PageHero kicker={page.title} title={dict.home.projectsTitle} lede={page.lede} />
      <Section>
        <div className={styles.list}>
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.id} project={p} n={i + 1} lang={lang} eager={i === 0} />
          ))}
        </div>
      </Section>
    </>
  );
}
