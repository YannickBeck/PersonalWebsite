/**
 * YB brand theme — Astryx custom theme für yannick-beck.de (Redesign 2026-10).
 *
 * Bauen nach jeder Änderung: pnpm exec astryx theme build src/theme/yb-theme.ts
 * (erzeugt yb.css, yb.js, yb.d.ts und yb.variants.d.ts; alle vier committen).
 *
 * Grundsätze
 * - Eigenständig (kein `extends`). Hell UND Dunkel als [light, dark]-Tupel; ohne gespeicherte
 *   Wahl folgt die Seite dem System, der Schalter setzt hell ↔ dunkel (E2).
 * - Grundton hell: warmes Papierweiß, tiefe Tinte, viel Weißraum. Die Farbwelt nimmt das
 *   Porträt auf (warmes Sonnenlicht, beige Jacke, schwarzer Rollkragen): Papier statt
 *   Kaltweiß, Tinte mit einem Hauch Violett statt Navy.
 *     hell    body #F7F4EE (Papier) → card/popover #FFFFFF, surface #FBF9F5, muted #EFEBE3
 *     dunkel  body #121117 (Tinte) → surface #17161D → card #1C1B22 → popover #23222B
 * - EIN Akzent: Violett (Markenfarbe #5B3FE0, dunkel aufgehellt #A28CFF), sparsam – Fokus,
 *   aktive Zustände, Links, kleine Marken. Primärschaltflächen sind Tinten-Pillen
 *   (background-inverted), damit das Violett nicht auf jeder Fläche steht (Anti-Slop
 *   „Excessive Accent“).
 * - Kontraste (WCAG, gemessen mit contrast.py): Text 16,5:1 / 15,7:1; Sekundärtext 6,5:1 auf
 *   Papier, 5,9:1 auf muted, 7,6:1 dunkel; Akzent 5,9:1 auf Papier, 6,9:1 dunkel; Feldränder
 *   (border-emphasized) 3,3:1 hell / 4,0:1 dunkel (≥ 3:1, WCAG 1.4.11).
 * - Formen: Karten 20px, Felder 12px, Innenflächen 6px; Buttons als Pillen (radius-full).
 *   Karten mit Schatten-Ring statt Rand (Make-Interfaces-Feel-Better: Schatten für Tiefe,
 *   Ränder für Struktur): hell drei transparente Ebenen, dunkel ein heller Ring.
 * - Seitenrhythmus über Abstand statt Farbbänder: Section transparent, 40px (mobil 24px).
 *
 * Typografie (Schriften: src/app/_shell/fonts.ts)
 * - Text/Überschriften: Fustat. Display (Namenszug, Abschnittsnummern, „IT Consultant“):
 *   Sofia Sans Extra Condensed über --yb-font-display. Einzelne Wörter in Überschriften:
 *   Newsreader Italic über --yb-font-serif (Klasse .yb-serif, motion.css-frei, globals.css).
 *   Technik/Kürzel: JetBrains Mono (code).
 * - Skala base 16 / ratio 1.25; Display- und H1-Größen fließend per clamp().
 *
 * Code (VIS4, A114): Syntax-Theme aus der Palette – Fläche Tinte #17161D (beide Modi dunkel);
 *   Kontraste gegen #17161D: Text 14,6 · Keyword 6,9 · String 9,7 · Kommentar 5,3 (≥ 4,5:1).
 *
 * Motion (Werte nur hier; Nutzung in src/app/motion.css)
 * - Astryx-Dauern: fast 150 ms, medium 350 ms, slow 800 ms; min/max = ×0.75 / ÷0.75.
 *   Easing --ease-standard = cubic-bezier(.24,1,.4,1). Eigene lokale Tokens (--yb-*) unten;
 *   unter prefers-reduced-motion: reduce setzt eine Adaptation Wege und Stagger auf 0.
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {defineSyntaxTheme} from '@astryxdesign/core/theme/syntax';

// Familie über die next/font-Variablen (COD5); hier nur noch der System-Stack.
const SANS_FALLBACKS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO_FALLBACKS = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/** Syntax-Farben aus der Palette (VIS4/A114), Fläche Tinte. */
const ybSyntax = defineSyntaxTheme({
  name: 'yb',
  tokens: {
    keyword: '#B7A6FF',
    string: '#D9D2C5',
    comment: '#9A958B',
    number: '#C9BCFF',
    function: '#E2DAFF',
    type: '#D6D0C4',
    variable: '#EEEAE3',
    operator: '#B3AEA4',
    constant: '#C9BCFF',
    tag: '#B7A6FF',
    attribute: '#E2DAFF',
    property: '#D6D0C4',
    punctuation: '#B3AEA4',
    background: '#17161D',
  },
});

