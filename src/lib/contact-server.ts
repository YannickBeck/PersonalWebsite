import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { CONTACT_MIN_FILL_MS, CONTACT_TOKEN_MAX_AGE_MS, type ContactPayload } from '@/lib/contact';

/**
 * Kontaktformular, Serverseite: Konfiguration, Token (Mindest-Ausfüllzeit), Rate-Limit und
 * Versand über die Resend-REST-API per fetch (keine zusätzliche Abhängigkeit).
 * Doku: docs/kontaktformular.md, Variablen: docs/environment.md.
 *
 * Datenschutz im Code: Nachrichteninhalte, Namen, Adressen und IPs werden NIE geloggt; Logs
 * enthalten nur Ereigniscodes und HTTP-Status. IPs liegen nur als gesalzener Hash im
 * Arbeitsspeicher (Rate-Limit-Fenster), nichts wird gespeichert.
 */

export interface ContactConfig {
  apiKey: string;
  to: string[];
  from: string;
  baseUrl: string;
}

/** Versand-Konfiguration aus der Laufzeit-Umgebung; null = nicht konfiguriert. */
export function contactConfig(): ContactConfig | null {
  const apiKey = process.env.CONTACT_RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM?.trim();
  const to = (process.env.CONTACT_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || !from || to.length === 0) {
    return null;
  }
  const baseUrl = (process.env.CONTACT_RESEND_BASE_URL?.trim() || 'https://api.resend.com').replace(/\/+$/, '');
  return { apiKey, from, to, baseUrl };
}

/* ---------- Token: signierter Ausgabezeitpunkt (Mindest-Ausfüllzeit, Ablauf) ---------- */

function tokenKey(cfg: ContactConfig): Buffer {
  // Vom API-Key abgeleitet: stabil über Neustarts und mehrere Instanzen, ohne eigene Variable.
  return createHmac('sha256', cfg.apiKey).update('yb-contact-token-v1').digest();
}

function sign(cfg: ContactConfig, issued: string): string {
  return createHmac('sha256', tokenKey(cfg)).update(issued).digest('base64url');
}

export function issueToken(cfg: ContactConfig, now = Date.now()): string {
  const issued = String(now);
  return `${issued}.${sign(cfg, issued)}`;
}

export type TokenCheck = 'ok' | 'invalid' | 'too_fast' | 'expired' | 'used';

/** Bereits erfolgreich genutzte Tokens (Wiederholung desselben Formular-Tokens abweisen). */
const usedTokens = new Map<string, number>();

export function checkToken(cfg: ContactConfig, token: string, now = Date.now()): TokenCheck {
  const [issued, sig] = token.split('.');
  if (!issued || !sig || !/^\d{10,16}$/.test(issued)) {
    return 'invalid';
  }
  const expected = Buffer.from(sign(cfg, issued));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return 'invalid';
  }
  const age = now - Number(issued);
  if (age < CONTACT_MIN_FILL_MS) {
    return 'too_fast';
  }
  if (age > CONTACT_TOKEN_MAX_AGE_MS) {
    return 'expired';
  }
  if (usedTokens.has(sig)) {
    return 'used';
  }
  return 'ok';
}

export function markTokenUsed(token: string, now = Date.now()): void {
  const sig = token.split('.')[1];
  if (!sig) {
    return;
  }
  usedTokens.set(sig, now);
  // aufräumen: abgelaufene Tokens wären ohnehin ungültig
  for (const [k, t] of usedTokens) {
    if (now - t > CONTACT_TOKEN_MAX_AGE_MS) {
      usedTokens.delete(k);
    }
  }
}

/* ---------- Rate-Limit (je Prozess, im Arbeitsspeicher) ---------- */

/** Anfragen je IP: höchstens IP_MAX POSTs in IP_WINDOW_MS. */
export const IP_WINDOW_MS = 10 * 60 * 1000;
export const IP_MAX = 5;
/** Versendete Nachrichten insgesamt: höchstens GLOBAL_MAX in GLOBAL_WINDOW_MS. */
export const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
export const GLOBAL_MAX = 20;
/** Obergrenze der gemerkten IP-Hashes (Speicherschutz bei vielen Absendern). */
const MAX_TRACKED = 5000;

const salt = randomBytes(16);
const ipHits = new Map<string, number[]>();
let sendHits: number[] = [];
let lastSweep = 0;

