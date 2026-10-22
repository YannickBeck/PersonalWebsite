/**
 * Hält ein Element an seiner Stelle im Bildschirm, während sich das Layout darüber ändert
 * (Abschluss-Fixes A111/A112). Öffnet man im gestapelten Projekt-Akkordeon oder im Werdegang
 * einen Eintrag, klappt der offene darüber zu: Ohne Ausgleich rückte der gewählte Kopf samt
 * Fokus um die Höhe des zugeklappten Inhalts nach oben – unter die klebenden Leisten oder aus
 * dem Bild (gemessen bis −860px).
 *
 * Vor der Änderung aufrufen (Klick-Handler, bevor React committet bzw. bevor <details> umschaltet).
 * Gemessen wird die Lage des Elements im Dokument; jeder Frame scrollt danach um deren
 * Verschiebung – also nur, was das Layout bewegt hat. Scrollt die Person währenddessen selbst,
 * bleibt das unberührt. Läuft, bis die Übergänge vorbei sind (motion.css §7/§8: 350ms) und sich
 * drei Frames lang nichts mehr bewegt; unter Reduced Motion ist die Verschiebung sofort da.
 * Die native Scroll-Verankerung (overflow-anchor) ist so lange aus, sonst glichen Browser und
 * Skript dieselbe Verschiebung doppelt aus. Ein neuer Aufruf beendet den vorigen.
 */
const MIN_MS = 450;
const MAX_MS = 1200;

let stopActive: (() => void) | null = null;

export function holdPosition(el: HTMLElement): void {
  stopActive?.();
  const root = document.documentElement;
  const docTop = () => el.getBoundingClientRect().top + window.scrollY;
  const anchor = docTop();
  let applied = 0;
  let still = 0;
  let frame = 0;
  const start = performance.now();
  const previous = root.style.overflowAnchor;
  root.style.overflowAnchor = 'none';

  const stop = () => {
    window.cancelAnimationFrame(frame);
    root.style.overflowAnchor = previous;
    if (stopActive === stop) {
      stopActive = null;
    }
  };

  const tick = (now: number) => {
    if (!el.isConnected) {
      stop();
      return;
    }
    const need = docTop() - anchor - applied;
    if (Math.abs(need) >= 0.5) {
      const before = window.scrollY;
      window.scrollBy({ top: need, behavior: 'instant' });
      const moved = window.scrollY - before;
      // Gezählt wird die tatsächliche Bewegung (Rundung auf ganze Pixel gleicht der nächste
      // Frame aus). Fehlt mehr als die Rundung, hat der Browser am Seitenrand begrenzt: Dann gilt
      // die Korrektur als erledigt – sonst versuchte jeder Frame es erneut und machte ein
      // Scrollen der Person in dieser Zeit rückgängig (gemessen: bei scrollY 0 geöffnet, danach
      // zum Kopf gescrollt – er rutschte bis zum Ende der Haltezeit 576–1055px nach unten).
      applied += Math.abs(need - moved) >= 1 ? need : moved;
      still = moved === 0 ? still + 1 : 0;
    } else {
      still += 1;
    }
    const elapsed = now - start;
    if ((elapsed < MIN_MS || still < 3) && elapsed < MAX_MS) {
      frame = window.requestAnimationFrame(tick);
    } else {
      stop();
    }
  };

  stopActive = stop;
  frame = window.requestAnimationFrame(tick);
}
