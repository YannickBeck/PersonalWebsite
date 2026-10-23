'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { ExternalArrow } from '@/components/icons';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { LINKEDIN_URL } from '@/content/links';
import {
  CONTACT_ENDPOINT,
  CONTACT_LIMITS,
  validateContact,
  type ContactErrorCode,
  type ContactField,
  type ContactFieldError,
  type ContactPayload,
  type ContactResponse,
  type ContactStatus,
} from '@/lib/contact';
import styles from './contact-form.module.css';

type Phase = 'idle' | 'sending' | 'done' | 'error';
/** Versand konfiguriert? checking = Abfrage läuft, unknown = Abfrage gescheitert (Netz). */
type Availability = 'checking' | 'available' | 'unavailable' | 'unknown';

/** Versandstatus + Token holen (GET /api/kontakt); null bei Netzfehler. */
async function fetchStatus(): Promise<ContactStatus | null> {
  try {
    const res = await fetch(CONTACT_ENDPOINT, { cache: 'no-store', headers: { Accept: 'application/json' } });
    return (await res.json()) as ContactStatus;
  } catch {
    return null;
  }
}

interface SendError {
  code: ContactErrorCode;
  retryAfter?: number;
}

/**
 * Kontaktformular mit echtem Versand (POST /api/kontakt → Resend, src/lib/contact-server.ts).
 *
 * - Natives <form method="dialog"> (FUN1): ohne JS bzw. vor der Hydration verlässt nichts den
 *   Browser und nichts landet in der URL. Mit JS sendet onSubmit JSON per fetch. Ohne JS fehlt
 *   das Formular ganz (yb-js-only), ein <noscript>-Hinweis nennt LinkedIn (Rest-Feinschliff REG1).
 * - Gerendert nur, wenn das Formular beim Build freigeschaltet ist (NEXT_PUBLIC_CONTACT_FORM,
 *   contact-block.tsx, DES6). Beim Laden fragt es GET /api/kontakt: Ist der Versand
 *   konfiguriert, kommt ein signiertes Token zurück (Mindest-Ausfüllzeit). Fehlen die
 *   Laufzeit-Variablen trotzdem, liegt eine ehrliche Meldung mit LinkedIn-Weg ÜBER dem Formular
 *   (absolut positioniert → kein Layout-Shift) und das Formular ist inert – kein Schein-Erfolg.
 *   Die Meldung ist KEINE Live-Region (A117): Sie entsteht ohne Zutun beim Laden und soll nicht
 *   ungefragt vorgelesen werden; man liest sie, wenn man hinkommt.
 * - Spam-Schutz: Honeypot-Feld (für Menschen unsichtbar, nicht fokussierbar), Mindest-
 *   Ausfüllzeit über das Token, Rate-Limit auf dem Server.
 * - Rückmeldung: ungültig → Fokus aufs erste aria-invalid-Feld. Ergebnis als Astryx-Banner,
 *   der erst nach dem Absenden eingehängt wird und selbst die Live-Rolle trägt (Erfolg
 *   role="status", Fehler role="alert" – Astryx-Empfehlung); keine zweite Region drumherum
 *   (A123: verschachtelte Live-Regionen). Danach Fokus zurück auf den Senden-Button.
 * - Während des Sendens bleibt der Button fokussierbar (isInterruptible: Spinner und aria-busy,
 *   aber nicht disabled – sonst fiel der Fokus auf <body>, A122); Doppelklicks fängt die
 *   phase-Prüfung in onSubmit ab.
 * - Einwilligung: Pflicht-Checkbox, Link zur Datenschutzerklärung.
 */
