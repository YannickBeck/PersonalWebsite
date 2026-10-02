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
- **Erlaubte Abweichung von „kein eigenes CSS“:** `src/app/motion.css` für jede eigene Bewegung (Keyframes, Transitions, `::view-transition-*`, Hover-/Fokus-Effekte, Scroll-Reveal); CSS-Module für fremdes HTML (Ghost) und wenige Layout-Hilfen, wo Astryx keine Prop bietet (z. B. Slide-Breiten in `carousel-row.module.css`). Nur Tokens (`--yb-motion-*`, `--yb-ease-*`, `--duration-*`, `--ease-standard`, `--spacing-*`, `--color-*`, `--radius-*`, `--shadow-*`); strukturelle Breiten wie `68ch`/`cqi` sind erlaubt.
- **Reduced Motion (eine Stelle):** keine globale `*`-Regel (bricht Astryx-Spinner und MobileNav). Eigene Bewegung steht ausschließlich in `src/app/motion.css` und dort nur innerhalb `@media (prefers-reduced-motion: no-preference)`; `animation-timeline` zusätzlich hinter `@supports`. Der Block „R“ am Ende von motion.css setzt alle `::view-transition-*` unter `reduce` auf `animation: none` (die lassen sich nicht per Media-Query ausklammern). Der Theme-Reveal startet unter `reduce` gar nicht (providers.tsx). Astryx regelt seine Komponenten selbst (Spinner 3 s, MobileNav, Carousel) – nicht überschreiben.
- **Screenshot-Gate vor jedem UI-Commit:** siehe Abschnitt „Screenshot-Gate vor Commit“ unten.
- **Seitenrahmen (E7):** `layout.tsx` = `Layout height="auto" contentWidth={1120}` mit Header-Slot (schmale Demo-Hinweiszeile `DemoNotice` + sticky `LayoutHeader padding={0}` mit `SiteHeader`), `LayoutContent isScrollable={false}` um `<main>` und `LayoutFooter`. Eine linke Kante für Marke, Inhalt und Footer (16px Inhaltslinie): `container_inset = content_line − intrinsic_inset` – TopNav (8px) + TopNavHeading (8px) besitzen die Linie, LayoutHeader bekommt deshalb 0. Sticky-Footer über `.print-area { display:grid; min-height:100dvh }`. Sections ohne Hintergrund; keine `variant="muted"`-Bänder, Rhythmus über Abstand bzw. `<Divider />` auf der Inhaltslinie.
- **Grids (E6):** siehe „Grid-Regel (max!)“ unten. Kartenreihen immer `CARD_COLUMNS` (`{minWidth: 260, max: 3}`, Spuren „fill“) aus `content-card.tsx`; bei 1–2 Treffern bleiben Karten bewusst spaltenbreit. Asymmetrische Splits nur über die vorhandenen Layout-Hilfen (`home.module.css` Hero 7:5, `split-section.tsx` 1:2, `reading-layout.tsx` Lesespalte + Randspalte) – nicht über `GridSpan` (erzeugt mobil eine 0px-Spur).
- **Karten und Cover:** Projekte/Artikel immer über `ContentCard` (Cover 16:10, Meta-Zeile immer vorhanden → Titel fluchten). Bilder über `ItemCover`; `/placeholders/*.svg` gelten als „kein Bild“ (`realImage()` in `src/lib/images.ts`) und werden zum generativen `CoverArt` (Akzent-Verlauf + Muster + Motiv + Kategorie-Marke). Porträt nur mit echter Quelle: `PORTRAIT_SRC` in `src/lib/images.ts` (aktuell `null`).
- **Demo-Kennzeichnung (E1):** seitenweit nur die Hinweiszeile im Header; inhaltsspezifische Hinweise als `<Banner status="note">` (ruhig, `role="status"`), nie `status="warning"` für statische Hinweise; einzelne Einträge mit `<Token label="Demo">` (Klasse `print-hide`).
- **Astryx-Eigenheiten:** `Section` legt `className`/`id` auf einen äußeren Wrapper – Padding-Variablen (`--astryx-section-padding-*`) gelten am inneren `.astryx-section`. Funktionen (z. B. SVG-Komponenten für `<Icon icon={…}>`) dürfen nicht aus Server-Komponenten an Client-Komponenten gehen → Icons als fertige Elemente aus `src/components/icons.tsx` (Client-Modul). `ListItem` kürzt String-Labels auf eine Zeile → längere Texte als `<Text>` übergeben.
- **Deutsche Astryx-Texte:** `InternationalizationProvider` in `providers.tsx` mit dem Auszug `src/i18n/astryx-de.ts` (nicht den ganzen de-DE-Katalog importieren); neue Komponenten mit eigenen Texten → Schlüssel dort ergänzen.
- **Seiteninhalte DE/EN:** Seiten mit identischem Aufbau rendern eine gemeinsame Inhaltskomponente aus `src/components/pages/` (`<XContent lang="de|en" />`); `page.tsx` je Sprache behält Metadaten und sprachspezifische Texte.

