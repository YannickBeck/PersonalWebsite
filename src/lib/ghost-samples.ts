/**
 * Ghost-Testinhalte, die nie als Seite erscheinen sollen (Fix-Runde 3, Jury-mustFix): der
 * Beitrag „Beispielprojekt“ mit Tag „project“ und Entwicklernotiz („Tag-Konvention: project
 * plus hash-lang-de. Echte Inhalte folgen.“). Er war live indexiert. Die Adressen leiten
 * dauerhaft (308) auf die Projektübersicht (next.config.ts, wie die alten Demo-Projekte), und
 * src/lib/ghost.ts lässt die Slugs aus – keine statische Seite, kein Markdown, nicht in
 * generateStaticParams. Exakte Slugs, damit echte Ghost-Projekte nie betroffen sind.
 *
 * Ohne Importe: next.config.ts liest die Liste ebenfalls.
 */
export const GHOST_SAMPLE_PROJECTS = {
  de: ['beispielprojekt-me-website'],
  en: ['sample-project-me-website'],
} as const satisfies Record<'de' | 'en', readonly string[]>;

/** Ghost-Testprojekt (wird ausgelassen und umgeleitet)? */
export function isGhostSampleProject(slug: string, lang: 'de' | 'en'): boolean {
  return (GHOST_SAMPLE_PROJECTS[lang] as readonly string[]).includes(slug);
}
