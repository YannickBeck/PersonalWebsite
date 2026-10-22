'use client';

import { useEffect } from 'react';
import { holdTransitions } from '@/lib/instant';

/**
 * Sprünge innerhalb der Startseite (Fähigkeit ↔ Projekt ↔ Werdegang).
 *
 * Verweise sind normale Anker mit `data-jump` (<a href="#project-orbitalis" data-jump>), auch
 * aus Server-Komponenten – ohne JS springt der Browser zum Anker. Mit JS:
 * 1. Ereignis JUMP_EVENT → Client-Blätter wählen bzw. öffnen ihr Ziel (Kachel, Projekt),
 *    ein <details> am Ziel (Werdegang) wird geöffnet;
 * 2. ohne CSS-Übergänge (holdTransitions, bis gescrollt ist), damit die Höhen sofort stehen;
 *    nach dem Commit Scrollen (weich nur bei no-preference) und Fokus auf das Bedienelement des
 *    Ziels ([data-jump-focus]), kurze Markierung über data-yb-jumped;
 * 3. URL per replaceState – kein History-Eintrag ohne Next-State (wie section-nav.tsx, FUN2).
 * Scrollen und Fokus warten auf Reacts Commit: bis das Ziel nicht mehr inert ist (A116: ein
 * Filter im Periodensystem macht Kacheln inert, ein zu früher focus() ließ den Fokus auf der
 * Marke stehen) und bis ein Akkordeon-Eintrag offen ist (Abschluss-Fixes A111: React übernimmt
 * die Auswahl aus dem Sprung-Ereignis mit normaler Priorität, oft erst nach dem nächsten
 * Frame – untereinander klappte Orbitalis danach noch zu und schob den Kopf der
 * Bachelorarbeit bis −860px aus dem Bild).
 * Auch die Aktionen des Einstiegs („Kontakt“, „Projekte“: Anker in .yb-hero-actions) laufen
 * hierüber (A111): Sie setzen den Fokus in den Zielabschnitt, statt nur zu scrollen.
 * Beim Laden mit Anker (z. B. /#skill-rag von einer Projektseite) und bei hashchange wird das
 * Ziel ausgewählt/geöffnet; das Scrollen übernimmt der Browser bzw. Next. Nachgeführt wird nur,
 * solange die Seite noch an der Ankerposition steht (nicht nach wiederhergestellter
 * Scrollposition beim Neuladen oder Zurück):
 * - Ziele mit `data-jump-scroll` (Kacheln des Periodensystems, Fix-Runde 3): Der Browser stellte
 *   die Kachel oben hin, Kopf und Detailfeld lagen über dem Bildschirm – das Raster rückt in Sicht.
 * - Ziele, die das Öffnen selbst verschiebt (Abschluss-Fixes A111/A112): #project-bachelorarbeit
 *   (untereinander klappt Orbitalis darüber zu) und #career-… unter dem offenen Studium – sie
 *   rücken nach dem Commit wieder an die Ankerposition (vorher bis −910px).
 *
 * <HomeJump /> steht in home-content.tsx NACH den Abschnitten: Effekte laufen in Baum-
 * Reihenfolge, die Abschnitte haben ihre Listener dann schon registriert.
 */
export const JUMP_EVENT = 'yb:jump';

/** Listener für Sprungziele; liefert die Abmeldung (für useEffect). */
export function onJump(handler: (id: string) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<{ id: string }>).detail.id);
  window.addEventListener(JUMP_EVENT, listener);
  return () => window.removeEventListener(JUMP_EVENT, listener);
}

const MARK_MS = 1600;

function prepare(id: string): HTMLElement | null {
  window.dispatchEvent(new CustomEvent(JUMP_EVENT, { detail: { id } }));
  const el = document.getElementById(id);
  if (!el) {
    return null;
  }
  const details = el instanceof HTMLDetailsElement ? el : el.closest('details');
  if (details && !details.open) {
    details.open = true;
  }
  return el;
}

/** Fokussierbar = nicht in einem inerten Teilbaum (Filter im Periodensystem, A116). */
function focusable(el: HTMLElement): boolean {
  return !el.closest('[inert]');
}

/** Bedienelement eines Ziels: ganze Abschnitte selbst, sonst [data-jump-focus] darin. */
function focusTarget(target: HTMLElement): HTMLElement {
  return target.matches('[data-jump-focus], section') ? target : (target.querySelector<HTMLElement>('[data-jump-focus]') ?? target);
}

/** Akkordeon-Eintrag, dessen Öffnen React noch nicht übernommen hat (A111). */
function pending(target: HTMLElement): boolean {
  return target.dataset.open === 'false';
}

/** Höchstens so lange auf Reacts Commit warten (danach trotzdem scrollen). */
const COMMIT_WAIT_MS = 500;

