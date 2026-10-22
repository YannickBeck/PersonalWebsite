'use client';

import type { MouseEvent } from 'react';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useThemeMode } from '@/app/providers';
import type { ThemeLabels } from '@/i18n/chrome';
import styles from './theme-toggle.module.css';

/**
 * Sonne/Mond als ein Inline-SVG. Welches Symbol sichtbar ist, entscheidet CSS
 * (<html data-theme> bzw. prefers-color-scheme), nicht React-State: so zeigen SSR,
 * Boot-Script und Hydration sofort das richtige Symbol, ohne Mismatch.
 */
function SunMoonIcon() {
  return (
    <svg
      className={`${styles.icon} yb-theme-icon`}
      data-yb-keep-transition=""
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g className={`${styles.sun} yb-theme-icon-part`}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </g>
      <g className={`${styles.moon} yb-theme-icon-part`}>
        <path d="M20.5 14.1A8.5 8.5 0 1 1 9.9 3.5a6.6 6.6 0 0 0 10.6 10.6Z" />
      </g>
    </svg>
  );
}

/** Zwei-Zustand-Umschalter hell ↔ dunkel (E2). Ohne gespeicherte Wahl gilt das System-Schema. */
export function ThemeToggle({ labels }: { labels: ThemeLabels }) {
  const { resolvedMode, toggleMode } = useThemeMode();
  const label =
    resolvedMode === 'dark'
      ? labels.toLight
      : resolvedMode === 'light'
        ? labels.toDark
        : labels.toggle;
  // Kreis-Reveal startet in der Mitte des Schalters (auch bei Tastatur-Auslösung).
  const onClick = (event: MouseEvent<HTMLElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    toggleMode({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };
  return (
    <IconButton
      className="yb-js-only"
      variant="ghost"
      label={label}
      // Tooltip ergänzt statt zu wiederholen (A123): sonst käme das Label zusätzlich als
      // aria-describedby doppelt an
      tooltip={labels.scheme}
      icon={<SunMoonIcon />}
      onClick={onClick}
    />
  );
}
