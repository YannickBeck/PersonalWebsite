import { Fragment, type ReactNode } from 'react';

/**
 * Überschrift mit Akzent-Wort: „Gebaut und *untersucht*.“ → das Wort in Sternchen erscheint in
 * der feinen Kursiv-Serif (Klasse .yb-serif, globals.css). Der Text bleibt für Screenreader
 * und Suchmaschinen unverändert (nur ein <em>). Server- und Client-tauglich.
 */
export function Emphasis({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <em key={i} className="yb-serif">
        {part.slice(1, -1)}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Text ohne Sternchen (für aria-label, Metadaten, Markdown). */
export function plain(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1');
}
