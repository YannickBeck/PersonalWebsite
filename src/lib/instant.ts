/**
 * Zustandswechsel ohne CSS-Transitions (B3): setzt <html data-yb-instant> für zwei Frames.
 * motion.css schaltet darunter alle Transitions ab – Farben/Zustände stehen sofort, die
 * View Transition (oder bei Reduced Motion: nichts) übernimmt den sichtbaren Übergang.
 * Genutzt bei Theme-Wechsel (providers.tsx), Seitenwechsel (route-transition.tsx) und
 * Filter (project-grid.tsx, post-list.tsx). Nur im Browser aufrufen.
 */
export function suppressTransitions() {
  const root = document.documentElement;
  root.setAttribute('data-yb-instant', '');
  requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute('data-yb-instant')));
}
