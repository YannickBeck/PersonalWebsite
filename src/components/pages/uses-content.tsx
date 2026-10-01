import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { List, ListItem } from '@astryxdesign/core/List';
import { PageHero } from '@/components/page-hero';
import { SplitSection } from '@/components/split-section';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { usesByLang } from '@/content/pages';

/** Uses (L7): Zeilen statt einer Karte je Eintrag; Platzhalter-Bilder entfallen (V6). */
export function UsesContent({ lang }: { lang: Lang }) {
  const page = getDictionary(lang).pages.uses;
  const groups = usesByLang(lang);
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      {groups.map((g, i) => (
        <SplitSection key={g.title} title={g.title} hasDivider={i > 0}>
          <Card padding={2}>
            <List hasDividers density="spacious">
              {g.items.map((item) => (
                <ListItem
                  key={item.name}
                  label={<Text weight="semibold">{item.name}</Text>}
                  description={<Text color="secondary">{item.text}</Text>}
                />
              ))}
            </List>
          </Card>
        </SplitSection>
      ))}
    </>
  );
}
