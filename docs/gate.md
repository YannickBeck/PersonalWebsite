# Screenshot-Gate, Ghost-Mock und Regressionstests

Alles, was vor einem UI-Commit geprüft wird (AGENTS.md, Abschnitt „Screenshot-Gate vor Commit“),
liegt seit 2026-10-22 im Repo. Vorher lagen Gate, Mock und Tests in einem Arbeitsordner unter
`/tmp` und gingen bei einem Neustart verloren.

| Datei | Zweck |
| --- | --- |
| `scripts/ghost-mock/server.mjs` | Ghost-Content-API-Mock (Port 2368, ohne Abhängigkeiten) |
| `scripts/ghost-mock/fixtures/*.json` | Beiträge, Tags, Autor, Einstellungen (spiegeln die live sichtbaren Ghost-Beiträge) |
| `scripts/gate/build.sh` | Build-Variante `prod`, `gaps` oder `form` mit Mock bauen, Standalone-Kopie in eigenen Ordner |
| `scripts/gate/serve.sh` | Standalone-Server einer Variante starten, stoppen, prüfen |
| `scripts/gate/shoot.mjs` | Screenshot-Gate: Seiten × Breiten × hell/dunkel, Metriken, Agenten-Prüfungen |
| `scripts/gate/home-test.mjs` | Regressionstests der Startseiten-Interaktionen |
| `scripts/gate/perf.mjs` | Gedrosselter Mobil-Lauf (Gate-Schritt 5b): LCP mit Element, CLS, übertragenes JS |
| `scripts/vt-probe.mjs` | View Transitions je Navigation (Typen, Morph, Taktung, Fokus nach dem Fähigkeits-Sprung) |
| `scripts/backscroll.mjs` | Browser-Zurück/-Vorwärts: Scroll-Position, auch mit Anker und unter Reduced Motion |
| `scripts/jssize.mjs` | JS-/CSS-Größen je Seite (gzip), mit und ohne `noModule`-Polyfill |

Alle Skripte lesen nur. Sie schicken kein Formular ab und brauchen keine echten Schlüssel.

## Voraussetzungen

- Node (getestet mit 26), pnpm, Google Chrome. Die Skripte starten Chromium mit `channel: 'chrome'`;
  mit `GATE_CHANNEL=chromium` läuft stattdessen das von Playwright geladene Chromium.
- Playwright ist keine Projekt-Abhängigkeit. Einmal in einen Arbeitsordner außerhalb des Repos
  installieren und den Pfad per `PLAYWRIGHT_MODULE` übergeben, wie bei `scripts/vt-probe.mjs`:

  ```sh
  mkdir -p "$TMPDIR/yb-pw" && cd "$TMPDIR/yb-pw" && npm init -y >/dev/null && npm i playwright@1.63.0
  export PLAYWRIGHT_MODULE="$TMPDIR/yb-pw/node_modules/playwright/index.mjs"
  ```

## Ablauf vor einem UI-Commit

```sh
pnpm lint && pnpm typecheck
node scripts/ghost-mock/server.mjs &              # idempotent; build.sh startet ihn sonst selbst
scripts/gate/build.sh prod                        # → $TMPDIR/yb-gate/prod (GATE_DIR ändert die Wurzel)
scripts/gate/build.sh gaps                        # Vorschau, NEXT_PUBLIC_SHOW_GAPS=1
scripts/gate/build.sh form                        # Formular, NEXT_PUBLIC_CONTACT_FORM=1
scripts/gate/serve.sh start "$TMPDIR/yb-gate/prod" 3351
scripts/gate/serve.sh start "$TMPDIR/yb-gate/gaps" 3352
node scripts/gate/shoot.mjs http://127.0.0.1:3351 "$TMPDIR/yb-gate/out/prod" --label=prod
node scripts/gate/shoot.mjs http://127.0.0.1:3352 "$TMPDIR/yb-gate/out/gaps" --label=gaps
node scripts/gate/home-test.mjs http://127.0.0.1:3351 "$TMPDIR/yb-gate/out/prod"
node scripts/vt-probe.mjs http://127.0.0.1:3351 "$TMPDIR/yb-gate/out/vt.json"            # dazu --reduce, --width=390
node scripts/backscroll.mjs http://127.0.0.1:3351 "$TMPDIR/yb-gate/out/backscroll.json"
node scripts/gate/perf.mjs http://127.0.0.1:3351 "$TMPDIR/yb-gate/out/perf"             # nur bei Bedarf, ~1 min
node scripts/jssize.mjs "$TMPDIR/yb-gate/prod/standalone" prod > "$TMPDIR/yb-gate/out/jssize.json"
scripts/gate/serve.sh stop 3351; scripts/gate/serve.sh stop 3352
```

