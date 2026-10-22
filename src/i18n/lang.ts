/**
 * Sprache und Pfade ohne UI-Texte (Feinschliff, Bundle): Client-Komponenten importieren von hier,
 * damit das Dictionary (src/i18n/dictionaries.ts, beide Sprachen) nicht in jedes Client-Bundle
 * gerät. dictionaries.ts reicht alles weiter – Server-Code bleibt unverändert.
 */
export type Lang = 'de' | 'en';

export const LANGS: Lang[] = ['de', 'en'];
export const DEFAULT_LANG: Lang = 'de';

export function langFromPath(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de';
}

/** Pfad in die andere Sprache spiegeln: /projekte <-> /en/projekte */
export function mirrorPath(pathname: string, lang: Lang): string {
  const rest = langFromPath(pathname) === 'en' ? pathname.replace(/^\/en(\/|$)/, '/') : pathname;
  const clean = rest === '' ? '/' : rest;
  return lang === 'en' ? (clean === '/' ? '/en' : `/en${clean}`) : clean;
}

export function withLang(href: string, lang: Lang): string {
  return lang === 'en' ? (href === '/' ? '/en' : `/en${href}`) : href;
}
