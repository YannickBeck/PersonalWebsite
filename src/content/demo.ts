/**
 * Zentrale Demo-Inhalte: Projekte (fiktiv, demo: true).
 * Echte Inhalte leben in Ghost. Ersetzen: Eintrag löschen + Ghost pflegen.
 * Siehe /content-status für die Gesamtübersicht aller Platzhalter.
 */
import type { Lang } from '@/i18n/dictionaries';

export { TRANSLATION_MAP } from '@/i18n/translations';

export const TOPIC_LABELS: Record<Lang, Record<string, string>> = {
  de: {
    web: 'Webentwicklung',
    cms: 'CMS',
    automation: 'Automatisierung',
    nextjs: 'Next.js',
    ghost: 'Ghost',
    tooling: 'Werkzeuge',
  },
  en: {
    web: 'Web development',
    cms: 'CMS',
    automation: 'Automation',
    nextjs: 'Next.js',
    ghost: 'Ghost',
    tooling: 'Tooling',
  },
};

export type ProjectCategory = 'web' | 'cms' | 'automation';

export interface DemoProject {
  demo: true;
  slug: string;
  lang: Lang;
  translationSlug: string;
  title: string;
  excerpt: string;
  category: ProjectCategory;
  categoryLabel: string;
  topics: string[];
  role: string;
  timeframe: string;
  cover: string;
  gallery: { src: string; alt: string }[];
  situation: string[];
  goal: string[];
  approach: { title: string; text: string }[];
  decisions: { decision: string; reason: string }[];
  challenges: string[];
  outcome: string;
  outcomeOpen: boolean;
  technologies: string[];
}

const COVERS: Record<ProjectCategory, string> = {
  web: '/placeholders/project-web.svg',
  cms: '/placeholders/project-cms.svg',
  automation: '/placeholders/project-automation.svg',
};

