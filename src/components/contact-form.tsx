'use client';

import { useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';
import { FormLayout } from '@astryxdesign/core/FormLayout';
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
    // Echtes <form> (M8): Enter/„Los“ auf dem Handy sendet; noValidate, weil lokal validiert wird.
    <VStack
      as="form"
      gap={6}
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        submit();
      }}
      {...{ noValidate: true }}
    >
      <Banner status="note" title={dict.demoNoticeTitle} description={dict.formDemoNote} />
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
      {show === 'done' && (
        <Banner status="success" title={dict.formPreviewSuccess} description={dict.formOkDemo} />
      )}
      <HStack gap={2}>
        <Button
          type="submit"
          label={dict.formSend}
          variant="primary"
          size="lg"
          isLoading={show === 'sending'}
        />
      </HStack>
      <Divider />
      <VStack gap={2}>
        <Text type="label" color="secondary">
          {dict.formPreviewLabel}
        </Text>
        {/* umbrechend, sonst seitlicher Überlauf bei 320px (TV2) */}
        <HStack gap={2} wrap="wrap">
          {(['idle', 'sending', 'error', 'done'] as Phase[]).map((p) => (
            <Button
              key={p}
              size="sm"
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
