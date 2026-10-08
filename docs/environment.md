# Umgebungsvariablen

Vorlage: `.env.example` (ohne Werte). Echte Werte gehören in die Deploy-Umgebung (Coolify) oder
lokal in `.env.local` – nie ins Repository.

| Variable | Wo wirkt sie | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `GHOST_URL` | Build + Laufzeit (ISR) | für Blog | Basis-URL des Ghost-CMS. Ohne Wert bleiben Blog-Listen leer (Build läuft trotzdem). |
| `GHOST_CONTENT_KEY` | Build + Laufzeit | für Blog | Content-API-Key (nur lesend). |
| `REVALIDATE_SECRET` | Laufzeit | für Webhook | Geheimnis für `/api/revalidate` (Ghost-Webhook `site.changed`). |
| `NEXT_PUBLIC_SHOW_GAPS` | **Build** | nein | `1` = Vorschau-Build: offene Angaben aus `src/content/profile.ts` erscheinen als gestrichelte „OFFEN: …“-Platzhalter, dazu Vorschau-Hinweiszeile, `/content-status` im Footer, Formular-Zustandsvorschau und Demo-Artikel. Leer = Produktion: offene Angaben fehlen vollständig. Wird beim Build in den Code eingesetzt – Umschalten erfordert einen neuen Build. |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Build | nein | Cloudflare Web Analytics; ohne Wert kein Skript. |

Hinweise

- `NEXT_PUBLIC_*` landet im Browser-Bundle – dort nie Geheimnisse ablegen.
- Lokale Prüfung beider Varianten: zwei Builds (mit und ohne `NEXT_PUBLIC_SHOW_GAPS=1`), Screenshot-Gate je Build (AGENTS.md).
- Kontaktformular-Versand (Resend) folgt mit eigenen Variablen; sie werden hier ergänzt, sobald die Anbindung steht.
