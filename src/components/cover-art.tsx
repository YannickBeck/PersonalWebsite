import type { CSSProperties } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { MorphTag } from '@/components/morph';
import styles from './cover-art.module.css';

export type CoverMotif = 'web' | 'cms' | 'automation' | 'code' | 'article';

const PATTERNS = ['grid', 'dots', 'lines', 'rings'] as const;

/** Bildaufbau des Motivs (VIS8): Variation über Komposition und Ausschnitt statt Farbe (E3). */
const COMPOSITIONS = ['corner', 'side', 'crop'] as const;

/** Linien-Motive (24er-Raster, eigene Zeichnung). Strichstärke bleibt beim Skalieren gleich. */
const MOTIF_PATHS: Record<CoverMotif, React.ReactNode> = {
  web: (
    <>
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
      <path d="M2.5 8.5h19M5.25 6.25h.01M7.25 6.25h.01M9.25 6.25h.01" />
      <path d="m10 12-2 2 2 2M14 12l2 2-2 2" />
    </>
  ),
  cms: (
    <>
      <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" />
      <path d="m2.5 12.25 9.5 5 9.5-5M2.5 16.25l9.5 5 9.5-5" />
    </>
  ),
  automation: (
    <>
      <rect x="2.5" y="3" width="7" height="5" rx="1.5" />
      <rect x="14.5" y="9.5" width="7" height="5" rx="1.5" />
      <rect x="2.5" y="16" width="7" height="5" rx="1.5" />
      <path d="M9.5 5.5H12a2 2 0 0 1 2 2v2M9.5 18.5H12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  article: (
    <>
      <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
      <path d="M8 7.5h8M8 11.5h8M8 15.5h5" />
    </>
  ),
};

function hash(seed: string): number {
  let h = 7;
  for (const c of seed) {
    h = (h * 31 + c.charCodeAt(0)) % 100003;
  }
  return h;
}

function MotifSvg({ motif, className }: { motif: CoverMotif; className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {MOTIF_PATHS[motif]}
    </svg>
  );
}

/**
 * Generatives Cover (V6, LV2): EIN Bildsystem für Projekte und Artikel ohne echtes Bild.
 * Verlauf + Muster aus dem Akzent-Token (hell/dunkel automatisch über light-dark()),
 * großes Linienmotiv und eine lesbare Kategorie-Marke – kein Mikrotext, kein Pseudo-Code.
 * Variation je Seed: Muster, Komposition, Lichtpunkt, Verlaufswinkel. Der Seed ist
 * sprachunabhängig (coverSeed in content-card.tsx), DE und EN sehen gleich aus. Füllt seinen Rahmen
 * (AspectRatio in ItemCover). Rein dekorativ: Titel steht immer als Text daneben.
 */
export function CoverArt({
  seed,
  label,
  motif = 'code',
  size = 'card',
}: {
  seed: string;
  label?: string;
  motif?: CoverMotif;
  size?: 'card' | 'hero';
}) {
  const h = hash(seed);
  const vars = {
    '--yb-cover-x': `${18 + (h % 64)}%`,
    '--yb-cover-y': `${12 + ((h >> 3) % 46)}%`,
    '--yb-cover-angle': `${120 + ((h >> 5) % 100)}deg`,
  } as CSSProperties;
  return (
    <VStack
      className={`${styles.cover} yb-cover-media`}
      data-pattern={PATTERNS[h % PATTERNS.length]}
      data-composition={COMPOSITIONS[(h >> 7) % COMPOSITIONS.length]}
      data-size={size}
      style={vars}
      justify="between"
      padding={size === 'hero' ? 6 : 4}
      aria-hidden="true"
    >
      {label ? (
        <MorphTag>
          <HStack className={styles.tag} gap={1.5} vAlign="center">
            <MotifSvg motif={motif} className={styles.tagIcon} />
            <Text type="label" weight="semibold">
              {label}
            </Text>
          </HStack>
        </MorphTag>
      ) : null}
      <MotifSvg motif={motif} className={styles.motif} />
    </VStack>
  );
}
