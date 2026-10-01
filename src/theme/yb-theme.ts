/**
 * YB brand theme — Astryx custom theme für yannick-beck.de.
 *
 * Bauen nach jeder Änderung: pnpm exec astryx theme build src/theme/yb-theme.ts
 * (erzeugt yb.css, yb.js, yb.d.ts und yb.variants.d.ts; alle vier committen).
 *
 * Grundsätze
 * - Eigenständig (kein `extends`): gothic war ein Dark-only-Theme und hat Light Mode,
 *   Secondary-Buttons, Status-Farben, Schatten und Abstände verfälscht (V1).
 * - Hell UND Dunkel als [light, dark]-Tupel; System ist Startwert (E2).
 * - Ein Violett überall (E3): Akzent als Token-Tupel samt on-accent, weil der
 *   color.accent-Generator für Dark sonst ein blasses Pastell (#D1BBFF) erzeugt.
 * - Hintergrund-Leiter aus EINER Navy-Familie mit sichtbarer Abstufung (V4):
 *     dunkel  body #0A0E1A → surface #0F1528 → muted #131A30 → card #18203A → popover #1E2744
 *     hell    body #F6F7FB → surface/card/popover #FFFFFF, muted #EEF0F7
 * - Seitenrhythmus über Abstand statt Farbbänder: Section-Standardvariante transparent (L3),
 *   Section-Padding 40px (mobil 24px) block, 16px inline (L4).
 *
 * Typografie (V5, A6)
 * - Fustat (Text/Überschriften) und JetBrains Mono (Code), beide über next/font geladen;
 *   die metrisch angepassten Fallbacks "Fustat Fallback" / "JetBrains Mono Fallback"
 *   stehen im Stack, damit der Font-Swap keinen Layout-Sprung erzeugt.
 * - Skala base 16 / ratio 1.25: sm 13 · base 16 · lg 20 · xl 25 · 2xl 31 · 3xl 39 · 4xl 49 · 5xl 61 px.
 * - Display- und H1-Größen fließend per clamp() zwischen zwei Skalenstufen (keine Sprünge
 *   an Breakpoints): display-2 (Hero-H1) 31→49 px, H1 Unterseiten 31→39 px, H2 25 px.
 * - Display: Zeilenhöhe ~1.08, Tracking −0.025em. Lede (Text type="large") normales Gewicht.
 * - Alle Überschriften semibold (gothic hatte H3/H4 bold → H3 wirkte schwerer als H2).
 *
 * Motion (dokumentiert, Werte nur hier; Nutzung in src/app/motion.css)
 * - Astryx-Dauern: fast 150 ms (Hover/Press), medium 350 ms (Ein-/Ausblenden, Slides),
 *   slow 800 ms; min/max = ×0.75 / ÷0.75. Easing --ease-standard = cubic-bezier(.24,1,.4,1).
 * - Eigene lokale Tokens (--yb-*): micro, exit (kürzer als enter), enter, emphasis,
 *   stagger, Slide-Distanz und Exit-/Move-Easing. Unter prefers-reduced-motion: reduce
 *   setzt eine Adaptation Distanz und Stagger auf 0 und kürzt die Dauern → Slides werden
 *   automatisch zu kurzen Überblendungen, ohne dass jede Animation das selbst prüfen muss.
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {dracula} from '@astryxdesign/core/theme/syntax';

const SANS_FALLBACKS =
  '"Fustat Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO_FALLBACKS = '"JetBrains Mono Fallback", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const ybTheme = defineTheme({
  name: 'yb',
  color: {accent: ['#5B3FE0', '#9B7BFF'], neutralStyle: 'cool', contrast: 'standard'},
  typography: {
    scale: {base: 16, ratio: 1.25},
    body: {family: 'Fustat', fallbacks: SANS_FALLBACKS},
    heading: {family: 'Fustat', fallbacks: SANS_FALLBACKS, weight: 'semibold'},
    code: {family: 'JetBrains Mono', fallbacks: MONO_FALLBACKS},
  },
  motion: {fast: 150, medium: 350, slow: 800, ratio: 0.75},
  syntax: dracula,
  tokens: {
    // ---- Akzent (E3, V3): ein Violett, kontraststark in beiden Modi
    '--color-accent': ['#5B3FE0', '#9B7BFF'],
    '--color-on-accent': ['#FFFFFF', '#0B0F1C'],
    '--focus-outline-color': 'var(--color-accent)',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px color-mix(in srgb, var(--color-accent) 55%, transparent)',

    // ---- Hintergrund-Leiter (V4, Verifier-Korrektur): eine Navy-Familie
    '--color-background-body': ['#F6F7FB', '#0A0E1A'],
    '--color-background-surface': ['#FFFFFF', '#0F1528'],
    '--color-background-muted': ['#EEF0F7', '#131A30'],
    '--color-background-card': ['#FFFFFF', '#18203A'],
    '--color-background-popover': ['#FFFFFF', '#1E2744'],
    '--color-background-inverted': ['#141826', '#F6F7FB'],

    // ---- Text, Icons, Linien (aus derselben Familie)
    '--color-text-primary': ['#141826', '#E6E8F2'],
    '--color-text-secondary': ['#525868', '#A3ABC0'],
    '--color-text-disabled': ['#9AA0B2', '#5D6580'],
    '--color-icon-primary': ['#141826', '#E6E8F2'],
    '--color-icon-secondary': ['#525868', '#A3ABC0'],
    '--color-icon-disabled': ['#9AA0B2', '#5D6580'],
    '--color-border': ['#1B1F3B1A', '#A5B4FC24'],
    '--color-border-emphasized': ['#A7AEC2', '#3D4766'],
    '--color-neutral': ['#1B1F3B0F', '#A5B4FC1A'],
    '--color-overlay': ['#0A0E1A66', '#05070D99'],
    '--color-overlay-hover': ['#1B1F3B0D', '#FFFFFF12'],
    '--color-overlay-pressed': ['#1B1F3B1A', '#FFFFFF1F'],
    '--color-skeleton': ['#D5D9E5', '#2A3350'],
    '--color-track': ['#D5D9E5', '#2A3350'],

    // ---- Typografie (V5, A6)
    '--text-heading-1-size': 'clamp(var(--font-size-2xl), 1.625rem + 1vw, var(--font-size-3xl))',
    '--text-heading-1-leading': '1.15',
    '--text-heading-2-leading': '1.28',
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
    // ---- Motion-Tokens für eigene Animationen (src/app/motion.css)
    '--yb-motion-micro': 'var(--duration-fast)',
    '--yb-motion-exit': 'var(--duration-fast)',
    '--yb-motion-enter': 'var(--duration-medium)',
    '--yb-motion-emphasis': 'var(--duration-medium-max)',
    '--yb-motion-stagger': 'calc(var(--duration-fast) * 0.4)',
    '--yb-motion-distance': 'var(--spacing-6)',
    '--yb-ease-enter': 'var(--ease-standard)',
    '--yb-ease-exit': 'cubic-bezier(0.4, 0, 1, 1)',
    '--yb-ease-move': 'cubic-bezier(0.65, 0, 0.35, 1)',

    // ---- Fließtext auf Detailseiten (L5): 18px, Zeilenhöhe 1.7 (reading-layout/ghost-content)
    '--yb-prose-size': 'calc(var(--font-size-base) * 1.125)',

    // ---- Terminal-Karte im Hero (E4): bewusst in beiden Modi dunkel (Code-Optik),
    //      aus derselben Navy-Familie; Kontraste: Text 15:1, Ausgabe 8:1, Prompt 5,9:1
    '--yb-terminal-background': '#0B1020',
    '--yb-terminal-bar': '#111833',
    '--yb-terminal-border': ['#1B1F3B26', '#A5B4FC24'],
    '--yb-terminal-text': '#E6E8F2',
    '--yb-terminal-muted': '#A3ABC0',
    '--yb-terminal-prompt': '#9B7BFF',
    '--yb-terminal-dot': '#3D4766',
  },
  components: {
    // Seitenstruktur ohne Farbbänder (L3). Astryx-intern nutzen nur BottomSheet-Panels
    // (malen ihre Fläche selbst, BottomSheetPanel.tsx) und Toolbar eine Standard-Section.
    section: {
      base: {padding: 'var(--spacing-10) var(--spacing-4)'},
      'variant:section': {backgroundColor: 'transparent'},
    },
    card: {
      base: {padding: 'var(--spacing-5)'},
    },
    'clickable-card': {
      base: {
        ':hover': {
          borderColor: 'color-mix(in srgb, var(--color-accent) 55%, var(--color-border-emphasized))',
        },
      },
    },
    button: {
      base: {fontWeight: 'var(--font-weight-semibold)'},
      // Primary-Hover sichtbar in beiden Modi (V8-Verifier)
      'variant:primary': {
        ':hover': {
          backgroundColor:
            'light-dark(color-mix(in srgb, var(--color-accent) 86%, black), color-mix(in srgb, var(--color-accent) 82%, white))',
        },
      },
      // Secondary: leise Fläche + Kontur statt Schieferblock (V1-Verifier)
      'variant:secondary': {
        backgroundColor: 'var(--color-neutral)',
        color: 'var(--color-text-primary)',
        borderWidth: 'var(--border-width)',
        borderStyle: 'solid',
        borderColor: 'var(--color-border-emphasized)',
      },
    },
    heading: {
      base: {letterSpacing: '-0.011em', textWrap: 'balance'},
      'level:1': {letterSpacing: '-0.02em'},
      'type:display-1': {letterSpacing: '-0.03em'},
      'type:display-2': {letterSpacing: '-0.025em'},
      'type:display-3': {letterSpacing: '-0.02em'},
    },
    text: {
      'type:large': {textWrap: 'pretty'},
    },
    // Listen mit Trennlinien: keine Linie unter der letzten Zeile (wirkt in Cards wie ein Fehler)
    'list-item': {
      base: {':last-child': {borderBottomWidth: '0'}},
    },
    'top-nav-heading': {
      base: {fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.01em'},
    },
    banner: {
      // Links in Bannern in Titelfarbe statt Akzent (Akzent auf getönter Fläche zu schwach).
      // Unterscheidbarkeit vom Fließtext über <Link hasUnderline> (WCAG 1.4.1).
      base: {'--color-text-accent': 'var(--color-text-primary)'},
      // Ruhiger Hinweis (E1): neutrale Fläche, kein Icon; unbekannter Status → role="status".
      'status:note': {backgroundColor: 'var(--color-background-muted)'},
    },
  },
  adaptations: {
    rules: [
      // Mobil: engerer Seitenrhythmus (L4-Verifier: 24px statt 40px)
      {
        when: {width: {below: 'md'}},
        value: {components: {section: {base: {padding: 'var(--spacing-6) var(--spacing-4)'}}}},
      },
      // Touch: Bedienelemente ≥ 44px (M5)
      {
        when: {pointer: 'coarse'},
        value: {tokens: {'--size-element-sm': '36px', '--size-element-md': '44px', '--size-element-lg': '48px'}},
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
