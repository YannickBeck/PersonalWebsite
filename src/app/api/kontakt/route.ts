import { type NextRequest } from 'next/server';
import {
  CONTACT_MAX_BODY_BYTES,
  validateContact,
  type ContactPayload,
  type ContactResponse,
  type ContactStatus,
} from '@/lib/contact';
import {
  checkToken,
  clientIp,
  contactConfig,
  countSend,
  globalWait,
  hitIp,
  issueToken,
  logEvent,
  markTokenUsed,
  releaseToken,
  reserveToken,
  sendContactMail,
} from '@/lib/contact-server';
import { CONTACT_FORM_ENABLED } from '@/lib/contact-flag';

/**
 * Kontaktformular (Route Handler, Doku: node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/route.md). Läuft nur zur Anfragezeit; Konfiguration aus der Umgebung
 * (docs/environment.md), Ablauf und Tests: docs/kontaktformular.md.
 *
 *   GET  → { available, form, token? }   Versand möglich? Formular im Build? + signierter Ausgabezeitpunkt
 *   POST → { ok } | { ok:false, error, fields?, retryAfter? }
 *
 * Nur mit freigeschaltetem Formular (NEXT_PUBLIC_CONTACT_FORM=1, Fix-Runde 2 / JURY1-1): Ohne
 * Flag gibt es weder Formular noch den Datenschutz-Abschnitt dazu – dann nimmt auch die API
 * nichts an (available:false, POST 503), selbst wenn CONTACT_* gesetzt sind. `form` zeigt nach
 * einem Deploy, ob das Build-Argument angekommen ist (docs/kontaktformular.md).
 */
export const dynamic = 'force-dynamic';

/** Versand-Konfiguration – nur, wenn das Formular in diesem Build freigeschaltet ist. */
function activeConfig() {
  return CONTACT_FORM_ENABLED ? contactConfig() : null;
}

const NO_STORE = { 'Cache-Control': 'no-store' };

function reply(body: ContactResponse | ContactStatus, status = 200, extra?: Record<string, string>): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...extra } });
}

export function GET(): Response {
  const cfg = activeConfig();
  if (!cfg) {
    return reply({ available: false, form: CONTACT_FORM_ENABLED });
  }
  return reply({ available: true, form: true, token: issueToken(cfg) });
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function POST(req: NextRequest): Promise<Response> {
  const cfg = activeConfig();
  if (!cfg) {
    logEvent('unavailable');
    return reply({ ok: false, error: 'unavailable' }, 503);
  }

  // Nur JSON aus derselben Herkunft: Fremde Formulare können kein application/json senden,
  // fremde Skripte scheitern am CORS-Preflight; Sec-Fetch-Site fängt den Rest ab.
  const type = req.headers.get('content-type') ?? '';
  const site = req.headers.get('sec-fetch-site');
  if (!type.toLowerCase().startsWith('application/json') || site === 'cross-site') {
    logEvent('bad_request');
    return reply({ ok: false, error: 'bad_request' }, 400);
  }

  const wait = hitIp(clientIp(req.headers));
  if (wait > 0) {
    logEvent('rate_limited');
    return reply({ ok: false, error: 'rate_limited', retryAfter: wait }, 429, { 'Retry-After': String(wait) });
  }

  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > CONTACT_MAX_BODY_BYTES) {
    logEvent('too_large');
    return reply({ ok: false, error: 'bad_request' }, 413);
  }
  let raw: Record<string, unknown>;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > CONTACT_MAX_BODY_BYTES) {
      logEvent('too_large');
      return reply({ ok: false, error: 'bad_request' }, 413);
    }
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('kein Objekt');
    }
    raw = parsed as Record<string, unknown>;
  } catch {
    logEvent('bad_request');
    return reply({ ok: false, error: 'bad_request' }, 400);
  }

  const payload: ContactPayload = {
    name: str(raw.name),
    email: str(raw.email),
    subject: str(raw.subject),
    message: str(raw.message),
    consent: raw.consent === true,
    hp: str(raw.hp),
    token: str(raw.token),
    lang: raw.lang === 'en' ? 'en' : 'de',
  };

  // Honeypot: Menschen sehen das Feld nicht. Ehrliche Ablehnung statt Schein-Erfolg.
  if (payload.hp.trim() !== '') {
    logEvent('honeypot');
    return reply({ ok: false, error: 'rejected' }, 400);
  }

  const token = checkToken(cfg, payload.token);
  if (token === 'too_fast') {
    logEvent('too_fast');
    return reply({ ok: false, error: 'too_fast' }, 400);
  }
  if (token === 'expired') {
    logEvent('expired');
    return reply({ ok: false, error: 'expired' }, 400);
  }
  if (token !== 'ok') {
    logEvent(`token_${token}`);
    return reply({ ok: false, error: 'rejected' }, 400);
  }

  const fields = validateContact(payload);
  if (Object.keys(fields).length > 0) {
    logEvent('invalid');
    return reply({ ok: false, error: 'invalid', fields }, 400);
  }

  const globalSeconds = globalWait();
  if (globalSeconds > 0) {
    logEvent('rate_limited_global');
    return reply({ ok: false, error: 'rate_limited', retryAfter: globalSeconds }, 429, {
      'Retry-After': String(globalSeconds),
    });
  }

  // Reservieren vor dem await (FUN3): gleichzeitige Anfragen mit demselben Token → nur eine Mail
  if (!reserveToken(payload.token)) {
    logEvent('token_used');
    return reply({ ok: false, error: 'rejected' }, 400);
  }
  const result = await sendContactMail(cfg, payload);
  if (!result.ok) {
    releaseToken(payload.token);
    logEvent('send_failed', result.status);
    return reply({ ok: false, error: 'send_failed' }, 502);
  }
  countSend();
  markTokenUsed(payload.token);
  logEvent('sent', result.status);
  return reply({ ok: true });
}
