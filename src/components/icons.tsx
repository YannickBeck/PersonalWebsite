'use client';

import type { SVGProps } from 'react';
import { Icon } from '@astryxdesign/core/Icon';

/**
 * Eigene Linien-Icons für Lücken im Astryx-Icon-Set (dort kein Pfeil nach rechts/links).
 * Client-Modul: Icon bekommt eine SVG-Komponente (Funktion) – die darf nicht aus einer
 * Server-Komponente an Client-Komponenten wie Button übergeben werden. Server-Code nutzt
 * deshalb <ArrowRight /> bzw. <ArrowLeft /> als fertiges Element.
 */
function ArrowRightSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowLeftSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

type IconColor = 'primary' | 'secondary' | 'accent' | 'inherit';

export function ArrowRight({ color = 'inherit' }: { color?: IconColor }) {
  return <Icon icon={ArrowRightSvg} size="sm" color={color} />;
}

export function ArrowLeft({ color = 'inherit' }: { color?: IconColor }) {
  return <Icon icon={ArrowLeftSvg} size="sm" color={color} />;
}
