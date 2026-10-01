'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Button } from '@astryxdesign/core/Button';
import styles from './filters.module.css';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { CARD_COLUMNS, ContentCard } from '@/components/content-card';
import type { CardItem } from '@/lib/items';

export function PostList({
  lang,
  posts,
}: {
  lang: Lang;
  posts: CardItem[];
}) {
  const dict = getDictionary(lang);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');

  const seen = new Map<string, string>();
  for (const p of posts) {
    for (const t of p.topics) {
      if (!seen.has(t.slug)) {
        seen.set(t.slug, t.label);
      }
    }
  }
  const topics = [...seen.entries()].map(([value, label]) => ({ value, label }));

  const q = query.trim().toLowerCase();
  const filtered = posts.filter((p) => {
    if (topic !== 'all' && !p.topics.some((t) => t.slug === topic)) {
      return false;
    }
    if (q.length === 0) {
      return true;
    }
    const hay = `${p.title} ${p.excerpt} ${p.topics.map((t) => t.label).join(' ')}`.toLowerCase();
    return hay.includes(q);
  });
  const isFiltered = q.length > 0 || topic !== 'all';

  return (
    <VStack gap={6}>
      <VStack gap={4}>
      <VStack maxWidth={480}>
        <TextInput
          label={dict.searchLabel}
          startIcon="search"
          hasClear
          value={query}
          onChange={setQuery}
          placeholder={dict.searchPlaceholder}
          isLabelHidden
        />
      </VStack>
      {topics.length > 0 && (
        <div className={styles.clip}>
        <TabList value={topic} onChange={setTopic} overflow="scroll">
          <Tab value="all" label={dict.filterAll} />
          {topics.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </TabList>
        </div>
      )}
      </VStack>
      {filtered.length === 0 ? (
        <VStack gap={2}>
          <Heading level={2}>{dict.noResultsTitle}</Heading>
          <Text>{dict.noResultsText}</Text>
          <HStack gap={2}>
          <Button
            label={dict.resetFilters}
            variant="secondary"
            onClick={() => {
              setQuery('');
              setTopic('all');
            }}
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
      {isFiltered && filtered.length > 0 && (
        <Text type="supporting">
          {filtered.length} / {posts.length}
        </Text>
      )}
    </VStack>
  );
}