Formular-Build gegen den Resend-Mock (die `CONTACT_*`-Werte sind Testwerte, siehe
`docs/kontaktformular.md`):

```sh
node scripts/resend-mock.mjs 3362 &
CONTACT_RESEND_API_KEY=re_test_fake_0000000000 CONTACT_TO=inbox@example.test \
CONTACT_FROM='Website <kontakt@example.test>' CONTACT_RESEND_BASE_URL=http://127.0.0.1:3362 \
  scripts/gate/serve.sh start "$TMPDIR/yb-gate/form" 3353
node scripts/gate/shoot.mjs http://127.0.0.1:3353 "$TMPDIR/yb-gate/out/form" --label=form
node scripts/contact-api-test.mjs http://127.0.0.1:3353 http://127.0.0.1:3362
```

Einen anderen Stand prüfen (z. B. den letzten Commit ohne die Änderungen im Arbeitsverzeichnis):
einen git worktree anlegen, dort `pnpm install --frozen-lockfile --offline` ausführen und
`scripts/gate/build.sh prod --src <worktree>` aus diesem Repo aufrufen. Mock und Skripte kommen
dabei immer aus diesem Repo.

## Ghost-Mock

`node scripts/ghost-mock/server.mjs [--port=2368] [--host=127.0.0.1] [--fixtures=<dir>] [--quiet]`

- Abgeleitet aus `src/lib/ghost.ts` und `@tryghost/content-api` 1.12: Die Bibliothek ruft mit
  `version: 'v5.0'` `/ghost/api/content/<resource>/` auf, Einzelabrufe unter `/<resource>/slug/<slug>/`
  bzw. `/<resource>/<id>/`, Parameter als Query (`key`, `filter`, `fields`, `include`, `order`,
  `limit`, `page`, `formats`).
- Ressourcen: `posts`, `pages`, `tags`, `authors` (Liste und Einzelabruf), `settings`, `tiers`,
  `newsletters` (Liste), `offers` (Einzelabruf, immer 404). Pfade mit `v2`–`v4` bzw. `canary`
  funktionieren ebenso.
- NQL-Teilmenge: `feld:wert`, `feld:-wert`, `feld:[a,b]`, `feld:-[a,b]`, `>`/`>=`/`<`/`<=`, `~`/`~^`/`~$`,
  `+` (und), `,` (oder), Klammern, Werte in `'…'`. Felder: `tag`/`tags`, `primary_tag`,
  `author`/`authors`, `primary_author` und jedes einfache Feld (`slug`, `featured`, `published_at` …).
  Damit greifen die Filter der Website (`tag:project+tag:hash-lang-de`, `tag:hash-lang-en+tag:-project`).
- Antworten wie Ghost: Liste `{posts: […], meta: {pagination}}`, Einzelabruf `{posts: [x]}` ohne
  `meta` (die Bibliothek entpackt dann das Objekt), Fehler `{errors: [{message, type}]}` mit 404,
  ohne `key` 403, ungültiger Schlüssel 401. Interne Tags (`#lang-de`, Slug `hash-lang-de`) kommen mit
  `include=tags` mit zurück; `/tags/` ohne Filter liefert nur öffentliche Tags.
- Schlüssel: Jeder 26-stellige Hex-Wert gilt (das verlangt die Bibliothek). `build.sh` und `serve.sh`
  nehmen `1234567890abcdef1234567890`. Mit `GHOST_MOCK_KEY` gilt nur genau dieser Wert.
- Steuerung: `GET /__mock/health`, `GET /__mock/requests` (letzte 200 Abrufe, ohne `key`),
  `POST /__mock/shutdown`. Ein zweiter Start meldet „läuft bereits“ und endet mit 0. Belegt ein
  anderes Programm den Port, endet er mit 1.

