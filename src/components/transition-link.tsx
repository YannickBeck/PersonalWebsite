'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { armMorph } from '@/components/morph';
import { markNavigationStart, rememberScroll } from '@/components/route-transition';
import { isInternalPath, morphKeyFor, navTransitionTypes } from '@/lib/transitions';
import { langFromPath } from '@/i18n/dictionaries';

type TransitionLinkProps = ComponentProps<typeof NextLink> & { to?: string };

/**
 * Link-Komponente für Astryx' <LinkProvider> (providers.tsx). Damit laufen ALLE Astryx-
 * Links durch: TopNavItem, SideNavItem, Link, Button href – und ClickableCard, deren
 * Klick auf den versteckten Link weitergereicht wird (useClickableContainer).
 *
 * - setzt transitionTypes automatisch aus der Pfadtiefe (nav-forward/-back/-lateral);
 *   explizit übergebene transitionTypes gewinnen; externe Links und Anker bleiben ohne.
 * - beendet beim Klick eine noch laufende View Transition (MOT4) und merkt sich, ob die
 *   alte Seite gescrollt war (MOT1, markNavigationStart).
 * - schaltet beim Klick genau ein Cover für den Morph scharf (morph.tsx) und merkt sich
 *   die Scroll-Position der alten Seite (für Browser-Zurück, route-transition.tsx).
 * - Links in die andere Sprache (z. B. Sprachwechsel EN/DE) tragen hrefLang und lang der
 *   Zielsprache (A124) – Astryx-Button reicht diese Attribute nicht typisiert durch.
 * - entfernt Astryx' zusätzliches `to`-Attribut (für React Router gedacht), sonst
 *   landet ein ungültiges <a to="…"> im HTML (T9).
 */
export function TransitionLink({ to: _to, href, transitionTypes, onClick, ...rest }: TransitionLinkProps) {
  void _to;
  const pathname = usePathname();
  const target = typeof href === 'string' ? href : (href.pathname ?? '');
  const types = transitionTypes ?? navTransitionTypes(pathname, target);
  const targetLang = isInternalPath(target) ? langFromPath(target.split(/[?#]/)[0]) : null;
  const langProps =
    targetLang && targetLang !== langFromPath(pathname) ? { hrefLang: targetLang, lang: targetLang } : null;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && types) {
      markNavigationStart();
      armMorph(morphKeyFor(pathname, target));
      rememberScroll();
    }
  };

  return <NextLink {...langProps} {...rest} href={href} transitionTypes={types} onClick={handleClick} />;
}
