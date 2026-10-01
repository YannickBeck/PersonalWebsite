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
 * Porträt nur mit echter Bildquelle rendern (E1). Solange null, zeigen Startseite und
 * „Über mich“ Text + Fakten statt eines Platzhalters.
 */
export const PORTRAIT_SRC: string | null = null;
