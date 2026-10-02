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
  /** Abschlussdatum (fiktiv wie das ganze Demo-Projekt); Karten zeigen das Jahr (VIS8). */
  date: string;
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
  const label = lang === 'de' ? 'Galeriebild' : 'Gallery image';
  const base = category === 'web' ? 0 : category === 'cms' ? 1 : 2;
  return [1, 2, 3].map((n) => ({
    src: `/placeholders/article-${((base + n) % 3) + 1}.svg`,
    alt: `${label} ${n}`,
  }));
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    demo: true,
    slug: 'demo-projekt-webseite',
    lang: 'de',
    translationSlug: 'demo-project-website',
    date: '2026-06-15',
    title: 'Firmenwebsite-Relaunch',
    excerpt:
      'Relaunch einer Unternehmenswebsite mit Next.js, neuem Design-System und messbar schnelleren Ladezeiten.',
    category: 'web',
    categoryLabel: 'Webentwicklung',
    topics: ['web', 'nextjs'],
    role: 'Lead-Entwicklung',
    timeframe: '3 Monate',
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
        title: '1. Bestandsaufnahme',
        text: 'Analyse: 40 Seiten, davon 12 verwaist; 2,1 MB Startseiten-Gewicht, davon 70 % Bilder ohne Größenangaben.',
      },
      {
        title: '2. Prototyp',
        text: 'Komponenten-Bibliothek mit zwölf Bausteinen, je ein Template für Landing- und Artikelseiten, dunkles Farbschema mit einer Akzentfarbe.',
      },
      {
        title: '3. Migration',
        text: 'Kapitelweise Übernahme der Inhalte, Weiterleitungen für alle alten URLs, Neuaufbau des Suchindex.',
      },
    ],
    decisions: [
      {
        decision: 'Statisches Rendering mit Revalidierung',
        reason: 'Schnelle Auslieferung bei trotzdem aktuellen Inhalten; kein Rendering pro Anfrage nötig.',
      },
      {
        decision: 'Design-System statt Einzelstyles',
        reason: 'Konsistente Abstände und Typografie über 40+ Seiten, wartbar durch eine Person.',
      },
    ],
    challenges: [
      '200 PDF-Dokumente ohne Textschicht erforderten eine OCR-Pipeline.',
      'Mehrsprachigkeit war nicht eingeplant und wurde nachgezogen.',
    ],
    outcome:
      'Vorgesehen: gemessene Vorher-/Nachher-Werte zu LCP, Anfragen und Redaktionsaufwand.',
    outcomeOpen: true,
    technologies: ['Next.js', 'TypeScript', 'Design-System', 'CMS'],
  },
  {
    demo: true,
    slug: 'demo-project-website',
    lang: 'en',
    translationSlug: 'demo-projekt-webseite',
    date: '2026-06-15',
    title: 'Company Website Relaunch',
    excerpt:
      'Relaunch of a company website with Next.js, a new design system and measurably faster load times.',
    category: 'web',
    categoryLabel: 'Web development',
    topics: ['web', 'nextjs'],
    role: 'Lead development',
    timeframe: '3 months',
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
        title: '1. Audit',
        text: 'Analysis: 40 pages, 12 orphaned; 2.1 MB homepage weight, 70 % images without dimensions.',
      },
      {
        title: '2. Prototype',
        text: 'Component library with twelve blocks, one template each for landing and article pages, dark color scheme with one accent color.',
      },
      {
        title: '3. Migration',
        text: 'Chapter-by-chapter content migration, redirects for all legacy URLs, rebuilt search index.',
      },
    ],
    decisions: [
      {
        decision: 'Static rendering with revalidation',
        reason: 'Fast delivery with fresh content; no per-request rendering needed.',
      },
      {
        decision: 'Design system instead of one-off styles',
        reason: 'Consistent spacing and typography across 40+ pages, maintainable by one person.',
      },
    ],
    challenges: [
      '200 PDFs without a text layer required an OCR pipeline.',
      'Multilingual support was unplanned and retrofitted.',
    ],
    outcome:
      'Planned: measured before/after values for LCP, enquiries and editorial effort.',
    outcomeOpen: true,
    technologies: ['Next.js', 'TypeScript', 'Design system', 'CMS'],
  },
  {
    demo: true,
    slug: 'demo-projekt-cms-migration',
    lang: 'de',
    translationSlug: 'demo-project-cms-migration',
    date: '2026-04-20',
    title: 'CMS-Migration im laufenden Betrieb',
    excerpt:
      'Umzug von 800 Artikeln auf ein Headless-CMS — ohne Downtime und ohne kaputte Links.',
    category: 'cms',
    categoryLabel: 'CMS',
    topics: ['cms', 'ghost'],
    role: 'CMS-Architektur',
    timeframe: '6 Wochen',
    cover: COVERS.cms,
    gallery: gallery('cms', 'de'),
    situation: [
      'Ein Fachmagazin pflegt 800 Artikel in einem veralteten Redaktionssystem: keine Vorschau, keine Rollen, regelmäßige Ausfälle beim Speichern.',
      'Die Redaktion arbeitet täglich — eine Abschaltung für die Migration ist ausgeschlossen.',
    ],
    goal: [
      'Vollständige Migration ohne einen einzigen toten Link.',
      'Vorschau, Rollen und Freigabeprozesse für ein Team von sechs Personen.',
      'Antwortzeiten der Artikelseiten unter einer Sekunde.',
    ],
    approach: [
      {
        title: '1. Content-Modell',
        text: 'Sieben Inhaltstypen, einheitliche Tag-Taxonomie, Pflichtfelder für Titelbild und Kurzbeschreibung.',
      },
      {
        title: '2. Sync-Pipeline',
        text: 'Nächtlicher Abgleich mit Differenzbericht; jede Änderung ist einer Quelle zuordenbar.',
      },
      {
        title: '3. Umschaltung',
        text: 'Lesender Verkehr erst nach vollständiger Verifikation, Schreibzugriff in einem Wartungsfenster von 20 Minuten.',
      },
    ],
    decisions: [
      {
        decision: 'Headless statt Suite',
        reason: 'Frontend und Redaktionssystem lassen sich unabhängig voneinander weiterentwickeln.',
      },
      {
        decision: 'Strikte Slug-Regeln',
        reason: 'Stabile URLs sind die Voraussetzung für den verlustfreien Umzug ohne Redirect-Ketten.',
      },
    ],
    challenges: [
      'Umlaute und Sonderzeichen in 15 % der alten URLs.',
      'Eingebettete Tabellen und Infoboxen hatten kein Gegenstück im Zielsystem.',
    ],
    outcome:
      'Illustrationswerte: 800/800 Artikel migriert, 0 tote Links im Crawl danach, Speicherabbrüche von 9 pro Woche auf 0.',
    outcomeOpen: false,
    technologies: ['Ghost', 'Content-API', 'Redirect-Plan', 'Suche'],
  },
  {
    demo: true,
    slug: 'demo-project-cms-migration',
    lang: 'en',
    translationSlug: 'demo-projekt-cms-migration',
    date: '2026-04-20',
    title: 'Zero-Downtime CMS Migration',
    excerpt:
      'Moving 800 articles to a headless CMS — without downtime or broken links.',
    category: 'cms',
    categoryLabel: 'CMS',
    topics: ['cms', 'ghost'],
    role: 'CMS architecture',
    timeframe: '6 weeks',
    cover: COVERS.cms,
    gallery: gallery('cms', 'en'),
    situation: [
      'A trade magazine maintains 800 articles in an outdated editorial system: no preview, no roles, regular save failures.',
      'The editors work daily — shutting down for migration is out of the question.',
    ],
    goal: [
      'Complete migration without a single dead link.',
      'Preview, roles and approval workflows for a team of six.',
      'Article page response times under one second.',
    ],
    approach: [
      {
        title: '1. Content model',
        text: 'Seven content types, unified tag taxonomy, required fields for cover image and excerpt.',
      },
      {
        title: '2. Sync pipeline',
        text: 'Nightly sync with diff report; every change traceable to a source.',
      },
      {
        title: '3. Cutover',
        text: 'Read traffic only after full verification, write access in a 20-minute window.',
      },
    ],
    decisions: [
      {
        decision: 'Headless over suite',
        reason: 'Frontend and editorial system evolve independently.',
      },
      {
        decision: 'Strict slug rules',
        reason: 'Stable URLs are the precondition for a lossless move without redirect chains.',
      },
    ],
    challenges: [
      'Special characters in 15 % of legacy URLs.',
      'Embedded tables and info boxes had no counterpart in the target system.',
    ],
    outcome:
      'Illustrative values: 800/800 articles migrated, 0 dead links in the crawl afterwards, save failures from 9 per week to 0.',
    outcomeOpen: false,
    technologies: ['Ghost', 'Content API', 'Redirect plan', 'Search'],
  },
  {
    demo: true,
    slug: 'demo-projekt-deploy-pipeline',
    lang: 'de',
    translationSlug: 'demo-project-deploy-pipeline',
    date: '2026-02-10',
    title: 'Deploy-Pipeline für Nebenprojekte',
    excerpt:
      'Von „per FTP hochladen" zu Vorschau-Umgebungen pro Pull-Request in einem Wochenendprojekt-Setup.',
    category: 'automation',
    categoryLabel: 'Automatisierung',
    topics: ['automation', 'tooling'],
    role: 'DevOps-Eigenbau',
    timeframe: '4 Wochenenden',
    cover: COVERS.automation,
    gallery: gallery('automation', 'de'),
    situation: [
      'Ausgangspunkt: drei kleine Webprojekte, jedes Deployment ein Handgriff per FTP, keine Tests, keine Vorschau — Fehler fallen erst live auf.',
      'Zielgruppe des Beispiels: Einzelentwickler mit wenig Zeit für Infrastruktur.',
    ],
    goal: [
      'Jeder Pull-Request erhält automatisch eine Vorschau-URL.',
      'Main-Branch ist immer auslieferbar, Rollback in unter fünf Minuten.',
      'Gesamtaufwand für Einrichtung und Pflege unter vier Stunden pro Monat.',
    ],
    approach: [
      {
        title: '1. Standardisierung',
        text: 'Ein Basis-Image, ein Compose-Schema und gleiche Healthcheck-Konventionen für alle drei Projekte.',
      },
      {
        title: '2. Pipeline',
        text: 'Lint, Typcheck, Test und Build als Pflichtschritte; Vorschau-Deployment nur bei grünem Ergebnis.',
      },
      {
        title: '3. Aufräumen',
        text: 'Vorschau-Umgebungen werden beim Mergen automatisch entfernt; Images älter als 30 Tage rotieren raus.',
      },
    ],
    decisions: [
      {
        decision: 'Plattform statt Eigenbau',
        reason: 'Verwaltete Build-Umgebungen sparen die meiste Zeit; eigene Runner nur für Sonderfälle.',
      },
      {
        decision: 'Compose als kleinster Nenner',
        reason: 'Alle Projekte beschreiben ihre Umgebung gleich — kein Spezialwissen pro Projekt nötig.',
      },
    ],
    challenges: [
      'Secrets für drei Umgebungen ohne Durcheinander verwalten.',
      'Datenbank-Migrationen in Vorschau-Umgebungen isolieren.',
    ],
    outcome:
      'Vorgesehen: Deploy-Häufigkeit, Fehlerquote und Zeitersparnis nach vier Wochen.',
    outcomeOpen: true,
    technologies: ['Docker', 'CI/CD', 'Preview-Environments', 'Healthchecks'],
  },
  {
    demo: true,
    slug: 'demo-project-deploy-pipeline',
    lang: 'en',
    translationSlug: 'demo-projekt-deploy-pipeline',
    date: '2026-02-10',
    title: 'Deploy Pipeline for Side Projects',
    excerpt:
      'From FTP uploads to per-pull-request preview environments in a weekend-project setup.',
    category: 'automation',
    categoryLabel: 'Automation',
    topics: ['automation', 'tooling'],
    role: 'DIY DevOps',
    timeframe: '4 weekends',
    cover: COVERS.automation,
    gallery: gallery('automation', 'en'),
    situation: [
      'Starting point: three small web projects, every deployment an FTP chore, no tests, no preview — bugs surface only in production.',
      'Example audience: solo developers with little time for infrastructure.',
    ],
    goal: [
      'Every pull request automatically gets a preview URL.',
      'Main branch always releasable, rollback under five minutes.',
      'Total setup and maintenance effort under four hours per month.',
    ],
    approach: [
      {
        title: '1. Standardize',
        text: 'One base image, one compose schema and identical healthcheck conventions for all three projects.',
      },
      {
        title: '2. Pipeline',
        text: 'Lint, typecheck, test and build as required steps; preview deploys only on green.',
      },
      {
        title: '3. Cleanup',
        text: 'Preview environments removed on merge; images older than 30 days rotate out.',
      },
    ],
    decisions: [
      {
        decision: 'Platform over DIY',
        reason: 'Managed build environments save the most time; custom runners only for edge cases.',
      },
      {
        decision: 'Compose as common denominator',
        reason: 'Every project describes its environment the same way — no per-project arcana.',
      },
    ],
    challenges: [
      'Managing secrets for three environments without mix-ups.',
      'Isolating database migrations in preview environments.',
    ],
    outcome:
      'Planned: deploy frequency, failure rate and time saved after four weeks.',
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
