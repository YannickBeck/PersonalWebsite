# Logos im Periodensystem (Startseite 02)

Das Detailfeld des Periodensystems zeigt ein Logo nur, wenn Lizenz oder Markenrichtlinie die
Verwendung erlauben. Sonst steht dort das Kürzel der Kachel als Monogramm. Die Logos sind
einfarbige SVGs aus Simple Icons und wurden über die Better-Icons-CLI geholt
(`npx -y better-icons search <name> --prefix simple-icons`, `npx -y better-icons get simple-icons:<slug>`).
Sie liegen unter `public/logos/`, jede Datei nennt im Kommentar Urheber, Lizenz und Quelle.
Auf der Seite erscheinen sie als CSS-Maske in Textfarbe (`skills.module.css`, `.elementLogo`).
Den Nachweis (Urheber, Lizenz-Link) zeigt das Detailfeld unter den Belegen an
(`SKILL_LOGOS` in `src/content/profile.ts`).

Stand der Prüfung: 2026-10-08. Metadaten aus `simple-icons@15.22.0/data/simple-icons.json`
(Felder `license`, `guidelines`), dazu die verlinkten Richtlinien.

| Fähigkeit | Simple Icons | Lizenz / Richtlinie | Entscheidung |
|---|---|---|---|
| PHP | `php` | CC BY-SA 4.0, Autor Colin Viebrock (php.net/download-logos.php: „feel free to reuse“) | **Logo**, einfarbig angepasst; Nachweis mit Lizenz-Link im Detailfeld, Datei selbst unter CC BY-SA 4.0 |
| FastAPI | `fastapi` | Datei aus dem FastAPI-Repository, MIT-Lizenz (Copyright Sebastián Ramírez) | **Logo**; Lizenzhinweis in der Datei und im Detailfeld |
| Python | `python` | python.org/community/logos: abgeleitete Fassungen (z. B. umgefärbt) nur nach Rückfrage bei der PSF | Monogramm `Py` |
| MariaDB | `mariadb` | mariadb.com/about-us/logos: nur die bereitgestellten Fassungen, Farbe nicht ändern | Monogramm `Db` |
| Bash | `gnubash` | Free Art License (FSF); Farbänderungen nur nach dem Bash-Styleguide (nicht geprüft) | Monogramm `Sh` |
| Ollama | `ollama` | keine Lizenz- oder Richtlinienangabe | Monogramm `Ol` |
| LlamaIndex, osTicket | nicht in Simple Icons | – | Monogramm |
| Microsoft 365, Intune, Azure, Entra ID, Conditional Access | nicht in Simple Icons | Microsoft-Logos nur mit Lizenz | Monogramm |

## Ein Logo ergänzen

1. Lizenz bzw. Richtlinie der Marke prüfen und hier eintragen. Nur bei klarer Erlaubnis für eine
   einfarbige Fassung weitermachen.
2. SVG holen: `npx -y better-icons get simple-icons:<slug> > public/logos/<slug>.svg`,
   `width`/`height` entfernen, Kommentar mit Urheber, Lizenz und Quelle ergänzen.
3. `SkillLogo` und `SKILL_LOGOS` in `src/content/profile.ts` erweitern, bei der Fähigkeit
   `logo: '<slug>'` setzen.

OFFEN: Python (Rückfrage bei psf-trademarks@python.org) und Bash (Styleguide prüfen), falls dort
Logos gewünscht sind.