Inhalte (`fixtures/posts.json`, Quelle je Eintrag im Feld `_quelle`; Felder mit `_` gehen nie in
die Antwort): die live sichtbaren Ghost-Beiträge des Stands `2d636c6`, abgerufen am 2026-10-22.

| Slug | Sprache | Tags | Ergebnis im Build |
| --- | --- | --- | --- |
| `hallo-welt-warum-diese-website` | DE | news, #lang-de | `/blog/hallo-welt-warum-diese-website` (●) |
| `hello-world-why-this-website` | EN | news, #lang-en | `/en/blog/hello-world-why-this-website` (●) |
| `coming-soon` | EN | news, #lang-en | `/en/blog/coming-soon` (●), Titelbild von `static.ghost.org` wie live |
| `beispielprojekt-me-website` | DE | project, #lang-de | keine Seite: 308 auf `/projekte` (`src/lib/ghost-samples.ts`) |
| `sample-project-me-website` | EN | project, #lang-en | keine Seite: 308 auf `/en/projekte` |

Bekannt: Die Uhrzeit von `published_at` ist angenommen (live ist nur das Datum sichtbar). Die
Tag-Zuordnung von „Coming soon“ ist aus der Live-Seite geschlossen (Tag „News“ auf der
Detailseite). `pages.json` ist leer, weil die Website keine Ghost-Seiten abruft. Das Titelbild von
„Coming soon“ lädt der Bildoptimierer zur Laufzeit von `static.ghost.org`, ohne Netz fehlt es.

## build.sh und serve.sh

`scripts/gate/build.sh <prod|gaps|form> [--src <repo>] [--out <ordner>] [--allow-dynamic]`

1. Ghost-Mock prüfen, sonst starten (Log `$GATE_DIR/ghost-mock.log`).
2. `.next/cache/fetch-cache` nach `<out>/fetch-cache.moved.<zeit>` verschieben. Sonst liefert
   der Build alte Mock-Antworten.
3. `pnpm build` mit `GHOST_URL`/`GHOST_CONTENT_KEY` auf den Mock. `NEXT_PUBLIC_SHOW_GAPS`,
   `NEXT_PUBLIC_CONTACT_FORM` und `NEXT_PUBLIC_CF_BEACON_TOKEN` werden vorher entfernt und nur je
   nach Variante gesetzt. Log: `<out>/build.log`.
4. Routentabelle prüfen: Dynamisch (ƒ) dürfen nur `/api/*`, `/rss.xml` und `/en/rss.xml` sein,
   sonst Exit 3.
5. `.next/standalone` samt `.next/static` und `public` nach `<out>/standalone` kopieren,
   `<out>/info.json` (Commit, Variante, Pfad zu `server.js`).

`scripts/gate/serve.sh start <out> <port>` beendet vorher jeden Node-Lauscher auf dem Port. Ein
verwaister `next-server` lieferte sonst den alten Build. Danach wartet es, bis `/` mit 200
antwortet. `GHOST_URL` und `GHOST_CONTENT_KEY` zeigen zur Laufzeit auf den Mock, für Seiten, die
erst bei Abruf entstehen (`/blog/<neu>`). `stop <port>` und `status <port>` gibt es auch.
Vorsicht: `stop 2368` beendet den Ghost-Mock.

## shoot.mjs

`node scripts/gate/shoot.mjs <baseUrl> <outDir> [--quick] [--widths=…] [--schemes=…] [--pages=…]
[--add=…] [--only=<regex>] [--sitemap] [--with-demo] [--concurrency=3] [--tabs=60] [--reduce]
[--no-full] [--no-shots] [--no-agent] [--no-fail] [--label=…]`

Seitenliste: `PUBLIC_ROUTES` und `NOINDEX_ROUTES` aus `src/lib/routes.ts`, je DE und `/en`.
Detailseiten kommen aus den Links von `/projekte`, `/en/projekte`, `/blog` und `/en/blog`, ohne
`demo-`-Slugs, damit Produktion und Vorschau dieselbe Liste haben. Dazu die 404-Proben
`/gibt-es-nicht-404`, `/en/gibt-es-nicht-404` (Pfad ohne Route), `/projekte/unbekannt-404`
(`dynamicParams = false`) sowie `/blog/unbekannt-404` und `/en/blog/unbekannt-404` (Proxy,
`docs/blog-404.md`). Alle fünf liefern die statische globale 404. Mit dem heutigen Stand sind das
36 Seiten. Breiten 390/768/1024/1440/1920 (Höhen
844/1024/768/900/1080), `--quick` nur 390 und 1440, jeweils hell und dunkel, ohne
Touch-Emulation.