## Motion & View Transitions

0 KB zusätzliches JS: React `<ViewTransition>` (im Next-16.3-React-Canary, kein Config-Flag – `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`), View Transitions API, CSS Scroll-Driven Animations, Astryx Carousel. Keine Animations-Library (kein Motion.dev, GSAP, Lenis, Embla) ohne neue Entscheidung. Gemessen (B3): JS gesamt +0,2 KB gz.

- **Vokabular an einer Stelle:** `src/lib/transitions.ts` (Transition-Types `nav-forward`/`nav-back`/`nav-lateral`/`filter`, Klassen-Maps, Morph-Namen). CSS dazu ausschließlich in `src/app/motion.css` (Abschnitte 1–5, R).
- **Seitenübergang zentral, nicht je page.tsx:** `RouteTransition` (`src/components/route-transition.tsx`) legt `<ViewTransition key={pathname} enter/exit=PAGE_TRANSITION update="none" share="none" default="none">` um `<main>` (layout.tsx). Der `key` erzwingt exit+enter bei jedem Pfadwechsel (die Next-Doku verlangt sonst einen Wrapper je page.tsx, weil Layouts gemountet bleiben). Neue Seiten brauchen deshalb nichts. `update`/`share` bleiben `none`, sonst feuert der Seitenübergang auch bei Filtern/Formularen (XV1).
- **Richtung kommt vom Link:** `TransitionLink` (`src/components/transition-link.tsx`) ist die Komponente des Astryx-`LinkProvider` → gilt für TopNav, SideNav, Link, Button `href` und ClickableCard (deren Klick geht an den versteckten Link). Typ aus der Pfadtiefe (tiefer = vorwärts, flacher = zurück, gleich/DE↔EN = Crossfade+Rise). Explizite `transitionTypes` gewinnen. Externe Links/Anker ohne Typ.
- **Browser-Zurück/-Vorwärts:** Next verarbeitet popstate ohne Transition (gemessen: 0 View Transitions). `RouteTransition` fängt popstate ab und lässt Next dieselbe URL per `router.replace(…, {scroll:false, transitionTypes})` ansteuern; Scroll-Position je History-Eintrag (Navigation-API-Key) wird im Commit wiederhergestellt. Fallback (Nexts Standard) ohne Navigation API/VT-Support, bei Reduced Motion, bei UA-Gesten-Animation (`hasUAVisualTransition`), Anker-Wechseln und unbekannter Position. Kein globales `scroll-behavior: smooth` (verfälscht die Wiederherstellung).
- **Header/Footer:** `.yb-vt-header` (steht, eigene Gruppe, z-index 100) und `.yb-vt-footer` (alter weg, neuer blendet mit der Seite ein – nie doppelt) in layout.tsx. Root-Snapshot ohne Animation. Beim Theme-Wechsel (`html[data-yb-vt="theme"]`) haben beide KEINEN Namen.
- **Morph Karte ↔ Detail:** Karten-Cover über `MorphSource` (in `ContentCard`), Detail-Cover über `MorphTarget` (project-detail, detail-page, article-detail). Name je Detailpfad (`morphName`). Karten tragen den Namen nur, wenn `TransitionLink` sie beim Klick „scharf“ schaltet – sonst würden alle gleichen Einträge (Startseite → Liste, Related) gleichzeitig fliegen. Immer `share` + `default="none"` zusammen (sonst morpht das Paar still nicht).
- **Filter:** `startTransition(() => { addTransitionType('filter'); setX(v) })` + Raster in `<ViewTransition key={filter} name="yb-filter-…" share={FILTER_SHARE} default="none">`. Nur das Raster blendet über, Footer und Tab-Indikator gleiten mit; kein Seitenübergang. Suche filtert ohne Transition.
- **Theme-Reveal:** `providers.tsx` → `document.startViewTransition({update, types:['theme']})` nur mit Typ-Support (sonst TypeError, XV1), nicht unter Reduced Motion, nicht während einer anderen VT. Kreis vom Schaltermittelpunkt (`--yb-reveal-x/-y/-r`).
- **Keine Farb-Nachzieher:** `suppressTransitions()` (`src/lib/instant.ts`, `html[data-yb-instant]` für zwei Frames) bei Theme-, Seiten- und Filterwechsel – Zustände stehen sofort, sichtbar ist nur der VT-Übergang.
- **Einstieg nur beim ersten Laden:** `.yb-enter` (Kinder gestaffelt), `.yb-hero-terminal`, `.yb-term-*` laufen nur unter `html:not([data-yb-nav])`; `RouteTransition` setzt `data-yb-nav` ab der ersten Client-Navigation. Reines CSS, endet sichtbar – auch ohne JS bleibt nichts unsichtbar.
- **Scroll-Reveal:** Klasse `.yb-reveal` (SectionHeader, ContentCard, Home-Cards, CtaCard). `animation-timeline: view()` nur hinter `@supports` + no-preference + `screen`, Bereich `entry 0%–40%`; animiert `transform` (nicht `translate`, das gehört dem Hover-Lift). Nicht in horizontalen Scrollern (Karussell: `reveal={false}`).
- **Mikrointeraktionen:** `.yb-card` (Lift 3px per `translate`, `--shadow-high`, Akzent-Rand, Cover-Zoom 1.03, Fokus = Hover; verlängerte Trefferfläche gegen Flackern, daher `overflow: visible` und Cover mit eigenen Eckenradien), `.yb-nav-item`/`.yb-nav-indicator` (Unterstrich statt grauer Fläche, gleitet beim Seitenwechsel per VT). Buttons: Astryx-eigenes Press-Feedback (`scale(.98)`).
- **Slides:** „Das könnte dich auch interessieren“ und Galerie über `RelatedCarousel`/`GalleryCarousel` (`src/components/carousel-row.tsx`, Astryx `Carousel hasSnap gap={4}`); Folienbreiten per Container-Query (Desktop 3 sichtbar, Tablet ~2,2, Mobil 84 %). Galerie nur mit echten Bildern.
- **Nur Compositor-Eigenschaften** (opacity, transform/translate/scale, clip-path) → CLS 0 (gemessen).
- **Browser:** React-VTs brauchen Transition-Types/`view-transition-class` (Chrome/Edge 125+, Safari 18.2+, Firefox 147+); ohne Support wird einfach geschnitten. Getestet nur in Chromium.

