import { Text } from '@astryxdesign/core/Text';
import { SHOW_GAPS } from '@/lib/gaps';
import { gapById, type GapId, type Lang } from '@/content/profile';
import styles from './gap.module.css';

/**
 * Vorschau-Platzhalter für eine offene Angabe (Lücken-Mechanik, src/lib/gaps.ts):
 * gestrichelter Rahmen, „OFFEN: …“. In Produktion (ohne NEXT_PUBLIC_SHOW_GAPS=1) rendert er
 * nichts – umgebende Layouts dürfen sich nicht auf ihn verlassen.
 * Server- und Client-tauglich (keine Hooks). block = eigene Zeile statt Inline-Marke.
 */
export function Gap({ id, lang, block = false }: { id: GapId; lang: Lang; block?: boolean }) {
  if (!SHOW_GAPS) {
    return null;
  }
  const gap = gapById(id);
  return (
    <Text
      as={block ? 'p' : 'span'}
      type="supporting"
      color="secondary"
      className={`${styles.gap} ${block ? styles.block : ''} print-hide`}
      data-yb-gap={id}
    >
      <Text type="supporting" weight="semibold" color="inherit">
        OFFEN:
      </Text>{' '}
      {gap.label[lang]}
    </Text>
  );
}

/** Freier Vorschau-Platzhalter ohne Lücken-ID (z. B. ganze Abschnitte). */
export function GapNote({ children, block = true }: { children: React.ReactNode; block?: boolean }) {
  if (!SHOW_GAPS) {
    return null;
  }
  return (
    <Text
      as={block ? 'p' : 'span'}
      type="supporting"
      color="secondary"
      className={`${styles.gap} ${block ? styles.block : ''} print-hide`}
      data-yb-gap=""
    >
      <Text type="supporting" weight="semibold" color="inherit">
        OFFEN:
      </Text>{' '}
      {children}
    </Text>
  );
}
