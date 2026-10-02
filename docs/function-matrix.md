# Funktionsmatrix — yannick-beck.de (Stand: Entwurf, Platzhalter aktiv)

## Funktioniert echt
- Navigation: sticky Header mit Blur, aktive Seite markiert; mobil Astryx-MobileNav-Drawer
  (Fokusfalle, Escape/Backdrop schließen, Fokus zurück, schließt bei Navigation, Theme-Schalter
  im Drawer). Sprachwechsel mit Übersetzungszuordnung (unbekannte Pfade → anderssprachige Startseite), Theme-Schalter (Icon hell ↔ dunkel, gespeichert; ohne Wahl folgt System; kein Flash dank Boot-Script)
- Projekt-/Artikel-Listen aus Ghost + Demo (Filter, Suche, Leer-Zustand, Reset)
- Detailseiten (Ghost-HTML + Demo-Blöcke mit TOC, Code-Kopie, Tabellen, Galerie)
- Related-Content, Zurück-Links, Redirects alter Ghost-URLs
- Ghost-Webhook → Revalidate, ISR 60 s, RSS/Sitemap/robots, Canonical/hreflang
- 404-Seite (DE; unter /en nach der Hydration vollständig Englisch, ohne Hydration-Fehler), Druckansicht CV (ohne Header/Footer/Buttons/Demo-Marken), Skip-Link,
  reduzierte Bewegung, Sticky-Footer auf kurzen Seiten
- Formulare als echtes `<form>` mit `autocomplete`, Enter sendet (lokal, Demo); deutsche
  Astryx-Beschriftungen über `InternationalizationProvider`

## Simuliert (Demo, keine Datenübertragung)
- Kontaktformular: Validierung + Lade/Fehler/Erfolg + Zustands-Vorschau
  („Demo geprüft – keine Nachricht versendet“)
- Newsletter: alle Zustände lokal (Invite-Hinweis, existiert, Fehler, Bestätigung)
- Alle mit „Demo“ markierten Inhalte (Projekte, Artikel, Bio, CV, Leistungen, Uses,
  Impressum/Datenschutz-Angaben, Bilder)

## Noch anzubinden (Angaben fehlen)
- Kontaktversand: Resend-Key oder eigene API-Route + Zieladresse
- Newsletter-Freischaltung: Ghost `members_signup_access` (derzeit `invite`)
- E-Mail-Adresse (Kopie-Funktion erscheint nach Bestätigung)
- Echte Inhalte: Portrait, Cover, Bio, CV, Preise (siehe /content-status)
- Analytics: `NEXT_PUBLIC_CF_BEACON_TOKEN` (optional)
- LE per DNS-01 statt Edge-Abdeckung (optional, unkritisch)
