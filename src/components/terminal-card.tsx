import type { CSSProperties } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import styles from './terminal-card.module.css';

function WindowDots() {
  return (
    <svg className={styles.dots} viewBox="0 0 44 12" aria-hidden="true" focusable="false">
      <circle cx="6" cy="6" r="5" />
      <circle cx="22" cy="6" r="5" />
      <circle cx="38" cy="6" r="5" />
    </svg>
  );
}

/**
 * Terminal-Karte im Hero (E4): Code-Optik statt Porträt. Zeilen aus dict.homeTerminal;
 * „$ “-Zeilen sind Befehle (Prompt in Akzentfarbe, werden „getippt“), die übrigen Ausgaben.
 * Die Einblendung ist reines CSS (terminal-card.module.css) und läuft nur ohne
 * Reduced-Motion-Präferenz; ohne JS und für Screenreader steht der volle Text sofort da.
 */
export function TerminalCard({
  title,
  lines,
  label,
}: {
  title: string;
  lines: string[];
  label: string;
}) {
  return (
    <Card padding={0} className={styles.terminal} role="figure" aria-label={label}>
      <HStack className={styles.bar} gap={3} vAlign="center" paddingInline={4} paddingBlock={3}>
        <WindowDots />
        <Text type="code" size="sm" className={styles.title}>
          {title}
        </Text>
      </HStack>
      <VStack className={styles.body} gap={1.5} padding={5}>
        {lines.map((line, i) => {
          const isCommand = line.startsWith('$ ');
          const text = isCommand ? line.slice(2) : line;
          const vars = { '--yb-line': i, '--yb-chars': Math.max(text.length, 1) } as CSSProperties;
          return (
            <Text
              key={`${i}-${line}`}
              type="code"
              display="block"
              className={isCommand ? styles.command : styles.output}
              style={vars}
            >
              {isCommand ? (
                <>
                  <span className={styles.prompt} aria-hidden="true">
                    ${' '}
                  </span>
                  <span className={styles.typed}>{text}</span>
                </>
              ) : (
                text
              )}
            </Text>
          );
        })}
        <Text
          type="code"
          display="block"
          className={styles.command}
          style={{ '--yb-line': lines.length } as CSSProperties}
          aria-hidden="true"
        >
          <span className={styles.prompt}>$ </span>
          <span className={styles.cursor} />
        </Text>
      </VStack>
    </Card>
  );
}
