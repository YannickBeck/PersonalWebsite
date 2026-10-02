'use client';

import { useEffect, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { getDictionary, langFromPath } from '@/i18n/dictionaries';

/**
 * Hält <html lang> mit der Route synchron (/en/* → "en", sonst "de"). Beim ersten Laden
 * setzt das Boot-Script (theme-boot.ts) lang schon vor dem ersten Paint (A116/COD12).
 */
export function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = langFromPath(pathname);
  }, [pathname]);
  return null;
}

/**
 * Sprungmarke zum Inhalt, Beschriftung aus dem Dictionary (COD13). Springt per Fokus statt
 * per Hash-Navigation (FUN2): #main erzeugte einen History-Eintrag ohne Next-State – das
 * nächste Browser-Zurück zeigte dann die falsche Seite. Ohne JS bleibt der native Anker.
 */
export function SkipLink() {
  const dict = getDictionary(langFromPath(usePathname()));
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
