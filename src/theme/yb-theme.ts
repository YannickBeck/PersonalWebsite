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
 * - Fustat (Text/Überschriften) und JetBrains Mono (Code), beide über next/font geladen und
 *   per CSS-Variable eingebunden (var(--font-fustat) usw., layout.tsx); die Variablen
 *   enthalten die metrisch angepassten Fallbacks, damit der Font-Swap keinen Layout-Sprung
 *   erzeugt.
 * - Skala base 16 / ratio 1.25: sm 13 · base 16 · lg 20 · xl 25 · 2xl 31 · 3xl 39 · 4xl 49 · 5xl 61 px.
 * - Display- und H1-Größen fließend per clamp() zwischen zwei Skalenstufen (keine Sprünge
 *   an Breakpoints): display-2 (Hero-H1) 31→49 px, H1 Unterseiten 31→39 px, H2 25 px.
 * - Display: Zeilenhöhe ~1.08, Tracking −0.025em. Lede (Text type="large") normales Gewicht.
 * - Alle Überschriften semibold (gothic hatte H3/H4 bold → H3 wirkte schwerer als H2).
 *
 * Code (VIS4, A114): eigenes Syntax-Theme aus der yb-Palette statt Dracula – Fläche wie die
 *   Terminal-Karte (#0B1020, in beiden Modi dunkel), Keywords im Akzent-Violett, Strings und
 *   Kommentare gedämpft. Kontraste gegen #0B1020: Text 15,5 · Keyword 8,2 · String 10,5 ·
 *   Kommentar/Codeblock-Titel 5,9 · Operator 8,2 (alle ≥ 4,5:1; Dracula-Kommentar hatte 3,02).
 *
 * Motion (dokumentiert, Werte nur hier; Nutzung in src/app/motion.css)
 * - Astryx-Dauern: fast 150 ms (Hover/Press), medium 350 ms (Ein-/Ausblenden, Slides),
 *   slow 800 ms; min/max = ×0.75 / ÷0.75. Easing --ease-standard = cubic-bezier(.24,1,.4,1).
 * - Eigene lokale Tokens (--yb-*): micro, exit (kürzer als enter), enter, emphasis,
 *   stagger, Slide-Distanz und Exit-/Move-Easing. Seitenwechsel kurz und leicht überlappend
 *   (MOT3): exit = fast-min (~113 ms), enter = medium-min (~263 ms), gesamt ~300 ms. Unter prefers-reduced-motion: reduce
 *   setzt eine Adaptation Distanz und Stagger auf 0 und kürzt die Dauern → Slides werden
 *   automatisch zu kurzen Überblendungen, ohne dass jede Animation das selbst prüfen muss.
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {defineSyntaxTheme} from '@astryxdesign/core/theme/syntax';

// Familie über die next/font-Variablen (COD5): --font-fustat/--font-jetbrains-mono liefern
// „Fustat", „Fustat Fallback" (metrisch angepasst) selbst – kein Literal, das an Nexts
// generierte Familiennamen gekoppelt ist. Hier nur noch der System-Stack.
const SANS_FALLBACKS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO_FALLBACKS = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/** Syntax-Farben aus der yb-Palette (VIS4/A114). */
const ybSyntax = defineSyntaxTheme({
  name: 'yb',
  tokens: {
    keyword: '#B49CFF',
    string: '#B7C0D8',
    comment: '#8590AD',
    number: '#C9B8FF',
    function: '#D9CCFF',
    type: '#C3CCE6',
    variable: '#E6E8F2',
    operator: '#A3ABC0',
    constant: '#C9B8FF',
    tag: '#B49CFF',
    attribute: '#D9CCFF',
    property: '#C3CCE6',
    punctuation: '#A3ABC0',
    background: '#0B1020',
  },
});

export const ybTheme = defineTheme({
  name: 'yb',
  color: {accent: ['#5B3FE0', '#9B7BFF'], neutralStyle: 'cool', contrast: 'standard'},
  typography: {
    scale: {base: 16, ratio: 1.25},
    body: {family: 'var(--font-fustat)', fallbacks: SANS_FALLBACKS},
    heading: {family: 'var(--font-fustat)', fallbacks: SANS_FALLBACKS, weight: 'semibold'},
    code: {family: 'var(--font-jetbrains-mono)', fallbacks: MONO_FALLBACKS},
  },
  motion: {fast: 150, medium: 350, slow: 800, ratio: 0.75},
  syntax: ybSyntax,
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
    // Feld- und Steuerelementränder ≥ 3:1 gegen Seite UND Feldfläche (A111, WCAG 1.4.11):
    // hell 3,35 (Weiß) / 3,13 (#F6F7FB), dunkel 3,71 (Seite) / 3,50 (Feld) / 3,10 (Karte)
    '--color-border-emphasized': ['#858CA1', '#626C8D'],
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
    '--yb-motion-exit': 'var(--duration-fast-min)',
    '--yb-motion-enter': 'var(--duration-medium-min)',
    '--yb-motion-emphasis': 'var(--duration-medium-max)',
    '--yb-motion-stagger': 'calc(var(--duration-fast) * 0.2667)',
    '--yb-motion-distance': 'var(--spacing-6)',
    '--yb-ease-enter': 'var(--ease-standard)',
    '--yb-ease-exit': 'cubic-bezier(0.4, 0, 1, 1)',
    '--yb-ease-move': 'cubic-bezier(0.65, 0, 0.35, 1)',

    // ---- Fließtext auf Detailseiten (L5, VIS4): 18px, Zeilenhöhe 1.7 – Demo- und Ghost-
    //      Inhalte, Projekt-Fallstudien (reading-layout/article-body/ghost-content)
    '--yb-prose-size': 'calc(var(--font-size-base) * 1.125)',
    // ---- Überschriften-Tracking (auch für Ghost-/Artikel-HTML) und Strichstärken (COD10)
    '--yb-heading-tracking': '-0.011em',
    '--yb-stroke-motif': '1.5px',
    '--yb-stroke-icon': '2px',
    // ---- Kontur des Secondary-Buttons (VIS14): hell dezent (Fläche weiß, Label trägt die
    //      Bedeutung), dunkel unverändert
    '--yb-control-border': ['#B9BFCF', '#3D4766'],

    // ---- Terminal-Karte im Hero (E4): bewusst in beiden Modi dunkel (Code-Optik),
    //      aus derselben Navy-Familie; Kontraste: Text 15:1, Ausgabe 8:1, Prompt 5,9:1
    '--yb-terminal-background': '#0B1020',
    '--yb-terminal-bar': '#111833',
    '--yb-terminal-border': ['#1B1F3B26', '#A5B4FC24'],
    '--yb-terminal-text': '#E6E8F2',
    '--yb-terminal-muted': '#A3ABC0',
    '--yb-terminal-prompt': '#9B7BFF',
    '--yb-terminal-dot': '#3D4766',
    // Terminal-Schrift fließend 13 → 15px (VIS7)
    '--yb-terminal-size': 'clamp(var(--font-size-sm), 0.72rem + 0.32vw, calc(var(--font-size-base) * 0.9375))',
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
    button: {
      base: {fontWeight: 'var(--font-weight-semibold)'},
      // Primary-Hover sichtbar in beiden Modi (V8-Verifier)
      'variant:primary': {
        ':hover': {
          backgroundColor:
            'light-dark(color-mix(in srgb, var(--color-accent) 86%, black), color-mix(in srgb, var(--color-accent) 82%, white))',
        },
      },
      // Secondary: hell weiße Fläche + dezente Kontur, Hover auf muted (VIS14); dunkel leise
      // Fläche + Kontur wie bisher (V1-Verifier)
      'variant:secondary': {
        backgroundColor: 'light-dark(var(--color-background-card), var(--color-neutral))',
        color: 'var(--color-text-primary)',
        borderWidth: 'var(--border-width)',
        borderStyle: 'solid',
        borderColor: 'var(--yb-control-border)',
        ':hover': {
          backgroundColor: 'light-dark(var(--color-background-muted), var(--color-neutral))',
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
      // Touch: Bedienelemente ≥ 44px (M5, A122) – auch Größe sm (FAQ, Vorschau, Code kopieren,
      // Footer-/Inhaltsverzeichnis-Zeilen)
      {
        when: {pointer: 'coarse'},
        value: {
          tokens: {'--size-element-sm': '44px', '--size-element-md': '44px', '--size-element-lg': '48px'},
          // Aufklapp-Zeilen (FAQ, Formularzustände) haben keine Größen-Token (A122)
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