Je Lauf, in dieser Reihenfolge:

1. Laden (`load`, Schriften, Netz ruhig, 400 ms). CLS mit Quelle aus einem gepufferten
   `PerformanceObserver` ab Navigationsbeginn, vor jeder Eingabe.
2. Danach Animationen und Übergänge neutralisieren (`animation`/`transition: none`), erst dann:
   - Überlauf (`scrollWidth > clientWidth`, mit den auslösenden Elementen)
   - Überschriften: genau eine H1, erste Überschrift H1, keine Sprünge (ohne inerte und versteckte)
   - Kantenspreizung: linke Kante des sichtbaren Inhalts von Marke (erster Link im Seiten-Header),
     erster H1 und Seiten-Footer. Text-Rechtecke und gemalte Flächen zählen, sr-only nicht.
   - Grid-Belegung: Astryx-Grid mit mehr Spuren als Einträgen, obwohl es mindestens 3 Einträge
     hat. 1–2 Treffer in 3 Spuren sind gewollt. Grids ohne `max` werden als Hinweis gemeldet.
   - `[data-yb-gap]` und `[data-yb-legal-open]` je Seite, `lang` im Browser
3. Screenshots: erster Bildschirm (`shots/*.png`) und ganze Seite (`full/*.jpg`, JPEG 70).
4. Fokus-Stichprobe: bis zu 60 Tab-Schritte ab Seitenanfang. Gemessen wird:
   - sichtbar: Stil des Elements, von drei Vorfahren und von `::before`/`::after` unterscheidet
     sich fokussiert gegenüber unfokussiert. Das erfasst auch Ringe am Feld-Wrapper.
   - verdeckt: der Mittelpunkt liegt unter einem klebenden oder festen Element
   - klein: unter 24 × 24 px, Links im Fließtext ausgenommen. Das ist nur ein Hinweis.
5. Konsolen- und Seitenfehler. Die 404-Meldung einer 404-Seite für ihre eigene URL zählt nicht.

Einmal je Basis-URL laufen die Agenten-Prüfungen per HTTP:

- `lang` im Server-HTML der 200-Seiten
- JSON-LD Person und WebSite auf `/` und `/en`
- `og:image` und `og:type` auf allen 200-Seiten, Bild abrufbar
- `/llms.txt`
- `Accept: text/markdown` auf `/`, `/en` und einem unbekannten Pfad (Status, Content-Type,
  `Vary: Accept`), `q=0` liefert HTML, Dateien behalten ihr Original
- Ghost-Testprojekt: 308 auf 4 Pfaden, als HTML und als Markdown
- Sitemap und llms.txt ohne Testprojekt, alle Sitemap-Ziele 200 und indexierbar
- `noindex` auf den nicht gelisteten Seiten
- `robots.txt` mit Sitemap-Zeile
- 404-Proben im Server-HTML: Status 404, keine `__next_error__`-Hülle, `lang` gesetzt, H1 mit
  Text, alle Stylesheets abrufbar, kein langes `s-maxage` (Feinschliff)
- 404-Proben im Browser ohne JavaScript (390 px): H1 sichtbar, Stylesheets angewendet

Die globale 404 ist ein statisches HTML mit `lang="de"`. Unter `/en` setzt ihr Boot-Script `lang`
vor dem ersten Paint. Deshalb prüft der Browser-Lauf `lang` für alle Seiten, das Server-HTML nur
für die 200-Seiten.

Abnahme (Exit 0): Ladefehler, `lang` im Browser, Status, Überlauf, CLS > 0, Konsolenfehler,
Überschriften, Kantenspreizung > 1 px, unterbelegte Grids, unsichtbarer und verdeckter Fokus
sowie fehlgeschlagene Agenten-Prüfungen sind alle 0. Nur Hinweise sind kleine Fokusziele,
fehlgeschlagene Abrufe, Grids ohne `max` und nicht messbare Kanten. Ergebnis: `metrics.json`
(alle Läufe), `summary.md`.

