'use client';

import { createContext, useContext } from 'react';
import type { Lang } from './dictionaries';

/**
 * Seitensprache für Client-Komponenten (Header, Footer, Skip-Link, Hinweiszeile, Links,
 * Astryx-Texte) – EINE Quelle statt langFromPath(usePathname()) je Komponente (JURY1-1).
 *
 * Seit den zwei Root-Layouts (src/app/(de)/layout.tsx, src/app/en/layout.tsx) kommt die Sprache
 * vom Server: RootShell übergibt sie an Providers, die sie hier bereitstellen. Damit stimmen
 * Server-HTML und Hydration immer überein; der frühere Sonderfall für /_not-found (deutsches
 * HTML unter /en, Umschalten nach der Hydration) entfällt – unbekannte URLs bedient
 * src/app/global-not-found.tsx ohne React-Hydration.
 */
export const RouteLangContext = createContext<Lang>('de');

/** Sprache der aktuellen Seite (über Providers bereitgestellt). */
export function useRouteLang(): Lang {
  return useContext(RouteLangContext);
}
