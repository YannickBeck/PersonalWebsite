# Unbekannte Blog-Slugs: statische 404 ohne Neubau für neue Beiträge

Stand: Feinschliff (2026-10-22), Next 16.3.6.

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
  der statischen globalen 404 (`src/app/global-not-found.tsx`): Status 404, `no-store`, Seite
  mit Stylesheets und Text auch ohne JavaScript. Unter `/en` setzt das Boot-Script `lang="en"`
  und zeigt den englischen Text, wie bei allen anderen 404 der Website.
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
- Die globale 404 ist ein einziges statisches HTML mit `lang="de"` im Server-HTML; `lang="en"`
  setzt unter `/en` das Boot-Script (wie bisher bei allen unbekannten Pfaden).
- Ein CDN vor der Website ist nicht betroffen: Die 404 hat `no-store`.
