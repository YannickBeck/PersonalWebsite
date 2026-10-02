'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { langFromPath, type Lang } from './dictionaries';

/**
 * Seitensprache für Client-Komponenten im Root-Layout (Header, Footer, Skip-Link, Hinweiszeile,
 * Links, Astryx-Texte) – EINE Quelle statt langFromPath(usePathname()) je Komponente (JURY1-1).
 *
 * Warum nicht einfach der Pfad: Unbekannte URLs bekommen das EINE statisch vorgerenderte
 * /_not-found-HTML (Deutsch). Auf /en/<unbekannt> läse der Client beim Hydrieren „en“ aus dem
 * Pfad → Text-Mismatch mit dem Server-HTML (React #418) und deutscher Inhalt unter englischem
 * Rahmen. Deshalb gilt auf dem Not-found-Segment während der Hydration die Sprache des
 * vorgerenderten HTML („de“); direkt danach schaltet alles gemeinsam auf die Pfadsprache um.
 * Den kurzen deutschen Zwischenstand blendet frame.module.css (.notFoundDe) aus (nur mit JS,
 * ohne JS bleibt die deutsche 404 vollständig sichtbar).
 *
 * Eigene 404 unter /en (src/app/en/[...rest] + notFound()) wurde gemessen und verworfen:
 * notFound() in einer Seite liefert in Next 16.3 die leere __next_error__-Hülle (ohne CSS, ohne
 * Inhalt; ohne JS leer), mit Suspense-Fallback dagegen Status 200 (Soft-404).
 */

/** Segment des Root-Layouts für unbekannte URLs (Next: UNDERSCORE_NOT_FOUND_ROUTE). */
const NOT_FOUND_SEGMENT = '/_not-found';

const subscribeNothing = () => () => {};

/** false beim Server-Rendern und Hydrieren, danach true (kein setState im Effekt nötig). */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

/** Nur in Providers aufrufen (Root-Layout-Ebene: das Segment ist dort das der Route). */
export function useResolvedRouteLang(): Lang {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  const hydrated = useIsHydrated();
  if (segment === NOT_FOUND_SEGMENT && !hydrated) {
    return 'de';
  }
  return langFromPath(pathname);
}

export const RouteLangContext = createContext<Lang>('de');

/** Sprache der aktuellen Seite (über Providers bereitgestellt). */
export function useRouteLang(): Lang {
  return useContext(RouteLangContext);
}
