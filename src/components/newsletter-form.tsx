'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Text } from '@astryxdesign/core/Text';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { FormPreview, type PreviewState } from '@/components/form-preview';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

type Phase = 'idle' | 'sending' | 'exists' | 'error' | 'confirm' | 'done';

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/**
 * Newsletter-Demo: Der Dienst ist nur auf Einladung aktiv (Ghost-Einstellung), daher
 * demonstriert das Formular alle Zustände lokal — ohne Übertragung. Gleiches Muster wie
 * contact-form.tsx: <form method="dialog"> (FUN1, nie Daten in der URL), Fokus aufs
 * fehlerhafte Feld bzw. zurück auf den Button, dauerhafte Live-Region (A117), zugeklappte
 * Zustands-Vorschau mit denselben vier Zuständen (VIS6).
 */
export function NewsletterForm({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<PreviewState>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  const show: Phase = preview !== 'idle' ? preview : phase;
  const invalid = touched && !isEmail(email);

  useEffect(() => {
    if (attempt > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [attempt]);

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'sending' && returnFocus.current) {
      returnFocus.current = false;
      submitRef.current?.focus();
    }
  }, [phase]);

  const submit = () => {
    setTouched(true);
    setPreview('idle');
    if (!isEmail(email)) {
      setAttempt((n) => n + 1);
      return;
    }
    returnFocus.current = true;
    setPhase('sending');
    window.setTimeout(() => {
      // Deterministische Demo-Verzweigung anhand der Adresse:
      // ...@beispiel.test → bereits angemeldet, sonst Bestätigung.
      setPhase(email.trim().endsWith('@beispiel.test') ? 'exists' : 'confirm');
    }, 900);
  };

  return (
    <VStack gap={6}>
      <Banner status="note" title={dict.newsletterInviteTitle} description={dict.newsletterInviteText} />
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
              label={dict.newsletterEmailLabel}
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setPhase('idle');
              }}
              htmlName="email"
              autoComplete="email"
              isRequired
              status={invalid ? { type: 'error', message: dict.newsletterErrInvalid } : undefined}
            />
          </FormLayout>
          {show === 'error' && <Banner status="error" title={dict.newsletterStateError} />}
          <VStack gap={4}>
            <HStack gap={2}>
              <Button
                ref={submitRef}
                type="submit"
                label={dict.newsletterSubmit}
                variant="primary"
                size="lg"
                isLoading={show === 'sending'}
              />
            </HStack>
            <VStack role="status" aria-live="polite">
              {show === 'exists' && <Banner status="info" title={dict.newsletterStateExists} />}
              {show === 'confirm' && <Banner status="info" title={dict.newsletterStateConfirm} />}
              {show === 'done' && <Banner status="success" title={dict.newsletterStateOk} />}
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
