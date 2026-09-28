'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import type { Lang } from '@/i18n/dictionaries';
import { withLang } from '@/i18n/dictionaries';
import type { GhostItem } from '@/lib/ghost';

export function PostList({
  lang,
  posts,
  searchLabel,
  searchPlaceholder,
}: {
  lang: Lang;
  posts: GhostItem[];
  searchLabel: string;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered =
    q.length === 0
      ? posts
      : posts.filter((p) =>
          `${p.title ?? ''} ${p.custom_excerpt ?? p.excerpt ?? ''}`
            .toLowerCase()
            .includes(q),
        );

  return (
    <VStack gap={3}>
      <TextInput
        label={searchLabel}
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder}
        isLabelHidden
      />
      {filtered.map((p) => (
        <ClickableCard
          key={p.slug}
          label={p.title ?? p.slug}
          href={withLang(`/blog/${p.slug}`, lang)}
          elevation="low"
        >
          <VStack gap={2}>
            <Heading level={2}>{p.title}</Heading>
            {(p.custom_excerpt || p.excerpt) && (
              <Text color="secondary">{p.custom_excerpt || p.excerpt}</Text>
            )}
          </VStack>
        </ClickableCard>
      ))}
    </VStack>
  );
}
