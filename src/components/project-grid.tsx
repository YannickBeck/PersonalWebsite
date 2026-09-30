'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Button } from '@astryxdesign/core/Button';
import styles from './filters.module.css';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { ItemCover } from '@/components/item-cover';
import { DemoBadge } from '@/components/demo-badge';
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
    <VStack gap={4}>
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
          <Button
            label={dict.resetFilters}
            variant="secondary"
            onClick={() => setCategory('all')}
          />
        </VStack>
      ) : (
        <Grid columns={{ minWidth: 260 }} gap={3}>
          {filtered.map((p) => (
            <ClickableCard
              key={p.slug}
              label={p.title}
              href={p.href}
              elevation="low"
            >
              <VStack gap={2}>
                <ItemCover src={p.image} alt={p.title} seed={p.slug} />
                {p.demo && <DemoBadge lang={lang} />}
                <Heading level={3}>{p.title}</Heading>
                {p.excerpt && <Text color="secondary">{p.excerpt}</Text>}
              </VStack>
            </ClickableCard>
          ))}
        </Grid>
      )}
    </VStack>
  );
}
