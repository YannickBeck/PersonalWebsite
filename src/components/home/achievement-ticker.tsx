'use client';

import { useState, type CSSProperties } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { PauseIcon, PlayIcon } from '@/components/icons';
import styles from './achievement-ticker.module.css';

export interface TickerItem {
  id: string;
  title: string;
  detail?: string;
}

/** Sekunden je Eintrag für einen Umlauf (ruhiges Lesetempo, mindestens 24 s). */
const SECONDS_PER_ITEM = 7;

/**
 * 05 Erfolge: Laufband (Client-Blatt). Erscheint nur mit belegten Einträgen (ACHIEVEMENTS);
 * ohne Einträge rendert die Startseite den Abschnitt nicht (Vorschau: Lücke).
 *
 * - Endlosschleife per CSS (motion.css §9): Spur = Liste + eine Kopie, verschoben um −50 %.
 *   Die Kopie ist aria-hidden und inert (keine doppelten Inhalte für Screenreader/Tastatur).
 * - WCAG 2.2.2: Schalter „Laufband anhalten/fortsetzen“; außerdem hält das Band bei Hover und
 *   solange der Fokus darin liegt.
 * - prefers-reduced-motion: reduce → keine Animation, keine Kopie, kein Schalter: die Einträge
 *   stehen als umbrechende Reihe. Unter 768px Breite: senkrechte, statische Liste.
 */
export function AchievementTicker({
  items,
  label,
  pauseLabel,
  playLabel,
}: {
  items: TickerItem[];
  label: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const [paused, setPaused] = useState(false);
  const duration = `${Math.max(24, items.length * SECONDS_PER_ITEM)}s`;
  const list = (clone: boolean) => (
    <ul className={`${styles.items} ${clone ? styles.clone : ''}`} aria-hidden={clone || undefined} inert={clone}>
      {items.map((it) => (
        <li key={it.id} className={styles.item}>
          <span className={`${styles.title} yb-display`}>{it.title}</span>
          {it.detail ? <span className={styles.detail}>{it.detail}</span> : null}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      role="region"
      aria-label={label}
      className={`${styles.ticker} yb-ticker`}
      data-paused={paused}
      style={{ '--yb-ticker-duration': duration } as CSSProperties}
    >
      <div className={`${styles.viewport} yb-ticker-viewport`}>
        <div className={`${styles.track} yb-ticker-track`}>
          {list(false)}
          {list(true)}
        </div>
      </div>
      <div className={styles.controls}>
        <Button
          label={paused ? playLabel : pauseLabel}
          variant="secondary"
          size="sm"
          icon={paused ? <PlayIcon /> : <PauseIcon />}
          onClick={() => setPaused((p) => !p)}
        />
      </div>
    </div>
  );
}
