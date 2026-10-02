'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { FormPreview, type PreviewState } from '@/components/form-preview';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

type Phase = 'idle' | 'sending' | 'error' | 'done';

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/**
 * Kontaktformular im DEMO-Betrieb: validiert lokal, versendet nichts, speichert nichts.
 *
 * - Natives <form method="dialog"> (FUN1): Außerhalb eines <dialog> bricht der Browser das
 *   Absenden ab – ohne JS bzw. vor der Hydration landen Eingaben NIE in der URL und gehen
 *   an keinen Server. Mit JS übernimmt onSubmit (preventDefault). Enter/„Los“ auf dem Handy
 *   sendet weiter (M8). noValidate, weil lokal validiert wird.
 * - Rückmeldung (A117): ungültiges Absenden fokussiert das erste fehlerhafte Feld; die
 *   Erfolgsmeldung steht in einer dauerhaft eingehängten Live-Region; nach dem Absenden
 *   kehrt der Fokus auf den Senden-Button zurück (isLoading deaktiviert ihn kurz).
 * - Zustände sind über die zugeklappte Vorschau unter dem Formular abrufbar (VIS6).
 */
export function ContactForm({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<PreviewState>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  const show: Phase = preview !== 'idle' ? preview : phase;
  const nameError = touched && name.trim().length === 0 ? dict.formErrRequired : undefined;
  const emailError =
    touched && !isEmail(email) ? (email.trim().length === 0 ? dict.formErrRequired : dict.formErrEmail) : undefined;
  const messageError =
    touched && message.trim().length === 0 ? dict.formErrRequired : undefined;

  // Nach ungültigem Absenden: erstes fehlerhaftes Feld fokussieren (aria-invalid steht erst nach dem Commit)
  useEffect(() => {
    if (attempt > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [attempt]);

  // Nach dem (simulierten) Versand: Fokus zurück auf den Button statt auf <body>
  useEffect(() => {
    if (phase === 'done' && returnFocus.current) {
      returnFocus.current = false;
      submitRef.current?.focus();
    }
  }, [phase]);

  const submit = () => {
    setTouched(true);
    setPreview('idle');
    if (name.trim().length === 0 || !isEmail(email) || message.trim().length === 0) {
      setAttempt((n) => n + 1);
      return;
    }
    returnFocus.current = true;
    setPhase('sending');
    window.setTimeout(() => setPhase('done'), 900);
  };

  return (
    <VStack gap={6}>
      <Banner status="note" title={dict.demoNoticeTitle} description={dict.formDemoNote} />
      <form
        ref={formRef}
        method="dialog"
        noValidate
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          submit();
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
              status={nameError ? { type: 'error', message: nameError } : undefined}
            />
            <TextInput
              label={dict.formEmail}
              type="email"
              value={email}
              onChange={setEmail}
              htmlName="email"
              autoComplete="email"
              isRequired
              status={emailError ? { type: 'error', message: emailError } : undefined}
            />
            <TextInput
              label={dict.formSubject}
              value={subject}
              onChange={setSubject}
              htmlName="subject"
              autoComplete="off"
              isOptional
            />
            <TextArea
              label={dict.formMessage}
              value={message}
              onChange={setMessage}
              htmlName="message"
              rows={6}
              isRequired
              status={messageError ? { type: 'error', message: messageError } : undefined}
            />
          </FormLayout>
          {show === 'error' && (
            <Banner status="error" title={dict.formPreviewError} description={dict.formErrSend} />
          )}
          <VStack gap={4}>
            <HStack gap={2}>
              <Button
                ref={submitRef}
                type="submit"
                label={dict.formSend}
                variant="primary"
                size="lg"
                isLoading={show === 'sending'}
              />
            </HStack>
            {/* Dauerhaft eingehängte Live-Region: nur ihr Inhalt wechselt (A117) */}
            <VStack role="status" aria-live="polite">
              {show === 'done' && (
                <Banner status="success" title={dict.formPreviewSuccess} description={dict.formOkDemo} />
              )}
            </VStack>
          </VStack>
        </VStack>
      </form>
      <noscript>
        <Text color="secondary">{dict.formNoScript}</Text>
      </noscript>
      <FormPreview
        lang={lang}
        value={preview}
        onChange={(p) => {
          setPreview(p);
          if (p === 'idle') {
            setPhase('idle');
          }
        }}
      />
    </VStack>
  );
}
