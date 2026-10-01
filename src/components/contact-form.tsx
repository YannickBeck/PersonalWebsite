'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

type Phase = 'idle' | 'sending' | 'error' | 'done';

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/**
 * Kontaktformular im DEMO-Betrieb: validiert lokal, versendet nichts,
 * speichert nichts. Alle Zustände über die Vorschau demonstrierbar.
 */
export function ContactForm({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<Phase>('idle');

  const show: Phase = preview !== 'idle' ? preview : phase;
  const nameError = touched && name.trim().length === 0 ? dict.formErrRequired : undefined;
  const emailError =
    touched && !isEmail(email) ? (email.trim().length === 0 ? dict.formErrRequired : dict.formErrEmail) : undefined;
  const messageError =
    touched && message.trim().length === 0 ? dict.formErrRequired : undefined;

  const submit = () => {
    setTouched(true);
    setPreview('idle');
    if (name.trim().length === 0 || !isEmail(email) || message.trim().length === 0) {
      return;
    }
    setPhase('sending');
    window.setTimeout(() => setPhase('done'), 900);
  };

  return (
    <VStack gap={3}>
      <Banner status="warning" title={dict.demoNoticeTitle} description={dict.formDemoNote} />
      <TextInput
        label={dict.formName}
        value={name}
        onChange={setName}
        isRequired
        status={nameError ? { type: 'error', message: nameError } : undefined}
      />
      <TextInput
        label={dict.formEmail}
        type="email"
        value={email}
        onChange={setEmail}
        isRequired
        status={emailError ? { type: 'error', message: emailError } : undefined}
      />
      <TextInput label={dict.formSubject} value={subject} onChange={setSubject} isOptional />
      <TextArea
        label={dict.formMessage}
        value={message}
        onChange={setMessage}
        isRequired
        status={messageError ? { type: 'error', message: messageError } : undefined}
      />
      {show === 'error' && (
        <Banner status="error" title={dict.formPreviewError} description={dict.formErrSend} />
      )}
      {show === 'done' && (
        <Banner status="success" title={dict.formPreviewSuccess} description={dict.formOkDemo} />
      )}
      <HStack gap={2}>
        <Button
          label={dict.formSend}
          variant="primary"
          onClick={submit}
          isLoading={show === 'sending'}
        />
      </HStack>
      <VStack gap={2}>
        <Heading level={3}>{dict.formPreviewLabel}</Heading>
        <HStack gap={2}>
          {(['idle', 'sending', 'error', 'done'] as Phase[]).map((p) => (
            <Button
              key={p}
              label={
                p === 'idle'
                  ? dict.formPreviewIdle
                  : p === 'sending'
                    ? dict.formPreviewLoading
                    : p === 'error'
                      ? dict.formPreviewError
                      : dict.formPreviewSuccess
              }
              variant={preview === p ? 'primary' : 'ghost'}
              onClick={() => {
                setPreview(p);
                if (p === 'idle') {
                  setPhase('idle');
                }
              }}
            />
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
}
