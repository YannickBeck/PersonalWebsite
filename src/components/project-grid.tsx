'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Button } from '@astryxdesign/core/Button';
import styles from './filters.module.css';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { CARD_COLUMNS, ContentCard } from '@/components/content-card';
import type { CardItem } from '@/lib/items';

export function ProjectGrid({ lang, items }: { lang: Lang; items: CardItem[] }) {
  const dict = getDictionary(lang);
  const [category, setCategory] = useState('all');
  const cats = [
    { value: 'all', label: dict.categoryAll },
    { value: 'web', label: dict.categoryWeb },
    { value: 'cms', label: dict.categoryCms },
    { value: 'automation', label: dict.categoryAutomation },
  ];
  const filtered =
    category === 'all' ? items : items.filter((i) => i.category === category);

  return (
    <VStack gap={6}>
      <div className={styles.clip}>
        <TabList value={category} onChange={setCategory} overflow="scroll">
        {cats.map((c) => (
          <Tab key={c.value} value={c.value} label={c.label} />
        ))}
        </TabList>
      </div>
      {filtered.length === 0 ? (
        <VStack gap={2}>
          <Heading level={2}>{dict.noResultsTitle}</Heading>
          <Text>{dict.noResultsText}</Text>
          <HStack gap={2}>
          <Button
            label={dict.resetFilters}
            variant="secondary"
            onClick={() => setCategory('all')}
          />
          </HStack>
        </VStack>
      ) : (
        <Grid columns={CARD_COLUMNS} gap={4}>
          {filtered.map((p) => (
            <ContentCard key={p.slug} item={p} lang={lang} headingAccessibilityLevel={2} />
          ))}
        </Grid>
      )}
    </VStack>
  );
}
