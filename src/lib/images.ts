/**
 * Bildquellen-Regeln (E1, V6):
 * - /placeholders/*.svg sind Demo-Platzhalter und gelten als „kein Bild“ → generatives CoverArt.
 * - Echte Bilder (z. B. Ghost feature_image) bleiben unverändert.
 */
export function realImage(src: string | null | undefined): string | null {
  if (!src) {
    return null;
  }
  return src.startsWith('/placeholders/') ? null : src;
}

/**
 * Porträt (Quelle: Foto des Nutzers, Metadaten entfernt). Alle Ausschnitte mit Maßen und
 * Alt-Texten: PHOTOS in src/content/profile.ts. PORTRAIT_SRC bleibt als Kurzform für
 * Komponenten, die nur „ein Porträt“ brauchen (quadratischer Kopf-Ausschnitt).
 */
export const PORTRAIT_SRC = '/me/portrait-avatar.webp';
export const PORTRAIT_CARD_SRC = '/me/portrait-card.webp';
export const PORTRAIT_CUTOUT_SRC = '/me/portrait-cutout.webp';
