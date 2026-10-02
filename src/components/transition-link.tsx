'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { armMorph } from '@/components/morph';
import { rememberScroll } from '@/components/route-transition';
import { morphKeyFor, navTransitionTypes } from '@/lib/transitions';

type TransitionLinkProps = ComponentProps<typeof NextLink> & { to?: string };

/**
 * Link-Komponente für Astryx' <LinkProvider> (providers.tsx). Damit laufen ALLE Astryx-
 * Links durch: TopNavItem, SideNavItem, Link, Button href – und ClickableCard, deren
 * Klick auf den versteckten Link weitergereicht wird (useClickableContainer).
 *
 * - setzt transitionTypes automatisch aus der Pfadtiefe (nav-forward/-back/-lateral);
 *   explizit übergebene transitionTypes gewinnen; externe Links und Anker bleiben ohne.
 * - schaltet beim Klick genau ein Cover für den Morph scharf (morph.tsx) und merkt sich
 *   die Scroll-Position der alten Seite (für Browser-Zurück, route-transition.tsx).
 * - entfernt Astryx' zusätzliches `to`-Attribut (für React Router gedacht), sonst
 *   landet ein ungültiges <a to="…"> im HTML (T9).
 */
export function TransitionLink({ to: _to, href, transitionTypes, onClick, ...rest }: TransitionLinkProps) {
  void _to;
  const pathname = usePathname();
  const target = typeof href === 'string' ? href : (href.pathname ?? '');
  const types = transitionTypes ?? navTransitionTypes(pathname, target);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && types) {
      armMorph(morphKeyFor(pathname, target));
      rememberScroll();
    }
  };

  return <NextLink {...rest} href={href} transitionTypes={types} onClick={handleClick} />;
}
