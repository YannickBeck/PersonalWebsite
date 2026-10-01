# Inhalte pflegen — yannick-beck.de

Zwei Quellen, klar getrennt:

## 1. Ghost-CMS (`cms.yannick-beck.de/ghost/`) — echte redaktionelle Inhalte

- **Blog-Artikel:** Posts mit Tag `#lang-de` bzw. `#lang-en` (interne Tags).
- **Projekte:** Posts mit Tag `project` **plus** Sprach-Tag.
- **Seiten:** About & Co. als Pages mit Sprach-Tag.
- **Cover:** pro Beitrag als Feature-Image setzen (16:10, min. 1280 × 800) —
  sobald gesetzt, ersetzt das Frontend automatisch den Muster-Platzhalter.
- **Veröffentlichen** löst per Webhook (`site.changed` → `/api/revalidate`)
  die Aktualisierung aus (zusätzlich ISR alle 60 s auf Listen).

## 2. Code (`/root/me-website`, GitHub `YannickBeck/PersonalWebsite`)

- **Demo-Inhalte:** `src/content/demo.ts` (Projekte), `src/content/demo-articles.ts`
  (Artikel), `src/content/pages.ts` (Leistungen, CV, Uses). Jeder Eintrag trägt
  `demo: true`. **Ersetzen = Eintrag löschen** (Ghost-Inhalt mit gleichem Thema anlegen).
- **UI-Texte:** `src/i18n/dictionaries.ts` (DE+EN nebeneinander).
- **Übersetzungszuordnung:** `src/i18n/translations.ts` (Slug-Paare beider Richtungen).
- **Platzhalter-Bilder:** `public/placeholders/*.svg` (neutral, 16:10 bzw. Portrait).
- **Brand-Theme:** `src/theme/yb-theme.ts` — nach jeder Änderung
  `pnpm exec astryx theme build src/theme/yb-theme.ts` ausführen (erzeugt `yb.css`/`yb.js`/`yb.d.ts`/`yb.variants.d.ts`, alle committen).
  Farb-, Typo- und Motion-Entscheidungen stehen im Kopfkommentar der Theme-Datei.

## 3. Übersicht aller Lücken

Seite `/content-status` (DE+EN, `noindex`): Fundstelle, benötigter Inhalt,
Format/Umfang, Status — dort steht, was noch fehlt.
