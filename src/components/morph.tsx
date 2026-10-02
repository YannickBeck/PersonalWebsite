'use client';

import { ViewTransition, useSyncExternalStore, type ReactNode } from 'react';
import { MORPH_SHARE, morphName } from '@/lib/transitions';

/*
 * Shared-Element-Morph Karten-Cover ↔ Detail-Cover (B3, Muster 1/6 der Recherche).
 *
 * Problem: Liste, Startseite und „Das könnte dich auch interessieren“ zeigen dieselben
 * Einträge. Trügen alle Karten-Cover dauerhaft ihren Namen, würden beim Seitenwechsel
 * ALLE Paare gleichzeitig morphen (z. B. Startseite → /projekte: drei Karten fliegen).
 * Lösung: Karten-Cover heißen nur, wenn sie „scharf“ sind – TransitionLink schaltet beim
 * Klick genau einen Schlüssel scharf (synchrones Update vor dem Navigations-Commit).
 * Das Detail-Cover (MorphTarget) heißt immer; ohne Partner bleibt es dank
 * default="none" unbewegt.
 */

let armedKey: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Schlüssel (Detailpfad) scharf schalten; null = keiner. */
export function armMorph(key: string | null) {
  if (key === armedKey) {
    return;
  }
  armedKey = key;
  for (const l of listeners) {
    l();
  }
}

/** Karten-Cover: Name nur, solange dieser Eintrag geklickt wurde bzw. zurückmorphen soll. */
export function MorphSource({ morphKey, children }: { morphKey: string; children: ReactNode }) {
  const armed = useSyncExternalStore(
    subscribe,
    () => armedKey === morphKey,
    () => false,
  );
  return (
    <ViewTransition name={armed ? morphName(morphKey) : undefined} share={MORPH_SHARE} default="none">
      {children}
    </ViewTransition>
  );
}

/** Detail-Cover (Hero): trägt den Namen immer; Paar entsteht nur mit einer scharfen Karte. */
export function MorphTarget({ morphKey, children }: { morphKey: string; children: ReactNode }) {
  return (
    <ViewTransition name={morphName(morphKey)} share={MORPH_SHARE} default="none">
      {children}
    </ViewTransition>
  );
}
