import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { PageHero } from '@/components/page-hero';
import { ChipList, PlainChip, SkillChipLink } from '@/components/skill-chip';
import { Gap } from '@/components/gap';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { projectById } from '@/content/profile';
import { anchor, extraTags, projectHref, skillChips } from '@/content/profile-view';

/**
 * Uses (Redesign B4): Es gibt (noch) keine belegte Werkzeugliste. Statt leerer Seite oder
 * erfundener Einträge: ein ehrlicher Satz und die belegte Technik aus dem Projekt Orbitalis
 * (Fähigkeits-Kacheln mit Sprung ins Periodensystem, übrige Tags neutral).
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
          <Text as="p" type="large" textWrap="pretty">
            {dict.usesEmpty}
          </Text>
          <VStack gap={3}>
            <Text type="label" color="secondary" id="uses-orbitalis">
              {dict.usesFromProjects}:{' '}
              <Link href={projectHref(orbitalis, lang)} color="primary" hasUnderline>
                {orbitalis.shortTitle[lang]}
              </Link>
            </Text>
            <ChipList labelledBy="uses-orbitalis">
              {skillChips(orbitalis.skills, lang).map((chip) => (
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
