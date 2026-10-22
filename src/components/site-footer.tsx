'use client';

import { usePathname } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { BrandMark } from '@/components/brand-mark';
import type { FooterData, FooterGroup } from '@/i18n/chrome';
import styles from './site-footer.module.css';

/**
 * Linkgruppe als eigene <nav> mit Namen statt H3 (T9: keine Überschriften-Sprünge
 * h1 → h3 auf jeder Seite). Der sichtbare Gruppentitel ist ein Label.
 */
function Group({ group, isCurrent }: { group: FooterGroup; isCurrent: (href: string) => boolean }) {
  return (
    <VStack as="nav" aria-label={group.title} gap={2}>
      <Text type="label" color="secondary">
        {group.title}
      </Text>
      <VStack gap={0} as="ul" className={styles.list}>
        {group.links.map((l) => (
          <li key={l.href} className={styles.item}>
            {l.external ? (
              <Link href={l.href} color="primary" target="_blank" rel="noopener noreferrer" aria-label={l.external}>
                {l.label} ↗
              </Link>
            ) : (
              <Link
                href={l.href}
                color={isCurrent(l.href) ? 'accent' : 'primary'}
                aria-current={isCurrent(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </VStack>
    </VStack>
  );
}

/**
 * Footer. Linkgruppen und Texte kommen vom Server (footerData, src/i18n/chrome.ts) – kein
 * Dictionary im Client-Bundle (Feinschliff); Client nur wegen der aktuellen Seite (aria-current).
 */
export function SiteFooter({ data }: { data: FooterData }) {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href;
  return (
    <footer>
      <VStack gap={8} paddingBlockStart={6} paddingBlockEnd={2}>
        <Grid columns={{ minWidth: 150, max: 3 }} gap={6}>
          {data.groups.map((g) => (
            <Group key={g.title} group={g} isCurrent={isCurrent} />
          ))}
        </Grid>
        <HStack gap={3} wrap="wrap" vAlign="center" justify="between">
          <HStack gap={2} vAlign="center">
            <BrandMark />
            <Text type="supporting" color="secondary">
              {data.footer} · {data.tagline}
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            {data.builtWith}
          </Text>
        </HStack>
      </VStack>
    </footer>
  );
}
