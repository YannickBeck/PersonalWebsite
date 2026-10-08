/**
 * Theme-Boot (gegen Theme-Flash, X1/T2/VV1).
 *
 * Läuft als blockierendes Inline-Script im <head> (src/app/layout.tsx), also bevor der
 * Browser den ersten Frame malt. Setzt eine gespeicherte Wahl hell/dunkel als
 * <html data-theme>, damit schon das SSR-HTML im richtigen Farbschema erscheint.
 * Ohne gespeicherte Wahl bleibt das Attribut weg → System (prefers-color-scheme).
 * <html lang> setzt seit den zwei Root-Layouts der Server (RootShell); das Boot-Script fasst
 * die Sprache nicht mehr an (Ausnahme: global-not-found.tsx mit eigenem Script).
 *
 * Gegenstücke:
 * - globals.css reicht das Attribut vor der Hydration an den Astryx-Theme-Wrapper durch.
 * - providers.tsx übernimmt die Wahl per useLayoutEffect vor dem ersten Paint nach der Hydration.
 */
export const THEME_STORAGE_KEY = 'yb-theme-mode';

export const THEME_BOOT = `(function(){var d=document.documentElement;try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');if(m==='light'||m==='dark'){d.setAttribute('data-theme',m);}}catch(e){}})();`;
