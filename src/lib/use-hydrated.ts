import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false beim Server-Rendering und beim Hydrieren, danach true (Rest-Feinschliff REG1).
 *
 * Für Bedienelemente, die nur mit JavaScript etwas tun und sich nicht per CSS ausblenden lassen,
 * weil ihr Inhalt auch ohne JavaScript gebraucht wird (Kacheln des Periodensystems, Köpfe des
 * Projekt-Akkordeons): Das Server-HTML rendert sie ohne Bedienung (kein Tab-Stopp, kein toter
 * Schalter), React setzt Rolle und Bedienung direkt nach der Hydration. Der erste Client-Render
 * stimmt mit dem Server-HTML überein (Server-Snapshot), es gibt keinen Hydration-Fehler.
 * Nach einer Client-Navigation ist der Wert sofort true (kein Hydrieren).
 *
 * Nur Attribute bzw. gleich gestaltete Elemente wechseln – kein Layout-Shift, kein Flackern.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
