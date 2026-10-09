import { Fustat, JetBrains_Mono, Newsreader, Sofia_Sans_Extra_Condensed } from 'next/font/google';

/**
 * Schriften (next/font, selbst gehostet, keine Anfrage an Google im Browser). Eigene
 * Variablennamen: --font-family-* gehören dem Theme (yb.css) und binden diese Variablen ein
 * (COD5); die Variablen enthalten die metrisch angepassten Fallbacks (V5).
 *
 * Wahl (Anti-Slop: nicht die Standard-Riege Inter/Geist/Space Grotesk, nicht die üblichen
 * „bold condensed“-Plakatschriften Bebas/Oswald/Anton):
 * - Display: Sofia Sans Extra Condensed – schmale, ruhige Grotesk in Versalien; trägt den
 *   riesigen, blassen Namenszug über die volle Breite und die Abschnittsnummern, ohne zu
 *   schreien. Variable Strichstärke (dünn im Hintergrund, kräftig für „IT Consultant“).
 * - Text: Fustat (bisherige Hausschrift, gut lesbar, offene Formen).
 * - Akzent-Serif: Newsreader Italic – fein, redaktionell, warm; nur für einzelne Wörter in
 *   Überschriften und das Titelblatt der Bachelorarbeit (statt der allgegenwärtigen Instrument
 *   Serif). Nur Gewicht 400, ohne opsz-Achse (Fix-Runde 1, PER2): Die variable Datei mit opsz
 *   und 200–800 wog 147 KB – größte Einzelressource der Startseite für eine Handvoll Wörter.
 *   Gemessen (Verifier): 24 KB, mobil gedrosselt LCP ≤ 2,5 s in 8/8 Läufen. Ohne opsz entfällt
 *   die optische Größenanpassung großer Überschriften (bewusste Abwägung).
 * - Technik: JetBrains Mono für Tags, Versionen, Kürzel (Konvention des Projekts).
 * preload nur für Text und Display (Einstieg/LCP); Serif und Mono laden bei Bedarf.
 */
export const fustat = Fustat({
  variable: '--font-fustat',
  subsets: ['latin'],
});

export const display = Sofia_Sans_Extra_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
});

export const serif = Newsreader({
  variable: '--font-serif',
  subsets: ['latin'],
  style: 'italic',
  weight: '400',
  preload: false,
});

export const mono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  preload: false,
});

export const FONT_VARIABLES = [fustat.variable, display.variable, serif.variable, mono.variable].join(' ');
