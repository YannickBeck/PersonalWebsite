import type { ReactNode } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/HStack';
import { ArrowLeft } from '@/components/icons';
import styles from './reading-layout.module.css';

export interface TocEntry {
  id: string;
  text: string;
}

/**
 * Detailseiten (E7, L5): links eine Lesespalte (~68 Zeichen pro Zeile), ab 1024px rechts
 * eine mitlaufende Randspalte (Inhaltsverzeichnis). Die linke Kante bleibt die
 * gemeinsame Inhaltslinie von Marke, H1 und Footer.
 */
export function ReadingLayout({
  children,
  toc,
  tocTitle,
  aside,
}: {
  children: ReactNode;
  toc?: TocEntry[];
  tocTitle: string;
  /** Zusätzlicher Inhalt der Randspalte (z. B. Projekt-Fakten). */
  aside?: ReactNode;
}) {
  const hasToc = !!toc && toc.length > 1;
  const hasAside = hasToc || aside != null;
  return (
    <Section>
      <Grid columns={1} gap={10} className={`${styles.reading} ${hasAside ? styles.withAside : ''}`}>
        <VStack gap={8} className={styles.main}>
          {children}
        </VStack>
        {hasAside ? (
          <VStack gap={6} className={styles.aside}>
            {aside}
            {hasToc ? (
              <VStack as="nav" gap={3} aria-label={tocTitle}>
                <Text type="label" color="secondary">
                  {tocTitle}
                </Text>
                <VStack as="ol" gap={0} className={styles.toc}>
                  {toc.map((h) => (
                    <li key={h.id} className={styles.tocItem}>
                      <Link href={`#${h.id}`} color="secondary">
                        {h.text}
                      </Link>
                    </li>
                  ))}
                </VStack>
              </VStack>
            ) : null}
          </VStack>
        ) : null}
      </Grid>
    </Section>
  );
}

/** Zurück-Link über der H1 (Eyebrow), bündig auf der Inhaltslinie. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} color="secondary" isStandalone>
      <HStack as="span" gap={1.5} vAlign="center">
        <ArrowLeft />
        {label}
      </HStack>
    </Link>
  );
}

/** h2-Überschriften mit id aus Ghost-HTML fürs Inhaltsverzeichnis. */
export function tocFromHtml(html: string | undefined): TocEntry[] {
  if (!html) {
    return [];
  }
  const out: TocEntry[] = [];
  const re = /<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
    if (text) {
      out.push({ id: m[1], text });
    }
  }
  return out;
}
