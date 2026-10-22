# Umgebungsvariablen

Vorlage: `.env.example` (ohne Werte). Echte Werte gehören in die Deploy-Umgebung (Coolify) oder
lokal in `.env.local` – nie ins Repository.

| Variable | Wo wirkt sie | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `GHOST_URL` | Build + Laufzeit (ISR) | für Blog | Basis-URL des Ghost-CMS. Ohne Wert bleiben Blog-Listen leer (Build läuft trotzdem). |
| `GHOST_CONTENT_KEY` | Build + Laufzeit | für Blog | Content-API-Key (nur lesend). |
| `REVALIDATE_SECRET` | Laufzeit | für Webhook | Geheimnis für `/api/revalidate` (Ghost-Webhook `site.changed`). |
| `NEXT_PUBLIC_SHOW_GAPS` | **Build** | nein | `1` = Vorschau-Build: offene Angaben aus `src/content/profile.ts` erscheinen als gestrichelte „OFFEN: …“-Platzhalter, dazu Vorschau-Hinweiszeile, `/content-status` im Footer (mit „Benötigt“ und den Quellen), Formular-Zustandsvorschau und Demo-Artikel. Leer = Produktion: offene Angaben fehlen vollständig; `/content-status` bleibt erreichbar, zeigt aber nur Bezeichnung und Fundstelle je Lücke. Wird beim Build in den Code eingesetzt – Umschalten erfordert einen neuen Build. |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Build | nein | Cloudflare Web Analytics; ohne Wert kein Skript. |
| `NEXT_PUBLIC_CONTACT_FORM` | **Build** | für das Formular | `1` = Kontaktformular auf Startseite und `/kontakt` anzeigen (Fix-Runde 1); Impressum, Datenschutz (Abschnitt „Kontaktformular“), llms.txt und Markdown nennen es dann, und `/api/kontakt` nimmt Nachrichten an (Fix-Runde 2). Leer = kompakter Zustand mit LinkedIn und „Das Kontaktformular folgt noch“ (der Formular-Code lädt dann nicht, Fix-Runde 3), Rechtstexte ohne Formular, API antwortet `available:false`. Erst setzen, wenn die `CONTACT_*`-Variablen zur Laufzeit gesetzt sind; Umschalten erfordert einen neuen Build (Dockerfile reicht sie per `ARG` weiter; Prüfung nach dem Deploy: `GET /api/kontakt` → `"form":true`). Kein Geheimnis. |
| `CONTACT_RESEND_API_KEY` | Laufzeit | für Formularversand | Resend-API-Key (`re_…`), nur serverseitig. Leitet zusätzlich den Schlüssel für die Formular-Tokens ab. Ohne Wert zeigt das Formular „Versand gerade nicht verfügbar“ mit LinkedIn-Weg. |
| `CONTACT_FROM` | Laufzeit | für Formularversand | Absender, z. B. `Website <kontakt@DOMAIN>` – die Domain muss bei Resend bestätigt sein. |
| `CONTACT_TO` | Laufzeit | für Formularversand | Empfängeradresse(n), mehrere mit Komma getrennt. Erscheint nirgends auf der Website. |
| `CONTACT_RESEND_BASE_URL` | Laufzeit | nein | Nur für Tests: Basis-URL eines lokalen Resend-Mocks (Standard `https://api.resend.com`). |

Hinweise

- `NEXT_PUBLIC_*` landet im Browser-Bundle – dort nie Geheimnisse ablegen.
- Lokale Prüfung beider Varianten: zwei Builds (mit und ohne `NEXT_PUBLIC_SHOW_GAPS=1`), Screenshot-Gate je Build (AGENTS.md).
- Kontaktformular: Versand nur, wenn `CONTACT_RESEND_API_KEY`, `CONTACT_FROM` und `CONTACT_TO` gesetzt sind. Die Werte werden zur Laufzeit gelesen (`/api/kontakt` ist dynamisch). Sichtbar wird das Formular erst in einem Build mit `NEXT_PUBLIC_CONTACT_FORM=1`. Ablauf, Spam-Schutz und Tests: `docs/kontaktformular.md`.
- `.env.example` konnte in B2 nicht ergänzt werden (Lese-/Schreibsperre für `.env*` in den Agent-Einstellungen). OFFEN: die vier `CONTACT_*`-Zeilen ohne Werte dort nachtragen:

  ```sh
  # Kontaktformular sichtbar bauen (1), sobald Resend konfiguriert ist – kein Geheimnis
  NEXT_PUBLIC_CONTACT_FORM=
  # Kontaktformular (Resend) – nur Laufzeit, nie committen
  CONTACT_RESEND_API_KEY=
  CONTACT_FROM=
  CONTACT_TO=
  # nur für lokale Tests gegen einen Mock
  CONTACT_RESEND_BASE_URL=
  ```
