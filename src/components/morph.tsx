'use client';

import { ViewTransition, createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { MORPH_SHARE, MORPH_TAG_SHARE, morphName } from '@/lib/transitions';

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

/**
 * Name des umgebenden Morph-Covers (null = nicht scharf). Die Kategorie-Marke im Cover
 * (MorphTag) bildet daraus ein eigenes Paar (MOT5): Sie fliegt von der Karten- an die
 * Hero-Position, statt im überblendeten Cover-Bild unterwegs doppelt zu stehen.
 */
const MorphNameContext = createContext<string | null>(null);

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
  const name = armed ? morphName(morphKey) : null;
  return (
    <MorphNameContext value={name}>
      <ViewTransition name={name ?? undefined} share={MORPH_SHARE} default="none">
        {children}
      </ViewTransition>
    </MorphNameContext>
  );
}

/** Detail-Cover (Hero): trägt den Namen immer; Paar entsteht nur mit einer scharfen Karte. */
export function MorphTarget({ morphKey, children }: { morphKey: string; children: ReactNode }) {
  const name = morphName(morphKey);
  return (
    <MorphNameContext value={name}>
      <ViewTransition name={name} share={MORPH_SHARE} default="none">
        {children}
      </ViewTransition>
    </MorphNameContext>
  );
}

/**
 * Kategorie-Marke im Cover (CoverArt): eigenes Morph-Paar „<cover>-tag“, nur innerhalb eines
 * scharfen MorphSource bzw. eines MorphTarget. Wie beim Cover gilt share + default="none":
 * ohne Partner bekommt die Marke keinen Namen und bewegt sich mit ihrer Seite.
 */
export function MorphTag({ children }: { children: ReactNode }) {
  const name = useContext(MorphNameContext);
  if (!name) {
    return children;
  }
  return (
    <ViewTransition name={`${name}-tag`} share={MORPH_TAG_SHARE} default="none">
      {children}
    </ViewTransition>
  );
}