## home-test.mjs

`node scripts/gate/home-test.mjs <baseUrl> [outDir] [--only=<regex>] [--lang=de|en|both]`

Jeder Test lädt die Startseite neu (1440 px, falls nicht anders angegeben). Geprüft werden:

- **Abschnittsnavigation:** Pillen, beim Laden ist „00 Start“ aktiv; ein Klick setzt
  `aria-current`, den Hash per `replaceState` und den Fokus in den Abschnitt, ohne dass das Ziel
  unter den Leisten liegt; ←/→/Pos1/Ende; der Fokusring ist bei 390 px nicht beschnitten; die
  fokussierte letzte Pille steht ganz im Scroller (A114); die Einstiegs-Pille setzt den Fokus (A111).
- **Ausweiskarte:** Umdrehen (`aria-pressed`, verdeckte Seite `inert`), Pfeiltasten, keine
  rAF-Aufrufe in Ruhe, kein Seitenüberlauf bei 390 px.
- **Periodensystem:** Tabs-Muster, ←/→ umlaufend, ↑/↓, Pos1/Ende; Filter (`aria-pressed`,
  `inert`, Kacheln bleiben stehen); Laden mit `#skill-rag` bei 1440 und 390 px; Sprung aus dem
  Akkordeon hebt einen verdeckenden Filter auf (A116).
- **Akkordeon:** genau einer offen, der Fokus bleibt, Pfeiltasten, Namen beginnen mit der Nummer;
  bei 1440 px nebeneinander mit fester Reihenhöhe; bei 768 und 390 px gestapelt, der gewählte Kopf
  bleibt stehen (holdPosition, A111); „Zum Projekt“ aus dem Werdegang landet im Bild (A111).
- **Werdegang:** exklusive `<details>`, Enter; eine Station unter der offenen bleibt beim Öffnen
  stehen (A112).
- **Laden mit Anker:** `#project-bachelorarbeit` bei 768 px, `#career-bechtle-junior` bei 1440
  und 390 px: Ziel offen, im Bild und nicht unter den Leisten (A111/A112). holdPosition am
  Seitenanfang hält ein späteres Scrollen nicht zurück.
- **Band der Abschnittsnavigation:** Klicks aufs leere Papier (auch im Seitenrand) treffen das
  Band, keine verdeckte Kachel wird gewählt, kein Seitenüberlauf (A113).
- **Reduced Motion:** 0 laufende Animationen nach Laden, Filter, Akkordeon, Werdegang und Karte.
- **Feinschliff:** geschlossener Kopf-Button des Akkordeons bei 1440 und 1024 px nur so breit wie
  der Streifen (vorher bis x 2132 bei 1440 px); Fähigkeits-Chip einer Projektseite → `/#skill-rag`
  per Client-Navigation: Kachel gewählt, fokussiert, im Bild (REG3); ohne JavaScript (1440/390 px):
  Theme-Schalter, Menü-Button, Filter-Pillen und „Karte umdrehen“ fehlen, die Textliste aller
  Kacheln ist sichtbar. Diese zehn Läufe schlagen auf `52febac` alle fehl.

Die Anzahl der Kacheln (35) prüft der Test nicht, sie hängt am Content-Modell.

## Referenzwerte (2026-10-22)

Gemessen mit Playwright 1.63 und Chrome. Gebaut wurde Commit `527c746` (Review-Fixes Runde 3) in
einem git worktree gegen den Ghost-Mock. Das Formular lief gegen `scripts/resend-mock.mjs`.

| Build | Läufe | Abnahme-Metriken | Agenten | Kleine Fokusziele @390 | Rechtstext-Lücken |
| --- | --- | --- | --- | --- | --- |
| prod | 340 (34 Seiten) | alle 0 | 18/18 | 10 | Impressum 3, Datenschutz 5 (DE und EN) |
| gaps | 340 | alle 0 | 18/18 | 66 | wie prod |
| form | 340 | alle 0 | 18/18 | 10 | Impressum 3, Datenschutz 8 (mit Abschnitt Kontaktformular) |
| prod `--quick` | 136 | alle 0 | 18/18 | 10 | wie prod |