function jump(id: string) {
  // Ziel öffnet ohne Übergang: Akkordeon/Details stehen in ihrer endgültigen Höhe, bevor
  // gescrollt wird – sonst zielte das Scrollen auf eine Position, die sich noch verschiebt
  // (z. B. wenn ein anderer Werdegang-Eintrag oder Orbitalis darüber zuklappt). Die Sperre
  // hält bis nach dem Scrollen (nicht nur zwei Frames: Reacts Commit kann später kommen).
  const release = holdTransitions();
  const el = prepare(id);
  if (!el) {
    release();
    return;
  }
  window.history.replaceState(window.history.state, '', `#${id}`);
  const start = performance.now();
  const run = () => {
    const target = document.getElementById(id) ?? el;
    // Ganze Abschnitte (Aktionen des Einstiegs) bekommen den Fokus selbst wie bei der
    // Abschnittsnavigation; sonst das Bedienelement des Ziels
    const focusEl = focusTarget(target);
    // Commit steht aus (Filter-Wechsel: noch inert; Akkordeon: noch zu) – weiter warten
    if ((!focusable(focusEl) || pending(target)) && performance.now() - start < COMMIT_WAIT_MS) {
      window.requestAnimationFrame(run);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollId = target.dataset.jumpScroll;
    const scrollEl = (scrollId && document.getElementById(scrollId)) || target;
    scrollEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    focusEl.focus({ preventScroll: true });
    target.setAttribute('data-yb-jumped', '');
    window.setTimeout(() => target.removeAttribute('data-yb-jumped'), MARK_MS);
    release();
  };
  window.requestAnimationFrame(run);
}

/** Steht das Ziel dort, wohin der Browser einen Anker scrollt (scroll-padding + scroll-margin)? */
function atAnchorPosition(target: HTMLElement): boolean {
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return Math.abs(target.getBoundingClientRect().top - (pad + margin)) <= 4;
}

/** Liegt der Fokus nirgends (body)? Dann darf ein Sprungziel ihn bekommen. */
function focusIsFree(): boolean {
  const active = document.activeElement;
  return active === null || active === document.body || active === document.documentElement;
}

/**
 * Nach dem Anker-Scroll des Browsers nachführen (Laden, hashchange):
 * - Kacheln (data-jump-scroll): Raster in Sicht, wenn die Kachel an der Ankerposition steht;
 * - Ziele, die das Öffnen verschoben hat: zurück an die Ankerposition, wenn sie vorher dort
 *   standen (anchorY = Scrollposition davor) und seither niemand gescrollt hat.
 * - Fokus (Feinschliff, REG3): Kam die Startseite per Client-Navigation mit Anker (Chip einer
 *   Projektseite → /#skill-rag) und steht das Ziel dort, wohin der Anker führt, bekommt sein
 *   Bedienelement den Fokus – wie beim Sprung innerhalb der Seite. Vorher blieb er auf body
 *   (der Link der alten Seite war weg, Next fokussierte die Kachel nicht). Nur, solange der
 *   Fokus nirgends liegt; nach Browser-Zurück an eine andere Stelle nicht (Ziel nicht an der
 *   Ankerposition) und beim ersten Laden nicht (kein Fokusring ohne Eingabe).
 */
function alignHashTarget(id: string, anchorY: number | null, release: () => void, focus = false) {
  const start = performance.now();
  const align = () => {
    const target = document.getElementById(id);
    if (!target) {
      release();
      return;
    }
    if (pending(target) && performance.now() - start < COMMIT_WAIT_MS) {
      window.requestAnimationFrame(align);
      return;
    }
    const scrollId = target.dataset.jumpScroll;
    const scrollEl = scrollId ? document.getElementById(scrollId) : null;
    const atAnchor = atAnchorPosition(target);
    const moved = !atAnchor && anchorY !== null && Math.abs(window.scrollY - anchorY) < 1;
    if (scrollEl && (atAnchor || moved)) {
      scrollEl.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else if (moved) {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    const focusEl = focusTarget(target);
    if (focus && (atAnchor || moved) && focusIsFree() && focusable(focusEl)) {
      focusEl.focus({ preventScroll: true });
    }
    release();
  };
  // zwei Frames: Auswahl (Filter aufheben, Akkordeon öffnen) ist dann meist committet
  window.requestAnimationFrame(() => window.requestAnimationFrame(align));
  // Chrome scrollt beim Abschluss des Ladens noch einmal zum Anker, wenn niemand gescrollt hat
  if (document.readyState !== 'complete') {
    window.addEventListener(
      'load',
      () =>
        window.requestAnimationFrame(() => {
          const target = document.getElementById(id);
          const scrollId = target?.dataset.jumpScroll;
          const scrollEl = scrollId ? document.getElementById(scrollId) : null;
          if (target && scrollEl && atAnchorPosition(target)) {
            scrollEl.scrollIntoView({ block: 'start', behavior: 'auto' });
          }
        }),
      { once: true },
    );
  }
}

export function HomeJump() {
  useEffect(() => {
    // Capture-Phase: Die Aktionen des Einstiegs sind Next-Links (Astryx-Button → TransitionLink),
    // deren Klick-Handler den Anker sonst selbst ansteuert (nur scrollen, Fokus bleibt stehen –
    // A111). Hier vorher abgefangen und nicht weitergereicht.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      // data-jump-Anker und die Aktionen des Einstiegs (Astryx-Button reicht data-* nicht durch)
      const link = (event.target as Element | null)?.closest?.('a[data-jump], .yb-hero-actions a[href^="#"]');
      const id = link?.getAttribute('href')?.replace(/^#/, '');
      if (!id || !document.getElementById(id)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      jump(id);
    };
    // Client-Navigation auf die Startseite? RouteTransition setzt data-yb-nav im Layout-Effekt,
    // also vor diesem Effekt; beim ersten Laden des Dokuments fehlt es.
    const viaClient = document.documentElement.hasAttribute('data-yb-nav');
    const fromHash = (event?: Event) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const before = id ? document.getElementById(id) : null;
      if (!before) {
        return;
      }
      // Lage vor dem Öffnen: Stand das Ziel an der Ankerposition, folgt die Seite ihm
      const anchorY = atAnchorPosition(before) ? window.scrollY : null;
      const release = holdTransitions();
      if (prepare(id)) {
        alignHashTarget(id, anchorY, release, viaClient && !event);
      } else {
        release();
      }
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', fromHash);
    fromHash();
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('hashchange', fromHash);
    };
  }, []);
  return null;
}
