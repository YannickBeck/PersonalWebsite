/**
 * Strukturierte Demo-Inhalte für Service-Seiten (fiktiv).
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
    title: 'Beratung (Demo)',
    problem:
      'Demo-Problemlage: Die Website ist langsam, unübersichtlich oder technisch veraltet — aber niemand sagt, wo man anfangen soll.',
    tasks: [
      'Technische Bestandsaufnahme mit verständlichem Bericht',
      'Priorisierte Maßnahmenliste nach Aufwand und Wirkung',
      'Begleitung bei der Auswahl von CMS, Hosting und Werkzeugen',
    ],
    deliverables: [
      'Schriftlicher Befund (ca. 10 Seiten, Demo-Umfang)',
      'Roadmap für 90 Tage mit Aufwandsschätzung',
      'Abschlussgespräch mit Fragen und Antworten',
    ],
    steps: [
      { title: '1. Kennenlernen (Demo)', text: '30 Minuten Gespräch: Ziele, Stand, Rahmen.' },
      { title: '2. Analyse (Demo)', text: 'Zugang, Messung, Sichtung — etwa eine Woche.' },
      { title: '3. Bericht (Demo)', text: 'Befund plus Roadmap, besprochen in einem Termin.' },
    ],
    openNote: 'Offen (Demo): Preise, Zielgruppen und Verfügbarkeiten stehen noch nicht fest.',
  },
  {
    slug: 'umsetzung',
    title: 'Umsetzung (Demo)',
    problem:
      'Demo-Problemlage: Das Konzept steht, aber niemand setzt es um — oder die Umsetzung stockt seit Monaten.',
    tasks: [
      'Aufbau von Website oder Web-App nach festem Umfang',
      'Anbindung an CMS, Suche, Formulare und Newsletter',
      'Übergabe mit Dokumentation und Einweisung',
    ],
    deliverables: [
      'Lauffähige Website auf deiner Infrastruktur (Demo-Umfang)',
      'Redaktionsleitfaden (ca. 5 Seiten, Demo-Umfang)',
      '30 Tage Nachbetreuung nach Go-Live (Demo-Angabe)',
    ],
    steps: [
      { title: '1. Festlegung (Demo)', text: 'Umfang, Termine und Abnahmen schriftlich fixieren.' },
      { title: '2. Aufbau (Demo)', text: 'Wöchentliche Zwischenstände in einer Vorschau-Umgebung.' },
      { title: '3. Go-Live (Demo)', text: 'Umschaltung, Messung, Übergabe — dann Nachbetreuung.' },
    ],
    openNote: 'Offen (Demo): Preise, Zielgruppen und Verfügbarkeiten stehen noch nicht fest.',
  },
  {
    slug: 'begleitung',
    title: 'Begleitung (Demo)',
    problem:
      'Demo-Problemlage: Die Website läuft, aber niemand kümmert sich — Updates stauen sich, kleine Fehler bleiben liegen.',
    tasks: [
      'Regelmäßige Updates und Sicherheitsprüfungen',
      'Kleine Weiterentwicklungen im Monatsrhythmus',
      'Ansprechpartner bei Fragen und Störungen',
    ],
    deliverables: [
      'Monatlicher Kurzbericht: Was wurde getan (Demo-Umfang)',
      'Vierteljährliche Durchsicht mit Empfehlungen',
      'Erreichbarkeit per E-Mail mit Reaktionsziel (Demo-Angabe)',
    ],
    steps: [
      { title: '1. Inventur (Demo)', text: 'Stand erfassen: Versionen, Backups, Zugänge.' },
      { title: '2. Rhythmus (Demo)', text: 'Fester Monatstermin für Updates und Durchsicht.' },
      { title: '3. Weiterentwicklung (Demo)', text: 'Kleine Verbesserungen laufend, große als eigene Vorhaben.' },
    ],
    openNote: 'Offen (Demo): Preise, Zielgruppen und Verfügbarkeiten stehen noch nicht fest.',
  },
];

const SERVICES_EN: ServiceOffer[] = [
  {
    slug: 'consulting',
    title: 'Consulting (demo)',
    problem:
      'Demo problem: the website is slow, confusing or technically outdated — but nobody says where to start.',
    tasks: [
      'Technical audit with an understandable report',
      'Prioritized action list by effort and impact',
      'Guidance on choosing CMS, hosting and tools',
    ],
    deliverables: [
      'Written findings (approx. 10 pages, demo scope)',
      '90-day roadmap with effort estimates',
      'Closing call with Q&A',
    ],
    steps: [
      { title: '1. Intro call (demo)', text: '30 minutes: goals, status, constraints.' },
      { title: '2. Analysis (demo)', text: 'Access, measurement, review — about one week.' },
      { title: '3. Report (demo)', text: 'Findings plus roadmap, discussed in one meeting.' },
    ],
    openNote: 'Open (demo): pricing, audiences and availability are not set yet.',
  },
  {
    slug: 'implementation',
    title: 'Implementation (demo)',
    problem:
      'Demo problem: the concept is ready but nobody builds it — or the build has stalled for months.',
    tasks: [
      'Building the website or web app to a fixed scope',
      'Connecting CMS, search, forms and newsletter',
      'Handover with documentation and walkthrough',
    ],
    deliverables: [
      'Working website on your infrastructure (demo scope)',
      'Editorial guide (approx. 5 pages, demo scope)',
      '30 days of aftercare post launch (demo terms)',
    ],
    steps: [
      { title: '1. Agreement (demo)', text: 'Scope, dates and acceptances fixed in writing.' },
      { title: '2. Build (demo)', text: 'Weekly progress in a preview environment.' },
      { title: '3. Go-live (demo)', text: 'Cutover, measurement, handover — then aftercare.' },
    ],
    openNote: 'Open (demo): pricing, audiences and availability are not set yet.',
  },
  {
    slug: 'support',
    title: 'Support (demo)',
    problem:
      'Demo problem: the website runs but nobody looks after it — updates pile up, small bugs linger.',
    tasks: [
      'Regular updates and security checks',
      'Small improvements on a monthly rhythm',
      'Contact person for questions and incidents',
    ],
    deliverables: [
      'Monthly short report: what was done (demo scope)',
      'Quarterly review with recommendations',
      'Email availability with response target (demo terms)',
    ],
    steps: [
      { title: '1. Inventory (demo)', text: 'Capture status: versions, backups, credentials.' },
      { title: '2. Rhythm (demo)', text: 'Fixed monthly slot for updates and review.' },
      { title: '3. Evolution (demo)', text: 'Small improvements continuously, big ones as projects.' },
    ],
    openNote: 'Open (demo): pricing, audiences and availability are not set yet.',
  },
];

export function servicesByLang(lang: Lang): ServiceOffer[] {
  return lang === 'de' ? SERVICES_DE : SERVICES_EN;
}

const CV_DE: CvStation[] = [
  {
    period: '2023 – heute (Demo)',
    role: 'Demo-Rolle: Freier Webentwickler (fiktiv)',
    org: 'Demo: Selbstständig (fiktiv)',
    text: 'Demo-Station: Websites und kleine Web-Apps für fiktive Kunden — von der Beratung bis zum Go-Live.',
    open: true,
  },
  {
    period: '2020 – 2023 (Demo)',
    role: 'Demo-Rolle: Frontend-Entwickler (fiktiv)',
    org: 'Demo-Firma Beispiel GmbH (fiktiv)',
    text: 'Demo-Station: Komponenten-Bibliothek aufgebaut, Barrierefreiheit eingeführt, Ladezeiten halbiert (fiktive Angaben).',
    open: true,
  },
  {
    period: '2017 – 2020 (Demo)',
    role: 'Demo-Rolle: Mediengestalter Digital (fiktiv)',
    org: 'Demo-Agentur Muster & Sohn (fiktiv)',
    text: 'Demo-Station: Von Print ins Web gewechselt; erste CMS-Projekte und Templates (fiktiv).',
    open: true,
  },
];

const CV_EN: CvStation[] = [
  {
    period: '2023 – now (demo)',
    role: 'Demo role: Freelance web developer (fictional)',
    org: 'Demo: self-employed (fictional)',
    text: 'Demo station: websites and small web apps for fictional clients — from consulting to go-live.',
    open: true,
  },
  {
    period: '2020 – 2023 (demo)',
    role: 'Demo role: Frontend developer (fictional)',
    org: 'Demo company Example Ltd (fictional)',
    text: 'Demo station: built a component library, introduced accessibility, halved load times (fictional figures).',
    open: true,
  },
  {
    period: '2017 – 2020 (demo)',
    role: 'Demo role: Digital media designer (fictional)',
    org: 'Demo agency Muster & Sohn (fictional)',
    text: 'Demo station: moved from print to web; first CMS projects and templates (fictional).',
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
    title: 'Hardware (Demo)',
    items: [
      { name: 'Demo-Laptop 14″ (fiktiv)', text: 'Demo-Eintrag: mobiles Arbeitsgerät für Entwicklung und Texte.' },
      { name: 'Demo-Monitor 27″ (fiktiv)', text: 'Demo-Eintrag: Hauptbildschirm mit augenschonender Einstellung.' },
      { name: 'Demo-Tastatur (fiktiv)', text: 'Demo-Eintrag: leise Tastatur für lange Schreibtage.' },
    ],
  },
  {
    title: 'Software (Demo)',
    items: [
      { name: 'Demo-Editor (fiktiv)', text: 'Demo-Eintrag: Code-Editor mit wenigen, aber sitzenden Erweiterungen.' },
      { name: 'Demo-Browser (fiktiv)', text: 'Demo-Eintrag: Hauptbrowser mit getrennten Profilen für Arbeit und Tests.' },
      { name: 'Demo-Notizen (fiktiv)', text: 'Demo-Eintrag: Ablage für Entwürfe, Checklisten und Leseliste.' },
    ],
  },
  {
    title: 'Arbeitsweise (Demo)',
    items: [
      { name: 'Demo-Rhythmus (fiktiv)', text: 'Demo-Eintrag: Vormittags Tiefenarbeit, nachmittags Termine und Kleinkram.' },
      { name: 'Demo-Backups (fiktiv)', text: 'Demo-Eintrag: täglich automatisch, wöchentlich geprüft.' },
    ],
  },
];

const USES_EN: UsesGroup[] = [
  {
    title: 'Hardware (demo)',
    items: [
      { name: 'Demo laptop 14″ (fictional)', text: 'Demo entry: mobile machine for development and writing.' },
      { name: 'Demo monitor 27″ (fictional)', text: 'Demo entry: main display with eye-friendly settings.' },
      { name: 'Demo keyboard (fictional)', text: 'Demo entry: quiet keyboard for long desk days.' },
    ],
  },
  {
    title: 'Software (demo)',
    items: [
      { name: 'Demo editor (fictional)', text: 'Demo entry: code editor with few but fitting extensions.' },
      { name: 'Demo browser (fictional)', text: 'Demo entry: main browser with separate work and test profiles.' },
      { name: 'Demo notes (fictional)', text: 'Demo entry: drafts, checklists and reading list.' },
    ],
  },
  {
    title: 'Workflow (demo)',
    items: [
      { name: 'Demo rhythm (fictional)', text: 'Demo entry: deep work mornings, meetings and small tasks afternoons.' },
      { name: 'Demo backups (fictional)', text: 'Demo entry: automatic daily, verified weekly.' },
    ],
  },
];

export function usesByLang(lang: Lang): UsesGroup[] {
  return lang === 'de' ? USES_DE : USES_EN;
}
