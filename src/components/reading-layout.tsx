import type { ReactNode } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/HStack';
import { ArrowLeft } from '@/components/icons';
import { TocList } from '@/components/toc-list';
import styles from './reading-layout.module.css';

export interface TocEntry {
  id: string;
  text: string;
}

/**
 * Detailseiten (E7, L5): links eine Lesespalte (~68 Zeichen pro Zeile), ab 1024px rechts
 * eine mitlaufende Randspalte (Fakten, Inhaltsverzeichnis mit aktivem Abschnitt) an der
 * rechten Rahmenkante (VIS3). Die linke Kante bleibt die gemeinsame Inhaltslinie von Marke,
 * H1 und Footer. Unter 1024px: Cover direkt nach dem Kopf, dann Randspalte, dann Text
 * (VIS15); ein kurzes Inhaltsverzeichnis (< 4 Einträge) entfällt mobil.
 */
export function ReadingLayout({
  children,
  cover,
  toc,
  tocTitle,
  aside,
}: {
  children: ReactNode;
  /** Titelbild (Morph-Ziel) – eigene Rasterzelle, damit es mobil vor der Randspalte steht. */
  cover?: ReactNode;
  toc?: TocEntry[];
  tocTitle: string;
  /** Zusätzlicher Inhalt der Randspalte (z. B. Projekt-Fakten). */
  aside?: ReactNode;
}) {
  const hasToc = !!toc && toc.length > 1;
  const hasAside = hasToc || aside != null;
  // Kurzes Inhaltsverzeichnis entfällt mobil; steht sonst nichts in der Randspalte, entfällt
  // sie ganz (keine leere Rasterzeile samt Abstand)
  const shortToc = hasToc && toc.length < 4;
  return (
    <Section>
      <Grid columns={1} gap={8} className={`${styles.reading} ${hasAside ? styles.withAside : ''}`}>
        {cover ? <VStack className={styles.cover}>{cover}</VStack> : null}
        <VStack gap={8} className={styles.main}>
          {children}
        </VStack>
        {hasAside ? (
          <VStack gap={6} className={`${styles.aside} ${shortToc && aside == null ? styles.tocShort : ''}`}>
            {aside}
            {hasToc ? (
              <VStack
                as="nav"
                gap={3}
                aria-label={tocTitle}
                className={toc.length < 4 ? styles.tocShort : undefined}
              >
                <Text type="label" color="secondary">
                  {tocTitle}
                </Text>
                <TocList entries={toc} />
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
    <Link href={href} color="secondary" isStandalone className={styles.backLink}>
      <HStack as="span" gap={1.5} vAlign="center">
        <ArrowLeft />
        {label}
      </HStack>
    </Link>
  );
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
};

/**
 * HTML-Entitäten aus Ghost-Überschriften dekodieren (COD7): React escaped den Text erneut,
 * „&lt;Image&gt;“ bliebe sonst sichtbar. Benannte Grundentitäten + numerische (&#39;, &#x27;).
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
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
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, '')).trim();
    if (text) {
      out.push({ id: m[1], text });
    }
  }
  return out;
}
