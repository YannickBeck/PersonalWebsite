# Inhalte pflegen — yannick-beck.de

Zwei Quellen, klar getrennt:

## 1. Ghost-CMS (`cms.yannick-beck.de/ghost/`) — echte redaktionelle Inhalte

- **Blog-Artikel:** Posts mit Tag `#lang-de` bzw. `#lang-en` (interne Tags).
- **Blog sichtbar machen (Fix-Runde 2, JURY1-4):** Solange Ghost nur Beispielbeiträge enthält
  („Hallo Welt“, „Coming soon“), stehen Blog und Newsletter nicht in Navigation, Footer, Sitemap
  und llms.txt (noindex, URLs erreichbar). Nach dem ersten eigenen Beitrag: Beispielbeiträge in
  Ghost löschen, `/blog` und `/newsletter` aus `UNLISTED_ROUTES` in `src/lib/routes.ts`
  streichen, neu bauen.
- **Projekte:** Posts mit Tag `project` **plus** Sprach-Tag.
- **Bereich eines Projekts** (Filter auf /projekte: Webentwicklung, CMS, Automatisierung):
  interner Tag `#bereich-web`, `#bereich-cms` oder `#bereich-automation` (hat Vorrang);
  sonst der erste passende öffentliche Tag (`web`/`webentwicklung`/`nextjs` → Web,
  `cms`/`ghost`/`headless-cms` → CMS, `automation`/`automatisierung`/`tooling`/`ci-cd`/
  `devops` → Automatisierung; `src/lib/items.ts`). Ohne Bereich erscheint das Projekt nur
  unter „Alle Bereiche“. Tabs gibt es nur für Bereiche mit Einträgen.
- **Seiten:** About & Co. als Pages mit Sprach-Tag.
- **Cover:** pro Beitrag als Feature-Image setzen (16:10, min. 1280 × 800) —
  sobald gesetzt, ersetzt das Frontend automatisch das generative Cover
  (Verlauf + Muster + Motiv, Kategorie aus dem ersten öffentlichen Tag).
- **Inhaltsverzeichnis:** h2-Überschriften mit `id` (Ghost setzt sie automatisch)
  erscheinen ab 1024px in der Randspalte (aktiver Abschnitt markiert), mobil nach dem
  Titelbild – dort erst ab 4 Überschriften. Sonderzeichen wie `<`, `&` sind erlaubt.
- **Koenig-Cards:** Bild (auch breit/voll), Galerie, Callout, Bookmark, Toggle haben
  Basisstyles (`src/components/ghost-content.module.css`).
- **Veröffentlichen** löst per Webhook (`site.changed` → `/api/revalidate`)
  die Aktualisierung aus (zusätzlich ISR alle 60 s auf Listen). Ein neuer Beitrag ist unter
  `/blog/<slug>` spätestens nach 10 s erreichbar, ein gelöschter liefert spätestens nach 60 s die
  404 (`src/proxy.ts`, `docs/blog-404.md`) – ohne Neubau.

## 2. Code (`/root/me-website`, GitHub `YannickBeck/PersonalWebsite`)

- **Inhalte über Yannick:** `src/content/profile.ts` – EINE Quelle (DE+EN) für Startseite, /cv,
  /ueber-mich, /projekte, /leistungen, /uses, llms.txt, JSON-LD und Markdown-Antworten. Jede Angabe
  trägt `quelle` (`linkedin` = LinkedIn-Export, `github:YannickBeck/<repo>`, `foto`) und `status`
  (`belegt` | `offen`). Neue Angabe = mit Quelle eintragen; ohne Beleg nicht veröffentlichen.
- **Offene Angaben:** `GAPS` in profile.ts (Kurztext, Fundstelle, benötigtes Format). Sie erscheinen
  nur im Vorschau-Build (`NEXT_PUBLIC_SHOW_GAPS=1`, docs/environment.md) als gestrichelter
  „OFFEN: …“-Platzhalter; in Produktion fehlen sie ganz. Sobald eine Angabe da ist: Wert in
  profile.ts eintragen (`status: 'belegt'`), Lücke aus GAPS löschen.
- **Erfolge (Startseite, Abschnitt Erfolge – Nummer 05, solange es Einträge gibt):** `ACHIEVEMENTS` in profile.ts – leer = Abschnitt und Navigationspunkt
  fehlen; mit Einträgen erscheinen beide automatisch als Laufband (Titel kurz, `detail` optional,
  jeweils mit Quelle).
