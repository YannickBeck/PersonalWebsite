'use client';

import { ViewTransition, addTransitionType, startTransition, useLayoutEffect, useRef, useState } from 'react';
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
import { FILTER, FILTER_SHARE } from '@/lib/transitions';
import { suppressTransitions } from '@/lib/instant';

/**
 * Filter als eigene Transition (B3, Typ „filter“): startTransition + addTransitionType.
 * Das Raster steckt in einer benannten ViewTransition mit key=Kategorie → altes und neues
 * Raster bilden ein Paar und blenden über (FILTER_SHARE), der Seiten-Wrapper reagiert
 * nicht (route-transition.tsx: update/share none), Header/Footer gleiten nur mit (motion.css).
 */
export function ProjectGrid({ lang, items }: { lang: Lang; items: CardItem[] }) {
  const dict = getDictionary(lang);
  const [category, setCategoryState] = useState('all');
  // Tab-Farben/Indikator ohne Nachziehen umschalten (Commit der Filter-Transition)
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    suppressTransitions();
  }, [category]);
  const setCategory = (value: string) =>
    startTransition(() => {
      addTransitionType(FILTER);
      setCategoryState(value);
    });
  // Nur Bereiche mit Einträgen als Tab (FUN6) – kein Tab führt in einen leeren Zustand
  const cats = [
    { value: 'all', label: dict.categoryAll },
    { value: 'web', label: dict.categoryWeb },
    { value: 'cms', label: dict.categoryCms },
    { value: 'automation', label: dict.categoryAutomation },
  ].filter((c) => c.value === 'all' || items.some((i) => i.category === c.value));
  const filtered =
    category === 'all' ? items : items.filter((i) => i.category === category);

  return (
    <VStack gap={6}>
      <div className={styles.clip}>
        <TabList value={category} onChange={setCategory} overflow="scroll" aria-label={dict.projectFilterLabel}>
        {cats.map((c) => (
          <Tab key={c.value} value={c.value} label={c.label} />
        ))}
        </TabList>
      </div>
      <ViewTransition key={category} name="yb-filter-projekte" share={FILTER_SHARE} default="none">
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
          {filtered.map((p, i) => (
            <ContentCard key={p.slug} item={p} lang={lang} headingAccessibilityLevel={2} eager={i < 3} />
          ))}
        </Grid>
      )}
      </ViewTransition>
      {/* Trefferzahl dauerhaft eingehängt, damit der Filterwechsel angesagt wird (A119) */}
      <Text type="supporting" color="secondary" role="status">
        {dict.resultCount(filtered.length, 'project')}
      </Text>
    </VStack>
  );
}
