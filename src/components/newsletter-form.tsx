'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';
import { FormLayout } from '@astryxdesign/core/FormLayout';
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
    // Echtes <form> (M8); Vorschau-Buttons mit kurzen Labels und Umbruch (M1/T3: kein Überlauf)
    <VStack
      as="form"
      gap={6}
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        submit();
      }}
      {...{ noValidate: true }}
    >
      <Banner status="note" title={dict.newsletterInviteTitle} description={dict.newsletterInviteText} />
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
      {phase === 'exists' && <Banner status="info" title={dict.newsletterStateExists} />}
      {phase === 'error' && <Banner status="error" title={dict.newsletterStateError} />}
      {phase === 'confirm' && <Banner status="info" title={dict.newsletterStateConfirm} />}
      {phase === 'done' && <Banner status="success" title={dict.newsletterStateOk} />}
      <HStack gap={2}>
        <Button
          type="submit"
          label={dict.newsletterSubmit}
          variant="primary"
          size="lg"
          isLoading={phase === 'sending'}
        />
      </HStack>
      <Divider />
      <VStack gap={2}>
        <Text type="label" color="secondary">
          {dict.formPreviewLabel}
        </Text>
        <HStack gap={2} wrap="wrap">
          <Button size="sm" label={dict.formPreviewError} variant="ghost" onClick={() => setPhase('error')} />
          <Button size="sm" label={dict.formPreviewSuccess} variant="ghost" onClick={() => setPhase('done')} />
        </HStack>
      </VStack>
    </VStack>
  );
}