export function ContactForm({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<SendError | null>(null);
  const [availability, setAvailability] = useState<Availability>('checking');
  const tokenRef = useRef<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const hpRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const returnFocus = useRef(false);

  const applyStatus = useCallback((data: ContactStatus | null) => {
    if (!data) {
      setAvailability((a) => (a === 'checking' ? 'unknown' : a));
      return;
    }
    tokenRef.current = data.token ?? '';
    setAvailability(data.available ? 'available' : 'unavailable');
  }, []);

  const loadStatus = useCallback(async (): Promise<ContactStatus | null> => {
    const data = await fetchStatus();
    applyStatus(data);
    return data;
  }, [applyStatus]);

  useEffect(() => {
    let alive = true;
    void fetchStatus().then((data) => {
      if (alive) {
        applyStatus(data);
      }
    });
    return () => {
      alive = false;
    };
  }, [applyStatus]);

  const input = { name, email, subject, message, consent };
  const errors = touched ? validateContact(input) : {};
  const fieldMessage = (field: ContactField, code: ContactFieldError | undefined): string | undefined => {
    if (!code) {
      return undefined;
    }
    switch (code) {
      case 'required':
        return dict.formErrRequired;
      case 'email':
        return dict.formErrEmail;
      case 'consent':
        return dict.formErrConsent;
      case 'tooLong':
        return dict.formErrTooLong(CONTACT_LIMITS[field as keyof typeof CONTACT_LIMITS]);
    }
  };
  const status = (field: ContactField) => {
    const msg = fieldMessage(field, errors[field]);
    return msg ? { type: 'error' as const, message: msg } : undefined;
  };

  // Nach ungültigem Absenden: erstes fehlerhaftes Feld fokussieren (aria-invalid steht erst nach dem Commit)
  useEffect(() => {
    if (attempt > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [attempt]);

  // Nach dem Versand (Erfolg oder Fehler): Fokus zurück auf den Button statt auf <body>, die
  // Meldung darunter in Sicht holen (mobil lag sie sonst unter dem Bildschirmrand)
  useEffect(() => {
    if ((phase === 'done' || phase === 'error') && returnFocus.current) {
      returnFocus.current = false;
      submitRef.current?.focus({ preventScroll: true });
      const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
      resultRef.current?.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    }
  }, [phase]);

  const submit = async () => {
    setTouched(true);
    if (Object.keys(validateContact(input)).length > 0) {
      setAttempt((n) => n + 1);
      return;
    }
    returnFocus.current = true;
    setPhase('sending');
    setError(null);
    if (!tokenRef.current) {
      await loadStatus();
    }
    const payload: ContactPayload = {
      ...input,
      hp: hpRef.current?.value ?? '',
      token: tokenRef.current,
      lang,
    };
    let data: ContactResponse | null = null;
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      data = (await res.json().catch(() => null)) as ContactResponse | null;
    } catch {
      data = null;
    }
    if (data?.ok) {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setConsent(false);
      setTouched(false);
      setPhase('done');
      // Token ist verbraucht: neues für eine weitere Nachricht
      tokenRef.current = '';
      void loadStatus();
      return;
    }
    const code: ContactErrorCode = data && !data.ok ? data.error : 'send_failed';
    if (code === 'unavailable') {
      returnFocus.current = false;
      setAvailability('unavailable');
      setPhase('idle');
      return;
    }
    if (code === 'expired' || code === 'rejected') {
      tokenRef.current = '';
      void loadStatus();
    }
    if (code === 'invalid') {
      setAttempt((n) => n + 1);
    }
    setError({ code, retryAfter: data && !data.ok ? data.retryAfter : undefined });
    setPhase('error');
  };

  const errorText = (e: SendError): string => {
    switch (e.code) {
      case 'invalid':
        return dict.contactErrInvalid;
      case 'rate_limited':
        return dict.contactErrRate(Math.max(1, Math.ceil((e.retryAfter ?? 600) / 60)));
      case 'too_fast':
        return dict.contactErrTooFast;
      case 'expired':
        return dict.contactErrExpired;
      case 'rejected':
        return dict.contactErrRejected;
      default:
        return dict.contactErrSend;
    }
  };

  const linkedIn = (
    <Button
      label={dict.contactLinkedInAction}
      // Name beginnt mit dem sichtbaren Text (Label-in-Name, WCAG 2.5.3, A113)
      aria-label={`${dict.contactLinkedInAction} (${dict.newTab})`}
      variant="secondary"
      size="sm"
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      endContent={<ExternalArrow />}
    />
  );

  const unavailable = availability === 'unavailable';

  return (
    <VStack gap={4}>
      {/* Ohne JavaScript (Rest-Feinschliff REG1): Das Formular fehlt (yb-js-only) – vorher ließ es
          sich ausfüllen, „Nachricht senden“ tat aber nichts. An seiner Stelle der ehrliche Stand
          mit dem LinkedIn-Weg, gestaltet wie der Zustand „Versand nicht verfügbar“. */}
      <noscript>
        <Card>
          <VStack gap={3}>
            <Text weight="semibold" size="lg">
              {dict.contactNoScriptTitle}
            </Text>
            <Text color="secondary" textWrap="pretty">
              {dict.contactNoScriptText}
            </Text>
            <HStack>{linkedIn}</HStack>
          </VStack>
        </Card>
      </noscript>
      <div className={`${styles.wrap} yb-js-only`} data-unavailable={unavailable ? 'true' : undefined}>
        <form
          ref={formRef}
          method="dialog"
          noValidate
          inert={unavailable}
          className={styles.form}
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (phase !== 'sending') {
              void submit();
            }
          }}
        >
          <VStack gap={6}>
            <FormLayout defaultOptionality="required">
              <TextInput
                label={dict.formName}
                value={name}
                onChange={setName}
                htmlName="name"
                autoComplete="name"
                isRequired
                status={status('name')}
              />
              <TextInput
                label={dict.formEmail}
                type="email"
                value={email}
                onChange={setEmail}
                htmlName="email"
                autoComplete="email"
                isRequired
                status={status('email')}
              />
              <TextInput
                label={dict.formSubject}
                value={subject}
                onChange={setSubject}
                htmlName="subject"
                autoComplete="off"
                isOptional
                status={status('subject')}
              />
              <TextArea
                label={dict.formMessage}
                value={message}
                onChange={setMessage}
                htmlName="message"
                rows={6}
                maxLength={CONTACT_LIMITS.message}
                isRequired
                status={status('message')}
              />
              <CheckboxInput
                label={dict.formConsent}
                description={dict.formConsentNote}
                value={consent}
                onChange={setConsent}
                htmlName="consent"
                isRequired
                status={status('consent')}
              />
            </FormLayout>
            <Text type="supporting" color="secondary" className={styles.privacy}>
              <Link href={`${withLang('/datenschutz', lang)}#kontaktformular`} hasUnderline color="inherit">
                {dict.formConsentLink}
              </Link>
            </Text>
            {/* Honeypot: für Menschen unsichtbar und nicht erreichbar; Bots füllen es aus */}
            <div className={styles.hp} aria-hidden="true">
              <label>
                {dict.formHoneypot}
                <input ref={hpRef} type="text" name="yb_firma" tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>
            <HStack gap={2}>
              <Button
                ref={submitRef}
                type="submit"
                label={dict.formSend}
                variant="primary"
                size="lg"
                isLoading={phase === 'sending'}
                isInterruptible
              />
            </HStack>
          </VStack>
        </form>
        {/* Ehrlicher Zustand ohne Konfiguration: über dem (inerten) Formular, kein Layout-Shift;
            keine Live-Region (A117) */}
        <div className={styles.veil}>
          {unavailable ? (
            <Card elevation="high" className={styles.veilCard}>
              <VStack gap={3}>
                <Text weight="semibold" size="lg">
                  {dict.contactUnavailableTitle}
                </Text>
                <Text color="secondary" textWrap="pretty">
                  {dict.contactUnavailableText}
                </Text>
                <HStack>{linkedIn}</HStack>
              </VStack>
            </Card>
          ) : null}
        </div>
      </div>
      {/* Ergebnis: der Banner trägt die Live-Rolle selbst (A123) */}
      <VStack ref={resultRef} className={`${styles.result} yb-js-only`}>
        {phase === 'done' ? <Banner status="success" title={dict.contactOkTitle} description={dict.contactOkText} /> : null}
        {phase === 'error' && error ? (
          <Banner
            status="error"
            title={dict.contactErrTitle}
            description={errorText(error)}
            endContent={error.code === 'invalid' || error.code === 'too_fast' || error.code === 'expired' ? undefined : linkedIn}
          />
        ) : null}
      </VStack>
    </VStack>
  );
}
