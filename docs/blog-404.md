# Unbekannte Blog-Slugs: echte 404 ohne Neubau für neue Beiträge

Stand: Feinschliff (2026-10-22), Next 16.3.6; Abschnitt „Englische 404“: Rest-Feinschliff
(2026-10-23).

## Ausgangslage

`/blog/<unbekannt>` und `/en/blog/<unknown>` lieferten Status 404, aber die leere Hülle
`<html id="__next_error__">`: ohne `lang`, ohne Stylesheet, ohne Text, mit Titel „Yannick Beck“
und `Cache-Control: s-maxage=31536000`. Erst der Browser zeigte mit JavaScript die 404. Bei
Projekten war das schon gelöst (`dynamicParams = false` → statische globale 404).

Zwei Anforderungen stehen gegeneinander:

1. Unbekannte Slugs sollen eine echte, statische 404 bekommen, wie bei den Projekten.
2. Neue Ghost-Beiträge sollen ohne Neubau erscheinen (Ghost-Webhook `site.changed` →
   `/api/revalidate`, `revalidatePath('/', 'layout')`).

## Was Next 16 dazu tut (gemessen und im Quelltext nachgesehen)

- `dynamicParams = false` (Doku `route-segment-config/dynamicParams.md`): Slugs außerhalb von
  `generateStaticParams` liefern die 404. Die Liste entsteht nur beim Build;
  `revalidatePath` fügt keine neuen Pfade hinzu. Neue Beiträge bräuchten also einen Neubau.
  Anforderung 2 wäre verletzt.
- `dynamicParams = true` (Standard, ISR-Doku): Neue Slugs werden beim ersten Abruf gerendert.
  Ein `notFound()` dabei läuft beim Server-Rendering aber nicht in eine Fehlergrenze: React
  rendert Fehlergrenzen beim SSR nicht, die `HTTPAccessFallbackBoundary` von Next ist eine
  Klassen-Komponente. Der Fehler erreicht die Shell, `app-render.js` rendert dann
  `getErrorRSCPayload` (die `__next_error__`-Hülle), und der Browser holt die 404 erst nach.
  Getestet: Eine `not-found.tsx` direkt im Segment `blog/[slug]` ändert daran nichts (die Grenze
  steht im RSC-Baum, das HTML bleibt leer).

## Lösung: Proxy vor dem Blog

`src/proxy.ts` (Next 16 „Proxy“, früher Middleware, Doku `01-getting-started/16-proxy.md`) läuft
nur für `/blog/:slug` und `/en/blog/:slug`:

- `src/lib/blog-slugs.ts` lädt je Sprache die Slug-Liste aus Ghost (nur das Feld `slug`, derselbe
  Filter wie `getPosts`: Sprach-Tag, ohne Tag `project`). Die Liste gilt 60 s lang als frisch.
  Fehlt ein Slug darin, wird höchstens alle 10 s neu geladen. Im Vorschau-Build zählen die
  Demo-Artikel als bekannt.
- Unbekannter Slug → Rewrite auf `<pfad>/_404`, einen Pfad ohne Route. Next antwortet dann mit
  der globalen 404 (`src/app/global-not-found.tsx`): Status 404, `no-store`, Seite mit
  Stylesheets und Text auch ohne JavaScript. Unter `/en` kommt sie seit dem Rest-Feinschliff mit
  `lang="en"` und englischem Text schon im Server-HTML (Abschnitt „Englische 404“ unten).
- Bekannter Slug → unverändert weiter in `/blog/[slug]` (ISR, Webhook).
- Ghost nicht erreichbar oder nicht konfiguriert → Anfrage geht durch, die Seite entscheidet wie
  vorher. Kein neuer Ausfallweg.
- Markdown-Abrufe (`Accept: text/markdown`, gleiche Regel wie der Rewrite in `next.config.ts`,
  gemeinsam in `src/lib/markdown-accept.ts`) bleiben unberührt. `/api/md` antwortet selbst mit
  der Markdown-404.

Der Modul-Zustand im Proxy ist nur ein Zwischenspeicher. Laut Proxy-Doku gibt es keine Garantie
für gemeinsamen Zustand; ohne ihn lädt der Proxy bei jedem Abruf neu, das Ergebnis bleibt richtig.

## Zeiten nach einer Änderung in Ghost

| Ereignis | Ergebnis |
| --- | --- |
| Neuer Beitrag veröffentlicht | erscheint spätestens nach 10 s (Liste wird neu geladen, die Seite entsteht beim ersten Abruf). Ein Abruf in den ersten 10 s bekommt die 404, sie wird nicht im Cache abgelegt. |
| Beitrag gelöscht | 404 spätestens nach 60 s (Proxy), auch wenn die Seite noch im ISR-Cache liegt; der Webhook leert den Cache zusätzlich. |
| Beitrag geändert | wie bisher über den Webhook (`revalidatePath`) |

## Gemessen (lokal, Ghost-Mock, Standalone-Server)

- Vorher (`52febac`): `/blog/unbekannt-404` 404, `<html id="__next_error__">`, 0 Stylesheets,
  keine H1, `s-maxage=31536000`.
