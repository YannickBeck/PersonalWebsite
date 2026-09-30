'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Button } from '@astryxdesign/core/Button';
import styles from './filters.module.css';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { ItemCover } from '@/components/item-cover';
import { DemoBadge } from '@/components/demo-badge';
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
    <VStack gap={4}>
      <TextInput
        label={dict.searchLabel}
        value={query}
        onChange={setQuery}
        placeholder={dict.searchPlaceholder}
        isLabelHidden
      />
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
      {filtered.length === 0 ? (
        <VStack gap={2}>
          <Heading level={2}>{dict.noResultsTitle}</Heading>
          <Text>{dict.noResultsText}</Text>
          <Button
            label={dict.resetFilters}
            variant="secondary"
            onClick={() => {
              setQuery('');
              setTopic('all');
            }}
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
      {isFiltered && filtered.length > 0 && (
        <Text type="supporting">
          {filtered.length} / {posts.length}
        </Text>
      )}
    </VStack>
  );
}
