'use client';

import { Button } from '@astryxdesign/core/Button';

/**
 * Lebenslauf drucken; Beschriftung vom Server (kein Dictionary im Client-Bundle).
 * window.print() braucht JavaScript – ohne fehlt der Button (yb-js-only, globals.css; Rest-
 * Feinschliff REG1), Drucken über den Browser bleibt möglich.
 */
export function PrintButton({ label }: { label: string }) {
  return <Button label={label} variant="secondary" className="yb-js-only" onClick={() => window.print()} />;
}
