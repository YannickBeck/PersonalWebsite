import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Link } from '@astryxdesign/core/Link';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { CtaCard } from '@/components/cta-card';
import { ChipList, SkillChipLink } from '@/components/skill-chip';
import { Gap } from '@/components/gap';
import { plain } from '@/components/emphasis';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { FOCUS_AREAS } from '@/content/profile';
import { anchor, projectHref, projectsForSkills, skillChips } from '@/content/profile-view';

/**
 * Schwerpunkte (Route /leistungen bleibt, Redesign B4): Themen aus dem LinkedIn-Profil statt
 * erfundener Leistungspakete – je Thema ein belegter Satz, die zugehörigen Fähigkeiten als
 * Kacheln (Sprung ins Periodensystem der Startseite) und, wo vorhanden, die Projekte, die
 * diese Fähigkeiten belegen (abgeleitet aus PROJECTS[].skills, nichts ergänzt). Ob es ein
 * konkretes Angebot gibt, ist offen (Lücke services-offer, nur Vorschau).
 * Anker #cloud/#identity/#ai/#consulting.
 */
export function ServicesContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.leistungen;
  const home = withLang('/', lang);
  return (
    <>
      <PageHero
        kicker={page.title}
        title={dict.servicesTitle}
        lede={page.lede}
        meta={<Gap id="services-offer" lang={lang} block />}
      />
      {FOCUS_AREAS.map((area, i) => {
        const projects = projectsForSkills(area.skills);
        const labelId = `${area.id}-skills`;
        return (
          <SplitSection
            key={area.id}
            id={area.id}
            index={String(i + 1).padStart(2, '0')}
            title={area.title[lang]}
            hasDivider={i > 0}
          >
            <Text as="p" textWrap="pretty" type="large">
              {area.text.value[lang]}
            </Text>
            <VStack gap={2}>
              <Text type="label" color="secondary" id={labelId}>
                {dict.servicesSkills}
              </Text>
              <ChipList labelledBy={labelId}>
                {skillChips(area.skills, lang).map((chip) => (
                  <li key={chip.id}>
                    <SkillChipLink chip={chip} href={`${home}#${anchor.skill(chip.id)}`} />
                  </li>
                ))}
              </ChipList>
            </VStack>
            {projects.length > 0 ? (
              <VStack gap={2}>
                <Text type="label" color="secondary">
                  {dict.servicesProjects}
                </Text>
                <HStack gap={4} wrap="wrap">
                  {projects.map((p) => (
                    <Link key={p.id} href={projectHref(p, lang)} color="primary" hasUnderline>
                      {p.shortTitle[lang]}
                    </Link>
                  ))}
                </HStack>
              </VStack>
            ) : null}
          </SplitSection>
        );
      })}
      <CtaCard
        title={plain(dict.home.contactTitle)}
        text={dict.home.contactLede}
        label={dict.contact}
        href={withLang('/kontakt', lang)}
      />
    </>
  );
}
