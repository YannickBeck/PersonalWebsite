import { Fragment, type ReactNode } from 'react';

/** Satzzeichen direkt nach dem Akzent-Wort (z. B. „*RAG*.“). */
const TRAILING_PUNCT = /^[.,!?:;…]+/;

/**
 * Überschrift mit Akzent-Wort: „Zwei Projekte rund um *RAG*.“ → das Wort in Sternchen erscheint in
 * der feinen Kursiv-Serif (Klasse .yb-serif, globals.css). Der Text bleibt für Screenreader
 * und Suchmaschinen unverändert (nur ein <em>). Server- und Client-tauglich.
 *
 * Folgende Satzzeichen wandern mit ins <em> (B4, gemessen): Die Serif lädt nach der Grotesk;
 * stand der Punkt als eigener Textknoten hinter dem Wort, rückte er beim Schriftwechsel ein
 * paar Pixel und zählte als Layout-Shift (CLS 0,0003–0,001 auf allen Unterseiten mit
 * Akzent-Wort in der H1). Im selben Textknoten bleibt sein Startpunkt stehen.
 */
export function Emphasis({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('*') && part.endsWith('*')) {
      const next = parts[i + 1] ?? '';
      const punct = next.match(TRAILING_PUNCT)?.[0] ?? '';
      if (punct) {
        parts[i + 1] = next.slice(punct.length);
      }
      out.push(
        <em key={i} className="yb-serif">
          {part.slice(1, -1) + punct}
        </em>,
      );
    } else if (part) {
      out.push(<Fragment key={i}>{part}</Fragment>);
    }
  }
  return out;
}

/** Text ohne Sternchen (für aria-label, Metadaten, Markdown). */
export function plain(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1');
}
