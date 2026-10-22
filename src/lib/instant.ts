/**
 * Zustandswechsel ohne CSS-Transitions (B3): setzt <html data-yb-instant>.
 * motion.css schaltet darunter alle Transitions ab – Farben/Zustände stehen sofort, die
 * View Transition (oder bei Reduced Motion: nichts) übernimmt den sichtbaren Übergang.
 * Nur im Browser aufrufen.
 *
 * - `suppressTransitions()`: für zwei Frames. Genutzt bei Theme-Wechsel (providers.tsx),
 *   Seitenwechsel (route-transition.tsx) und Filter (post-list.tsx).
 * - `holdTransitions()`: bis die zurückgegebene Freigabe aufgerufen ist (plus ein Frame).
 *   Für Sprünge auf der Startseite (home-jump.tsx, Abschluss-Fixes A111): Das Akkordeon
 *   übernimmt die Auswahl erst mit Reacts Commit, und der kam teils erst nach den zwei
 *   Frames – dann lief der Übergang doch und das Scrollen zielte auf eine Position, die sich
 *   noch verschob.
 * Mehrere gleichzeitige Sperren werden gezählt; das Attribut fällt mit der letzten.
 */
let holds = 0;

export function holdTransitions(): () => void {
  const root = document.documentElement;
  holds += 1;
  root.setAttribute('data-yb-instant', '');
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    requestAnimationFrame(() => {
      holds = Math.max(0, holds - 1);
      if (holds === 0) {
        root.removeAttribute('data-yb-instant');
      }
    });
  };
}

export function suppressTransitions() {
  const release = holdTransitions();
  requestAnimationFrame(release);
}
