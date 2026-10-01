'use client';

import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

/** Demo-FAQ als Akkordeon (Tastatur: Tab + Enter/Leertaste). */
export function Faq({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  return (
    <VStack gap={3}>
      <Heading level={2}>{dict.faqTitle}</Heading>
      <CollapsibleGroup hasDividers density="balanced">
        {dict.faqItems.map((item) => (
          <Collapsible
            key={item.q}
            value={item.q}
            trigger={<Text weight="semibold">{item.q}</Text>}
          >
            <Text color="secondary">{item.a}</Text>
          </Collapsible>
        ))}
      </CollapsibleGroup>
    </VStack>
  );
}