- Nachher: 404, `<html lang="de">`, 4 Stylesheets, H1 „Seite nicht gefunden / Page not found“,
  `no-store`; ohne JavaScript H1 sichtbar und CSS angewendet. Gate-Proben `/blog/unbekannt-404` und
  `/en/blog/unbekannt-404` (scripts/gate/shoot.mjs, zwei neue Agenten-Prüfungen).
- Neuer Beitrag ohne Neubau (zweiter Mock auf eigenem Port, Fixture um einen Beitrag ergänzt,
  Server mit `GHOST_URL` auf diesen Mock): vor der Veröffentlichung 404; direkt danach 404 (Liste
  jünger als 10 s); nach 10 s 200 (`x-nextjs-cache: MISS`, danach `HIT`); Webhook mit falschem
  Geheimnis 401, mit richtigem 200, danach neu gerendert.
- Server-Log: Jeder Abruf eines unbekannten Blog-Slugs schreibt wie bei Projekten
  `Error: Internal: NoFallbackError` (siehe docs/urls.md, FUN2). Die Antwort ist korrekt.

## Grenzen

- Client-Navigation auf einen unbekannten Slug (Link innerhalb der Website): Der RSC-Abruf
  bekommt 404, der Browser lädt die Adresse dann vollständig und zeigt die globale 404.
- Ein CDN vor der Website ist nicht betroffen: Die 404 hat `no-store`.

## Englische 404: `lang` im Server-HTML (Rest-Feinschliff, 2026-10-23)

Ausgangslage: Die globale 404 war ein einziges statisches HTML mit `lang="de"`. Unter `/en`
setzte erst ihr Boot-Script `lang="en"` und `data-yb-404="en"`. Agenten und Browser ohne
JavaScript bekamen unter `/en/<unbekannt>` und `/en/blog/<unbekannt>` die deutsche Fassung
(gemessen am Stand `4221b3f`: Server-HTML `lang="de"`, ohne JavaScript H1 „Seite nicht
gefunden“).

Bedingung: kein Textaustausch per Script (React #418), Seiten mit Route bleiben statisch.

Geprüft, jeweils mit eigenem Build gegen den Ghost-Mock:

1. **Fallback-Rewrite** (`rewrites().fallback`: `/en/:path*` → eine EN-Seite, die `notFound()`
   aufruft). Next wendet ihn nur an, wenn keine Route passt, auch bei `/en/projekte/<unbekannt>`.
   Die Zielseite ruft `notFound()` aber beim Vorrendern auf, und Next liefert dann wieder die leere
   `__next_error__`-Hülle mit `s-maxage=31536000`, auch beim direkten Abruf. **Verworfen.**
2. **Sprache per Proxy-Header** (umgesetzt): `src/proxy.ts` läuft zusätzlich für `/en/:path*` und
   setzt den Anfrage-Header `x-yb-lang: en` (`src/lib/not-found-lang.ts`). `global-not-found.tsx`
   liest ihn mit `headers()` und setzt `lang` und `data-yb-404` im Server-HTML. Der Text bleibt
   in beiden Sprachen im Dokument, CSS zeigt die Fassung wie vorher. Seiten mit Route lesen den
   Header nicht und bleiben statisch (`/en` weiter `s-maxage=31536000`).

Kosten von Variante 2:

- `/_not-found` ist jetzt dynamisch (ƒ) und wird je Abruf gerendert. Gecacht wurde die 404 auch
  vorher nie (`private, no-cache, no-store`). `scripts/gate/build.sh` lässt diese eine Seite
  als dynamisch zu.
- Lokal gemessen (Standalone-Server, je 40 Abrufe, Median): 404 unter `/en` 2,5 → 5,1 ms,
  unter DE 2,5 → 3,9 ms; EN-Seiten mit Route (`/en/cv`) 4,1 → 4,6 ms durch den Proxy.
- Ein Client, der den Header auf einem DE-Pfad selbst mitschickt, bekommt dort die englische
  404. Das betrifft nur seine eigene Antwort (`no-store`). Unter `/blog/<slug>` entfernt der Proxy
  den Header.

Ergebnis (Gate-Proben, Server-HTML und ohne JavaScript):

| Pfad | vorher `lang` / sichtbare H1 ohne JS | nachher |
| --- | --- | --- |
| `/en/gibt-es-nicht-404` | `de` / „Seite nicht gefunden“ | `en` / „Page not found“ |
| `/en/blog/unbekannt-404` | `de` / „Seite nicht gefunden“ | `en` / „Page not found“ |
| `/en/projekte/unbekannt-404` | `de` / „Seite nicht gefunden“ | `en` / „Page not found“ |
| `/gibt-es-nicht-404`, `/blog/unbekannt-404`, `/projekte/unbekannt-404` | `de` / „Seite nicht gefunden“ | unverändert |

Mit JavaScript zeigten alle drei EN-Pfade schon vorher „Page not found“ (Boot-Script).

Status 404, `no-store`, Stylesheets und H1 bleiben wie vorher. Mit JavaScript gibt es keinen
Hydration-Fehler (0 Konsolenfehler außer der 404-Ressourcenmeldung der Seite selbst). Das
Boot-Script setzt `lang` und `data-yb-404` weiter, mit demselben Wert, als Rückfall ohne Proxy.
Das Gate prüft seitdem `lang` auch im Server-HTML der 404-Proben und ohne JavaScript die Sprache
der sichtbaren H1 (`scripts/gate/shoot.mjs`).