- **Fähigkeiten (Periodensystem, Startseite 02):** `SKILLS` in profile.ts – Kürzel (`symbol`,
  zwei Zeichen, eindeutig), Name, Kategorie (`SKILL_CATEGORIES`), Belege (`evidence`: Station,
  Ausbildung, Zertifikat, Projekt oder Profilstelle). Kurzname für die Kachel (`tile`) nur, wenn der
  Name zu lang ist. Logo nur mit geprüfter Lizenz (`docs/skill-logos.md`).
- **Projekt-Kurzfassung:** `brief` je Projekt (Akkordeon der Startseite) – ein Absatz (`summary`,
  fehlt er, der Teaser) und die Stichpunkte, nur gekürzt aus den belegten Feldern; Ausgangslage und
  Ergebnis zeigt nur die Detailseite (Fix-Runde 3: beide Projekte etwa gleich hoch).
- **Englische Rollenbezeichnungen:** Ist die EN-Fassung einer Station eine eigene Übersetzung,
  `enRole: open('station-en-role')` setzen (GEBHARDT: „Electrical technician – automation“ für
  „Elektrotechniker – Automatisierung“) – die Vorschau markiert sie auf EN-Seiten.
- **Projekte:** nur `PROJECTS` in profile.ts (derzeit Orbitalis und Bachelorarbeit). Ghost-Beiträge
  mit Tag `project` werden nicht gelistet (URL bleibt erreichbar, noindex); Ghost-Testinhalte, die nie
  erscheinen sollen, stehen in `src/lib/ghost-samples.ts` (308 auf die Übersicht, Fix-Runde 3).
- **Rechtstexte:** `src/content/legal.ts` (Impressum, Datenschutz; DE+EN, auch für die Markdown-
  Fassung). Fehlende Pflichtangaben stehen als `open` und erscheinen – als einzige Lücken – auch in
  Produktion als „OFFEN: …“. Angabe da → Text eintragen, `open` löschen; vor der Veröffentlichung
  rechtlich prüfen lassen (Entwurf, keine Rechtsberatung). Was fehlt und wo es hingehört: Abschnitt 2a.
- **Schwerpunkte (/leistungen):** `FOCUS_AREAS` in profile.ts; „Projekte dazu“ ergibt sich aus
  `PROJECTS[].skills`.
- **Alte Adressen:** Weiterleitungen und Prüfskripte in `docs/urls.md`.
- **Demo-Artikel:** `src/content/demo-articles.ts` – nur im Vorschau-Build sichtbar (Token „Demo“);
  das Newsletter-Demo-Formular ebenso.
- **UI-Texte:** `src/i18n/dictionaries.ts` (DE+EN nebeneinander), nur Bedienung und Überschriften.
- **Übersetzungszuordnung:** `src/i18n/translations.ts` (Slug-Paare beider Richtungen).
- **Platzhalter-Bilder:** `public/placeholders/*.svg` werden im Frontend wie „kein Bild“
  behandelt (generatives Cover statt Platzhalter-Grafik, Galerie ausgeblendet).
- **Fotos:** `public/me/` (vom Inhaber, Metadaten entfernt): `portrait.webp` (Original),
  `portrait-cutout.webp` (freigestellt, Einstieg), `portrait-card.webp` (4:5), `portrait-avatar.webp`
  (quadratisch). Maße/Alt-Texte in `PHOTOS` (profile.ts). Neue Ausschnitte nur aus dem Original,
  ohne Hochskalieren und ohne Metadaten.
- **Brand-Theme:** `src/theme/yb-theme.ts` — nach jeder Änderung
  `pnpm exec astryx theme build src/theme/yb-theme.ts` ausführen (erzeugt `yb.css`/`yb.js`/`yb.d.ts`/`yb.variants.d.ts`, alle committen).
  Farb-, Typo- und Motion-Entscheidungen stehen im Kopfkommentar der Theme-Datei.

## 2a. Rechtstexte: was fehlt und wo es hingehört

Stand 23.10.2026. Alle Einzelquellen (URL, Abrufdatum, Messung) stehen im Kopfkommentar von
`src/content/legal.ts`.

