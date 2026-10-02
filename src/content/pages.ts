/**
 * Strukturierte Demo-Inhalte für Service-Seiten (fiktiv; gekennzeichnet über die Hinweiszeile
 * und je Seite höchstens einen Hinweis, nicht je Eintrag – VIS1).
 * Echte Inhalte: in Ghost bzw. direkt vom Inhaber — siehe /content-status.
 */
import type { Lang } from '@/i18n/dictionaries';

export interface ServiceOffer {
  slug: string;
  title: string;
  problem: string;
  tasks: string[];
  deliverables: string[];
  steps: { title: string; text: string }[];
  openNote: string;
}

export interface CvStation {
  period: string;
  role: string;
  org: string;
  text: string;
  open: boolean;
}

export interface UsesGroup {
  title: string;
  items: { name: string; text: string; href?: string }[];
}

const SERVICES_DE: ServiceOffer[] = [
  {
    slug: 'beratung',
    title: 'Beratung',
    problem:
      'Die Website ist langsam, unübersichtlich oder technisch veraltet — aber niemand sagt, wo man anfangen soll.',
    tasks: [
      'Technische Bestandsaufnahme mit verständlichem Bericht',
      'Priorisierte Maßnahmenliste nach Aufwand und Wirkung',
      'Begleitung bei der Auswahl von CMS, Hosting und Werkzeugen',
    ],
    deliverables: [
      'Schriftlicher Befund (ca. 10 Seiten)',
      'Roadmap für 90 Tage mit Aufwandsschätzung',
      'Abschlussgespräch mit Fragen und Antworten',
    ],
    steps: [
      { title: '1. Kennenlernen', text: '30 Minuten Gespräch: Ziele, Stand, Rahmen.' },
      { title: '2. Analyse', text: 'Zugang, Messung, Sichtung — etwa eine Woche.' },
      { title: '3. Bericht', text: 'Befund plus Roadmap, besprochen in einem Termin.' },
    ],
    openNote: 'Preise, Zielgruppen und Verfügbarkeiten stehen noch nicht fest.',
  },
  {
    slug: 'umsetzung',
    title: 'Umsetzung',
    problem:
      'Das Konzept steht, aber niemand setzt es um — oder die Umsetzung stockt seit Monaten.',
    tasks: [
      'Aufbau von Website oder Web-App nach festem Umfang',
      'Anbindung an CMS, Suche, Formulare und Newsletter',
      'Übergabe mit Dokumentation und Einweisung',
    ],
    deliverables: [
      'Lauffähige Website auf deiner Infrastruktur',
      'Redaktionsleitfaden (ca. 5 Seiten)',
      '30 Tage Nachbetreuung nach Go-Live',
    ],
    steps: [
      { title: '1. Festlegung', text: 'Umfang, Termine und Abnahmen schriftlich fixieren.' },
      { title: '2. Aufbau', text: 'Wöchentliche Zwischenstände in einer Vorschau-Umgebung.' },
      { title: '3. Go-Live', text: 'Umschaltung, Messung, Übergabe — dann Nachbetreuung.' },
    ],
    openNote: 'Preise, Zielgruppen und Verfügbarkeiten stehen noch nicht fest.',
  },
  {
    slug: 'begleitung',
    title: 'Begleitung',
    problem:
      'Die Website läuft, aber niemand kümmert sich — Updates stauen sich, kleine Fehler bleiben liegen.',
    tasks: [
      'Regelmäßige Updates und Sicherheitsprüfungen',
      'Kleine Weiterentwicklungen im Monatsrhythmus',
      'Ansprechpartner bei Fragen und Störungen',
    ],
    deliverables: [
      'Monatlicher Kurzbericht: Was wurde getan',
      'Vierteljährliche Durchsicht mit Empfehlungen',
      'Erreichbarkeit per E-Mail mit Reaktionsziel',
    ],
    steps: [
      { title: '1. Inventur', text: 'Stand erfassen: Versionen, Backups, Zugänge.' },
      { title: '2. Rhythmus', text: 'Fester Monatstermin für Updates und Durchsicht.' },
      { title: '3. Weiterentwicklung', text: 'Kleine Verbesserungen laufend, große als eigene Vorhaben.' },
    ],
    openNote: 'Preise, Zielgruppen und Verfügbarkeiten stehen noch nicht fest.',
  },
];

const SERVICES_EN: ServiceOffer[] = [
  {
    slug: 'consulting',
    title: 'Consulting',
    problem:
      'The website is slow, confusing or technically outdated — but nobody says where to start.',
    tasks: [
      'Technical audit with an understandable report',
      'Prioritized action list by effort and impact',
      'Guidance on choosing CMS, hosting and tools',
    ],
    deliverables: [
      'Written findings (approx. 10 pages)',
      '90-day roadmap with effort estimates',
      'Closing call with Q&A',
    ],
    steps: [
      { title: '1. Intro call', text: '30 minutes: goals, status, constraints.' },
      { title: '2. Analysis', text: 'Access, measurement, review — about one week.' },
      { title: '3. Report', text: 'Findings plus roadmap, discussed in one meeting.' },
    ],
    openNote: 'Pricing, audiences and availability are not set yet.',
  },
  {
    slug: 'implementation',
    title: 'Implementation',
    problem:
      'The concept is ready but nobody builds it — or the build has stalled for months.',
    tasks: [
      'Building the website or web app to a fixed scope',
      'Connecting CMS, search, forms and newsletter',
      'Handover with documentation and walkthrough',
    ],
    deliverables: [
      'Working website on your infrastructure',
      'Editorial guide (approx. 5 pages)',
      '30 days of aftercare post launch',
    ],
    steps: [
      { title: '1. Agreement', text: 'Scope, dates and acceptances fixed in writing.' },
      { title: '2. Build', text: 'Weekly progress in a preview environment.' },
      { title: '3. Go-live', text: 'Cutover, measurement, handover — then aftercare.' },
    ],
    openNote: 'Pricing, audiences and availability are not set yet.',
  },
  {
    slug: 'support',
    title: 'Support',
    problem:
      'The website runs but nobody looks after it — updates pile up, small bugs linger.',
    tasks: [
      'Regular updates and security checks',
      'Small improvements on a monthly rhythm',
      'Contact person for questions and incidents',
    ],
    deliverables: [
      'Monthly short report: what was done',
      'Quarterly review with recommendations',
      'Email availability with response target',
    ],
    steps: [
      { title: '1. Inventory', text: 'Capture status: versions, backups, credentials.' },
      { title: '2. Rhythm', text: 'Fixed monthly slot for updates and review.' },
      { title: '3. Evolution', text: 'Small improvements continuously, big ones as projects.' },
    ],
    openNote: 'Pricing, audiences and availability are not set yet.',
  },
];