/** Abgelaufene IP-Einträge verwerfen (höchstens einmal pro Minute): Hashes leben ≤ ~11 Minuten. */
function sweep(now: number): void {
  if (now - lastSweep < 60_000) {
    return;
  }
  lastSweep = now;
  for (const [k, list] of ipHits) {
    if (list.every((t) => now - t >= IP_WINDOW_MS)) {
      ipHits.delete(k);
    }
  }
}

function ipKey(ip: string): string {
  return createHash('sha256').update(salt).update(ip).digest('base64url').slice(0, 22);
}

/**
 * Client-IP: CF-Connecting-IP (Cloudflare), sonst der erste Eintrag aus X-Forwarded-For,
 * sonst X-Real-IP. Die Kopfzeilen sind nur hinter einem Proxy vertrauenswürdig, der sie setzt
 * (Cloudflare → Coolify/Traefik). Das Rate-Limit ist eine Bremse, kein Schutzwall – dafür gibt
 * es zusätzlich die globale Obergrenze.
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip')?.trim();
  if (cf) {
    return cf;
  }
  const xff = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (xff) {
    return xff;
  }
  return headers.get('x-real-ip')?.trim() || 'unbekannt';
}

/** Zählt eine Anfrage dieser IP; liefert Sekunden bis zum nächsten erlaubten Versuch oder 0. */
export function hitIp(ip: string, now = Date.now()): number {
  sweep(now);
  const key = ipKey(ip);
  const recent = (ipHits.get(key) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (recent.length >= IP_MAX) {
    ipHits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + IP_WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  ipHits.set(key, recent);
  if (ipHits.size > MAX_TRACKED) {
    // zu viele Absender im Fenster: älteste Einträge verwerfen (Map hält die Einfügereihenfolge)
    while (ipHits.size > MAX_TRACKED) {
      const first = ipHits.keys().next().value;
      if (first === undefined) {
        break;
      }
      ipHits.delete(first);
    }
  }
  return 0;
}

/** Globale Obergrenze für tatsächliche Versände; Sekunden bis frei oder 0. */
export function globalWait(now = Date.now()): number {
  sendHits = sendHits.filter((t) => now - t < GLOBAL_WINDOW_MS);
  if (sendHits.length >= GLOBAL_MAX) {
    return Math.max(1, Math.ceil((sendHits[0] + GLOBAL_WINDOW_MS - now) / 1000));
  }
  return 0;
}

export function countSend(now = Date.now()): void {
  sendHits.push(now);
}

/* ---------- Versand ---------- */

/** Steuerzeichen (auch CR/LF) aus einzeiligen Feldern entfernen, Leerraum zusammenziehen. */
export function oneLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Mehrzeiliger Text: Zeilenumbrüche normalisieren, übrige Steuerzeichen entfernen. */
function multiLine(value: string): string {
  return (
    value
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, '')
      .trim()
  );
}

export interface SendResult {
  ok: boolean;
  /** HTTP-Status von Resend (0 = Netzwerkfehler/Zeitüberschreitung). */
  status: number;
}

/**
 * Nachricht als Klartext-Mail über Resend (POST {base}/emails, Bearer-Key, snake_case-Felder
 * laut https://resend.com/docs/api-reference/emails/send-email). Antworten gehen per reply_to
 * direkt an die absendende Person.
 */
export async function sendContactMail(cfg: ContactConfig, p: ContactPayload): Promise<SendResult> {
  const name = oneLine(p.name);
  const email = oneLine(p.email);
  const subjectLine = oneLine(p.subject);
  const subject = `Kontaktformular: ${subjectLine || 'Neue Nachricht'} – ${name}`.slice(0, 200);
  const text = [
    'Neue Nachricht über das Kontaktformular auf yannick-beck.de',
    '',
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Anliegen: ${subjectLine || '–'}`,
    `Seite: ${p.lang === 'en' ? 'englisch (/en)' : 'deutsch'}`,
    'Einwilligung: erteilt',
    '',
    'Nachricht:',
    multiLine(p.message),
    '',
    '—',
    'Antworten gehen direkt an die Absenderadresse (Reply-To).',
  ].join('\n');

  try {
    const res = await fetch(`${cfg.baseUrl}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: cfg.from, to: cfg.to, subject, text, reply_to: email }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    // Antwortkörper nicht auswerten/loggen (kann Adressen enthalten); nur den Status
    await res.body?.cancel().catch(() => {});
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** Ereignis ohne personenbezogene Daten protokollieren (Code + optional Status). */
export function logEvent(code: string, status?: number): void {
  console.warn(`[kontakt] ${code}${status !== undefined ? ` status=${status}` : ''}`);
}
