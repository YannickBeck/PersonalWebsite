import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { Link } from '@astryxdesign/core/Link';
import { PageHero } from '@/components/page-hero';
import { Gap } from '@/components/gap';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { projectById } from '@/content/profile';
import { projectHref } from '@/content/profile-view';

/**
 * Uses: Es gibt (noch) keine belegte Werkzeugliste. Statt leerer Seite oder erfundener
 * Einträge: ein ehrlicher Satz und die belegte Technik aus dem Projekt Orbitalis.
 * Nicht in Navigation und Sitemap, URL bleibt erreichbar.
 */
export function UsesContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.uses;
  const orbitalis = projectById('orbitalis');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <VStack gap={6} maxWidth={720}>
          <Text as="p" type="large" textWrap="pretty">
            {dict.usesEmpty}
          </Text>
          <VStack gap={3}>
            <Text type="label" color="secondary">
              {dict.usesFromProjects}:{' '}
              <Link href={projectHref(orbitalis, lang)} color="primary" hasUnderline>
                {orbitalis.shortTitle[lang]}
              </Link>
            </Text>
            <HStack gap={2} wrap="wrap">
              {orbitalis.tags.map((t) => (
                <Token key={t} label={t} size="lg" />
              ))}
            </HStack>
          </VStack>
          <Gap id="uses" lang={lang} block />
        </VStack>
      </Section>
    </>
  );
}
