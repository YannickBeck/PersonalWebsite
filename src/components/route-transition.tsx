'use client';

import { ViewTransition, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { armMorph } from '@/components/morph';
import { NAV_BACK, NAV_FORWARD, PAGE_TRANSITION, morphKeyFor } from '@/lib/transitions';
import { suppressTransitions } from '@/lib/instant';

type NavigationLike = { currentEntry?: { index: number; key: string } | null };

function currentEntry(): { index: number; key: string } | null {
  const nav = (window as unknown as { navigation?: NavigationLike }).navigation;
  const entry = nav?.currentEntry;
  return entry && typeof entry.index === 'number' && typeof entry.key === 'string' ? entry : null;
}

/** Scroll-Position je History-Eintrag (Navigation-API-Key), für Browser-Zurück/-Vorwärts. */
const scrollByEntry = new Map<string, number>();

/** Vor einer Link-Navigation aufrufen (TransitionLink): merkt die Position der alten Seite. */
export function rememberScroll() {
  const entry = currentEntry();
  if (entry) {
    scrollByEntry.set(entry.key, window.scrollY);
  }
}

let pendingRestore: number | null = null;

/**
 * Zentraler Seitenübergang (B3) statt eines Wrappers in jeder page.tsx.
 *
 * Die Next-Doku (view-transitions.md, „Put the wrapper in each page.tsx, not the
 * layout“) begründet das damit, dass Layouts gemountet bleiben und enter/exit dort nie
 * feuern. Der `key={pathname}` löst genau das: Jeder Pfadwechsel tauscht die Boundary aus,
 * React sieht exit (alte Seite) + enter (neue Seite) im selben Commit – für alle Routen
 * (/, Listen, Details, DE ↔ EN, 404), ohne 28 page.tsx anzufassen. Kosten: Der Seitenbaum
 * unter dem Root-Layout wird je Pfad neu gemountet (wie bei template.tsx); Zustand von
 * Client-Komponenten einer Seite (Filter, Formular) beginnt neu – das war ohnehin so.
 *
 * Nur enter/exit animieren (Klassen je Transition-Type, PAGE_TRANSITION). update/share =
 * none: Filter-, Formular- und Theme-Updates innerhalb der Seite lösen KEINEN Seitenübergang
 * aus (XV1).
 *
 * <html data-yb-nav> ab der ersten Client-Navigation: Die Einstiegs-Choreografie (Hero,
 * Terminal) läuft nur beim ersten Laden des Dokuments, nicht bei jeder Rückkehr zur
 * Startseite (M3). useLayoutEffect: das Attribut steht, bevor der Browser die neue Seite
 * stylt/malt bzw. bevor die View Transition den neuen Zustand aufnimmt.
 *
 * Browser-Zurück/-Vorwärts (popstate): Next verarbeitet popstate als ACTION_RESTORE und setzt
 * den Router-State erst in einem Promise-Callback – AUSSERHALB jeder Transition. Damit gibt
 * es dort nie eine View Transition (gemessen: 0, harter Schnitt; entgegen
 * view-transitions.md:358). Außerdem landete Zurück bisher am Seitenanfang statt an der
 * alten Position (B2 gemessen: Liste bei 700 px verlassen → zurück bei 77 px).
 * Deshalb: popstate in der Capture-Phase abfangen und Next einen Task später dieselbe URL per
 * router.replace() mit Richtungs-Typ ansteuern lassen (zurück/vorwärts aus dem
 * Navigation-API-Index) → normale Router-Transition mit Slide und Morph; replace lässt den
 * History-Stapel unverändert. Die Scroll-Position des Ziels kommt aus scrollByEntry und wird
 * im Commit (Layout-Effekt, also vor dem Aufnehmen des neuen Zustands) gesetzt.
 * Nicht abgefangen (Nexts Standardverhalten bleibt): ohne Navigation API oder View
 * Transitions, bei Reduced Motion, bei fremden History-Einträgen (kein __NA, Next lädt neu),
 * bei reinen Anker-Wechseln auf derselben Seite, bei unbekannter Ziel-Position und wenn der
 * Browser selbst schon animiert (hasUAVisualTransition, z. B. Wischgeste).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = useRef(pathname);
  const shown = useRef<{ index: number; key: string } | null>(null);

  useLayoutEffect(() => {
    // Vergleich mit dem zuletzt gezeigten Pfad (nicht dem ersten): auch die Rückkehr zur
    // Einstiegsseite ist ein Seitenwechsel.
    const changed = currentPath.current !== pathname;
    currentPath.current = pathname;
    shown.current = currentEntry();
    if (changed) {
      document.documentElement.setAttribute('data-yb-nav', '');
      // Zustände der neuen Seite (aktiver Nav-Punkt, Link-Farben) ohne Nachziehen
      suppressTransitions();
    }
    if (pendingRestore !== null) {
      window.scrollTo({ top: pendingRestore, behavior: 'instant' });
      pendingRestore = null;
    }
  }, [pathname]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const entry = currentEntry();
      const previous = shown.current;
      const to = window.location.pathname;
      const target = entry ? scrollByEntry.get(entry.key) : undefined;
      const skip =
        to === currentPath.current ||
        typeof document.startViewTransition !== 'function' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        (event as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition === true ||
        !(event.state && typeof event.state === 'object' && '__NA' in event.state);
      if (previous) {
        // Position der Seite, die wir gerade verlassen (der Browser hat noch nicht gescrollt)
        scrollByEntry.set(previous.key, window.scrollY);
      }
      if (skip || entry === null || previous === null || target === undefined) {
        return;
      }
      event.stopImmediatePropagation();
      const type = entry.index > previous.index ? NAV_FORWARD : NAV_BACK;
      armMorph(morphKeyFor(currentPath.current, to));
      pendingRestore = target;
      const leaving = window.scrollY;
      const { search, hash } = window.location;
      // Nächster Frame (vor dem Malen): Der Browser hat inzwischen seine eigene Scroll-
      // Wiederherstellung auf die noch alte Seite angewendet – zurück auf die Stelle, an der
      // der Nutzer war, damit die alte Ansicht ohne Sprung hinausgleitet. Außerdem liegt der
      // Aufruf so außerhalb von Reacts synchroner popstate-Behandlung („eager“).
      window.requestAnimationFrame(() => {
        if (window.scrollY !== leaving) {
          window.scrollTo({ top: leaving, behavior: 'instant' });
        }
        router.replace(`${to}${search}${hash}`, { scroll: false, transitionTypes: [type] });
      });
    };
    window.addEventListener('popstate', onPopState, { capture: true });
    return () => window.removeEventListener('popstate', onPopState, { capture: true });
  }, [router]);

  return (
    <ViewTransition key={pathname} enter={PAGE_TRANSITION} exit={PAGE_TRANSITION} update="none" share="none" default="none">
      {children}
    </ViewTransition>
  );
}