## Grid-Regel (max!)

- **Jedes `Grid columns={{ minWidth }}` bekommt ein `max`.** Ohne `max` erzeugt Astryx bei 1440/1920 px so viele „fill“-Spuren, wie hineinpassen (z. B. 4 × 260 px), und Reihen bleiben halb leer (B2/L1). Festgelegt: Kartenreihen `CARD_COLUMNS = {minWidth: 260, max: 3}`, Hero `{minWidth: 400, max: 2}` (+ 7:5 ab 1024 px in home.module.css), Zweispalter `{minWidth: 320, max: 2}`, Leistungs-Listen `{minWidth: 260, max: 2}`, Footer `{minWidth: 150, max: 3}`.
- Neue Grids mit 1, 2, 3 und 4+ Einträgen bei 768/1024/1280/1440/1920 px prüfen (Gate-Metrik „Grid-Belegung“). Reste in der letzten Reihe (4 → 3+1) sind erlaubt; leere Spuren bei 1–2 gefilterten Treffern bewusst (Karten werden nicht gestreckt).
- Mehr Einträge als eine Reihe, die nicht alle gezeigt werden müssen (Related, Galerie) → Karussell statt zweiter Grid-Reihe.
- Keine `GridSpan` für asymmetrische Spalten (mobil 0px-Spur) – dafür die vorhandenen Layout-Hilfen.

## Screenshot-Gate vor Commit

Pflicht vor jedem UI-Commit, mit Ghost-Mock-Inhalten (Fixture-Server aus dem Scratchpad, Port 2368; Fake-Key, nie echte Secrets):

1. `pnpm lint` und `GHOST_URL=http://127.0.0.1:2368 GHOST_CONTENT_KEY=<fake> pnpm build` grün, alle Seiten bleiben statisch (○/●). Vorher `.next/cache/fetch-cache` beiseiteschieben – sonst liefert der Build alte Mock-Antworten.
2. Standalone-Server starten (`.next/static` und `public` nach `.next/standalone/` kopieren, `node .next/standalone/server.js` mit `PORT`/`HOSTNAME=127.0.0.1`).
3. Gate: `node shoot.mjs <baseUrl> <outDir> [--quick]` (390–1920 px × hell/dunkel; quick = 390 + 1440). Abnahme: 0 horizontaler Überlauf, 0 Konsolenfehler, Kantenspreizung Marke/H1/Footer 0 px, 0 unterbelegte Grids (Einstiegs-/Reveal-Animationen werden für die Messung neutralisiert).
4. Bei Motion-Änderungen zusätzlich: VT-Prüfung (Typen + Pseudo-Animationen je Navigation, auch `--reduce`), Frame-Captures (Animationen per CDP verlangsamt), Reduced-Motion-Messung (0 laufende Animationen bei Navigation/Theme/Filter), CLS, JS-Transfergröße gegen den Vorstand.
5. Nur Chromium ist automatisiert; WebKit/Firefox-Abweichungen als „OFFEN“ notieren.

