# Funktionsmatrix — yannick-beck.de (Stand: Redesign B4, 2026-10)

## Funktioniert echt
- Navigation: sticky Header mit Blur, aktive Seite markiert; mobil Astryx-MobileNav-Drawer
  (Fokusfalle, Escape/Backdrop schließen, Fokus zurück, schließt bei Navigation, Theme-Schalter
  im Drawer). Sprachwechsel mit Übersetzungszuordnung (unbekannte Pfade → anderssprachige Startseite), Theme-Schalter (Icon hell ↔ dunkel, gespeichert; ohne Wahl folgt System; kein Flash dank Boot-Script)
- Inhalte über Yannick aus dem Content-Modell (`src/content/profile.ts`, belegt aus LinkedIn-Export, Orbitalis-READMEs, Fotos); offene Angaben nur im Vorschau-Build
- Startseite als Scrollseite mit Abschnitten 00–06 und klebender Abschnittsnavigation (aktiver Abschnitt, Tastatur, mobil horizontal)
- Einstieg: freigestelltes Porträt vor blassem Namenszug, Einblenden beim ersten Laden, Zeiger-Parallaxe (Maus) und Scroll-Drift; unter Reduced Motion statisch
- Ausweiskarte am Band (Über mich): Ziehen (Maus/Touch), Tippen, Button „Karte umdrehen“, ←/→ schwenken; Pendeln nur ohne Reduced Motion, klingt in < 4 s aus
- Fähigkeiten als Periodensystem (35 Kacheln aus LinkedIn und Orbitalis, farbig nach Kategorie; seit Fix-Runde 1 ohne „AI Agents“ – laut Profil ein Interesse): Filter-Pillen, Auswahl per Klick/Tippen/Pfeiltasten, Detailfeld mit Kürzel bzw. Logo (nur PHP und FastAPI, Lizenz geprüft: `docs/skill-logos.md`), Kategorie und Belegen mit Sprung zu Werdegang und Projekten; vollständige Textliste für Screenreader
- Projekte als Akkordeon (nebeneinander mit Streifen, mobil untereinander): Kurzfassung, Fähigkeiten mit Sprung ins Periodensystem, Detailseite und Quellcode-Link (Orbitalis); Projektseiten verlinken ihre Fähigkeiten zurück auf die Startseite
- Werdegang mit aufklappbaren Stationen (native `<details>`, exklusiv, ohne JS bedienbar), Ausbildung und Zertifikate als Liste; Bachelorarbeit springt ins Projekt
- Laufband „Erfolge“ fertig (Pause-Schalter, Kopie verborgen, statisch bei Reduced Motion und mobil) – erscheint erst mit belegten Einträgen
- Kontaktformular mit echtem Versand: `POST /api/kontakt` → Resend (fetch), Honeypot, Mindest-Ausfüllzeit, Rate-Limit je IP + global, Einwilligung, ehrliche Zustände (Erfolg, Fehler, „Versand gerade nicht verfügbar“ ohne Konfiguration); Doku `docs/kontaktformular.md`
- Projekte: Orbitalis + Bachelorarbeit mit Detailseiten; Artikel-Liste aus Ghost (Filter und Suche ab vier Beiträgen, Leer-Zustand, Reset; Demo-Artikel nur Vorschau)
- Unterseiten im Look der Startseite (B4): Seitenkopf mit Kennung in der Display-Schrift und Akzent-Wort, nummerierte Abschnitte; Lebenslauf aus dem Content-Modell, druckbar (DE/EN je 3 Seiten A4); Über mich mit Porträt und Werdegang kurz; Schwerpunkte mit Fähigkeiten und Projekten; Projekte als Zeilen, Detailseiten mit „Weiteres Projekt“; Profil-Marken springen ins Periodensystem
- Alle Adressen des Live-Stands erreichbar oder dauerhaft weitergeleitet (`docs/urls.md`, `scripts/url-check.mjs`, `scripts/link-check.mjs`)
- Agenten-Lesbarkeit: `<html lang>` je Sprache serverseitig, JSON-LD Person, og:image (`/og/de|en`), llms.txt, Markdown bei `Accept: text/markdown` inkl. Markdown-404
- Detailseiten (Projekte aus dem Content-Modell; Ghost-HTML mit TOC, Code-Kopie, Tabellen, Galerie)
- Related-Content, Zurück-Links, Redirects alter Ghost-URLs
- Ghost-Webhook → Revalidate, ISR 60 s, RSS/Sitemap/robots, Canonical/hreflang
- 404: unbekannte Slugs im Rahmen der Sprache; URLs ohne Route über die statische globale 404 (DE, unter /en vor dem ersten Paint Englisch), Druckansicht CV (ohne Header/Footer/Buttons/Demo-Marken), Skip-Link,
  reduzierte Bewegung, Sticky-Footer auf kurzen Seiten
- Formulare als echtes `<form>` mit `autocomplete`, Enter sendet; deutsche
  Astryx-Beschriftungen über `InternationalizationProvider`

## Simuliert (keine Datenübertragung) – nur im Vorschau-Build
- Newsletter-Formular: alle Zustände lokal (Invite-Hinweis, existiert, Fehler, Bestätigung). Produktion: ehrlicher Stand (nur auf Einladung) + RSS-Feed + LinkedIn
- Demo-Artikel

## Entwurf (auch in Produktion sichtbar)
- Impressum/Datenschutz aus `src/content/legal.ts`: belegte Angaben (Name, tatsächliches Verhalten der Website) plus „OFFEN“-Markierungen für fehlende Pflichtangaben

## Noch anzubinden (Angaben fehlen)
- Kontaktversand in Produktion: Resend-Konto mit bestätigter Absender-Domain, dann `CONTACT_RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` in Coolify (bis dahin zeigt das Formular ehrlich „Versand gerade nicht verfügbar“)
- Newsletter-Freischaltung: Ghost `members_signup_access` (derzeit `invite`)
- Offene Angaben laut /content-status (z. B. Zertifikatsdaten, Ergebnis der Bachelorarbeit)
- Keine öffentliche E-Mail-Adresse (Nutzerentscheidung: Kontakt über Formular und LinkedIn)
- Analytics: `NEXT_PUBLIC_CF_BEACON_TOKEN` (optional)
- LE per DNS-01 statt Edge-Abdeckung (optional, unkritisch)
