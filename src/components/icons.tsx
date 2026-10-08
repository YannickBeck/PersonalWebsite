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

function ExternalArrowSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 16 16 8M9 8h7v7" />
    </svg>
  );
}

function PauseSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6v12M15 6v12" />
    </svg>
  );
}

function PlaySvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 5.5v13l10-6.5z" />
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

/** Pfeil nach rechts oben: Link verlässt die Website (externes Ziel, z. B. LinkedIn, GitHub). */
export function ExternalArrow({ color = 'inherit' }: { color?: IconColor }) {
  return <Icon icon={ExternalArrowSvg} size="sm" color={color} />;
}

/** Laufband anhalten (Erfolge, WCAG 2.2.2). */
export function PauseIcon({ color = 'inherit' }: { color?: IconColor }) {
  return <Icon icon={PauseSvg} size="sm" color={color} />;
}

/** Laufband fortsetzen. */
export function PlayIcon({ color = 'inherit' }: { color?: IconColor }) {
  return <Icon icon={PlaySvg} size="sm" color={color} />;
}

/**
 * Pfeil hinter einem Linktext im Fließtext (Randspalte, Rechtstexte): bleibt inline beim
 * letzten Wort. Astryx-Link legt den Inhalt in ein Text-Span, das Icon wäre dort ein Block
 * und rutschte beim Umbruch in eine eigene Zeile bzw. an den rechten Rand.
 */
export function InlineExternalArrow() {
  return (
    <span className="yb-inline-icon" aria-hidden="true">
      <Icon icon={ExternalArrowSvg} size="sm" color="inherit" />
    </span>
  );
}
