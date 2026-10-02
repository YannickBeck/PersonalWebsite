'use client';

/**
 * Inline-Script, das nur im Server-HTML ausführbar ist (COD8, Muster aus
 * node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md):
 * auf dem Server type="text/javascript", im Client "text/plain". Rendert React das Root-
 * Layout im Client neu (z. B. nach der __next_error__-Hülle unbekannter Detail-Slugs),
 * entsteht so kein ausführbares <script> und keine Dev-Warnung; suppressHydrationWarning
 * nimmt den type-Unterschied hin (das DOM gewinnt, das Script lief bereits).
 * Client-Komponente, damit typeof window im Browser ausgewertet wird.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
