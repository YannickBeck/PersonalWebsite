# Inhalte pflegen — yannick-beck.de

Zwei Quellen, klar getrennt:

## 1. Ghost-CMS (`cms.yannick-beck.de/ghost/`) — echte redaktionelle Inhalte

- **Blog-Artikel:** Posts mit Tag `#lang-de` bzw. `#lang-en` (interne Tags).
- **Projekte:** Posts mit Tag `project` **plus** Sprach-Tag.
- **Seiten:** About & Co. als Pages mit Sprach-Tag.
- **Cover:** pro Beitrag als Feature-Image setzen (16:10, min. 1280 × 800) —
  sobald gesetzt, ersetzt das Frontend automatisch das generative Cover
  (Verlauf + Muster + Motiv, Kategorie aus dem ersten öffentlichen Tag).
- **Inhaltsverzeichnis:** h2-Überschriften mit `id` (Ghost setzt sie automatisch)
  erscheinen ab 1024px in der Randspalte, mobil über dem Text.
- **Koenig-Cards:** Bild (auch breit/voll), Galerie, Callout, Bookmark, Toggle haben
  Basisstyles (`src/components/ghost-content.module.css`).
- **Veröffentlichen** löst per Webhook (`site.changed` → `/api/revalidate`)
  die Aktualisierung aus (zusätzlich ISR alle 60 s auf Listen).

## 2. Code (`/root/me-website`, GitHub `YannickBeck/PersonalWebsite`)

- **Demo-Inhalte:** `src/content/demo.ts` (Projekte), `src/content/demo-articles.ts`
  (Artikel), `src/content/pages.ts` (Leistungen, CV, Uses). Jeder Eintrag trägt
  `demo: true`. **Ersetzen = Eintrag löschen** (Ghost-Inhalt mit gleichem Thema anlegen).
- **UI-Texte:** `src/i18n/dictionaries.ts` (DE+EN nebeneinander).
- **Übersetzungszuordnung:** `src/i18n/translations.ts` (Slug-Paare beider Richtungen).
- **Platzhalter-Bilder:** `public/placeholders/*.svg` werden im Frontend wie „kein Bild“
  behandelt (generatives Cover statt Platzhalter-Grafik, Galerie ausgeblendet).
- **Porträt:** erscheint erst, wenn `PORTRAIT_SRC` in `src/lib/images.ts` auf eine echte
  Bildquelle zeigt (z. B. `/portrait.jpg` in `public/`); bis dahin Text + Fakten.
- **Demo-Hinweis:** eine schlanke Zeile über dem Header (`src/components/demo-notice.tsx`,
  Text `demoNoticeLine` in den Dictionaries). Entfernen, sobald keine Demo-Inhalte mehr live sind.
- **Brand-Theme:** `src/theme/yb-theme.ts` — nach jeder Änderung
  `pnpm exec astryx theme build src/theme/yb-theme.ts` ausführen (erzeugt `yb.css`/`yb.js`/`yb.d.ts`/`yb.variants.d.ts`, alle committen).
  Farb-, Typo- und Motion-Entscheidungen stehen im Kopfkommentar der Theme-Datei.

## 3. Übersicht aller Lücken

Seite `/content-status` (DE+EN, `noindex`): Fundstelle, benötigter Inhalt,
Format/Umfang, Status — dort steht, was noch fehlt.