Der Bericht zu Fix-Runde 3 nennt dieselben Nullwerte. Abweichungen:

- **Agenten-Prüfungen:** Der Bericht hatte 23, hier sind es 18. Das alte Skript ist verloren,
  die Prüfungen sind neu zusammengestellt und deshalb nicht einzeln vergleichbar.
- **Kleine Fokusziele @390 im Vorschau-Build:** 66 statt 20. Es sind ausschließlich die bekannten
  1 × 1 px großen Links der ClickableCard (A125) auf den nicht gelisteten Blog-Seiten. Die
  Stichprobe geht jetzt bis 60 Tab-Schritte weit und erreicht dadurch mehr Demo-Karten.

`home-test.mjs` (36 Läufe) auf `527c746`: 27/36. Die 9 Fehlschläge sind genau die Befunde, die die
Abschluss-Fixes beheben:

- A111: holdPosition bei 768 und 390 px, gemessen −598 bis −1053 px; „Zum Projekt“ landet bei
  −403 px.
- A112: Werdegang −551 px bei 1440 und −745 px bei 390.
- A114: „05 Contact“ bei 390 px um 60 px abgeschnitten.

Eine Kopie des Arbeitsverzeichnisses mit diesen Fixes besteht 36/36.

Stand „Redesign: Abschluss-Fixes“ (gleicher Tag, gleiche Werkzeuge): Gate in Produktion, Vorschau
und Formular je 340 Läufe, alle Abnahme-Metriken 0, Agenten 18/18, kleine Fokusziele @390
10 / 66 / 10, Rechtstext-Lücken wie oben. `home-test.mjs` 42/42 in allen drei Builds; die sechs
dabei neuen Tests (Laden mit verschobenen Ankern, holdPosition am Seitenanfang, Band A113)
schlagen auf `527c746` alle fehl.

Vorher-Aufnahme der Live-Seite (Stand `2d636c6`) mit
`node scripts/gate/shoot.mjs https://yannick-beck.de <out> --sitemap --no-fail --concurrency=2`:

- 32 Seiten, 320 Läufe, kein Überlauf.
- CLS > 0 in 34 Läufen, Maximum 0,14 auf der 404 bei 768 px.
- 40 Überschriften-Sprünge H1 → H3 auf den Listen.
- Agenten-Prüfungen 3/18: `lang` nur per Script, kein JSON-LD, kein `og:image`, kein `llms.txt`,
  keine Markdown-Weiche, Testprojekt erreichbar.

## vt-probe.mjs

`node scripts/vt-probe.mjs <baseUrl> [out.json] [--reduce] [--width=1440]`

Instrumentiert `document.startViewTransition` und prüft 13 Schritte gegen die Erwartung:
Header → `/projekte` (nav-forward), Projektzeile → `/projekte/orbitalis` (Morph des Covers),
„Weiteres Projekt“ → Bachelorarbeit (nav-lateral; die Detailseite hat kein Cover, also kein Morph)
und zurück → Orbitalis (Morph), Zurück-Link → `/projekte` (Rück-Morph), Header → `/cv`
(nav-lateral), Marke → `/` (nav-back), Browser-Zurück/-Vorwärts, Fähigkeits-Chip → `/#skill-rag`
(Fokus auf der Kachel), `/blog` → Beitrag (Morph), Sprachwechsel (Dokumentwechsel ohne VT,
`lang="en"`), Theme (Reveal). Unter `--reduce`: keine Pseudo-Animation länger als 0 ms, kein
Theme-Reveal, Browser-Zurück/-Vorwärts mit Typ `nav-none`. Schmal laufen die Header-Ziele über den
Drawer; Morph-Paare erwartet das Skript erst ab 1024 px (React bildet ein Paar nur, wenn beide
Flächen im Bild liegen). Exit 1 bei einer Abweichung oder einem Konsolenfehler.

## backscroll.mjs

`node scripts/backscroll.mjs <baseUrl> [out.json] [--reduce-only|--motion-only]`

