# Kontaktformular

Stand: Redesign B2 (2026-10). Das Formular steht auf `/kontakt`, `/en/kontakt` und im Abschnitt
„Kontakt“ der Startseite. Es versendet echte E-Mails über die REST-API von
[Resend](https://resend.com/docs/api-reference/emails/send-email), per `fetch` und ohne
zusätzliche Abhängigkeit.

## Bausteine

| Datei | Aufgabe |
| --- | --- |
| `src/lib/contact.ts` | Gemeinsame Regeln für Browser und Server: Feldgrenzen, Validierung, Fehlercodes, Typen |
| `src/lib/contact-server.ts` | Nur Server: Konfiguration, Token (Mindest-Ausfüllzeit), Rate-Limit, Versand, Logging ohne Inhalte |
| `src/app/api/kontakt/route.ts` | Route Handler `GET`/`POST /api/kontakt` (dynamisch, `Cache-Control: no-store`) |
| `src/components/contact-form.tsx` | Formular (Client): Statusabfrage, Validierung, Zustände, Honeypot, Einwilligung |

## Ablauf

1. Beim Laden ruft das Formular `GET /api/kontakt` auf.
   - Versand konfiguriert: `{ "available": true, "token": "<ms>.<hmac>" }`. Das Token ist der
     signierte Ausgabezeitpunkt. Der Schlüssel wird aus dem API-Key abgeleitet, eine eigene
     Variable ist dafür nicht nötig.
   - Nicht konfiguriert: `{ "available": false }`. Über dem Formular erscheint der Hinweis
     „Versand gerade nicht verfügbar“ mit dem LinkedIn-Weg. Das Formular ist dann `inert`
     (gedämpft, nicht bedienbar). Der Hinweis liegt absolut darüber, damit nichts verrutscht
     (CLS 0, gemessen).
2. Absenden: Der Browser prüft die Felder (gleiche Regeln wie der Server) und schickt JSON an
   `POST /api/kontakt`.
3. Der Server prüft der Reihe nach:
   1. Konfiguration vorhanden, sonst `503 unavailable`
   2. `Content-Type: application/json` und kein `Sec-Fetch-Site: cross-site`, sonst `400 bad_request`
   3. Rate-Limit je IP: höchstens 5 Anfragen in 10 Minuten, sonst `429 rate_limited` mit `Retry-After`
   4. Größe höchstens 32 KB (`413`), gültiges JSON (`400 bad_request`)
   5. Honeypot leer, sonst `400 rejected` (ehrliche Ablehnung, kein Schein-Erfolg)
   6. Token: gültige Signatur, mindestens 3 s alt (`too_fast`), höchstens 24 h alt (`expired`),
      nach einem erfolgreichen Versand nicht noch einmal nutzbar (`rejected`)
   7. Felder: Name 1–100, E-Mail gültig und höchstens 200, Anliegen höchstens 150,
      Nachricht 1–5000 Zeichen, Einwilligung `true`. Sonst `400 invalid` mit `fields`
   8. Globale Obergrenze: höchstens 20 versendete Nachrichten pro Stunde, sonst `429`
   9. Versand an Resend (`POST {CONTACT_RESEND_BASE_URL}/emails`, Timeout 10 s). Klartext-Mail,
      `reply_to` = Absenderadresse. Fehler oder Timeout ergeben `502 send_failed`; das Token
      bleibt dann für einen neuen Versuch gültig.
4. Erfolg `200 { ok: true }`: Die Felder werden geleert und das Formular holt ein neues Token.

Die Meldungen stehen in den Dictionaries (`contactErr*`, `contactOk*`, `contactUnavailable*`).
Der Fokus geht nach dem Absenden zurück auf den Button, die Meldung erscheint in einer
dauerhaft eingehängten Live-Region und wird in Sicht gescrollt.

## Datenschutz im Code

- Es werden keine Nachrichteninhalte, Namen, E-Mail-Adressen oder IP-Adressen geloggt. Logzeilen
  sehen so aus: `[kontakt] sent status=200`, `[kontakt] honeypot`, `[kontakt] rate_limited`.
- IP-Adressen liegen nur als gesalzener Hash im Arbeitsspeicher. Das Salz ist zufällig je
  Prozess. Abgelaufene Einträge werden spätestens nach rund 11 Minuten verworfen.
- Nichts wird gespeichert, es gibt keine Datenbank. Die Nachricht existiert danach nur als
  E-Mail (Postfach, Versanddienst).
- Text der Datenschutzerklärung: Abschnitt „Kontaktformular“ auf `/datenschutz`. Er ist ein
  Entwurf, die rechtlichen Angaben in eckigen Klammern sind OFFEN (keine Rechtsberatung).

## Grenzen

- Rate-Limit und Token-Sperre gelten je Node-Prozess (Standalone-Container). Bei mehreren
  Instanzen zählt jede für sich.
- Die Client-IP stammt aus `CF-Connecting-IP`, sonst aus dem ersten Eintrag von
  `X-Forwarded-For`, sonst aus `X-Real-IP`. Diese Kopfzeilen sind nur hinter einem Proxy
  vertrauenswürdig, der sie setzt (Cloudflare → Coolify/Traefik). Das Rate-Limit ist deshalb
  eine Bremse und kein Schutzwall. Die globale Obergrenze fängt den Rest ab.
- Ohne JavaScript sendet das Formular nichts (`<form method="dialog">`). Ein `<noscript>`-Hinweis
  sagt das.

## Einrichten (Produktion)

1. Resend-Konto anlegen und die Absender-Domain bestätigen (DNS-Einträge bei Resend).
   OFFEN: Konto und Domain existieren noch nicht bzw. sind nicht bestätigt.
2. In Coolify als Laufzeit-Variablen setzen (keine Build-Variablen nötig, siehe
   `docs/environment.md`): `CONTACT_RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`.
3. Neu starten und `curl -s https://yannick-beck.de/api/kontakt` prüfen: Die Antwort muss
   `"available":true` enthalten.
4. Eine Testnachricht über `/kontakt` schicken und den Eingang prüfen.

## Lokal testen (ohne echte Keys)

Ein Mock für die Resend-API (`scripts/resend-mock.mjs`, Node, ohne Abhängigkeiten) nimmt
`POST /emails` an und protokolliert die Anfragen. Mit `CONTACT_RESEND_BASE_URL` zeigt der Server
darauf; `scripts/contact-api-test.mjs` prüft die API-Fälle:

```sh
node scripts/resend-mock.mjs 3362     # Modi: POST /__mode {"mode":"ok"|"fail"|"invalid"|"hang"}
CONTACT_RESEND_API_KEY=re_test_fake CONTACT_TO=inbox@example.test \
CONTACT_FROM='Website <kontakt@example.test>' CONTACT_RESEND_BASE_URL=http://127.0.0.1:3362 \
PORT=3302 HOSTNAME=127.0.0.1 node .next/standalone/server.js
node scripts/contact-api-test.mjs http://127.0.0.1:3302 http://127.0.0.1:3362
```

Geprüft wurden in B2: 21 API-Fälle (`contact-api-test.mjs`) (Erfolg mit
Prüfung von `from`/`to`/`reply_to`/Bearer-Key, zu schnell, Token-Wiederholung, Honeypot,
ungültige Felder, CR/LF im Namen, Resend 500/422, Wiederholung nach Fehler, Cross-Site,
falsches Format, kaputtes JSON, zu groß, Rate-Limit mit `Retry-After`, Vorrang von
`CF-Connecting-IP`), Timeout des Anbieters (10 s → 502), ohne Konfiguration (503 bzw.
`available:false`). Dazu UI-Tests mit Playwright (Arbeitsordner, nicht im Repo): Erfolg, Fehler, Fokus, Hinweis ohne
Konfiguration, CLS. Im Server-Log stand dabei keiner der Testinhalte.
