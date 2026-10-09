'use client';

import { useEffect } from 'react';
import { suppressTransitions } from '@/lib/instant';

/**
 * Sprünge innerhalb der Startseite (Fähigkeit ↔ Projekt ↔ Werdegang).
 *
 * Verweise sind normale Anker mit `data-jump` (<a href="#project-orbitalis" data-jump>), auch
 * aus Server-Komponenten – ohne JS springt der Browser zum Anker. Mit JS:
 * 1. Ereignis JUMP_EVENT → Client-Blätter wählen bzw. öffnen ihr Ziel (Kachel, Projekt),
 *    ein <details> am Ziel (Werdegang) wird geöffnet;
 * 2. ohne CSS-Übergänge (suppressTransitions), damit die Höhen sofort stehen; nach dem
 *    Commit (nächster Frame) Scrollen (weich nur bei no-preference) und Fokus auf das
 *    Bedienelement des Ziels ([data-jump-focus]), kurze Markierung über data-yb-jumped;
 * 3. URL per replaceState – kein History-Eintrag ohne Next-State (wie section-nav.tsx, FUN2).
 * Der Fokus wartet, bis das Ziel nicht mehr inert ist (A116): Ein Filter im Periodensystem
 * macht Kacheln inert; hebt der Sprung ihn auf, ist die Kachel erst nach Reacts Commit wieder
 * fokussierbar – ein zu früher focus() ließ den Fokus auf der Marke stehen.
 * Auch die Aktionen des Einstiegs („Kontakt“, „Projekte“: Anker in .yb-hero-actions) laufen
 * hierüber (A111): Sie setzen den Fokus in den Zielabschnitt, statt nur zu scrollen.
 * Beim Laden mit Anker (z. B. /#skill-rag von einer Projektseite) und bei hashchange wird das
 * Ziel nur ausgewählt/geöffnet; das Scrollen übernimmt der Browser bzw. Next.
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

function jump(id: string) {
  // Ziel öffnet ohne Übergang: Akkordeon/Details stehen im nächsten Frame in ihrer
  // endgültigen Höhe – sonst zielte das Scrollen auf eine Position, die sich noch verschiebt
  // (z. B. wenn ein anderer Werdegang-Eintrag darüber zuklappt). Sichtbar ist das Scrollen.
  suppressTransitions();
  const el = prepare(id);
  if (!el) {
    return;
  }
  window.history.replaceState(window.history.state, '', `#${id}`);
  let tries = 0;
  const run = () => {
    const target = document.getElementById(id) ?? el;
    // Ganze Abschnitte (Aktionen des Einstiegs) bekommen den Fokus selbst wie bei der
    // Abschnittsnavigation; sonst das Bedienelement des Ziels
    const focusEl =
      target.matches('[data-jump-focus], section') ? target : (target.querySelector<HTMLElement>('[data-jump-focus]') ?? target);
    // Noch inert (Commit des Filter-Wechsels steht aus): einen weiteren Frame warten, höchstens 10
    if (!focusable(focusEl) && tries < 10) {
      tries += 1;
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
  };
  window.requestAnimationFrame(run);
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
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) {
        prepare(id);
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
