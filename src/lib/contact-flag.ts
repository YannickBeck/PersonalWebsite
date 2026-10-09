import { getDictionary, type Lang } from '@/i18n/dictionaries';

/**
 * Kontaktformular sichtbar? Build-Variable `NEXT_PUBLIC_CONTACT_FORM=1` (Fix-Runde 1, DES6).
 *
 * Ohne sie zeigen Startseite und /kontakt statt des Formulars einen kompakten, ehrlichen
 * Zustand (LinkedIn als Hauptweg, „Das Kontaktformular folgt“) – kein ausgegrautes Formular.
 * Entschieden wird beim Build (die Seiten sind statisch), damit nichts nachträglich springt.
 * Der Versand selbst braucht weiterhin die Laufzeit-Variablen CONTACT_* (docs/kontaktformular.md);
 * fehlen sie trotz Flag, zeigt das Formular den Hinweis „Versand gerade nicht verfügbar“.
 * Kein Geheimnis: Der Wert landet im Browser-Bundle.
 */
export const CONTACT_FORM_ENABLED = process.env.NEXT_PUBLIC_CONTACT_FORM === '1';

/** Lede des Kontakt-Abschnitts der Startseite (und der Kontakt-Teaser) passend zum Zustand. */
export function contactLede(lang: Lang): string {
  const h = getDictionary(lang).home;
  return CONTACT_FORM_ENABLED ? h.contactLede : h.contactLedeLinkedIn;
}

/** Lede (und Meta-Description) der Seite /kontakt passend zum Zustand. */
export function contactPageLede(lang: Lang): string {
  const page = getDictionary(lang).pages.kontakt;
  return CONTACT_FORM_ENABLED ? page.lede : page.ledeLinkedIn;
}
