'use client';

import { Button } from '@astryxdesign/core/Button';

/** Lebenslauf drucken; Beschriftung vom Server (kein Dictionary im Client-Bundle). */
export function PrintButton({ label }: { label: string }) {
  return <Button label={label} variant="secondary" onClick={() => window.print()} />;
}
