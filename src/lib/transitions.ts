/**
 * View-Transition-Vokabular (B3, E5) – eine Quelle für Typen, Klassen und Namen.
 * Server-tauglich (keine Hooks): wird von Client-Komponenten (TransitionLink,
 * RouteTransition, MorphSource, Filter) und Server-Komponenten (MorphTarget) genutzt.
 * CSS dazu: src/app/motion.css (Abschnitt 2).
 *
 * Transition-Types (React addTransitionType / Next <Link transitionTypes>):
 *   nav-forward  tiefer in die Hierarchie (Liste → Detail, / → /projekte)
 *   nav-back     zurück nach oben (Detail → Liste, Zurück-Link)
 *   nav-lateral  gleiche Ebene (Projekte ↔ Blog, DE ↔ EN)
 *   filter       Filter-Tabs auf /projekte und /blog: nur das Raster blendet über
 *   theme        Theme-Wechsel (document.startViewTransition, kein React-Übergang)
 */
/**
 * Next-Version, gegen die das popstate-Abfangen in route-transition.tsx verifiziert ist
 * (COD2). Es stützt sich auf Next-Interna (__NA im History-State, Reihenfolge der popstate-
 * Handler). Nach jedem Next-Upgrade: scripts/vt-probe.mjs + scripts/backscroll.mjs (AGENTS.md),
 * dann diese Konstante anheben.
 */
export const TESTED_NEXT = '16.3.6';

/** Schalter für das popstate-Abfangen (false = Nexts Standardverhalten bei Zurück/Vorwärts). */
export const INTERCEPT_POPSTATE = true;

export const NAV_FORWARD = 'nav-forward';
export const NAV_BACK = 'nav-back';
export const NAV_LATERAL = 'nav-lateral';
export const FILTER = 'filter';

type ClassMap = Record<'default' | (string & {}), string>;

/**
 * Seiten-Wrapper (route-transition.tsx): Typ → view-transition-class.
 * default = dezenter Crossfade + Rise, auch für Navigationen ohne Typ.
 */
export const PAGE_TRANSITION: ClassMap = {
  [NAV_FORWARD]: 'yb-nav-forward',
  [NAV_BACK]: 'yb-nav-back',
  [NAV_LATERAL]: 'yb-nav-fade',
  [FILTER]: 'none',
  default: 'yb-nav-fade',
};

/** Karten-Cover ↔ Detail-Cover: morpht bei jeder Seiten-Navigation, nie beim Filtern. */
export const MORPH_SHARE: ClassMap = { [FILTER]: 'none', default: 'yb-morph' };

/** Kategorie-Marke im Cover: eigenes Paar über dem Cover (MOT5, motion.css §2c). */
export const MORPH_TAG_SHARE: ClassMap = { [FILTER]: 'none', default: 'yb-morph-tag' };

/** Filter-Raster: Paar (gleicher Name, neuer key) blendet nur beim Typ „filter“ über. */
export const FILTER_SHARE: ClassMap = { [FILTER]: 'yb-filter', default: 'none' };

function cleanPath(href: string): string {
  const path = href.split(/[?#]/)[0] || '/';
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

/** Pfadtiefe ohne Sprachpräfix: "/" = 0, "/projekte" = 1, "/projekte/x" = 2. */
function depth(path: string): number {
  const segs = cleanPath(path).split('/').filter(Boolean);
  return (segs[0] === 'en' ? segs.slice(1) : segs).length;
}

/** Interner App-Pfad (kein Protokoll, kein //host, kein reiner #Anker). */
export function isInternalPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

/**
 * Richtung einer Link-Navigation aus der Pfadtiefe. undefined = kein Seitenwechsel
 * (externer Link, Anker auf derselben Seite) → keine Transition-Types.
 */
export function navTransitionTypes(from: string, to: string): string[] | undefined {
  if (!isInternalPath(to) || cleanPath(to) === cleanPath(from)) {
    return undefined;
  }
  const d = depth(to) - depth(from);
  return [d > 0 ? NAV_FORWARD : d < 0 ? NAV_BACK : NAV_LATERAL];
}

/** Detailseite eines Projekts/Artikels (DE oder EN)? Liefert den bereinigten Pfad. */
export function detailPath(href: string): string | null {
  if (!isInternalPath(href)) {
    return null;
  }
  const path = cleanPath(href);
  return /^(\/en)?\/(projekte|blog)\/[^/]+$/.test(path) ? path : null;
}

/**
 * Welches Cover soll beim Klick morphen? Ziel ist eine Detailseite → deren Cover
 * (Karte → Hero). Sonst, wenn wir von einer Detailseite kommen → deren Cover
 * (Hero → Karte, z. B. Zurück-Link auf die Liste).
 */
export function morphKeyFor(from: string, to: string): string | null {
  return detailPath(to) ?? detailPath(from);
}

/** view-transition-name je Detailpfad (app-weit eindeutig, gültiger CSS-Ident). */
export function morphName(key: string): string {
  return `yb-cover${key.replace(/[^a-zA-Z0-9-]/g, '_')}`;
}
