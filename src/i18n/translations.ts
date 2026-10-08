/**
 * Übersetzungszuordnung (beide Richtungen) für den Sprachwechsel,
 * inkl. echter Ghost-Slugs. Separates Modul, damit Client-Komponenten
 * nicht die gesamten Demo-Inhalte bundeln.
 */
export const TRANSLATION_MAP: Record<string, string> = {
  // Projekte aus dem Content-Modell (src/content/profile.ts, PROJECTS[].slug)
  orbitalis: 'orbitalis',
  bachelorarbeit: 'bachelor-thesis',
  'bachelor-thesis': 'bachelorarbeit',
  // Demo-Artikel (nur Vorschau)
  'demo-warum-eigene-website': 'demo-why-own-website',
  'demo-why-own-website': 'demo-warum-eigene-website',
  'demo-ghost-headless': 'demo-ghost-headless-en',
  'demo-ghost-headless-en': 'demo-ghost-headless',
  'demo-automatisierung-alltag': 'demo-automation-everyday',
  'demo-automation-everyday': 'demo-automatisierung-alltag',
  'demo-nextjs-rendering': 'demo-nextjs-rendering-en',
  'demo-nextjs-rendering-en': 'demo-nextjs-rendering',
  'demo-content-modellierung': 'demo-content-modeling',
  'demo-content-modeling': 'demo-content-modellierung',
  'demo-ci-cd-sideprojects': 'demo-ci-cd-sideprojects-en',
  'demo-ci-cd-sideprojects-en': 'demo-ci-cd-sideprojects',
  // Echte Ghost-Inhalte
  'beispielprojekt-me-website': 'sample-project-me-website',
  'sample-project-me-website': 'beispielprojekt-me-website',
  'hallo-welt-warum-diese-website': 'hello-world-why-this-website',
  'hello-world-why-this-website': 'hallo-welt-warum-diese-website',
};
