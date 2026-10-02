import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { Card } from '@astryxdesign/core/Card';
import { Banner } from '@astryxdesign/core/Banner';
import { List, ListItem } from '@astryxdesign/core/List';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { PrintButton } from '@/components/print-button';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { cvByLang, skillsByLang } from '@/content/pages';

/**
 * CV (L7, VV4, A7): Stationen als Zeitleiste in Zeilen, Kompetenzen als Tokens statt
 * „•“-Text. Druck: Header/Footer/Buttons/Demo-Kennzeichnungen ausgeblendet (globals.css).
 */
export function CvContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages.cv;
  const stations = cvByLang(lang);
  const skills = skillsByLang(lang);
  return (
    <>
      <PageHero
        title={page.title}
        lede={page.lede}
        meta={
          <HStack className="print-hide">
            <PrintButton lang={lang} />
          </HStack>
        }
      />
      <SplitSection title={dict.cvStationsTitle}>
        {/* Ein Hinweis je Seite (VIS1) statt „(Demo)“/„(fiktiv)“ an jeder Station */}
        <Banner status="note" title={dict.demoNoticeTitle} description={dict.cvDemoNote} />
        <Card padding={2}>
          <List hasDividers density="spacious">
            {stations.map((s) => (
              <ListItem
                key={s.role}
                label={
                  <VStack gap={1}>
                    <Text type="supporting" hasTabularNumbers>
                      {s.period}
                    </Text>
                    <Text weight="semibold">{s.role}</Text>
                  </VStack>
                }
                description={
                  <VStack gap={1}>
                    <Text>{s.org}</Text>
                    <Text color="secondary">{s.text}</Text>
                  </VStack>
                }
              />
            ))}
          </List>
        </Card>
      </SplitSection>
      <SplitSection title={dict.skillsTitle} hasDivider>
        <HStack gap={2} wrap="wrap">
          {skills.map((s) => (
            <Token key={s} label={s} size="lg" />
          ))}
        </HStack>
      </SplitSection>
    </>
  );
}
