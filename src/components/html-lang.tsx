'use client';

import { useLayoutEffect, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { getDictionary, langFromPath } from '@/i18n/dictionaries';
import { useRouteLang } from '@/i18n/route-lang';

/**
 * Hält <html lang> mit der Route synchron (/en/* → "en", sonst "de"). Beim ersten Laden
 * setzt das Boot-Script (theme-boot.ts) lang schon vor dem ersten Paint (A116/COD12).
 * Bewusst direkt aus dem Pfad, nicht über useRouteLang: Auf /en/<unbekannt> bleibt lang damit
 * schon während des deutschen Hydrations-Zwischenstands "en" – das hält die Ausblendung in
 * frame.module.css (.notFoundDe) aktiv, bis der Inhalt englisch ist (JURY1-1).
 */
export function HtmlLang() {
  const pathname = usePathname();
  // Layout-Effekt: lang steht schon im Commit (vor Paint und vor dem Snapshot einer View
  // Transition), damit :lang()-Regeln nie einen Frame mit der alten Sprache malen.
  useLayoutEffect(() => {
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