Neun Szenarien je Modus (no-preference und reduce): Startseite bei y=0 und y=1500, nach einer
Pille der Abschnittsnavigation (Anker `/#projekte` per replaceState) mit und ohne anschließendes
Scrollen an den Anfang, `/projekte` bei y=600, mobil über den Drawer (390 px, Touch), auch EN.
Weg per Header-Link bzw. Drawer, dort auf 300 scrollen, Zurück, Vorwärts, Zurück. Erwartet: die
verlassene Position ±2 px, vorwärts 300. Klicks per Koordinaten.

Vorher (`52febac`): 13/18. Mit Anker und danach gescrolltem Anfang landete Zurück am Abschnitt
(Drawer: 3605 statt 0, reduce 2551 statt 0; REG1). Nachher 18/18.

## perf.mjs (Gate-Schritt 5b)

`node scripts/gate/perf.mjs <baseUrl> [outDir] [--runs=8] [--pages=/,/en] [--profile=slow4g|lighthouse]`

Je Lauf ein frischer Kontext, 390×844 @3x, Touch, Cache aus. Profil `slow4g` = Chrome-DevTools-
Voreinstellung „Slow 4G“ (562,5 ms, 1,44 Mbit/s herunter, 675 kbit/s hoch) plus 4× CPU;
`lighthouse` = 150 ms, 1,6/0,75 Mbit/s, 4× CPU (so maß die Abschluss-Jury). Gemessen: FCP, LCP mit
Element und Bild-URL, CLS mit verschiebenden Elementen, übertragenes JavaScript (CDP), geladene
`noModule`-Skripte. Bericht, keine Abnahme: Exit 1 nur bei Ladefehlern.

## jssize.mjs

`node scripts/jssize.mjs <ordner mit .next> [label]` – auch für eine Standalone-Kopie aus
`build.sh` (`<out>/standalone`). Je Seite `jsGz` (alle referenzierten Skripte, wie in den
früheren Berichten) und `jsGzModule` (ohne `<script noModule>`). Nexts Polyfill-Chunk
(core-js, 39,4 KB gz) steht in jeder Seite als `noModule` und wird von den Zielbrowsern nie
geladen (perf.mjs: 0 geladen). `jsGzModule` ist deshalb die Zahl, die ein Besucher überträgt.

## Referenzwerte Feinschliff (2026-10-22)

Gleiche Werkzeuge, Arbeitsstand vor dem Commit „Redesign: Feinschliff“, gegen den Ghost-Mock:

| Build | Läufe | Abnahme-Metriken | Agenten | Kleine Fokusziele @390 | Rechtstext-Lücken |
| --- | --- | --- | --- | --- | --- |
| prod | 360 (36 Seiten) | alle 0 | 20/20 | 10 | Impressum 3, Datenschutz 5 (DE und EN) |
| gaps | 360 | alle 0 | 20/20 | 66 | wie prod |
| form | 360 | alle 0 | 20/20 | 10 | Impressum 3, Datenschutz 8 |

- home-test 52/52 in allen drei Builds (42 bisherige + 10 neue).
- vt-probe 13/13 bei 1440 und 390 px, jeweils auch mit `--reduce`; backscroll 18/18.
- perf.mjs (slow4g, 16 Läufe je Stand, `/`): LCP-Median 2538 ms vorher, 2540 ms nachher (Porträt,
  CLS 0 in 16/16 je Stand); FCP-Median 2040 bzw. 2038 ms (zweigipflig, ~1,92 oder ~2,15 s); JS
  übertragen 266,9 → 259,3 KB.
- url-check 74/74 (Produktion, Vorschau, Formular), link-check 0 Befunde, contact-api-test 23/23.
- axe-core 4.13 (40 Läufe: `/`, `/en`, `/cv`, `/projekte`, `/projekte/orbitalis`, `/kontakt`,
  `/content-status`, beide Blog-404, globale 404; 1440/390; hell/dunkel): nur die dokumentierten
  Ausnahmen (Namenszug, „404“).

## Grenzen

- Nur Chromium. WebKit und Firefox bleiben OFFEN (AGENTS.md).
- Keine Touch-Emulation: Zielgrößen auf Touch (≥ 44 px) prüft das Gate nicht.
- Die Fokus-Stichprobe endet nach 60 Tab-Schritten. Auf der Startseite und auf „Über mich“
  erreicht sie deshalb nicht alle Bedienelemente.
- Kontrast misst das Gate nicht (axe-Läufe getrennt, Ausnahmen in AGENTS.md 5a).
