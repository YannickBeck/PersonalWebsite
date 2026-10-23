# Kontaktformular

Stand: Redesign B2, ergänzt in Fix-Runde 1 und 2 (2026-10). Das Formular steht auf `/kontakt`,
`/en/kontakt` und im Abschnitt „Kontakt“ der Startseite. Es versendet echte E-Mails über die
REST-API von [Resend](https://resend.com/docs/api-reference/emails/send-email), per `fetch` und
ohne zusätzliche Abhängigkeit.

## Sichtbar erst mit Build-Variable (Fix-Runde 1, DES6)

Das Formular erscheint nur in einem Build mit `NEXT_PUBLIC_CONTACT_FORM=1`
(`src/lib/contact-flag.ts`, Dockerfile-`ARG`). Ohne die Variable zeigen Startseite und
`/kontakt` statt eines ausgegrauten Formulars einen kompakten, ehrlichen Zustand: die
LinkedIn-Karte als Hauptweg („Auf LinkedIn schreiben“) neben „Wer dir antwortet“, der Satz „Das
Kontaktformular folgt noch“ steht einmal in der Lede. Entschieden wird beim Build, weil die Seiten
statisch sind – so springt nach dem Laden nichts um.

Seit Fix-Runde 3 lädt der Formular-Code ohne Flag gar nicht: `ContactBlock` bindet das Formular
über `src/components/contact-form-lazy.tsx` ein (`next/dynamic` in einer Client-Komponente – lädt
den Chunk nur, wenn das Formular gerendert wird). Ein statischer Import, aber auch `next/dynamic`
direkt in der Server-Komponente, zog den Chunk in jedes Seiten-Bundle (Next-Doku
lazy-loading.md: Server-Komponenten splitten Client-Komponenten nicht ab; gemessen). Gemessen
(Produktions-Build, Skripte der vorgerenderten Seite): `/` und `/en` 1.029.325 → 991.399 B roh
(−37,9 KB; gzip −14,6 KB), `/kontakt` −38,5 KB roh (gzip −14,2 KB). Mit Flag wird das Formular
weiter serverseitig gerendert; der Chunk lädt beim Hydrieren nach.

Die Variable ist kein Geheimnis (sie landet im Browser-Bundle). Den Versand selbst steuern
weiterhin die Laufzeit-Variablen `CONTACT_*`; fehlen sie trotz Flag, greift der Hinweis
„Versand gerade nicht verfügbar“ (unten).

Seit Fix-Runde 2 (JURY1-1) hängt alles Weitere am selben Schalter:

| | ohne Flag | mit `NEXT_PUBLIC_CONTACT_FORM=1` |
| --- | --- | --- |
| Startseite, `/kontakt` | LinkedIn-Karte + „Wer dir antwortet“, Lede „… Das Kontaktformular folgt noch.“ | Formular + LinkedIn + „Wer dir antwortet“ |
| `/impressum` (Kontakt) | „Du erreichst mich auf LinkedIn.“ | „… über das Kontaktformular oder auf LinkedIn.“ + Link `/kontakt` |
| `/datenschutz` | Abschnitt „Kontakt“ (`#kontakt`): kein Formular, nur LinkedIn | Abschnitt „Kontaktformular“ (`#kontaktformular`): Übertragung, Resend, Spam-Schutz, Einwilligung – mit OFFEN-Punkten |
| `/api/kontakt` | `GET` → `{"available":false,"form":false}`, `POST` → `503 unavailable` – auch wenn `CONTACT_*` gesetzt sind | wie unten beschrieben |
| llms.txt, Markdown | nennen kein Formular | nennen das Formular |

Damit verarbeitet die Website ohne Flag keine Nachrichten, über die die Datenschutzerklärung
nichts sagt. Die Rechtstexte kommen aus `src/content/legal.ts` (HTML und Markdown).

## Bausteine

| Datei | Aufgabe |
| --- | --- |
| `src/lib/contact.ts` | Gemeinsame Regeln für Browser und Server: Feldgrenzen, Validierung, Fehlercodes, Typen |
| `src/lib/contact-server.ts` | Nur Server: Konfiguration, Token (Mindest-Ausfüllzeit), Rate-Limit, Versand, Logging ohne Inhalte |
| `src/app/api/kontakt/route.ts` | Route Handler `GET`/`POST /api/kontakt` (dynamisch, `Cache-Control: no-store`) |
| `src/components/contact-form.tsx` | Formular (Client): Statusabfrage, Validierung, Zustände, Honeypot, Einwilligung |

## Ablauf

1. Beim Laden ruft das Formular `GET /api/kontakt` auf.
   - Versand konfiguriert: `{ "available": true, "form": true, "token": "<ms>.<nonce>.<hmac>" }`. Das Token
     ist der signierte Ausgabezeitpunkt plus eine Zufalls-Nonce (Fix-Runde 1, FUN3: vorher
     waren in derselben Millisekunde ausgegebene Tokens identisch). Der Schlüssel wird aus dem
     API-Key abgeleitet, eine eigene Variable ist dafür nicht nötig.
   - Nicht konfiguriert (nur noch, wenn `NEXT_PUBLIC_CONTACT_FORM=1` gebaut wurde, die
     Laufzeit-Variablen aber fehlen): `{ "available": false, "form": true }`. Über dem Formular erscheint der
     Hinweis „Versand gerade nicht verfügbar“ mit dem LinkedIn-Weg. Das Formular ist dann
     `inert` (gedämpft, nicht bedienbar). Der Hinweis liegt absolut darüber, damit nichts
     verrutscht (CLS 0, gemessen). Er ist keine Live-Region (A117): Screenreader lesen ihn,
     wenn man hinkommt, statt ihn beim Laden ungefragt anzusagen.
2. Absenden: Der Browser prüft die Felder (gleiche Regeln wie der Server) und schickt JSON an
   `POST /api/kontakt`.
3. Der Server prüft der Reihe nach:
   1. Formular im Build freigeschaltet und Konfiguration vorhanden, sonst `503 unavailable`
   2. `Content-Type: application/json` und kein `Sec-Fetch-Site: cross-site`, sonst `400 bad_request`
   3. Rate-Limit je IP: höchstens 5 Anfragen in 10 Minuten, sonst `429 rate_limited` mit `Retry-After`
   4. Größe höchstens 32 KB (`413`), gültiges JSON (`400 bad_request`)
   5. Honeypot leer, sonst `400 rejected` (ehrliche Ablehnung, kein Schein-Erfolg)
   6. Token: gültige Signatur, mindestens 3 s alt (`too_fast`), höchstens 24 h alt (`expired`),
      nach einem erfolgreichen Versand nicht noch einmal nutzbar (`rejected`). Vor dem Versand
      wird das Token synchron reserviert: Gleichzeitige Anfragen mit demselben Token ergeben
      genau eine Mail, die übrigen `rejected` (FUN3). Ein Anbieterfehler gibt es wieder frei.
   7. Felder: Name 1–100, E-Mail gültig und höchstens 200, Anliegen höchstens 150,
      Nachricht 1–5000 Zeichen, Einwilligung `true`. Sonst `400 invalid` mit `fields`
   8. Globale Obergrenze: höchstens 20 versendete Nachrichten pro Stunde, sonst `429`
   9. Versand an Resend (`POST {CONTACT_RESEND_BASE_URL}/emails`, Timeout 10 s). Klartext-Mail,
      `reply_to` = Absenderadresse. Fehler oder Timeout ergeben `502 send_failed`; das Token
      bleibt dann für einen neuen Versuch gültig.
4. Erfolg `200 { ok: true }`: Die Felder werden geleert und das Formular holt ein neues Token.

Die Meldungen stehen in den Dictionaries (`contactErr*`, `contactOk*`, `contactUnavailable*`).
Während des Sendens bleibt der Button fokussierbar (Astryx `isInterruptible`: Spinner und
`aria-busy`, aber nicht `disabled` – sonst fiel der Fokus auf `<body>`, A122). Danach geht der
Fokus zurück auf den Button; die Meldung ist ein Astryx-Banner, der erst dann eingehängt wird
und selbst die Live-Rolle trägt (Erfolg `role="status"`, Fehler `role="alert"`, keine zweite
Region drumherum – A123) und in Sicht gescrollt wird. OFFEN: mit echtem Screenreader
(NVDA/VoiceOver) nicht geprüft.

## Datenschutz im Code

- Es werden keine Nachrichteninhalte, Namen, E-Mail-Adressen oder IP-Adressen geloggt. Logzeilen
  sehen so aus: `[kontakt] sent status=200`, `[kontakt] honeypot`, `[kontakt] rate_limited`.
- IP-Adressen liegen nur als gesalzener Hash im Arbeitsspeicher. Das Salz ist zufällig je
  Prozess. Abgelaufene Einträge werden spätestens nach rund 11 Minuten verworfen.
- Nichts wird gespeichert, es gibt keine Datenbank. Die Nachricht existiert danach nur als
  E-Mail (Postfach, Versanddienst).
- Text der Datenschutzerklärung: Abschnitt „Kontaktformular“ auf `/datenschutz` (nur mit Flag,
  siehe oben). Er ist ein Entwurf; fehlende rechtliche Angaben stehen dort als „OFFEN“ (auch in
  Produktion, keine Rechtsberatung).

## Grenzen

- Rate-Limit und Token-Sperre gelten je Node-Prozess (Standalone-Container). Bei mehreren
  Instanzen zählt jede für sich.
- Die Client-IP stammt aus `CF-Connecting-IP`, sonst aus dem ersten Eintrag von
  `X-Forwarded-For`, sonst aus `X-Real-IP`. Diese Kopfzeilen sind nur hinter einem Proxy
  vertrauenswürdig, der sie setzt (Cloudflare → Coolify/Traefik). Das Rate-Limit ist deshalb
  eine Bremse und kein Schutzwall. Die globale Obergrenze fängt den Rest ab.
- Ohne JavaScript sendet das Formular nichts (`<form method="dialog">`). Seit dem Rest-Feinschliff
  (REG1) fehlt es dann ganz (`yb-js-only`); an seiner Stelle steht eine `<noscript>`-Karte
  „Formular nur mit JavaScript“ mit dem LinkedIn-Weg. Vorher ließen sich die Felder ausfüllen,
  „Nachricht senden“ tat nichts (der Hinweis stand seit Fix-Runde 1 vor den Feldern, FUN4).

## Einrichten (Produktion) – vor der Freigabe, macht Yannick

Stand Fix-Runde 2: nichts davon ist erledigt (OFFEN, Lücke `contact-delivery`). Ein Agent kann
das nicht übernehmen: Konto, Domain-Bestätigung und API-Key sind Yannicks Zugangsdaten.

1. Resend-Konto anlegen und die Absender-Domain bestätigen (DNS-Einträge bei Resend,
   https://resend.com/docs/dashboard/domains/introduction).
2. In Coolify als **Laufzeit**-Variablen setzen (siehe `docs/environment.md`):
   `CONTACT_RESEND_API_KEY` (geheim), `CONTACT_FROM` (Adresse auf der bestätigten Domain),
   `CONTACT_TO`. Für den API-Key in Coolify die Build-Verfügbarkeit ausschalten – er wird nur
   zur Laufzeit gelesen und soll nicht in Build-Argumenten bzw. Image-Metadaten landen
   (Coolify-Doku: „Traditional Docker build arguments can appear in image metadata“,
   https://coolify.io/docs/knowledge-base/environment-variables).
3. Die **Build**-Variable `NEXT_PUBLIC_CONTACT_FORM=1` setzen und neu bauen. Laut Coolify-Doku
   (Dockerfile-Build-Pack, Abschnitt „Build arguments“:
   https://coolify.io/docs/applications/build-packs/dockerfile) kann Coolify Build-Variablen
   als Docker-Build-Argumente übergeben; das Dockerfile nimmt sie per
   `ARG NEXT_PUBLIC_CONTACT_FORM` an und setzt sie für `pnpm build`. Steht die Einstellung
   „Build arguments“ unter Advanced → Build auf „Managed manually in Dockerfile“, kommt der Wert
   nicht an. OFFEN: an der echten Coolify-Instanz noch nicht geprüft.
4. Nach dem Deploy prüfen:
   - `curl -s https://yannick-beck.de/api/kontakt` → `"available":true,"form":true`.
     `"form":false` heißt: Das Build-Argument ist nicht angekommen (Schritt 3).
     `"available":false,"form":true` heißt: Laufzeit-Variablen fehlen (Schritt 2).
   - `/kontakt` zeigt das Formular, `/datenschutz#kontaktformular` den Formular-Abschnitt,
     `/impressum` nennt das Kontaktformular.
5. Ende-zu-Ende-Test auf der Zielumgebung: eine Testnachricht über `/kontakt` schicken (nach
   mindestens 3 s), Eingang im Postfach `CONTACT_TO` prüfen, mit „Antworten“ prüfen, dass die
   Antwort an die eingegebene Adresse geht (`reply_to`). Im Container-Log darf nur
   `[kontakt] sent status=200` stehen, kein Inhalt.
6. Danach die OFFEN-Punkte im Datenschutz-Abschnitt (Resend: Anbieter, Auftragsverarbeitung,
   Drittland; Speicherdauer; Rechtsgrundlage) klären und in `src/content/legal.ts` eintragen.

## Lokal testen (ohne echte Keys)

Ein Mock für die Resend-API (`scripts/resend-mock.mjs`, Node, ohne Abhängigkeiten) nimmt
`POST /emails` an und protokolliert die Anfragen. Mit `CONTACT_RESEND_BASE_URL` zeigt der Server
darauf; `scripts/contact-api-test.mjs` prüft die API-Fälle:

```sh
node scripts/resend-mock.mjs 3362     # Modi: POST /__mode {"mode":"ok"|"fail"|"invalid"|"hang"}
CONTACT_RESEND_API_KEY=re_test_fake_0000000000 CONTACT_TO=inbox@example.test \
CONTACT_FROM='Website <kontakt@example.test>' CONTACT_RESEND_BASE_URL=http://127.0.0.1:3362 \
PORT=3302 HOSTNAME=127.0.0.1 node .next/standalone/server.js
# für die UI: vorher mit NEXT_PUBLIC_CONTACT_FORM=1 bauen
node scripts/contact-api-test.mjs http://127.0.0.1:3302 http://127.0.0.1:3362
```

Geprüft wurden in B2: 21 API-Fälle (`contact-api-test.mjs`) (Erfolg mit
Prüfung von `from`/`to`/`reply_to`/Bearer-Key, zu schnell, Token-Wiederholung, Honeypot,
ungültige Felder, CR/LF im Namen, Resend 500/422, Wiederholung nach Fehler, Cross-Site,
falsches Format, kaputtes JSON, zu groß, Rate-Limit mit `Retry-After`, Vorrang von
`CF-Connecting-IP`), Timeout des Anbieters (10 s → 502), ohne Konfiguration (503 bzw.
`available:false`). Dazu UI-Tests mit Playwright (Arbeitsordner, nicht im Repo): Erfolg, Fehler, Fokus, Hinweis ohne
Konfiguration, CLS. Im Server-Log stand dabei keiner der Testinhalte. Fix-Runde 1: zusätzlich
„6 parallele GET → 6 verschiedene Tokens“ und „3 parallele POST mit demselben Token → genau
1× 200, 1 Mail“.