**Persönliche Angaben, an EINER Stelle:** `LEGAL_PERSON` in `src/content/legal.ts`. Impressum
(„Angaben gemäß § 5 DDG“, „Kontakt“, „§ 18 Abs. 2 MStV“) und Datenschutz („Verantwortliche
Stelle“) lesen daraus. Ein eingetragener Wert ersetzt die OFFEN-Zeile auf beiden Seiten, in DE, EN
und der Markdown-Fassung.

| Feld | Inhalt | Solange `null` |
| --- | --- | --- |
| `address` | Ladungsfähige Anschrift, eine Zeile je Eintrag: `['Straße Hausnummer', 'PLZ Ort']` | OFFEN im Impressum und im Datenschutz |
| `email` | E-Mail-Adresse (§ 5 DDG, Datenschutzanfragen) – steht danach öffentlich, mit „keine öffentliche E-Mail“ abstimmen | OFFEN im Impressum und im Datenschutz |
| `mstv` | `{ name, address: [...] }` der verantwortlichen Person nach § 18 Abs. 2 MStV; `false`, wenn die rechtliche Prüfung ergibt, dass es nicht nötig ist (Abschnitt entfällt) | OFFEN im Impressum |

Liegt die Anschrift nicht in Baden-Württemberg, ändert sich auch die Aufsichtsbehörde im
Abschnitt „Deine Rechte“ (`RIGHTS_BLOCK`, derzeit der Landesbeauftragte für Baden-Württemberg,
abgeleitet aus dem LinkedIn-Ort Sandhausen).

**Offene Punkte im Datenschutz (Einträge mit `open` in `PRIVACY`):**

- Server (Hetzner): Standort des Rechenzentrums; ob ein Auftragsverarbeitungsvertrag (Art. 28
  DSGVO) mit Hetzner besteht; ob und wie lange der Server Abrufe protokolliert und auf welcher
  Rechtsgrundlage.
- Cloudflare: Rechtsgrundlage für die Auslieferung und für die Übermittlung in die USA; ob das
  Data Processing Addendum von Cloudflare abgeschlossen ist.
- Analyse: Stand vor der Veröffentlichung prüfen (Cloudflare Web Analytics ist vorbereitet, aber aus).
- Mit Kontaktformular zusätzlich: Resend (Anbieter, Vertrag, Drittland), Speicherdauer,
  Rechtsgrundlage und Widerrufsweg.

**Belegt und im Text:** Betroffenenrechte (Art. 15, 16, 17, 18, 20, 21, 77 DSGVO, Art. 7 Abs. 3
nur mit Kontaktformular), Aufsichtsbehörde Baden-Württemberg mit Anschrift, Hetzner als Hoster
(Angabe des Inhabers) mit Anschrift aus dem Hetzner-Impressum, Cloudflare (Auslieferung, Network
Error Logging, keine Cookies gemessen, Teilnahme am EU-US Data Privacy Framework), Tunnel
(Angabe des Inhabers).

**Neu messen, wenn sich am Betrieb etwas ändert** (Cloudflare-Einstellungen, Analyse, neuer
Hoster): Antwort-Header von `https://yannick-beck.de` mit und ohne Browser-User-Agent prüfen
(`server`, `cf-cache-status`, `report-to`/`nel`, `set-cookie`) und die betroffenen Sätze in
`PRIVACY` anpassen. Bot Fight Mode setzt z. B. das Cookie `__cf_bm`, Challenges setzen
`cf_clearance` (Cloudflare-Doku, Link in legal.ts).

Prüfen nach einer Änderung: Gate-Zähler `legalOpen` (shoot.mjs) und die Markdown-Fassung
(`curl -H 'Accept: text/markdown' <host>/datenschutz`).

## 3. Übersicht aller Lücken

Seite `/content-status` (DE+EN, `noindex`, im Footer nur im Vorschau-Build): alle Einträge aus
`GAPS` mit Fundstelle und benötigtem Format, dazu die Quellen der veröffentlichten Angaben.
Im Produktions-Build (ohne `NEXT_PUBLIC_SHOW_GAPS`) nur Bezeichnung und Fundstelle je Lücke;
„Benötigt“ und die Quellen sind Arbeitsanweisungen und erscheinen nur in der Vorschau. `need`-Texte
trotzdem neutral schreiben (Yannick in der dritten Person, keine internen Zweifel).
