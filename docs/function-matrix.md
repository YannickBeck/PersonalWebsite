# Funktionsmatrix — yannick-beck.de (Stand: Redesign B1, 2026-10)

## Funktioniert echt
- Navigation: sticky Header mit Blur, aktive Seite markiert; mobil Astryx-MobileNav-Drawer
  (Fokusfalle, Escape/Backdrop schließen, Fokus zurück, schließt bei Navigation, Theme-Schalter
  im Drawer). Sprachwechsel mit Übersetzungszuordnung (unbekannte Pfade → anderssprachige Startseite), Theme-Schalter (Icon hell ↔ dunkel, gespeichert; ohne Wahl folgt System; kein Flash dank Boot-Script)
- Inhalte über Yannick aus dem Content-Modell (`src/content/profile.ts`, belegt aus LinkedIn-Export, Orbitalis-READMEs, Fotos); offene Angaben nur im Vorschau-Build
- Startseite als Scrollseite mit Abschnitten 00–06 und klebender Abschnittsnavigation (aktiver Abschnitt, Tastatur, mobil horizontal)
- Projekte: Orbitalis + Bachelorarbeit mit Detailseiten; Artikel-Liste aus Ghost (Filter, Suche, Leer-Zustand, Reset; Demo-Artikel nur Vorschau)
- Agenten-Lesbarkeit: `<html lang>` je Sprache serverseitig, JSON-LD Person, og:image (`/og/de|en`), llms.txt, Markdown bei `Accept: text/markdown` inkl. Markdown-404
- Detailseiten (Projekte aus dem Content-Modell; Ghost-HTML mit TOC, Code-Kopie, Tabellen, Galerie)
- Related-Content, Zurück-Links, Redirects alter Ghost-URLs
- Ghost-Webhook → Revalidate, ISR 60 s, RSS/Sitemap/robots, Canonical/hreflang
- 404: unbekannte Slugs im Rahmen der Sprache; URLs ohne Route über die statische globale 404 (DE, unter /en vor dem ersten Paint Englisch), Druckansicht CV (ohne Header/Footer/Buttons/Demo-Marken), Skip-Link,
  reduzierte Bewegung, Sticky-Footer auf kurzen Seiten
- Formulare als echtes `<form>` mit `autocomplete`, Enter sendet (lokal, Demo); deutsche
  Astryx-Beschriftungen über `InternationalizationProvider`

## Simuliert (keine Datenübertragung)
- Kontaktformular: Validierung + Lade/Fehler/Erfolg; Hinweis „noch nicht angebunden“
  (Zustands-Vorschau nur im Vorschau-Build)
- Newsletter: alle Zustände lokal (Invite-Hinweis, existiert, Fehler, Bestätigung)
- Demo-Artikel (nur Vorschau-Build); Impressum/Datenschutz-Angaben als [Platzhalter]

## Noch anzubinden (Angaben fehlen)
- Kontaktversand: Resend-Key oder eigene API-Route + Zieladresse
- Newsletter-Freischaltung: Ghost `members_signup_access` (derzeit `invite`)
- Offene Angaben laut /content-status (z. B. Zertifikatsdaten, Ergebnis der Bachelorarbeit)
- Keine öffentliche E-Mail-Adresse (Nutzerentscheidung: Kontakt über Formular und LinkedIn)
- Analytics: `NEXT_PUBLIC_CF_BEACON_TOKEN` (optional)
- LE per DNS-01 statt Edge-Abdeckung (optional, unkritisch)
