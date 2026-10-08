import type { ReactNode } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Emphasis } from '@/components/emphasis';
import styles from './home.module.css';

/**
 * Nummerierter Abschnitt der Startseite: <section id> als Sprungziel (Abschnittsnavigation),
 * benannt über die H2. Kopf: Abschnittsnummer in der Display-Schrift (dekorativ, aria-hidden),
 * H2 mit Akzent-Wort, optional eine Lede. tabIndex -1: die Navigation setzt den Fokus hierher.
 */
export function HomeSection({
  id,
  number,
  title,
  lede,
  aside,
  children,
}: {
  id: string;
  number: string;
  title: string;
  lede?: string;
  /** Zusatz rechts neben dem Kopf (z. B. Links), mobil darunter. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} tabIndex={-1} className={styles.section}>
      <Section>
        <VStack gap={8}>
          <header className={styles.sectionHead}>
            <VStack gap={3} maxWidth={720}>
              <Text type="label" color="secondary" className={styles.sectionNumber}>
                <span className="yb-display" aria-hidden="true">
                  {number}
                </span>
              </Text>
              <Heading level={2} id={titleId} textWrap="balance" className={styles.sectionTitle}>
                <Emphasis text={title} />
              </Heading>
              {lede ? (
                <Text color="secondary" textWrap="pretty">
                  {lede}
                </Text>
              ) : null}
            </VStack>
            {aside}
          </header>
          {children}
        </VStack>
      </Section>
    </section>
  );
}