export function servicesByLang(lang: Lang): ServiceOffer[] {
  return lang === 'de' ? SERVICES_DE : SERVICES_EN;
}

const CV_DE: CvStation[] = [
  {
    period: '2023 – heute',
    role: 'Freier Webentwickler',
    org: 'Selbstständig',
    text: 'Websites und kleine Web-Apps für Kunden — von der Beratung bis zum Go-Live.',
    open: true,
  },
  {
    period: '2020 – 2023',
    role: 'Frontend-Entwickler',
    org: 'Beispiel GmbH',
    text: 'Komponenten-Bibliothek aufgebaut, Barrierefreiheit eingeführt, Ladezeiten halbiert.',
    open: true,
  },
  {
    period: '2017 – 2020',
    role: 'Mediengestalter Digital',
    org: 'Agentur Muster & Sohn',
    text: 'Von Print ins Web gewechselt; erste CMS-Projekte und Templates.',
    open: true,
  },
];

const CV_EN: CvStation[] = [
  {
    period: '2023 – now',
    role: 'Freelance web developer',
    org: 'Self-employed',
    text: 'Websites and small web apps for clients — from consulting to go-live.',
    open: true,
  },
  {
    period: '2020 – 2023',
    role: 'Frontend developer',
    org: 'Example Ltd',
    text: 'Built a component library, introduced accessibility, halved load times.',
    open: true,
  },
  {
    period: '2017 – 2020',
    role: 'Digital media designer',
    org: 'Agency Muster & Sohn',
    text: 'Moved from print to web; first CMS projects and templates.',
    open: true,
  },
];

export function cvByLang(lang: Lang): CvStation[] {
  return lang === 'de' ? CV_DE : CV_EN;
}

export const SKILLS_DE = ['TypeScript', 'React / Next.js', 'Design-Systeme', 'Headless-CMS', 'Barrierefreiheit (WCAG)', 'CI/CD & Docker'];
export const SKILLS_EN = ['TypeScript', 'React / Next.js', 'Design systems', 'Headless CMS', 'Accessibility (WCAG)', 'CI/CD & Docker'];

export function skillsByLang(lang: Lang): string[] {
  return lang === 'de' ? SKILLS_DE : SKILLS_EN;
}

const USES_DE: UsesGroup[] = [
  {
    title: 'Hardware',
    items: [
      { name: 'Laptop 14″', text: 'Mobiles Arbeitsgerät für Entwicklung und Texte.' },
      { name: 'Monitor 27″', text: 'Hauptbildschirm mit augenschonender Einstellung.' },
      { name: 'Tastatur', text: 'Leise Tastatur für lange Schreibtage.' },
    ],
  },
  {
    title: 'Software',
    items: [
      { name: 'Editor', text: 'Code-Editor mit wenigen, aber sitzenden Erweiterungen.' },
      { name: 'Browser', text: 'Hauptbrowser mit getrennten Profilen für Arbeit und Tests.' },
      { name: 'Notizen', text: 'Ablage für Entwürfe, Checklisten und Leseliste.' },
    ],
  },
  {
    title: 'Arbeitsweise',
    items: [
      { name: 'Rhythmus', text: 'Vormittags Tiefenarbeit, nachmittags Termine und Kleinkram.' },
      { name: 'Backups', text: 'Täglich automatisch, wöchentlich geprüft.' },
    ],
  },
];

const USES_EN: UsesGroup[] = [
  {
    title: 'Hardware',
    items: [
      { name: 'Laptop 14″', text: 'Mobile machine for development and writing.' },
      { name: 'Monitor 27″', text: 'Main display with eye-friendly settings.' },
      { name: 'Keyboard', text: 'Quiet keyboard for long desk days.' },
    ],
  },
  {
    title: 'Software',
    items: [
      { name: 'Editor', text: 'Code editor with few but fitting extensions.' },
      { name: 'Browser', text: 'Main browser with separate work and test profiles.' },
      { name: 'Notes', text: 'Drafts, checklists and reading list.' },
    ],
  },
  {
    title: 'Workflow',
    items: [
      { name: 'Rhythm', text: 'Deep work mornings, meetings and small tasks afternoons.' },
      { name: 'Backups', text: 'Automatic daily, verified weekly.' },
    ],
  },
];

export function usesByLang(lang: Lang): UsesGroup[] {
  return lang === 'de' ? USES_DE : USES_EN;
}
