import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { ItemCover } from '@/components/item-cover';
import type { CoverMotif } from '@/components/cover-art';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import styles from './content-card.module.css';

/** Minimaldaten einer Karte – CardItem (lib/items) und Ghost-/Demo-Einträge passen hinein. */
export interface ContentCardData {
  kind: 'project' | 'post';
  slug: string;
  title: string;
  href: string;
  excerpt?: string;
  image?: string | null;
  demo?: boolean;
  date?: string;
  readingMinutes?: number;
  category?: string;
  categoryLabel?: string;
  topics?: { slug: string; label: string }[];
}

const DATE_LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };

/** Datum stabil zwischen Server und Browser (feste Zeitzone, kein Hydration-Mismatch). */
export function formatDate(iso: string, lang: Lang, style: 'medium' | 'long' = 'medium'): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    dateStyle: style,
    timeZone: 'Europe/Berlin',
  }).format(new Date(iso));
}

const TOPIC_MOTIF: Record<string, CoverMotif> = {
  web: 'web',
  cms: 'cms',
  ghost: 'cms',
  automation: 'automation',
  tooling: 'automation',
  nextjs: 'code',
};

/** Kategorie-Marke und Motiv fürs generative Cover – aus vorhandenen Daten, nichts erfunden. */
export function coverMeta(item: ContentCardData, lang: Lang): { label: string; motif: CoverMotif } {
  const dict = getDictionary(lang);
  const firstTopic = item.topics?.[0];
  const key = item.category ?? firstTopic?.slug ?? '';
  const motif = TOPIC_MOTIF[key] ?? (item.kind === 'post' ? 'article' : 'code');
  const label =
    item.categoryLabel ?? firstTopic?.label ?? (item.kind === 'post' ? dict.kindPost : dict.kindProject);
  return { label, motif };
}

function metaLine(item: ContentCardData, lang: Lang): string {
  const dict = getDictionary(lang);
  const parts: string[] = [];
  if (item.date) {
    parts.push(formatDate(item.date, lang));
  }
  if (item.readingMinutes) {
    parts.push(`${item.readingMinutes} ${dict.readingMinutes}`);
  }
  if (parts.length === 0) {
    parts.push(item.kind === 'post' ? dict.kindPost : dict.kindProject);
  }
  return parts.join(' · ');
}

/**
 * Eine Karte für Projekte und Artikel (L6): Cover 16:10 bündig oben, darunter IMMER eine
 * Meta-Zeile (Datum/Lesezeit bzw. Art + Demo-Token), Titel, Auszug (max. 3 Zeilen).
 * Dadurch liegen Überschriften jeder Reihe auf einer Linie, egal ob Bild oder Demo.
 */
export function ContentCard({
  item,
  lang,
  headingAccessibilityLevel,
  showExcerpt = true,
}: {
  item: ContentCardData;
  lang: Lang;
  /** z. B. 2, wenn die Karte direkt unter der H1 steht (T9: kein Sprung h1 → h3). */
  headingAccessibilityLevel?: 2 | 3 | 4;
  showExcerpt?: boolean;
}) {
  const dict = getDictionary(lang);
  const { label, motif } = coverMeta(item, lang);
  return (
    <ClickableCard label={item.title} href={item.href} padding={0} className={styles.card}>
      <VStack gap={0} height="100%">
        <ItemCover src={item.image} seed={item.slug} label={label} motif={motif} />
        <VStack gap={2} padding={5}>
          {/* feste Mindesthöhe = Höhe des Tokens sm (22px): Titel fluchten mit und ohne Demo-Token (L6) */}
          <HStack gap={2} vAlign="center" wrap="wrap" minHeight="calc(var(--spacing-5) + var(--spacing-0-5))">
            <Text type="supporting" color="secondary">
              {metaLine(item, lang)}
            </Text>
            {item.demo ? <Token label={dict.demoToken} size="sm" className="print-hide" /> : null}
          </HStack>
          <Heading level={3} accessibilityLevel={headingAccessibilityLevel} textWrap="balance">
            {item.title}
          </Heading>
          {showExcerpt && item.excerpt ? (
            <Text color="secondary" maxLines={3} hasTruncateTooltip={false}>
              {item.excerpt}
            </Text>
          ) : null}
        </VStack>
      </VStack>
    </ClickableCard>
  );
}

/** Kartenreihen (E6): mind. 260px je Spalte, höchstens 3 Spalten, Spuren „fill“. */
export const CARD_COLUMNS: { minWidth: number; max: number } = { minWidth: 260, max: 3 };
