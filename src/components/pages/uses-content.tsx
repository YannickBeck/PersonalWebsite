import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { PageHero } from '@/components/page-hero';
import { ChipList, PlainChip, SkillChipLink } from '@/components/skill-chip';
import { Gap } from '@/components/gap';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { projectById, skillById } from '@/content/profile';
import { anchor, extraTags, projectHref, skillChips } from '@/content/profile-view';

/**
 * Uses (Redesign B4): Es gibt (noch) keine belegte Werkzeugliste. Statt leerer Seite oder
 * erfundener Einträge: die Lede sagt es ehrlich, darunter die belegte Technik aus dem Projekt
 * Orbitalis (nur Werkzeuge: Projekttechnik-Kacheln mit Sprung ins Periodensystem, übrige Tags
 * neutral – Fix-Runde 1, TEX17).
 * Nicht in Navigation und Sitemap (routes.ts UNLISTED_ROUTES), URL bleibt erreichbar.
 */
export function UsesContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.uses;
  const orbitalis = projectById('orbitalis');
  const home = withLang('/', lang);
  return (
    <>
      <PageHero kicker={page.title} title={dict.usesTitle} lede={page.lede} />
      <Section>
        <VStack gap={6} maxWidth={720}>
          <VStack gap={3}>
            <Text as="p" type="large" textWrap="pretty" id="uses-orbitalis">
              {dict.usesFromProjects[0]}
              <Link href={projectHref(orbitalis, lang)} color="primary" hasUnderline>
                {orbitalis.shortTitle[lang]}
              </Link>
              {dict.usesFromProjects[1]}
            </Text>
            {/* Nur Werkzeuge (Projekttechnik), keine Konzepte wie RAG oder LLMs (TEX17) */}
            <ChipList labelledBy="uses-orbitalis">
              {skillChips(orbitalis.skills.filter((id) => skillById(id).category === 'build'), lang).map((chip) => (
                <li key={chip.id}>
                  <SkillChipLink chip={chip} href={`${home}#${anchor.skill(chip.id)}`} />
                </li>
              ))}
              {extraTags(orbitalis).map((t) => (
                <li key={t}>
                  <PlainChip label={t} />
                </li>
              ))}
            </ChipList>
          </VStack>
          <Gap id="uses" lang={lang} block />
        </VStack>
      </Section>
    </>
  );
}
