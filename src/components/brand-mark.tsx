/**
 * Wortmarken-Zeichen: Terminal-Prompt „›_“ auf Akzentfläche (Bezug zur Terminal-Karte im Hero).
 * Rein dekorativ – der Name steht als Text daneben (TopNavHeading heading).
 * Farben ausschließlich über Tokens (fill/stroke per CSS-Variable).
 */
export function BrandMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="28" height="28" rx="8" style={{ fill: 'var(--color-accent)' }} />
      <path
        d="M8.5 9.5 13 14l-4.5 4.5M15 19h5"
        fill="none"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: 'var(--color-on-accent)' }}
      />
    </svg>
  );
}
