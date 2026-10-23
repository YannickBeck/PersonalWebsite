/**
 * Sprache der globalen 404 (Rest-Feinschliff): src/proxy.ts setzt diesen Anfrage-Header für
 * /en/*, src/app/global-not-found.tsx liest ihn. Ein eigener Name, kein Standard-Header.
 */
export const LANG_HEADER = 'x-yb-lang';