function gallery(
  category: ProjectCategory,
  lang: Lang,
): { src: string; alt: string }[] {
  const label = lang === 'de' ? 'Demo-Galeriebild' : 'Demo gallery image';
  const base = category === 'web' ? 0 : category === 'cms' ? 1 : 2;
  return [1, 2, 3].map((n) => ({
    src: `/placeholders/article-${((base + n) % 3) + 1}.svg`,
    alt: `${label} ${n} (Platzhalter 16:10)`,
  }));
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    demo: true,
    slug: 'demo-projekt-webseite',
    lang: 'de',
    translationSlug: 'demo-project-website',
    title: 'Demo-Projekt: Firmenwebsite-Relaunch',
    excerpt:
      'Fiktives Beispiel: Relaunch einer Unternehmenswebsite mit Next.js, neuem Design-System und messbar schnelleren Ladezeiten.',
    category: 'web',
    categoryLabel: 'Webentwicklung',
    topics: ['web', 'nextjs'],
    role: 'Demo-Rolle: Lead-Entwicklung (fiktiv)',
    timeframe: 'Demo-Zeitraum: 3 Monate (fiktiv)',
    cover: COVERS.web,
    gallery: gallery('web', 'de'),
    situation: [
      'Die Beispiel-Firma betreibt eine in die Jahre gekommene Website: langsame Ladezeiten, kein durchgängig responsives Layout und Inhalte, die nur per FTP änderbar sind.',
      'Das Marketing-Team wünscht sich eigenständige Inhaltspflege, die Geschäftsführung messbare Verbesserungen bei Ladegeschwindigkeit und Anfragen.',
    ],
    goal: [
      'Ladezeit der Startseite unter 2 Sekunden (Laborwert, 4G-Drosselung).',
      'Redaktionelle Unabhängigkeit ohne Entwickler-Beteiligung.',
      'Barrierearme Umsetzung mit WCAG 2.2 AA als Ziel.',
    ],
    approach: [
      {
        title: '1. Bestandsaufnahme (Demo)',
        text: 'Fiktive Analyse: 40 Seiten, davon 12 verwaist; 2,1 MB Startseiten-Gewicht, davon 70 % Bilder ohne Größenangaben.',
      },
      {
        title: '2. Prototyp (Demo)',
        text: 'Komponenten-Bibliothek mit zwölf Bausteinen, je ein Template für Landing- und Artikelseiten, dunkles Farbschema mit einer Akzentfarbe.',
      },
      {
        title: '3. Migration (Demo)',
        text: 'Kapitelweise Übernahme der Inhalte, Weiterleitungen für alle alten URLs, Neuaufbau des Suchindex.',
      },
    ],
    decisions: [
      {
        decision: 'Statisches Rendering mit Revalidierung (Demo)',
        reason: 'Schnelle Auslieferung bei trotzdem aktuellen Inhalten; kein Rendering pro Anfrage nötig.',
      },
      {
        decision: 'Design-System statt Einzelstyles (Demo)',
        reason: 'Konsistente Abstände und Typografie über 40+ Seiten, wartbar durch eine Person.',
      },
    ],
    challenges: [
      'Demo-Herausforderung: 200 PDF-Dokumente ohne Textschicht erforderten eine fiktive OCR-Pipeline.',
      'Demo-Herausforderung: Mehrsprachigkeit war nicht eingeplant und wurde nachgezogen.',
    ],
    outcome:
      'Ergebnis ergänzen — Demo-Platzhalter: Hier stünden gemessene Vorher/Nachher-Werte (LCP, Anfragen, Redaktionsaufwand).',
    outcomeOpen: true,
    technologies: ['Next.js', 'TypeScript', 'Design-System', 'CMS'],
  },
  {
    demo: true,
    slug: 'demo-project-website',
    lang: 'en',
    translationSlug: 'demo-projekt-webseite',
    title: 'Demo Project: Company Website Relaunch',
    excerpt:
      'Fictional example: relaunch of a company website with Next.js, a new design system and measurably faster load times.',
    category: 'web',
    categoryLabel: 'Web development',
    topics: ['web', 'nextjs'],
    role: 'Demo role: Lead development (fictional)',
    timeframe: 'Demo period: 3 months (fictional)',
    cover: COVERS.web,
    gallery: gallery('web', 'en'),
    situation: [
      'The example company runs an ageing website: slow load times, no consistently responsive layout, and content that can only be changed via FTP.',
      'The marketing team wants independent content management; management wants measurable improvements in speed and enquiries.',
    ],
    goal: [
      'Homepage load time under 2 seconds (lab value, throttled 4G).',
      'Editorial independence without developer involvement.',
      'Accessible implementation targeting WCAG 2.2 AA.',
    ],
    approach: [
      {
        title: '1. Audit (demo)',
        text: 'Fictional analysis: 40 pages, 12 orphaned; 2.1 MB homepage weight, 70 % images without dimensions.',
      },
      {
        title: '2. Prototype (demo)',
        text: 'Component library with twelve blocks, one template each for landing and article pages, dark color scheme with one accent color.',
      },
      {
        title: '3. Migration (demo)',
        text: 'Chapter-by-chapter content migration, redirects for all legacy URLs, rebuilt search index.',
      },
    ],
    decisions: [
      {
        decision: 'Static rendering with revalidation (demo)',
        reason: 'Fast delivery with fresh content; no per-request rendering needed.',
      },
      {
        decision: 'Design system instead of one-off styles (demo)',
        reason: 'Consistent spacing and typography across 40+ pages, maintainable by one person.',
      },
    ],
    challenges: [
      'Demo challenge: 200 PDFs without a text layer required a fictional OCR pipeline.',
      'Demo challenge: multilingual support was unplanned and retrofitted.',
    ],
    outcome:
      'Outcome to be added — demo placeholder: measured before/after values (LCP, enquiries, editorial effort) would go here.',
    outcomeOpen: true,
    technologies: ['Next.js', 'TypeScript', 'Design system', 'CMS'],
  },
  {
    demo: true,
    slug: 'demo-projekt-cms-migration',
    lang: 'de',
    translationSlug: 'demo-project-cms-migration',
    title: 'Demo-Projekt: CMS-Migration im laufenden Betrieb',
    excerpt:
      'Fiktives Beispiel: Umzug von 800 Artikeln auf ein Headless-CMS — ohne Downtime und ohne kaputte Links.',
    category: 'cms',
    categoryLabel: 'CMS',
    topics: ['cms', 'ghost'],
    role: 'Demo-Rolle: CMS-Architektur (fiktiv)',
    timeframe: 'Demo-Zeitraum: 6 Wochen (fiktiv)',
    cover: COVERS.cms,
    gallery: gallery('cms', 'de'),
    situation: [
      'Ein fiktives Fachmagazin pflegt 800 Artikel in einem veralteten Redaktionssystem: keine Vorschau, keine Rollen, regelmäßige Ausfälle beim Speichern.',
      'Die Redaktion arbeitet täglich — eine Abschaltung für die Migration ist ausgeschlossen.',
    ],
    goal: [
      'Vollständige Migration ohne einen einzigen toten Link.',
      'Vorschau, Rollen und Freigabeprozesse für ein Team von sechs Personen.',
      'Antwortzeiten der Artikelseiten unter einer Sekunde.',
    ],
    approach: [
      {
        title: '1. Content-Modell (Demo)',
        text: 'Sieben Inhaltstypen, einheitliche Tag-Taxonomie, Pflichtfelder für Titelbild und Kurzbeschreibung.',
      },
      {
        title: '2. Sync-Pipeline (Demo)',
        text: 'Nächtlicher Abgleich mit Differenzbericht; jede Änderung ist einer Quelle zuordenbar.',
      },
      {
        title: '3. Umschaltung (Demo)',
        text: 'Lesender Verkehr erst nach vollständiger Verifikation, Schreibzugriff in einem Wartungsfenster von 20 Minuten.',
      },
    ],
    decisions: [
      {
        decision: 'Headless statt Suite (Demo)',
        reason: 'Frontend und Redaktionssystem lassen sich unabhängig voneinander weiterentwickeln.',
      },
      {
        decision: 'Strikte Slug-Regeln (Demo)',
        reason: 'Stabile URLs sind die Voraussetzung für den verlustfreien Umzug ohne Redirect-Ketten.',
      },
    ],
    challenges: [
      'Demo-Herausforderung: Umlaute und Sonderzeichen in 15 % der alten URLs.',
      'Demo-Herausforderung: Eingebettete Tabellen und Infoboxen hatten kein Gegenstück im Zielsystem.',
    ],
    outcome:
      'Demo-Ergebnis (fiktiv, Illustrationswerte): 800/800 Artikel migriert, 0 tote Links im Crawl danach, Speicherabbrüche von 9 pro Woche auf 0.',
    outcomeOpen: false,
    technologies: ['Ghost', 'Content-API', 'Redirect-Plan', 'Suche'],
  },
  {
    demo: true,
    slug: 'demo-project-cms-migration',
    lang: 'en',
    translationSlug: 'demo-projekt-cms-migration',
    title: 'Demo Project: Zero-Downtime CMS Migration',
    excerpt:
      'Fictional example: moving 800 articles to a headless CMS — without downtime or broken links.',
    category: 'cms',
    categoryLabel: 'CMS',
    topics: ['cms', 'ghost'],
    role: 'Demo role: CMS architecture (fictional)',
    timeframe: 'Demo period: 6 weeks (fictional)',
    cover: COVERS.cms,
    gallery: gallery('cms', 'en'),
    situation: [
      'A fictional trade magazine maintains 800 articles in an outdated editorial system: no preview, no roles, regular save failures.',
      'The editors work daily — shutting down for migration is out of the question.',
    ],
    goal: [
      'Complete migration without a single dead link.',
      'Preview, roles and approval workflows for a team of six.',
      'Article page response times under one second.',
    ],
    approach: [
      {
        title: '1. Content model (demo)',
        text: 'Seven content types, unified tag taxonomy, required fields for cover image and excerpt.',
      },
      {
        title: '2. Sync pipeline (demo)',
        text: 'Nightly sync with diff report; every change traceable to a source.',
      },
      {
        title: '3. Cutover (demo)',
        text: 'Read traffic only after full verification, write access in a 20-minute window.',
      },
    ],
    decisions: [
      {
        decision: 'Headless over suite (demo)',
        reason: 'Frontend and editorial system evolve independently.',
      },
      {
        decision: 'Strict slug rules (demo)',
        reason: 'Stable URLs are the precondition for a lossless move without redirect chains.',
      },
    ],
    challenges: [
      'Demo challenge: special characters in 15 % of legacy URLs.',
      'Demo challenge: embedded tables and info boxes had no counterpart in the target system.',
    ],
    outcome:
      'Demo outcome (fictional, illustrative values): 800/800 articles migrated, 0 dead links in the crawl afterwards, save failures from 9 per week to 0.',
    outcomeOpen: false,
    technologies: ['Ghost', 'Content API', 'Redirect plan', 'Search'],
  },
  {
    demo: true,
    slug: 'demo-projekt-deploy-pipeline',
    lang: 'de',
    translationSlug: 'demo-project-deploy-pipeline',
    title: 'Demo-Projekt: Deploy-Pipeline für Nebenprojekte',
    excerpt:
      'Fiktives Beispiel: Von „per FTP hochladen" zu Vorschau-Umgebungen pro Pull-Request in einem Wochenendprojekt-Setup.',
    category: 'automation',
    categoryLabel: 'Automatisierung',
    topics: ['automation', 'tooling'],
    role: 'Demo-Rolle: DevOps-Eigenbau (fiktiv)',
    timeframe: 'Demo-Zeitraum: 4 Wochenenden (fiktiv)',
    cover: COVERS.automation,
    gallery: gallery('automation', 'de'),
    situation: [
      'Fiktiver Ausgangspunkt: drei kleine Webprojekte, jedes Deployment ein Handgriff per FTP, keine Tests, keine Vorschau — Fehler fallen erst live auf.',
      'Zielgruppe des Beispiels: Einzelentwickler mit wenig Zeit für Infrastruktur.',
    ],
    goal: [
      'Jeder Pull-Request erhält automatisch eine Vorschau-URL.',
      'Main-Branch ist immer auslieferbar, Rollback in unter fünf Minuten.',
      'Gesamtaufwand für Einrichtung und Pflege unter vier Stunden pro Monat.',
    ],
    approach: [
      {
        title: '1. Standardisierung (Demo)',
        text: 'Ein Basis-Image, ein Compose-Schema und gleiche Healthcheck-Konventionen für alle drei Projekte.',
      },
      {
        title: '2. Pipeline (Demo)',
        text: 'Lint, Typcheck, Test und Build als Pflichtschritte; Vorschau-Deployment nur bei grünem Ergebnis.',
      },
      {
        title: '3. Aufräumen (Demo)',
        text: 'Vorschau-Umgebungen werden beim Mergen automatisch entfernt; Images älter als 30 Tage rotieren raus.',
      },
    ],
    decisions: [
      {
        decision: 'Plattform statt Eigenbau (Demo)',
        reason: 'Verwaltete Build-Umgebungen sparen die meiste Zeit; eigene Runner nur für Sonderfälle.',
      },
      {
        decision: 'Compose als kleinster Nenner (Demo)',
        reason: 'Alle Projekte beschreiben ihre Umgebung gleich — kein Spezialwissen pro Projekt nötig.',
      },
    ],
    challenges: [
      'Demo-Herausforderung: Secrets für drei Umgebungen ohne Durcheinander verwalten.',
      'Demo-Herausforderung: Datenbank-Migrationen in Vorschau-Umgebungen isolieren.',
    ],
    outcome:
      'Ergebnis ergänzen — Demo-Platzhalter: Hier stünden Deploy-Häufigkeit, Fehlerquote und Zeitersparnis nach vier Wochen.',
    outcomeOpen: true,
    technologies: ['Docker', 'CI/CD', 'Preview-Environments', 'Healthchecks'],
  },
  {
    demo: true,
    slug: 'demo-project-deploy-pipeline',
    lang: 'en',
    translationSlug: 'demo-projekt-deploy-pipeline',
    title: 'Demo Project: Deploy Pipeline for Side Projects',
    excerpt:
      'Fictional example: from FTP uploads to per-pull-request preview environments in a weekend-project setup.',
    category: 'automation',
    categoryLabel: 'Automation',
    topics: ['automation', 'tooling'],
    role: 'Demo role: DIY DevOps (fictional)',
    timeframe: 'Demo period: 4 weekends (fictional)',
    cover: COVERS.automation,
    gallery: gallery('automation', 'en'),
    situation: [
      'Fictional starting point: three small web projects, every deployment an FTP chore, no tests, no preview — bugs surface only in production.',
      'Example audience: solo developers with little time for infrastructure.',
    ],
    goal: [
      'Every pull request automatically gets a preview URL.',
      'Main branch always releasable, rollback under five minutes.',
      'Total setup and maintenance effort under four hours per month.',
    ],
    approach: [
      {
        title: '1. Standardize (demo)',
        text: 'One base image, one compose schema and identical healthcheck conventions for all three projects.',
      },
      {
        title: '2. Pipeline (demo)',
        text: 'Lint, typecheck, test and build as required steps; preview deploys only on green.',
      },
      {
        title: '3. Cleanup (demo)',
        text: 'Preview environments removed on merge; images older than 30 days rotate out.',
      },
    ],
    decisions: [
      {
        decision: 'Platform over DIY (demo)',
        reason: 'Managed build environments save the most time; custom runners only for edge cases.',
      },
      {
        decision: 'Compose as common denominator (demo)',
        reason: 'Every project describes its environment the same way — no per-project arcana.',
      },
    ],
    challenges: [
      'Demo challenge: managing secrets for three environments without mix-ups.',
      'Demo challenge: isolating database migrations in preview environments.',
    ],
    outcome:
      'Outcome to be added — demo placeholder: deploy frequency, failure rate and time saved after four weeks would go here.',
    outcomeOpen: true,
    technologies: ['Docker', 'CI/CD', 'Preview environments', 'Healthchecks'],
  },
];

export function demoProjectsByLang(lang: Lang): DemoProject[] {
  return DEMO_PROJECTS.filter((p) => p.lang === lang);
}

export function demoProjectBySlug(slug: string, lang: Lang): DemoProject | undefined {
  return DEMO_PROJECTS.find((p) => p.slug === slug && p.lang === lang);
}
