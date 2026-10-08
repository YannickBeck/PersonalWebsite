import type { ReactNode } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';
import { Emphasis } from '@/components/emphasis';
import styles from './split-section.module.css';

/**
 * Unterseiten-Abschnitt (L7, Redesign B4): Titelspalte links (1/3, klebt beim Lesen), Inhalt
 * rechts (2/3) ab 1024px, darunter gestapelt. Kopf wie die Abschnitte der Startseite: Nummer
 * in der Display-Schrift (dekorativ, aria-hidden), H2 mit Akzent-Wort (`*Wort*`). Optional
 * eine Trennlinie auf der Inhaltslinie (nicht über die Section-Kante hinaus, L3-Verifier).
 */
export function SplitSection({
  id,
  index,
  title,
  lede,
  aside,
  children,
  hasDivider = false,
}: {
  id?: string;
  index?: string;
  title: string;
  lede?: string;
  /** Zusatz unter dem Titel (z. B. Button). */
  aside?: ReactNode;
  children: ReactNode;
  hasDivider?: boolean;
}) {
  return (
    <Section id={id} className={styles.section}>
      <VStack gap={8}>
        {hasDivider ? <Divider /> : null}
        <Grid columns={1} gap={6} className={styles.split}>
          <VStack gap={3} className={styles.head}>
            {index ? (
              <Text type="label" color="secondary" className={styles.index}>
                <span className="yb-display" aria-hidden="true">
                  {index}
                </span>
              </Text>
            ) : null}
            <Heading level={2} textWrap="balance" className={styles.title}>
              <Emphasis text={title} />
            </Heading>
            {lede ? (
              <Text color="secondary" textWrap="pretty">
                {lede}
              </Text>
            ) : null}
            {aside}
          </VStack>
          <VStack gap={6} className={styles.body}>
            {children}
          </VStack>
        </Grid>
      </VStack>
    </Section>
  );
}
