import { HStack } from '@astryxdesign/core/HStack';
import { Token } from '@astryxdesign/core/Token';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { CtaCard } from '@/components/cta-card';
import { Gap } from '@/components/gap';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { FOCUS_AREAS, skillById } from '@/content/profile';

/**
 * Schwerpunkte (Route /leistungen bleibt): Themen aus dem LinkedIn-Profil statt erfundener
 * Leistungspakete – je Thema ein belegter Satz und die zugehörigen Fähigkeiten. Ob es ein
 * konkretes Angebot gibt, ist offen (Lücke services-offer, nur Vorschau).
 * Anker #cloud/#identity/#ai/#consulting.
 */
export function ServicesContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.leistungen;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} meta={<Gap id="services-offer" lang={lang} block />} />
      {FOCUS_AREAS.map((area, i) => (
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
            <Text type="label" color="secondary">
              {dict.servicesSkills}
            </Text>
            <HStack gap={2} wrap="wrap">
              {area.skills.map((id) => (
                <Token key={id} label={skillById(id).name[lang]} size="lg" />
              ))}
            </HStack>
          </VStack>
        </SplitSection>
      ))}
      <CtaCard
        title={dict.home.contactTitle.replace(/\*/g, '')}
        text={dict.home.contactLede}
        label={dict.contact}
        href={withLang('/kontakt', lang)}
      />
    </>
  );
}
