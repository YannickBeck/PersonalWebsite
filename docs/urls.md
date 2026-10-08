# Adressen — alt und neu (Redesign B4, 2026-10)

Grundlage: alle Adressen des Live-Stands `2d636c6` (Sitemap `https://yannick-beck.de/sitemap.xml`
und die Links der Seiten, abgerufen am 09.10.2026) plus die neuen Projektseiten. Jede alte Adresse
bleibt erreichbar oder leitet dauerhaft weiter – keine führt ins Leere.

Prüfen (nur lesende GETs, gegen einen lokalen Standalone-Server mit Ghost-Mock):

```bash
node scripts/url-check.mjs http://127.0.0.1:3304            # Produktion
node scripts/url-check.mjs http://127.0.0.1:3304 --preview  # Vorschau (NEXT_PUBLIC_SHOW_GAPS=1)
node scripts/link-check.mjs http://127.0.0.1:3304           # tote interne Links + fehlende Sprungziele
```

## Seiten (DE und EN, alle 200)

| Pfad (DE, EN mit `/en`) | Inhalt seit B4 |
|---|---|
| `/` | lange Startseite (Einstieg, Über mich, Fähigkeiten, Projekte, Werdegang, Kontakt) |
| `/ueber-mich` | LinkedIn-Zusammenfassung im Wortlaut, Porträt, Schwerpunkte, Interessen, Werdegang kurz |
| `/projekte` | genau zwei Projekte (Orbitalis, Bachelorarbeit) als Zeilen |
| `/projekte/orbitalis`, `/projekte/bachelorarbeit` (EN `/en/projekte/orbitalis`, `/en/projekte/bachelor-thesis`) | Detailseiten aus dem Content-Modell, „Weiteres Projekt“ statt Karussell |
| `/cv` | Lebenslauf aus dem Content-Modell, druckbar (3 Seiten A4, gemessen) |
| `/leistungen` | „Schwerpunkte“: vier Themen aus dem Profil, kein Leistungskatalog |
| `/uses` | ehrlich: Liste folgt, bis dahin die Technik aus Orbitalis (nicht in Navigation/Sitemap, noindex) |
| `/blog`, `/blog/<slug>` | Beiträge aus Ghost; Suche/Filter erst ab vier Beiträgen |
| `/kontakt` | Formular mit echtem Versand + LinkedIn |
| `/newsletter` | ehrlich: Anmeldung nur auf Einladung, RSS-Feed und LinkedIn als Wege; Demo-Formular nur in der Vorschau |
| `/impressum`, `/datenschutz` | Entwurf aus `src/content/legal.ts`; fehlende Pflichtangaben auch in Produktion als „OFFEN“ |
| `/content-status` | Lückenliste (noindex, nur in der Vorschau verlinkt) |

Ghost-Beiträge, die live existieren und erreichbar bleiben: `/blog/hallo-welt-warum-diese-website`,
`/en/blog/hello-world-why-this-website`, `/en/blog/coming-soon` (Ghost-Standardbeitrag),
`/projekte/beispielprojekt-me-website`, `/en/projekte/sample-project-me-website` (Ghost-Beitrag mit
Tag „project“: erreichbar, noindex, nicht gelistet).

## Weiterleitungen (308, `next.config.ts`)

| Alt | Ziel | Grund |
|---|---|---|
| `/projekte/demo-projekt-webseite`, `…-cms-migration`, `…-deploy-pipeline` | `/projekte` | Demo-Projekte eines anderen Agenten, im Redesign entfernt |
| `/en/projekte/demo-project-website`, `…-cms-migration`, `…-deploy-pipeline` | `/en/projekte` | dto. |
| `/blog/demo-*` (6 Slugs) | `/blog` | Demo-Artikel – **nur Produktion**; im Vorschau-Build gibt es sie weiter |
| `/en/blog/demo-*` (6 Slugs) | `/en/blog` | dto. |
| `/about` | `/ueber-mich` | alte Ghost-Adresse |
| `/coming-soon` | `/en/blog` | alte Ghost-Adresse (Beitrag selbst unter `/en/blog/coming-soon`) |
| `/tag/news` | `/blog` | alte Ghost-Adresse |
| `/contact`, `/privacy`, `/imprint` | `/kontakt`, `/datenschutz`, `/impressum` | übliche englische Pfade (Vertrauensanker für Agenten) |

Entscheidung: Weiterleitung statt 404, weil die Demo-Adressen in Navigation, Listen und der Sitemap
des Live-Stands standen. Exakte Slugs statt Muster, damit künftige Ghost-Beiträge nie versehentlich
umgeleitet werden. Next leitet vor dem Dateisystem um (`redirects.md`), auch vor der
Markdown-Umschreibung für Agenten.

## Sonstiges

`/rss.xml`, `/en/rss.xml` (im `<head>` jeder Seite als `alternate` verlinkt), `/sitemap.xml`,
`/robots.txt`, `/llms.txt`, `/og/de`, `/og/en`, `/placeholders/*.svg` (alte Demo-Cover, weiter
ausgeliefert). Unbekannte Pfade → 404 (HTML bzw. Markdown bei `Accept: text/markdown`).
