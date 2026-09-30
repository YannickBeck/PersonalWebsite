'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

type Phase = 'idle' | 'sending' | 'exists' | 'error' | 'confirm' | 'done';

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/**
 * Newsletter-Demo: Der Dienst ist nur auf Einladung aktiv (Ghost-Einstellung),
 * daher demonstriert das Formular alle Zustände lokal — ohne Übertragung.
 */
export function NewsletterForm({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');

  const invalid = touched && !isEmail(email);

  const submit = () => {
    setTouched(true);
    if (!isEmail(email)) {
      return;
    }
    setPhase('sending');
    window.setTimeout(() => {
      // Deterministische Demo-Verzweigung anhand der Adresse:
      // ...@beispiel.test → bereits angemeldet, sonst Bestätigung.
      // Fehler/Erfolg zusätzlich über die Vorschau unten erzwingbar.
      setPhase(email.trim().endsWith('@beispiel.test') ? 'exists' : 'confirm');
    }, 900);
  };

  return (
    <VStack gap={3}>
      <Banner
        status="warning"
        title={dict.newsletterInviteTitle}
        description={dict.newsletterInviteText}
      />
      <TextInput
        label={dict.newsletterEmailLabel}
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          setPhase('idle');
        }}
        isRequired
        status={invalid ? { type: 'error', message: dict.newsletterErrInvalid } : undefined}
      />
      {phase === 'exists' && (
        <Banner status="info" title={dict.newsletterStateExists} description="" />
      )}
      {phase === 'error' && (
        <Banner status="error" title={dict.newsletterStateError} description="" />
      )}
      {phase === 'confirm' && (
        <Banner status="info" title={dict.newsletterStateConfirm} description="" />
      )}
      {phase === 'done' && (
        <Banner status="success" title={dict.newsletterStateOk} description="" />
      )}
      <Button
        label={dict.newsletterSubmit}
        variant="primary"
        onClick={submit}
        isLoading={phase === 'sending'}
      />
      <HStack gap={2}>
        <Button
          label={dict.newsletterStateError}
          variant="ghost"
          onClick={() => setPhase('error')}
        />
        <Button
          label={dict.newsletterStateOk}
          variant="ghost"
          onClick={() => setPhase('done')}
        />
      </HStack>
    </VStack>
  );
}
