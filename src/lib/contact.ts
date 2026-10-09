/**
 * Kontaktformular – gemeinsame Regeln für Browser (src/components/contact-form.tsx) und Server
 * (src/app/api/kontakt/route.ts, src/lib/contact-server.ts). Keine Node-APIs in dieser Datei.
 *
 * Ablauf (Doku: docs/kontaktformular.md)
 *   GET  /api/kontakt → { available, token? }  Versand konfiguriert? + signierter Zeitstempel
 *   POST /api/kontakt → { ok } | { ok:false, error, fields?, retryAfter? }
 * Fehlercodes sind stabil; die Texte dazu stehen in den Dictionaries (contactErr*).
 */

export const CONTACT_ENDPOINT = '/api/kontakt';

/** Höchstlängen in sichtbaren Zeichen (Graphemen, wie der Zähler der Astryx-TextArea). */
export const CONTACT_LIMITS = { name: 100, email: 200, subject: 150, message: 5000 } as const;

/** Mindest-Ausfüllzeit: Zeit zwischen Token-Ausgabe (Formular geladen) und Absenden. */
export const CONTACT_MIN_FILL_MS = 3000;

/** Token-Gültigkeit (Formular lange offen → neues Token holen). */
export const CONTACT_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Größte akzeptierte Anfrage (JSON) in Bytes. */
export const CONTACT_MAX_BODY_BYTES = 32 * 1024;

export type ContactField = 'name' | 'email' | 'subject' | 'message' | 'consent';
export type ContactFieldError = 'required' | 'email' | 'tooLong' | 'consent';

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  consent: boolean;
}

/** Was der Browser sendet. `hp` = Honeypot (muss leer sein), `token` aus GET. */
export interface ContactPayload extends ContactInput {
  hp: string;
  token: string;
  lang: 'de' | 'en';
}

export type ContactErrorCode =
  | 'invalid'
  | 'unavailable'
  | 'rate_limited'
  | 'too_fast'
  | 'expired'
  | 'rejected'
  | 'send_failed'
  | 'bad_request';

export type ContactResponse =
  | { ok: true }
  | {
      ok: false;
      error: ContactErrorCode;
      fields?: Partial<Record<ContactField, ContactFieldError>>;
      /** Sekunden bis zum nächsten Versuch (rate_limited). */
      retryAfter?: number;
    };

export interface ContactStatus {
  available: boolean;
  /** Formular in diesem Build freigeschaltet (NEXT_PUBLIC_CONTACT_FORM=1) – Diagnose nach dem Deploy. */
  form?: boolean;
  token?: string;
}

let segmenter: Intl.Segmenter | null | undefined;

/** Sichtbare Zeichen zählen (ein Emoji = 1), wie der Zähler der TextArea. */
export function countChars(value: string): number {
  if (segmenter === undefined) {
    segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  }
  if (!segmenter) {
    return [...value].length;
  }
  return Array.from(segmenter.segment(value)).length;
}

/**
 * Pragmatische Adressprüfung: genau ein @, Punkt in der Domain, keine Leer-, Steuer- oder
 * Trennzeichen, die in Kopfzeilen Ärger machen (Reply-To).
 */
export function isEmail(value: string): boolean {
  return /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:".]+(\.[^\s@<>()[\]\\,;:".]+)+$/.test(value.trim());
}

/** Prüft die Eingaben; leeres Objekt = gültig. Gleiche Regeln im Browser und auf dem Server. */
export function validateContact(input: ContactInput): Partial<Record<ContactField, ContactFieldError>> {
  const errors: Partial<Record<ContactField, ContactFieldError>> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();
  if (!name) {
    errors.name = 'required';
  } else if (countChars(name) > CONTACT_LIMITS.name) {
    errors.name = 'tooLong';
  }
  if (!email) {
    errors.email = 'required';
  } else if (countChars(email) > CONTACT_LIMITS.email || !isEmail(email)) {
    errors.email = 'email';
  }
  if (countChars(subject) > CONTACT_LIMITS.subject) {
    errors.subject = 'tooLong';
  }
  if (!message) {
    errors.message = 'required';
  } else if (countChars(message) > CONTACT_LIMITS.message) {
    errors.message = 'tooLong';
  }
  if (input.consent !== true) {
    errors.consent = 'consent';
  }
  return errors;
}
