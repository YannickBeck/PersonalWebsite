'use client';

import { Collapsible } from '@astryxdesign/core/Collapsible';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

export type PreviewState = 'idle' | 'sending' | 'error' | 'done';

const STATES: PreviewState[] = ['idle', 'sending', 'error', 'done'];

/**
 * Zustands-Vorschau der Demo-Formulare (VIS6): zugeklappt unter dem Formular, auf Kontakt
 * und Newsletter gleich – vier Zustände als SegmentedControl (ein Eingabewert, kein zweiter
 * Primärbutton im Formularblock). Gehört nicht zum Formular selbst (steht außerhalb des
 * <form>), damit Enter im Formular nie die Vorschau auslöst.
 */
export function FormPreview({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: PreviewState;
  onChange: (state: PreviewState) => void;
}) {
  const dict = getDictionary(lang);
  const label: Record<PreviewState, string> = {
    idle: dict.formPreviewIdle,
    sending: dict.formPreviewLoading,
    error: dict.formPreviewError,
    done: dict.formPreviewSuccess,
  };
  return (
    <Collapsible
      defaultIsOpen={false}
      trigger={
        <Text type="label" color="secondary">
          {dict.formPreviewLabel}
        </Text>
      }
    >
      <SegmentedControl
        label={dict.formPreviewLabel}
        value={value}
        onChange={(v) => onChange(v as PreviewState)}
        size="sm"
      >
        {STATES.map((s) => (
          <SegmentedControlItem key={s} value={s} label={label[s]} />
        ))}
      </SegmentedControl>
    </Collapsible>
  );
}
