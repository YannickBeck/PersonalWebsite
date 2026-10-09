import { Text } from '@astryxdesign/core/Text';
import styles from './fact-list.module.css';

/**
 * Kurze Liste in den kompakten Angaben (Sprachen, Interessen): je Eintrag eine Zeile statt
 * einer ·-Kette, die über mehrere Zeilen läuft und Trenner an Zeilenenden hängt (DES12).
 * `note` (z. B. Sprachniveau) steht sekundär hinter dem Eintrag; bricht die Zeile, rutscht
 * sie als Ganzes in die nächste Zeile (kein Trenner am Zeilenende oder -anfang).
 */
export function FactList({ items }: { items: { main: string; note?: string }[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.main}>
          <Text>{item.main}</Text>
          {item.note ? (
            <Text color="secondary">
              {/* sichtbar trennt der Abstand, vorgelesen ein Doppelpunkt */}
              <span className="yb-sr-only">: </span>
              {item.note}
            </Text>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