export const ybTheme = defineTheme({
  name: 'yb',
  color: {accent: ['#5B3FE0', '#A28CFF'], neutralStyle: 'warm', contrast: 'standard'},
  typography: {
    scale: {base: 16, ratio: 1.25},
    body: {family: 'var(--font-fustat)', fallbacks: SANS_FALLBACKS},
    heading: {family: 'var(--font-fustat)', fallbacks: SANS_FALLBACKS, weight: 'semibold'},
    code: {family: 'var(--font-jetbrains-mono)', fallbacks: MONO_FALLBACKS},
  },
  motion: {fast: 150, medium: 350, slow: 800, ratio: 0.75},
  syntax: ybSyntax,
  tokens: {
    // ---- Akzent: ein Violett, kontraststark in beiden Modi
    '--color-accent': ['#5B3FE0', '#A28CFF'],
    '--color-on-accent': ['#FFFFFF', '#121117'],
    '--focus-outline-color': 'var(--color-accent)',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px color-mix(in srgb, var(--color-accent) 55%, transparent)',

    // ---- Flächen: Papier (hell) / Tinte (dunkel)
    '--color-background-body': ['#F7F4EE', '#121117'],
    '--color-background-surface': ['#FBF9F5', '#17161D'],
    '--color-background-muted': ['#EFEBE3', '#1D1C24'],
    '--color-background-card': ['#FFFFFF', '#1C1B22'],
    '--color-background-popover': ['#FFFFFF', '#23222B'],
    '--color-background-inverted': ['#16151B', '#EEEAE3'],

    // ---- Text, Icons, Linien
    '--color-text-primary': ['#16151B', '#EEEAE3'],
    '--color-text-secondary': ['#5C5850', '#A9A49A'],
    '--color-text-disabled': ['#A29D93', '#6A665E'],
    '--color-icon-primary': ['#16151B', '#EEEAE3'],
    '--color-icon-secondary': ['#5C5850', '#A9A49A'],
    '--color-icon-disabled': ['#A29D93', '#6A665E'],
    '--color-border': ['#16151B1A', '#EEEAE31F'],
    // Feld- und Steuerelementränder ≥ 3:1 gegen Seite und Feldfläche (A111, WCAG 1.4.11)
    '--color-border-emphasized': ['#8A857B', '#77736B'],
    '--color-neutral': ['#16151B0D', '#EEEAE314'],
    '--color-overlay': ['#16151B66', '#05050899'],
    '--color-overlay-hover': ['#16151B0D', '#FFFFFF12'],
    '--color-overlay-pressed': ['#16151B1A', '#FFFFFF1F'],
    '--color-skeleton': ['#E3DED4', '#2A2932'],
    '--color-track': ['#E3DED4', '#2A2932'],

    // ---- Formen: Karten 20 / Felder 12 / innen 6 (konzentrisch: Karte 20 = Feld 12 + 8 Abstand)
    '--radius-inner': '6px',
    '--radius-element': '12px',
    '--radius-container': '20px',
    '--radius-page': '32px',

    // ---- Typografie
    '--text-heading-1-size': 'clamp(var(--font-size-2xl), 1.625rem + 1vw, var(--font-size-3xl))',
    '--text-heading-1-leading': '1.15',
    '--text-heading-2-size': 'clamp(var(--font-size-xl), 1.3rem + 0.9vw, var(--font-size-2xl))',
    '--text-heading-2-leading': '1.2',
    '--text-heading-3-leading': '1.4',
    '--text-large-weight': 'var(--font-weight-normal)',
    '--text-large-leading': '1.5',
    '--text-display-1-size': 'clamp(var(--font-size-3xl), 1.9rem + 2.4vw, var(--font-size-5xl))',
    '--text-display-1-weight': 'var(--font-weight-semibold)',
    '--text-display-1-leading': '1.05',
    '--text-display-2-size': 'clamp(var(--font-size-2xl), 1.6rem + 1.75vw, var(--font-size-4xl))',
    '--text-display-2-weight': 'var(--font-weight-semibold)',
    '--text-display-2-leading': '1.08',
    '--text-display-3-size': 'clamp(var(--font-size-2xl), 1.4rem + 1.4vw, var(--font-size-3xl))',
    '--text-display-3-weight': 'var(--font-weight-semibold)',
    '--text-display-3-leading': '1.12',

    // ---- Bedienelemente: etwas großzügiger als der Astryx-Standard (28/32/36)
    '--size-element-sm': '30px',
    '--size-element-md': '36px',
    '--size-element-lg': '44px',
  },
  localTokens: {
    // ---- Schriftfamilien neben dem Theme-Text (Display, Akzent-Serif)
    '--yb-font-display': 'var(--font-display), "Arial Narrow", "Roboto Condensed", sans-serif',
    '--yb-font-serif': 'var(--font-serif), Georgia, "Times New Roman", serif',

    // ---- Schatten-Ring für Karten und Kacheln (statt Rand; Hover etwas kräftiger).
    //      light-dark() nimmt nur Farben – deshalb Farben je Modus, die Schattenliste einmal.
    //      Dunkel nur der helle Ring (Tiefenschatten sind auf Tinte unsichtbar).
    '--yb-ring-color': ['oklch(0 0 0 / 0.07)', 'oklch(1 0 0 / 0.09)'],
    '--yb-ring-color-hover': ['oklch(0 0 0 / 0.1)', 'oklch(1 0 0 / 0.16)'],
    '--yb-lift-color': ['oklch(0 0 0 / 0.07)', 'transparent'],
    '--yb-ambient-color': ['oklch(0 0 0 / 0.05)', 'transparent'],
    '--yb-shadow-ring':
      '0px 0px 0px 1px var(--yb-ring-color), 0px 1px 2px -1px var(--yb-lift-color), 0px 2px 4px 0px var(--yb-ambient-color)',
    '--yb-shadow-ring-hover':
      '0px 0px 0px 1px var(--yb-ring-color-hover), 0px 2px 4px -1px var(--yb-lift-color), 0px 8px 20px 0px var(--yb-ambient-color)',
    // Bild-Kontur: neutral schwarz/weiß 10 % (nie getönt)
    '--yb-image-outline': ['oklch(0 0 0 / 0.1)', 'oklch(1 0 0 / 0.1)'],
    // Blasser Namenszug im Einstieg (dekorativ, aria-hidden)
    '--yb-name-ghost': ['color-mix(in srgb, #16151B 7%, transparent)', 'color-mix(in srgb, #EEEAE3 7%, transparent)'],

    // ---- Motion-Tokens für eigene Animationen (src/app/motion.css)
    '--yb-motion-micro': 'var(--duration-fast)',
    '--yb-motion-exit': 'var(--duration-fast-min)',
    '--yb-motion-enter': 'var(--duration-medium-min)',
    '--yb-motion-emphasis': 'var(--duration-medium-max)',
    '--yb-motion-stagger': 'calc(var(--duration-fast) * 0.2667)',
    '--yb-motion-distance': 'var(--spacing-6)',
    '--yb-ease-enter': 'var(--ease-standard)',
    '--yb-ease-exit': 'cubic-bezier(0.4, 0, 1, 1)',
    '--yb-ease-move': 'cubic-bezier(0.65, 0, 0.35, 1)',

    // ---- Fließtext auf Detailseiten (L5, VIS4): 18px, Zeilenhöhe 1.7
    '--yb-prose-size': 'calc(var(--font-size-base) * 1.125)',
    // ---- Überschriften-Tracking (auch für Ghost-/Artikel-HTML) und Strichstärken (COD10)
    '--yb-heading-tracking': '-0.011em',
    '--yb-stroke-motif': '1.5px',
    '--yb-stroke-icon': '2px',
    // ---- Kontur des Secondary-Buttons: hell dezent, dunkel leise
    '--yb-control-border': ['#CFC9BD', '#3A3942'],
  },
  components: {
    // Seitenstruktur ohne Farbbänder (L3).
    section: {
      base: {padding: 'var(--spacing-10) var(--spacing-4)'},
      'variant:section': {backgroundColor: 'transparent'},
    },
    card: {
      base: {
        padding: 'var(--spacing-5)',
        borderColor: 'transparent',
        boxShadow: 'var(--yb-shadow-ring)',
      },
      // Gedämpfte Karten liegen in der Fläche: kein Ring
      'variant:muted': {boxShadow: 'none'},
    },
    button: {
      base: {fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)'},
      // Primär = Tinten-Pille (hell: Tinte auf Papier, dunkel: Papier auf Tinte). Hover hebt
      // sich in beiden Modi sichtbar ab.
      'variant:primary': {
        backgroundColor: 'var(--color-background-inverted)',
        color: 'var(--color-background-body)',
        ':hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-background-inverted) 84%, var(--color-accent))',
        },
      },
      // Secondary: Kartenfläche + dezente Kontur, Hover auf muted
      'variant:secondary': {
        backgroundColor: 'light-dark(var(--color-background-card), var(--color-neutral))',
        color: 'var(--color-text-primary)',
        borderWidth: 'var(--border-width)',
        borderStyle: 'solid',
        borderColor: 'var(--yb-control-border)',
        ':hover': {
          backgroundColor: 'light-dark(var(--color-background-muted), var(--color-overlay-hover))',
        },
      },
    },
    heading: {
      base: {letterSpacing: 'var(--yb-heading-tracking)', textWrap: 'balance'},
      'level:1': {letterSpacing: '-0.02em'},
      'type:display-1': {letterSpacing: '-0.03em'},
      'type:display-2': {letterSpacing: '-0.025em'},
      'type:display-3': {letterSpacing: '-0.02em'},
    },
    text: {
      'type:large': {textWrap: 'pretty'},
    },
    'list-item': {
      base: {':last-child': {borderBottomWidth: '0'}},
    },
    'top-nav-heading': {
      base: {fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.01em'},
    },
    banner: {
      base: {'--color-text-accent': 'var(--color-text-primary)'},
      'status:note': {backgroundColor: 'var(--color-background-muted)'},
    },
  },
  adaptations: {
    rules: [
      // Mobil: engerer Seitenrhythmus (24px statt 40px)
      {
        when: {width: {below: 'md'}},
        value: {components: {section: {base: {padding: 'var(--spacing-6) var(--spacing-4)'}}}},
      },
      // Touch: Bedienelemente ≥ 44px (M5, A122)
      {
        when: {pointer: 'coarse'},
        value: {
          tokens: {'--size-element-sm': '44px', '--size-element-md': '44px', '--size-element-lg': '48px'},
          components: {'collapsible-trigger': {base: {minHeight: 'var(--size-element-md)'}}},
        },
      },
      // Reduced Motion: keine Wege, kein Stagger, kurze Dauern (X3/W8)
      {
        when: {motion: 'reduce'},
        value: {
          localTokens: {
            '--yb-motion-distance': '0px',
            '--yb-motion-stagger': '0ms',
            '--yb-motion-exit': 'var(--duration-fast-min)',
            '--yb-motion-enter': 'var(--duration-fast-min)',
            '--yb-motion-emphasis': 'var(--duration-fast-min)',
          },
        },
      },
    ],
  },
});
