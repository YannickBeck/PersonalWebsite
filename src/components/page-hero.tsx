import type { ReactNode } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Emphasis } from '@/components/emphasis';
import styles from './page-hero.module.css';

/** Kopfabstand unter dem Header (VIS2), auch für Home-Hero und 404. */
export const PAGE_TOP = styles.top;

/**
 * Seitenkopf der Unterseiten (Redesign B4) – dieselbe Sprache wie die Abschnitte der
 * Startseite: oben die Kennung in der Display-Schrift (Seitenname bzw. „Art · Jahr“, wie die
 * Abschnittsnummern), darunter die H1 mit Akzent-Wort (`*Wort*` → Kursiv-Serif) und die Lede.
 *
 * size:
 *  - 'xl'      ausdrucksstarke Überschrift (Startseiten-Format, z. B. „Gebaut und *untersucht*.“)
 *  - 'lg'      lange Titel (Projekt- und Artikelseiten, Rechtstexte)
 *  - 'display' Name in der Display-Schrift (Lebenslauf): Versalien, Tinte, druckt gut
 * eyebrow: Zurück-Link über der Kennung; meta: Zeile(n) unter der Lede (Datum, Links, Lücken).
 */
export function PageHero({
  title,
  kicker,
  lede,
  eyebrow,
  meta,
  size = 'xl',
}: {
  title: string;
  kicker?: string;
  lede?: string;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  size?: 'xl' | 'lg' | 'display';
}) {
  const titleClass = size === 'display' ? `${styles.title} ${styles.display} yb-display` : `${styles.title} ${styles[size]}`;
  return (
    <Section paddingBlockEnd={0} className={styles.top}>
      {/* .yb-enter: gestaffelter Einstieg beim ersten Laden (motion.css §3) */}
      <VStack gap={4} maxWidth={size === 'lg' ? 820 : 880} className="yb-enter">
        {eyebrow}
        {kicker ? (
          <Text type="label" color="secondary" className={styles.kicker}>
            <span className="yb-display">{kicker}</span>
          </Text>
        ) : null}
        <Heading level={1} textWrap="balance" className={titleClass}>
          <Emphasis text={title} />
        </Heading>
        {lede ? (
          <Text type="large" color="secondary" textWrap="pretty" className={styles.lede}>
            {lede}
          </Text>
        ) : null}
        {meta}
      </VStack>
    </Section>
  );
}
