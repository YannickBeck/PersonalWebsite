# Testbericht — Entwurf (Stand: 30.09.2026, Platzhalter aktiv)

## Methode
Laborprüfungen mit headless Chrome (CDP + Screenshots),KEINE Feld-Daten (kein RUM).
Gute Werte werden nicht behauptet — unten stehen ausschließlich gemessene Befunde.
Alle Screenshots: `/tmp/opencode/shots/` (Server).

## Overflow (document.scrollWidth vs. Viewport)
| Breite | Home | Projekte | Blog/Detail | Befund |
|---|---|---|---|---|
| 320px | 320 ok | 320 ok | 320 ok | behoben: Grid-minWidth 260, TabList-Clip, Code-Scroll-Container |
| 390px | 390 ok | 390 ok | 390 ok | der gemeldete 501px-Fehler tritt nicht mehr auf (mobilen Header + Clips) |
| 768px | ok | ok | ok | – |
| 1440px | ok | ok | ok | – |

Ursachen (gefixt, per CDP-Right-Edge-Analyse): Grid-Mindestbreite 320 + Layout-Padding,
TabList-Strip ohne Breitenbindung, CodeBlock ohne Scroll-Container.

## Kontraste (gemessen, computed colors)
| Paar | dunkel | hell | WCAG AA (4.5) |
|---|---|---|---|
| H1 / Hintergrund | 14.91:1 | 15.62:1 | erfüllt (AAA) |
| Link-Akzent / Hintergrund | 11.27:1 | 5.87:1 | erfüllt (AAA / AA) |

## Tastatur & Fokus (statisch + CDP-verifiziert)
- Skip-Link vorhanden; alle Bedienelemente native Buttons/Links/Inputs (Tab erreichbar).
- Mobiles Menü: öffnet per Klick, `aria-expanded`, alle 5 Links, Escape schließt,
  Fokus wandert ins Panel (CDP-Test bestanden).
- Formularfehler mit `aria-invalid` + Meldung (TextInput/TextArea-Status).
- Manuell nachzuholen: kompletter Tastatur-Rundgang + Screenreader-Stichprobe.

## Interaktionen (funktional geprüft)
- Filter (Projekte/ Blog-Themen), Suche (Titel/Excerpt/Themen), Leer-Zustand + Reset.
- Sprachwechsel mit Zuordnung (DE↔EN Detail-Paare), Fallback auf Startseite.
- Theme-Wechsel System/Hell/Dunkel (gespeichert), Light-Mode-Screenshot ok.
- Kontakt-Formular: Validierung, Demo-Erfolg/Fehler, Vorschau-Steuerung.
- Newsletter: alle Zustände lokal demonstrierbar.
- Akkordeon-FAQ (CollapsibleGroup), Druckansicht CV.

## Transfergrößen HTML (prod, Stand vor Redesign-Deploy)
`/` 46 KB, `/projekte` 29 KB, `/blog` 29 KB, `/kontakt` 26 KB, `/en` 50 KB.
Platzhalter-SVGs je 2–7 KB. Keine Feld- oder LCP-Messungen vorhanden.

## Verbleibende Probleme
- Auto-Deploy bei Git-Push greift nicht zuverlässig → Deploy manuell per API.
- Traefik-LE für Tunnel-Hosts scheitert (Edge-Zert deckt ab) → DNS-01 optional.
- Echte Inhalte, Versand-Anbindung, Analytics-Token offen (siehe /content-status).
- Kein RUM/Web-Vitals-Feldmonitoring eingerichtet.
