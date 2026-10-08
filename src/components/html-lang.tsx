'use client';

import type { MouseEvent } from 'react';
import { getDictionary } from '@/i18n/dictionaries';
import { useRouteLang } from '@/i18n/route-lang';

/**
 * Sprungmarke zum Inhalt, Beschriftung aus dem Dictionary (COD13). Springt per Fokus statt
 * per Hash-Navigation (FUN2): #main erzeugte einen History-Eintrag ohne Next-State – das
 * nächste Browser-Zurück zeigte dann die falsche Seite. Ohne JS bleibt der native Anker.
 */
export function SkipLink() {
  const dict = getDictionary(useRouteLang());
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById('main');
    if (!main) {
      return;
    }
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  };
  return (
    <a href="#main" className="skip-link" onClick={onClick}>
      {dict.skipToContent}
    </a>
  );
}
