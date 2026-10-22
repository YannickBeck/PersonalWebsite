'use client';

import { useEffect } from 'react';
import { holdPosition } from '@/lib/hold-position';

/**
 * Werdegang (Abschluss-Fixes A112): Die Stationen sind exklusive <details name> – öffnet man
 * eine Station unter dem offenen Studium, klappt das Studium zu und die gewählte Zeile rückte
 * um 550–750px nach oben, unter Header und Abschnittsnavigation (1440: summary bei −11px,
 * WCAG 2.4.11) bzw. aus dem Bild. Hier bleibt der angeklickte <summary> an seiner Stelle
 * (holdPosition). Klick-Listener statt `toggle`: Der Klick kommt vor dem Umschalten (Enter,
 * Leertaste und Tippen lösen ihn ebenfalls aus), das `toggle`-Ereignis erst danach – dann wäre
 * die verschobene Lage schon gezeichnet. Ohne JavaScript bleibt das native Verhalten.
 */
export function CareerHold() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const summary = (event.target as Element | null)?.closest?.('.yb-career-entry > summary');
      const details = summary?.parentElement;
      if (summary instanceof HTMLElement && details instanceof HTMLDetailsElement && !details.open) {
        holdPosition(summary);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
