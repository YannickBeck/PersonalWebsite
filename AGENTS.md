<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- ASTRYX:START -->
Astryx v0.6.3 · 164 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   164 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any Astryx or integration dependency bump
<!-- ASTRYX:END -->

## Projektregeln yannick-beck.de (ergänzen die Astryx-Regeln oben)

- **Theme:** `src/theme/yb-theme.ts` ist eigenständig (kein `extends: gothicTheme`). Farb-, Typo- und Motion-Entscheidungen stehen im Kopfkommentar. Nach jeder Änderung `pnpm exec astryx theme build src/theme/yb-theme.ts`; die generierten `yb.css`, `yb.js`, `yb.d.ts`, `yb.variants.d.ts` mitcommitten (in ESLint ignoriert).
- **Farbschema ohne Flash:** `<html data-astryx-theme="yb">` plus Boot-Script aus `src/theme/theme-boot.ts` im `<head>` (layout.tsx); `providers.tsx` übernimmt die gespeicherte Wahl per `useLayoutEffect`. Nicht auf `useEffect`/Lazy-State umbauen, kein `color-scheme` am `body`. Natives `light-dark()` über `browserslist` in package.json (Chrome/Edge 123, Firefox 120, Safari 17.5): Targets nicht absenken, sonst polyfillt Lightning CSS und die Wrapper-Regel in globals.css greift nicht mehr.
- **Theme-Schalter:** zwei Zustände (hell ↔ dunkel) über `ThemeToggle`; ohne gespeicherte Wahl folgt die Seite dem System.
- **Erlaubte Abweichung von „kein eigenes CSS“:** CSS-Module bzw. `src/app/motion.css` für Motion, `::view-transition-*`, Keyframes, Hover-Effekte, fremdes HTML (Ghost) und wenige Layout-Hilfen, wo Astryx keine Prop bietet. Nur Tokens (`--yb-motion-*`, `--duration-*`, `--ease-standard`, `--spacing-*`, `--color-*`, `--radius-*`); strukturelle Breiten wie `68ch` sind erlaubt.
- **Reduced Motion:** keine globale `*`-Regel (bricht Astryx-Spinner und MobileNav). Eigene Bewegung nur über `--yb-motion-distance`/`--yb-motion-stagger` (unter `reduce` vom Theme auf 0 gesetzt) oder innerhalb `@media (prefers-reduced-motion: no-preference)`; `animation-timeline` zusätzlich hinter `@supports`.
- **Screenshot-Gate vor jedem UI-Commit:** Build mit Ghost-Mock-Inhalten, Aufnahmen 390–1920 px × hell/dunkel, dabei linke Kanten (Marke/Inhalt/Footer), Grid-Belegung, horizontalen Überlauf und Konsolenfehler prüfen.
