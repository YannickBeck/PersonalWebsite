/**
 * Accept-Header, für den die Markdown-Fassung kommt (next.config.ts, beforeFiles-Rewrite auf
 * /api/md): text/markdown, aber nicht ausdrücklich abgelehnt (text/markdown;q=0 → HTML, PER8).
 * Ohne Importe: next.config.ts liest den Wert ebenfalls; src/proxy.ts lässt diese Abrufe durch,
 * weil /api/md selbst antwortet (auch mit der Markdown-404).
 */
export const MARKDOWN_ACCEPT =
  '(?!.*text/markdown\\s*;\\s*q\\s*=\\s*0(?:\\.0{0,3})?\\s*(?:[,;]|$)).*text/markdown.*';

/** Bekommt dieser Accept-Header die Markdown-Fassung? Gleiche Regel wie Nexts `has`-Abgleich
 * (verankert, Groß-/Kleinschreibung beachtet). */
export function wantsMarkdown(accept: string | null): boolean {
  return accept !== null && new RegExp(`^${MARKDOWN_ACCEPT}$`).test(accept);
}
