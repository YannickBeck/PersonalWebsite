/**
 * Lücken-Mechanik (Content-Modell src/content/profile.ts).
 *
 * NEXT_PUBLIC_SHOW_GAPS=1 (Build-Variable, wird in Server- und Client-Bundles eingesetzt):
 * offene Angaben erscheinen als gestrichelte „OFFEN: …“-Platzhalter (src/components/gap.tsx),
 * dazu die Vorschau-Hinweiszeile und /content-status in der Navigation.
 * Ohne die Variable (Produktion) fehlen offene Angaben vollständig – Layouts müssen in beiden
 * Fällen tragen (Gate: zwei Builds).
 */
export const SHOW_GAPS = process.env.NEXT_PUBLIC_SHOW_GAPS === '1';
