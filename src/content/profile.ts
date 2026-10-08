/**
 * Zentrales Content-Modell yannick-beck.de (DE + EN) – EINE Quelle für Startseite, /cv,
 * /ueber-mich, /projekte, /leistungen, /uses, /content-status, llms.txt, JSON-LD und die
 * Markdown-Antworten (src/lib/markdown.ts).
 *
 * Belegregeln
 * - Jede Angabe trägt `quelle` und `status`:
 *     'belegt' = steht so (oder sinngleich gekürzt) in der Quelle,
 *     'offen'  = fehlt oder ist unbestätigt.
 * - Quellen (nur diese gelten):
 *     'linkedin'                                  LinkedIn-Export Profile.pdf vom 2026-10-08
 *                                                 (Abschrift: Zusammenfassung, Stationen,
 *                                                 Ausbildung, Sprachen, Zertifikate, Kenntnisse)
 *     'github:YannickBeck/Abgabe_Orbitalis'       README + Eigenleistungen/SUMMARY.md
 *     'github:YannickBeck/OrbitalisTicketSystem'  README (Vollrepo)
 *     'foto'                                      Porträtfotos des Nutzers (public/me/)
 * - Offene Angaben erscheinen nur in der Vorschau (NEXT_PUBLIC_SHOW_GAPS=1) als gestrichelter
 *   „OFFEN: …“-Platzhalter (src/components/gap.tsx), in Produktion gar nicht. Die
 *   Gesamtliste steht in GAPS (Seite /content-status).
 * - EN ist eine Übersetzung der belegten DE-Angaben – keine zusätzlichen Aussagen.
 * - Die Kontakt-E-Mail aus dem LinkedIn-Export erscheint NICHT (Nutzerentscheidung).
 *   Kontaktwege: LinkedIn + Kontaktformular.
 * - Nichts erfinden: keine weiteren Rollen, Kunden, Kennzahlen, Daten oder Eigenschaften.
 */

import { LINKEDIN_URL } from './links';

export type Lang = 'de' | 'en';
/** Zweisprachiger Wert. */
export type L<T = string> = Record<Lang, T>;

export type Quelle =
  | 'linkedin'
  | 'github:YannickBeck/Abgabe_Orbitalis'
  | 'github:YannickBeck/OrbitalisTicketSystem'
  | 'foto';

export type Status = 'belegt' | 'offen';

/** Herkunft einer Angabe. `fundstelle` = Abschnitt/Datei in der Quelle. */
export interface Beleg {
  quelle: Quelle;
  status: Status;
  fundstelle?: string;
}

/** Belegte Angabe mit Wert. */
export interface Fact<T = L> extends Beleg {
  status: 'belegt';
  value: T;
}

/** Offene Angabe: was fehlt (für Vorschau-Platzhalter und /content-status). */
export interface Open extends Omit<Beleg, 'quelle'> {
  status: 'offen';
  quelle?: Quelle;
  /** Lücken-ID aus GAPS. */
  gap: GapId;
}

export type Maybe<T = L> = Fact<T> | Open;

function li<T>(value: T, fundstelle?: string): Fact<T> {
  return { quelle: 'linkedin', status: 'belegt', value, fundstelle };
}

function gh<T>(repo: 'Abgabe_Orbitalis' | 'OrbitalisTicketSystem', value: T, fundstelle?: string): Fact<T> {
  return { quelle: `github:YannickBeck/${repo}`, status: 'belegt', value, fundstelle };
}

function open(gap: GapId, quelle?: Quelle): Open {
  return { status: 'offen', gap, quelle };
}

/** Wert einer Angabe oder null, wenn offen. */
export function known<T>(m: Maybe<T> | undefined): T | null {
  return m && m.status === 'belegt' ? m.value : null;
}

/** Zweisprachigen Wert auflösen. */
export function t<T>(value: L<T>, lang: Lang): T {
  return value[lang];
}

/* =====================================================================
 * Lücken (GAPS) – was fehlt, wo es gebraucht wird. /content-status listet alle.
 * ===================================================================== */

export type GapId =
  | 'cert-dates'
  | 'cert-en-title'
  | 'thesis-result'
  | 'thesis-period'
  | 'thesis-link'
  | 'orbitalis-context'
  | 'orbitalis-result'
  | 'orbitalis-media'
  | 'achievements'
  | 'services-offer'
  | 'uses'
  | 'blog-posts'
  | 'contact-delivery'
  | 'newsletter'
  | 'legal-imprint'
  | 'legal-privacy'
  | 'interests-private';

export interface GapEntry {
  id: GapId;
  /** Kurztext für den Platzhalter („OFFEN: …“). */
  label: L;
  /** Fundstelle(n) auf der Website. */
  where: L;
  /** Was benötigt wird (Format/Umfang). */
  need: L;
}

export const GAPS: GapEntry[] = [
  {
    id: 'cert-dates',
    label: { de: 'Ausstellungsdatum der Zertifikate', en: 'Issue dates of the certifications' },
    where: { de: 'Startseite (Werdegang), /cv', en: 'Homepage (career), /cv' },
    need: {
      de: 'Monat/Jahr je Zertifikat (der LinkedIn-Export enthält keine Daten)',
      en: 'Month/year per certification (the LinkedIn export has no dates)',
    },
  },
  {
    id: 'cert-en-title',
    label: {
      de: 'Offizieller englischer Titel des Microsoft-Zertifikats bestätigen',
      en: 'Confirm the official English title of the Microsoft certification',
    },
    where: { de: 'Englische Seiten (CV, Werdegang)', en: 'English pages (CV, career)' },
    need: {
      de: 'LinkedIn zeigt nur den deutschen Namen; vermutlich „Microsoft Certified: Information Security Administrator Associate“ – bitte bestätigen',
      en: 'LinkedIn only shows the German name; probably “Microsoft Certified: Information Security Administrator Associate” – please confirm',
    },
  },
  {
    id: 'thesis-result',
    label: { de: 'Ergebnis der Bachelorarbeit', en: 'Outcome of the bachelor’s thesis' },
    where: { de: 'Projekte, /projekte/bachelorarbeit', en: 'Projects, /en/projekte/bachelor-thesis' },
    need: {
      de: 'Kernergebnis/Fazit in 2–3 Sätzen (ohne vertrauliche Inhalte), ggf. Note',
      en: 'Key finding/conclusion in 2–3 sentences (no confidential content), grade optional',
    },
  },
  {
    id: 'thesis-period',
    label: { de: 'Bearbeitungszeitraum der Bachelorarbeit', en: 'Time frame of the bachelor’s thesis' },
    where: { de: '/projekte/bachelorarbeit', en: '/en/projekte/bachelor-thesis' },
    need: { de: 'Monat/Jahr Beginn und Abgabe', en: 'Start and submission month/year' },
  },
  {
    id: 'thesis-link',
    label: { de: 'Veröffentlichung oder Zusammenfassung der Bachelorarbeit', en: 'Publication or summary of the thesis' },
    where: { de: '/projekte/bachelorarbeit', en: '/en/projekte/bachelor-thesis' },
    need: { de: 'Link oder Freigabe für eine öffentliche Kurzfassung', en: 'Link or approval for a public summary' },
  },
  {
    id: 'orbitalis-context',
    label: { de: 'Rahmen des Orbitalis-Projekts (Modul/Hochschule, Team oder Einzelarbeit)', en: 'Context of the Orbitalis project (course, team or solo)' },
    where: { de: 'Projekte, /projekte/orbitalis', en: 'Projects, /en/projekte/orbitalis' },
    need: { de: 'Ein Satz zum Rahmen der Abgabe', en: 'One sentence on the submission context' },
  },
  {
    id: 'orbitalis-result',
    label: { de: 'Bewertung bzw. Rückmeldung zur Orbitalis-Abgabe', en: 'Assessment or feedback on the Orbitalis submission' },
    where: { de: '/projekte/orbitalis', en: '/en/projekte/orbitalis' },
    need: { de: 'Optional: Bewertung oder Einsatz nach der Abgabe', en: 'Optional: assessment or use after submission' },
  },
  {
    id: 'orbitalis-media',
    label: { de: 'Screenshot des laufenden Systems (AI-Draft im Ticket)', en: 'Screenshot of the running system (AI draft in a ticket)' },
    where: { de: 'Projekte (Cover), /projekte/orbitalis', en: 'Projects (cover), /en/projekte/orbitalis' },
    need: { de: '16:10, mind. 1280 × 800, ohne personenbezogene Daten', en: '16:10, min. 1280 × 800, no personal data' },
  },
  {
    id: 'achievements',
    label: { de: 'Belegbare Erfolge (Abschnitt „Erfolge“)', en: 'Verifiable achievements (section “Achievements”)' },
    where: { de: 'Startseite, Abschnitt 05', en: 'Homepage, section 05' },
    need: {
      de: 'Je Eintrag: kurze Aussage + Quelle (z. B. Abschluss, Auszeichnung, Kennzahl mit Beleg)',
      en: 'Per entry: short statement + source (e.g. degree, award, metric with evidence)',
    },
  },
  {
    id: 'services-offer',
    label: { de: 'Ob und welche Leistungen angeboten werden', en: 'Whether and which services are offered' },
    where: { de: '/leistungen', en: '/en/leistungen' },
    need: {
      de: 'Klären: reine Themenübersicht oder konkretes Angebot (Umfang, Rahmen, Verfügbarkeit)',
      en: 'Clarify: topic overview only or a concrete offer (scope, terms, availability)',
    },
  },
  {
    id: 'uses',
    label: { de: 'Werkzeuge und Setup', en: 'Tools and setup' },
    where: { de: '/uses', en: '/en/uses' },
    need: { de: 'Liste: Hardware, Software, Arbeitsweise – je Eintrag ein Satz', en: 'List: hardware, software, workflow – one sentence each' },
  },
  {
    id: 'blog-posts',
    label: { de: 'Eigene Blogbeiträge in Ghost', en: 'Own blog posts in Ghost' },
    where: { de: '/blog', en: '/en/blog' },
    need: {
      de: 'Ghost enthält bisher den Beispielbeitrag „Hallo Welt“; Projekt-Beispielbeitrag wird nicht gelistet',
      en: 'Ghost currently holds the sample post “Hello World”; the sample project post is not listed',
    },
  },
  {
    id: 'contact-delivery',
    label: {
      de: 'Versand des Kontaktformulars in der Produktion einrichten',
      en: 'Set up contact form delivery in production',
    },
    where: { de: '/kontakt, Startseite Abschnitt Kontakt', en: '/en/kontakt, homepage section Contact' },
    need: {
      de: 'Resend-Konto mit bestätigter Absender-Domain; CONTACT_RESEND_API_KEY, CONTACT_FROM und CONTACT_TO in der Deploy-Umgebung setzen (docs/kontaktformular.md). Bis dahin zeigt das Formular „Versand gerade nicht verfügbar“ mit LinkedIn-Weg.',
      en: 'Resend account with a verified sender domain; set CONTACT_RESEND_API_KEY, CONTACT_FROM and CONTACT_TO in the deploy environment (docs/kontaktformular.md). Until then the form shows “sending unavailable” with the LinkedIn route.',
    },
  },
  {
    id: 'newsletter',
    label: { de: 'Newsletter-Anmeldung in Ghost freischalten', en: 'Enable newsletter signup in Ghost' },
    where: { de: '/newsletter', en: '/en/newsletter' },
    need: { de: 'Ghost-Einstellung members_signup_access (derzeit nur Einladung)', en: 'Ghost setting members_signup_access (currently invite-only)' },
  },
  {
    id: 'legal-imprint',
    label: { de: 'Impressumsangaben', en: 'Imprint details' },
    where: { de: '/impressum', en: '/en/impressum' },
    need: { de: 'Name, ladungsfähige Anschrift, Kontaktweg – alle [eckigen Klammern] ersetzen', en: 'Name, postal address, contact – replace all [brackets]' },
  },
  {
    id: 'legal-privacy',
    label: { de: 'Datenschutzerklärung vervollständigen', en: 'Complete the privacy policy' },
    where: { de: '/datenschutz', en: '/en/datenschutz' },
    need: {
      de: 'Verantwortlicher, Hosting, Kontaktformular (Resend) – rechtlich prüfen lassen',
      en: 'Controller, hosting, contact form (Resend) – have it legally reviewed',
    },
  },
  {
    id: 'interests-private',
    label: { de: 'Persönliches abseits der Arbeit (optional)', en: 'Something personal beyond work (optional)' },
    where: { de: '/ueber-mich', en: '/en/ueber-mich' },
    need: { de: 'Optional 1–2 Sätze, nur wenn gewünscht', en: 'Optional 1–2 sentences, only if wanted' },
  },
];

export function gapById(id: GapId): GapEntry {
  const g = GAPS.find((x) => x.id === id);
  if (!g) {
    throw new Error(`Unbekannte Lücke: ${id}`);
  }
  return g;
}

/* =====================================================================
 * Person
 * ===================================================================== */

export { LINKEDIN_URL };

export const PERSON = {
  name: 'Yannick Beck',
  firstName: 'Yannick',
  /** Rolle laut Headline („IT Consultant“); Stationstitel schreibt „IT-Consultant“. */
  role: li<L>({ de: 'IT Consultant', en: 'IT Consultant' }, 'Headline'),
  /** Headline im Wortlaut. */
  headline: li(
    'IT Consultant | Microsoft Cloud & AI | Modern Workplace | Azure | Entra ID | Intune | Wirtschaftsinformatik – Sales & Consulting',
    'Headline',
  ),
  /** Zweite Zeile im Einstieg (Auszug aus der Headline). */
  focusLine: li<L>(
    { de: 'Microsoft Cloud & AI · Modern Workplace', en: 'Microsoft Cloud & AI · Modern Workplace' },
    'Headline',
  ),
  location: li<L>(
    { de: 'Sandhausen, Baden-Württemberg', en: 'Sandhausen, Baden-Württemberg, Germany' },
    'Kopf',
  ),
  address: li({ locality: 'Sandhausen', region: 'Baden-Württemberg', country: 'DE' }, 'Kopf'),
  linkedin: li(LINKEDIN_URL, 'Kopf'),
  /** Aktueller Arbeitgeber (Station „IT-Consultant“, seit Oktober 2026). */
  employer: li('Bechtle Mannheim', 'Berufserfahrung'),
  /** „Seit 2020 bin ich im IT-Systemhaus-Umfeld tätig.“ */
  inIndustrySince: li(2020, 'Zusammenfassung'),
  industry: li<L>(
    { de: 'IT-Systemhaus-Umfeld', en: 'IT systems integration' },
    'Zusammenfassung',
  ),
};

/**
 * Begrüßung im Abschnitt „Über mich“ (Vorname belegt; Formulierung = Seitenstimme).
 * *Wort* = Akzent-Serif (src/components/emphasis.tsx).
 */
export const GREETING: L = { de: 'Hallo, ich bin *Yannick*.', en: 'Hi, I’m *Yannick*.' };

/**
 * Kurzvorstellung (Startseite 01): LinkedIn-Zusammenfassung, gekürzt – Yannicks Wortlaut,
 * nur Sätze ausgelassen bzw. zusammengezogen.
 */
export const INTRO: Fact<L<string[]>> = li(
  {
    de: [
      'Microsoft Cloud, Modern Workplace und Künstliche Intelligenz bilden meine fachlichen Schwerpunkte. Seit 2020 bin ich im IT-Systemhaus-Umfeld tätig – von der Ausbildung zum Fachinformatiker für Systemintegration bis zum Bachelor in Wirtschaftsinformatik mit der Studienrichtung Sales & Consulting.',
      'Mich interessiert nicht nur, ob eine Technologie technisch funktioniert, sondern welchen konkreten Mehrwert sie für Unternehmen, Administratoren und Anwender schafft.',
    ],
    en: [
      'Microsoft Cloud, Modern Workplace and artificial intelligence are my core areas. I have worked in IT systems integration since 2020 – from an apprenticeship as an IT specialist for system integration to a bachelor’s degree in business informatics with a focus on sales & consulting.',
      'I care not only about whether a technology works, but about the concrete value it creates for companies, administrators and users.',
    ],
  },
  'Zusammenfassung (gekürzt)',
);

/** Ausführlich (/ueber-mich): LinkedIn-Zusammenfassung im Wortlaut, in Absätze geteilt. */
export const ABOUT: Fact<L<string[]>> = li(
  {
    de: [
      'Microsoft Cloud, Modern Workplace und Künstliche Intelligenz bilden meine fachlichen Schwerpunkte. Seit 2020 bin ich im IT-Systemhaus-Umfeld tätig. Mein beruflicher Weg führte mich von der Ausbildung zum Fachinformatiker für Systemintegration bis zum Bachelorabschluss in Wirtschaftsinformatik mit der Studienrichtung Sales & Consulting.',
      'Mein technischer Fokus liegt insbesondere auf Microsoft 365, Microsoft Intune, Microsoft Entra ID, Azure, Endpoint Management sowie Identity & Security. Dabei beschäftige ich mich sowohl mit der Konzeption als auch mit der technischen Umsetzung moderner Microsoft-Cloud-Umgebungen.',
      'Ein weiterer Schwerpunkt liegt auf Künstlicher Intelligenz und Automatisierung. Besonders interessieren mich Generative AI, Large Language Models, Retrieval-Augmented Generation, AI Agents sowie die Frage, wie sich KI sinnvoll und sicher in bestehende Unternehmensprozesse und IT-Landschaften integrieren lässt.',
      'Durch meinen Hintergrund in Wirtschaftsinformatik verbinde ich technische Lösungen mit betriebswirtschaftlichen Anforderungen und einer beratungsorientierten Perspektive. Mich interessiert nicht nur, ob eine Technologie technisch funktioniert, sondern welchen konkreten Mehrwert sie für Unternehmen, Administratoren und Anwender schafft.',
    ],
    en: [
      'Microsoft Cloud, Modern Workplace and artificial intelligence are my core areas. I have worked in IT systems integration since 2020. My path led from an apprenticeship as an IT specialist for system integration to a bachelor’s degree in business informatics with a focus on sales & consulting.',
      'My technical focus is on Microsoft 365, Microsoft Intune, Microsoft Entra ID, Azure, endpoint management and identity & security. I work on both the design and the technical implementation of modern Microsoft cloud environments.',
      'Artificial intelligence and automation are a second focus. I am particularly interested in generative AI, large language models, retrieval-augmented generation, AI agents, and the question of how AI can be integrated sensibly and securely into existing business processes and IT landscapes.',
      'With my background in business informatics, I connect technical solutions with business requirements and a consulting perspective. I care not only about whether a technology works, but about the concrete value it creates for companies, administrators and users.',
    ],
  },
  'Zusammenfassung',
);

/** Schwerpunkte-Liste (LinkedIn, Ende der Zusammenfassung) – Eigennamen, in beiden Sprachen gleich. */
export const FOCUS_LIST: Fact<string[]> = li(
  [
    'Microsoft 365',
    'Microsoft Intune',
    'Microsoft Entra ID',
    'Microsoft Azure',
    'Modern Workplace',
    'Endpoint Management',
    'Identity & Security',
    'Conditional Access',
    'Generative AI',
    'LLMs',
    'RAG',
    'AI Automation',
    'IT Consulting',
    'Sales & Consulting',
  ],
  'Schwerpunkte',
);

/** Top-Kenntnisse laut LinkedIn. */
export const TOP_SKILLS: Fact<L<string[]>> = li(
  {
    de: ['Mobile-Device-Management', 'Cloud-Computing', 'Praktische Ausbildung'],
    en: ['Mobile device management', 'Cloud computing', 'Hands-on training'],
  },
  'Top-Kenntnisse',
);

/** Interessen (aus „Besonders interessieren mich …“). */
export const INTERESTS: Fact<L<string[]>> = li(
  {
    de: ['Generative AI', 'Large Language Models', 'Retrieval-Augmented Generation', 'AI Agents'],
    en: ['Generative AI', 'Large language models', 'Retrieval-augmented generation', 'AI agents'],
  },
  'Zusammenfassung',
);

export interface Language {
  name: L;
  level: L;
  /** Stufe im Export (LinkedIn-Skala, englisch). */
  levelOriginal: string;
  /** BCP-47-Code für JSON-LD. */
  code: string;
}

/**
 * Sprachen mit Niveau. Der Export nennt die LinkedIn-Stufen englisch; die deutsche Fassung
 * übersetzt die Stufe, ohne sie aufzuwerten.
 */
export const LANGUAGES: Fact<Language[]> = li(
  [
    { name: { de: 'Deutsch', en: 'German' }, level: { de: 'Muttersprache', en: 'Native' }, levelOriginal: 'Native or Bilingual', code: 'de' },
    {
      name: { de: 'Englisch', en: 'English' },
      level: { de: 'Fließend im Beruf', en: 'Professional working proficiency' },
      levelOriginal: 'Professional Working',
      code: 'en',
    },
    { name: { de: 'Spanisch', en: 'Spanish' }, level: { de: 'Grundkenntnisse', en: 'Elementary' }, levelOriginal: 'Elementary', code: 'es' },
  ],
  'Languages',
);

/* =====================================================================
 * Werdegang: Stationen, Ausbildung, Zertifikate
 * ===================================================================== */

/** Monat als 'JJJJ-MM'. */
export type YearMonth = `${number}-${number}`;

export interface Station extends Beleg {
  id: 'bechtle-consultant' | 'bechtle-studium' | 'bechtle-junior' | 'bechtle-ausbildung' | 'gebhardt';
  org: string;
  role: L;
  /** Kurzform der Rolle (Ausweiskarte, Startseite 01) – gekürzt aus `role`, nichts ergänzt. */
  short: L;
  start: YearMonth;
  /** null = heute */
  end: YearMonth | null;
  place?: L;
  /** Beschreibung (LinkedIn, Wortlaut). */
  summary?: L;
  points: L<string[]>;
  /** Satz nach den Stichpunkten (LinkedIn). */
  closing?: L;
  /** Abschlussarbeit (nur Studium). */
  thesis?: Thesis;
}

export interface Thesis {
  title: L;
  focus: L<string[]>;
  /** Verweis auf das Projekt (Detailseite). */
  projectId: ProjectId;
}

export const THESIS: Thesis = {
  title: {
    de: 'Untersuchung eines KI-Modells zur Unterstützung der Angebotserstellung im Presales-Prozess',
    en: 'Investigation of an AI model to support proposal creation in the presales process',
  },
  focus: {
    de: ['Generative AI', 'Retrieval-Augmented Generation (RAG)', 'Information Retrieval', 'Integration von KI in bestehende Presales-Prozesse'],
    en: ['Generative AI', 'Retrieval-augmented generation (RAG)', 'Information retrieval', 'Integrating AI into existing presales processes'],
  },
  projectId: 'bachelorarbeit',
};

const MANNHEIM: L = { de: 'Mannheim', en: 'Mannheim' };

export const STATIONS: Station[] = [
  {
    id: 'bechtle-consultant',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Berufserfahrung',
    org: 'Bechtle Mannheim',
    role: { de: 'IT-Consultant', en: 'IT Consultant' },
    short: { de: 'IT-Consultant', en: 'IT Consultant' },
    start: '2026-10',
    end: null,
    place: MANNHEIM,
    points: { de: [], en: [] },
  },
  {
    id: 'bechtle-studium',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Berufserfahrung',
    org: 'Bechtle Mannheim',
    role: {
      de: 'Duales Studium Wirtschaftsinformatik – Sales & Consulting',
      en: 'Dual study programme, Business Informatics – Sales & Consulting',
    },
    short: { de: 'Duales Studium Wirtschaftsinformatik', en: 'Dual study, business informatics' },
    start: '2023-10',
    end: '2026-10',
    place: MANNHEIM,
    summary: {
      de: 'Duales Studium der Wirtschaftsinformatik mit Schwerpunkt Sales & Consulting und Verbindung von technischem IT-Know-how, Beratung und betriebswirtschaftlichen Fragestellungen.',
      en: 'Dual degree in business informatics with a focus on sales & consulting, combining technical IT know-how, consulting and business questions.',
    },
    points: {
      de: [
        'Mitarbeit an IT-Consulting- und Presales-Themen',
        'Beschäftigung mit Cloud-Technologien, moderner IT-Infrastruktur und digitalen Lösungen',
        'Analyse und Optimierung von Geschäfts- und IT-Prozessen',
        'Konzeption und Bewertung technischer Lösungsansätze im Kundenkontext',
        'Vertiefung in Artificial Intelligence, Generative AI und datengetriebenen Anwendungen',
        'Verbindung technischer Anforderungen mit wirtschaftlichen und kundenspezifischen Zielsetzungen',
      ],
      en: [
        'Contributing to IT consulting and presales topics',
        'Working with cloud technologies, modern IT infrastructure and digital solutions',
        'Analysing and improving business and IT processes',
        'Designing and assessing technical solution approaches in a customer context',
        'Specialising in artificial intelligence, generative AI and data-driven applications',
        'Aligning technical requirements with economic and customer-specific goals',
      ],
    },
    thesis: THESIS,
  },
  {
    id: 'bechtle-junior',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Berufserfahrung („Junior Information Technology Consultant“)',
    org: 'Bechtle Mannheim',
    role: { de: 'Junior IT Consultant', en: 'Junior IT Consultant' },
    short: { de: 'Junior IT Consultant', en: 'Junior IT Consultant' },
    start: '2023-07',
    end: '2023-10',
    summary: {
      de: 'Unterstützung bei der Beratung, Konzeption und Umsetzung moderner IT-Arbeitsplatz- und Infrastruktur-Lösungen.',
      en: 'Supporting the consulting, design and implementation of modern workplace and infrastructure solutions.',
    },
    points: {
      de: [
        'Mitarbeit in IT-Consulting-Projekten',
        'Administration und Konfiguration von Microsoft Intune',
        'Unterstützung im Endpoint- und Device-Management',
        'Analyse technischer Kundenanforderungen und Entwicklung geeigneter Lösungsansätze',
        'Technische Dokumentation und Unterstützung bei der Implementierung von IT-Lösungen',
        'Zusammenarbeit mit Kunden und internen technischen Teams',
      ],
      en: [
        'Working on IT consulting projects',
        'Administering and configuring Microsoft Intune',
        'Supporting endpoint and device management',
        'Analysing technical customer requirements and developing suitable approaches',
        'Technical documentation and support in implementing IT solutions',
        'Working with customers and internal technical teams',
      ],
    },
  },
  {
    id: 'bechtle-ausbildung',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Berufserfahrung („Fachinformatiker Systemintegration“)',
    org: 'Bechtle Mannheim',
    role: {
      de: 'Ausbildung Fachinformatiker Systemintegration',
      en: 'Apprenticeship, IT specialist for system integration',
    },
    short: { de: 'Ausbildung Fachinformatiker', en: 'Apprenticeship, IT specialist' },
    start: '2020-08',
    end: '2023-07',
    place: MANNHEIM,
    summary: {
      de: 'Ausbildung zum Fachinformatiker für Systemintegration mit Schwerpunkt auf dem Aufbau, der Administration und dem Betrieb moderner IT-Infrastrukturen.',
      en: 'Apprenticeship as an IT specialist for system integration, focused on building, administering and operating modern IT infrastructure.',
    },
    points: {
      de: [
        'Installation und Administration von Client- und Serversystemen',
        'Einrichtung und Betreuung von Netzwerk- und IT-Infrastrukturen',
        'Fehleranalyse und Troubleshooting im IT-Betrieb',
        'Unterstützung bei Managed-Service- und Kundenprojekten',
        'Technische Dokumentation und Präsentation von Lösungen',
        'Unterstützung und Beratung von Anwendern und Kunden',
      ],
      en: [
        'Installing and administering client and server systems',
        'Setting up and maintaining network and IT infrastructure',
        'Fault analysis and troubleshooting in IT operations',
        'Supporting managed service and customer projects',
        'Technical documentation and presenting solutions',
        'Supporting and advising users and customers',
      ],
    },
    closing: {
      de: 'Aufbau eines breiten technischen Fundaments als Grundlage für die anschließende Tätigkeit im IT-Consulting und das Studium der Wirtschaftsinformatik.',
      en: 'A broad technical foundation for the subsequent work in IT consulting and the business informatics degree.',
    },
  },
  {
    id: 'gebhardt',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Berufserfahrung',
    org: 'GEBHARDT Fördertechnik GmbH',
    role: { de: 'Elektrotechniker – Automatisierung', en: 'Electrical engineering – automation' },
    short: { de: 'Elektrotechniker – Automatisierung', en: 'Electrical engineering – automation' },
    start: '2018-08',
    end: '2020-01',
    place: { de: 'Sinsheim', en: 'Sinsheim' },
    points: {
      de: ['Entwicklung: Projekte für automatisierte Lagersysteme', 'Werkstatt/Service: Einsatz als Service-Techniker'],
      en: ['Development: projects for automated storage systems', 'Workshop/service: deployed as a service technician'],
    },
  },
];

export interface Education extends Beleg {
  id: 'dhbw-wi' | 'wvss' | 'dhbw-et' | 'ess';
  school: string;
  degree: L;
  start: YearMonth;
  end: YearMonth;
}

export const EDUCATION: Education[] = [
  {
    id: 'dhbw-wi',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: 'Duale Hochschule Baden-Württemberg',
    degree: { de: 'Bachelor, Wirtschaftsinformatik – Sales & Consulting', en: 'Bachelor, Business Informatics – Sales & Consulting' },
    start: '2023-10',
    end: '2026-10',
  },
  {
    id: 'wvss',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: 'Werner-von-Siemens-Schule Mannheim',
    degree: { de: 'Fachinformatiker für Systemintegration', en: 'IT specialist for system integration (vocational school)' },
    start: '2020-08',
    end: '2023-07',
  },
  {
    id: 'dhbw-et',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: 'Duale Hochschule Baden-Württemberg',
    degree: { de: 'Elektrotechnik – Automation', en: 'Electrical engineering – automation' },
    start: '2018-08',
    end: '2020-01',
  },
  {
    id: 'ess',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: 'Ehrhart-Schott-Schule Schwetzingen',
    degree: { de: 'Abitur – Profil Technik und Management', en: 'Abitur (university entrance qualification) – technology and management profile' },
    start: '2015-09',
    end: '2018-07',
  },
];

export interface Certification extends Beleg {
  id: 'kpn' | 'ms-infosec';
  /** Name laut LinkedIn. lang = Sprache des Namens (für lang-Auszeichnung auf EN-Seiten). */
  name: L;
  nameLang: L<Lang>;
  issuer: string;
  date: Maybe<string>;
  /** Offizieller EN-Titel, falls unbestätigt. */
  enTitle?: Open;
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'ms-infosec',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Certifications',
    name: {
      de: 'Microsoft Zertifiziert: Mitarbeiter für Informationssicherheit-Administration',
      // EN-Seiten zeigen den belegten LinkedIn-Namen (deutsch, lang="de"), bis der offizielle
      // englische Titel bestätigt ist (cert-en-title).
      en: 'Microsoft Zertifiziert: Mitarbeiter für Informationssicherheit-Administration',
    },
    nameLang: { de: 'de', en: 'de' },
    issuer: 'Microsoft',
    date: open('cert-dates', 'linkedin'),
    enTitle: open('cert-en-title', 'linkedin'),
  },
  {
    id: 'kpn',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Certifications',
    name: { de: 'KPN Technical Accreditation Exam', en: 'KPN Technical Accreditation Exam' },
    nameLang: { de: 'en', en: 'en' },
    issuer: 'KPN',
    date: open('cert-dates', 'linkedin'),
  },
];

/* =====================================================================
 * Projekte (Nutzerentscheidung: genau diese zwei)
 * ===================================================================== */

export type ProjectId = 'orbitalis' | 'bachelorarbeit';

export interface ProjectLink {
  label: L;
  href: string;
  kind: 'source';
}

export interface Project {
  id: ProjectId;
  slug: L;
  title: L;
  /** Kurzer Titel für Streifen/Navigation. */
  shortTitle: L;
  /** Art des Projekts (Karten-Marke). */
  kind: L;
  /** Ein Satz für Karten und Meta-Description. */
  teaser: L;
  period: Maybe<L>;
  context: Maybe<L>;
  situation: Fact<L<string[]>>;
  contribution: Fact<L<string[]>>;
  result: Maybe<L<string[]>>;
  /** Technik/Themen als Tags (Eigennamen). */
  tags: string[];
  links: ProjectLink[];
  /** Fähigkeiten (SKILLS-IDs), die das Projekt belegt. */
  skills: SkillId[];
  /** Weitere offene Punkte (Vorschau). */
  gaps: GapId[];
  quellen: Quelle[];
}

export const PROJECTS: Project[] = [
  {
    id: 'orbitalis',
    slug: { de: 'orbitalis', en: 'orbitalis' },
    title: {
      de: 'Orbitalis – osTicket mit lokalem KI-Antwortassistenten',
      en: 'Orbitalis – osTicket with a local AI reply assistant',
    },
    shortTitle: { de: 'Orbitalis', en: 'Orbitalis' },
    kind: { de: 'Abgabeprojekt', en: 'Submission project' },
    teaser: {
      de: 'osTicket schreibt mit einem lokalen Sprachmodell und RAG Antwortentwürfe als interne Notiz – ohne Cloud-Abhängigkeit.',
      en: 'osTicket drafts replies as internal notes using a local language model and RAG – no cloud dependency.',
    },
    period: gh<L>('Abgabe_Orbitalis', { de: '2026', en: '2026' }, 'Repo-Metadaten: angelegt 23.02.2026 (Vollrepo) und 29.03.2026 (Abgabe)'),
    context: open('orbitalis-context'),
    situation: gh<L<string[]>>(
      'Abgabe_Orbitalis',
      {
        de: [
          'Ausgangspunkt war osTicket, ein Open-Source-Helpdesk, und das Plugin „AI Reply Assistant“ (sasabajic, v1.0.4) – ein einfacher LLM-Connector.',
          'Ziel: KI-gestützte Antwortvorschläge für Support-Tickets, vollständig lokal, ohne Cloud-Abhängigkeit und ohne Datenweitergabe an externe Dienste. Ein Agent prüft jeden Entwurf, bevor etwas an Kunden geht.',
        ],
        en: [
          'The starting point was osTicket, an open-source helpdesk, and the “AI Reply Assistant” plugin (sasabajic, v1.0.4) – a simple LLM connector.',
          'Goal: AI-assisted reply suggestions for support tickets, fully local, without cloud dependency and without sending data to external services. An agent reviews every draft before anything reaches a customer.',
        ],
      },
      'README, Eigenleistungen/SUMMARY.md',
    ),
    contribution: gh<L<string[]>>(
      'Abgabe_Orbitalis',
      {
        de: [
          'RAG-Service neu entwickelt: Python/FastAPI mit LlamaIndex und Ollama-Embeddings, Endpunkte /query, /health und /reindex, liest FAQs und Kategorien direkt aus der osTicket-Datenbank und indexiert Änderungen alle 5 Minuten neu.',
          'Plugin um 10 neue PHP-Klassen erweitert – darunter RAG-Client, Kontextaufbau, Antwort-Parser, PII-Redactor (E-Mail, Telefon, IBAN, IP), Rate-Limiter, Gating und Audit-Log.',
          'KB-Seeder geschrieben: schema-agnostisch, idempotent, befüllt die Wissensdatenbank mit 370 Artikeln.',
          'Installationsskript für Debian 13: baut das System in 9 Schritten auf und prüft am Ende die KI-Kette (RAG-Abfrage und JSON-Antwort des Modells).',
        ],
        en: [
          'Built a new RAG service: Python/FastAPI with LlamaIndex and Ollama embeddings, endpoints /query, /health and /reindex; reads FAQs and categories straight from the osTicket database and re-indexes changes every 5 minutes.',
          'Extended the plugin with 10 new PHP classes – including a RAG client, context builder, response parser, PII redactor (email, phone, IBAN, IP), rate limiter, gating and audit log.',
          'Wrote a KB seeder: schema-agnostic, idempotent, fills the knowledge base with 370 articles.',
          'Install script for Debian 13: sets up the system in 9 steps and finally checks the AI chain (RAG query and the model’s JSON answer).',
        ],
      },
      'Eigenleistungen/SUMMARY.md',
    ),
    result: gh<L<string[]>>(
      'Abgabe_Orbitalis',
      {
        de: [
          'Zu einem Ticket erzeugt das System einen Antwortentwurf als interne Notiz – mit Quellen aus der Wissensdatenbank, vorgeschlagenen Tags und einer Konfidenz. Versendet wird nichts automatisch.',
          'Läuft lokal mit gemma3:4b und embeddinggemma über Ollama; 370 Dokumente indexiert.',
        ],
        en: [
          'For a ticket, the system creates a reply draft as an internal note – with sources from the knowledge base, suggested tags and a confidence value. Nothing is sent automatically.',
          'Runs locally with gemma3:4b and embeddinggemma via Ollama; 370 documents indexed.',
        ],
      },
      'README, Eigenleistungen/SUMMARY.md',
    ),
    tags: ['osTicket', 'PHP', 'Python', 'FastAPI', 'LlamaIndex', 'Ollama', 'RAG', 'MariaDB', 'Debian 13'],
    links: [
      {
        label: { de: 'Abgabe-Repository', en: 'Submission repository' },
        href: 'https://github.com/YannickBeck/Abgabe_Orbitalis',
        kind: 'source',
      },
      {
        label: { de: 'Vollrepo (osTicket mit Erweiterungen)', en: 'Full repository (osTicket with extensions)' },
        href: 'https://github.com/YannickBeck/OrbitalisTicketSystem',
        kind: 'source',
      },
    ],
    skills: ['rag', 'llm', 'genai', 'python', 'fastapi', 'llamaindex', 'ollama', 'osticket', 'php', 'mariadb', 'bash'],
    gaps: ['orbitalis-context', 'orbitalis-result', 'orbitalis-media'],
    quellen: ['github:YannickBeck/Abgabe_Orbitalis', 'github:YannickBeck/OrbitalisTicketSystem'],
  },
  {
    id: 'bachelorarbeit',
    slug: { de: 'bachelorarbeit', en: 'bachelor-thesis' },
    title: {
      de: 'Bachelorarbeit: KI-Modell für die Angebotserstellung im Presales',
      en: 'Bachelor’s thesis: an AI model for proposal creation in presales',
    },
    shortTitle: { de: 'Bachelorarbeit', en: 'Bachelor’s thesis' },
    kind: { de: 'Bachelorarbeit', en: 'Bachelor’s thesis' },
    teaser: {
      de: 'Untersuchung eines KI-Modells zur Unterstützung der Angebotserstellung im Presales-Prozess – mit Generative AI, RAG und Information Retrieval.',
      en: 'Investigating an AI model to support proposal creation in the presales process – with generative AI, RAG and information retrieval.',
    },
    period: open('thesis-period'),
    context: li<L>(
      {
        de: 'Abschlussarbeit im dualen Studium Wirtschaftsinformatik – Sales & Consulting (Bechtle Mannheim, Duale Hochschule Baden-Württemberg).',
        en: 'Final thesis of the dual degree in Business Informatics – Sales & Consulting (Bechtle Mannheim, Baden-Württemberg Cooperative State University).',
      },
      'Berufserfahrung → Duales Studium; Ausbildung',
    ),
    situation: li<L<string[]>>(
      {
        de: [
          'Titel: „Untersuchung eines KI-Modells zur Unterstützung der Angebotserstellung im Presales-Prozess“.',
          'Sie entstand im dualen Studium, in dem ich an IT-Consulting- und Presales-Themen mitgearbeitet und mich in Artificial Intelligence und Generative AI vertieft habe.',
        ],
        en: [
          'Title: “Investigation of an AI model to support proposal creation in the presales process”.',
          'It was written during the dual degree, in which I contributed to IT consulting and presales topics and specialised in artificial intelligence and generative AI.',
        ],
      },
      'Berufserfahrung → Duales Studium',
    ),
    contribution: li<L<string[]>>(
      {
        de: [
          'Schwerpunkte der Arbeit: Generative AI, Retrieval-Augmented Generation (RAG), Information Retrieval und die Integration von KI in bestehende Presales-Prozesse.',
        ],
        en: [
          'Focus of the thesis: generative AI, retrieval-augmented generation (RAG), information retrieval and integrating AI into existing presales processes.',
        ],
      },
      'Berufserfahrung → Duales Studium („Schwerpunkte der Arbeit“)',
    ),
    result: open('thesis-result'),
    tags: ['Generative AI', 'RAG', 'Information Retrieval', 'Presales'],
    links: [],
    skills: ['genai', 'rag', 'ir', 'presales'],
    gaps: ['thesis-period', 'thesis-result', 'thesis-link'],
    quellen: ['linkedin'],
  },
];

export function projectById(id: ProjectId): Project {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) {
    throw new Error(`Unbekanntes Projekt: ${id}`);
  }
  return p;
}

export function projectBySlug(slug: string, lang: Lang): Project | undefined {
  return PROJECTS.find((p) => p.slug[lang] === slug);
}

/* =====================================================================
 * Fähigkeiten (Periodensystem) – abgeleitet aus LinkedIn und Orbitalis.
 * Keine Bewertungen (keine Prozent, keine Sterne): nur Beleg-Verweise.
 * ===================================================================== */

export type SkillCategory = 'cloud' | 'identity' | 'ai' | 'infra' | 'consulting' | 'build';

export const SKILL_CATEGORIES: { id: SkillCategory; label: L; short: L }[] = [
  { id: 'cloud', label: { de: 'Microsoft Cloud & Modern Workplace', en: 'Microsoft Cloud & Modern Workplace' }, short: { de: 'Cloud', en: 'Cloud' } },
  { id: 'identity', label: { de: 'Identity & Security', en: 'Identity & Security' }, short: { de: 'Identity', en: 'Identity' } },
  { id: 'ai', label: { de: 'KI & Automatisierung', en: 'AI & Automation' }, short: { de: 'KI', en: 'AI' } },
  { id: 'infra', label: { de: 'Infrastruktur & Betrieb', en: 'Infrastructure & Operations' }, short: { de: 'Betrieb', en: 'Operations' } },
  { id: 'consulting', label: { de: 'Beratung & Presales', en: 'Consulting & Presales' }, short: { de: 'Beratung', en: 'Consulting' } },
  { id: 'build', label: { de: 'Projekttechnik (Orbitalis)', en: 'Project stack (Orbitalis)' }, short: { de: 'Technik', en: 'Stack' } },
];

/** Profilstellen, die eine Fähigkeit belegen. */
export type ProfileRef = 'headline' | 'summary' | 'focus' | 'topSkills';

export type Evidence =
  | { kind: 'station'; id: Station['id'] }
  | { kind: 'education'; id: Education['id'] }
  | { kind: 'cert'; id: Certification['id'] }
  | { kind: 'project'; id: ProjectId }
  | { kind: 'profile'; id: ProfileRef };

export type SkillId =
  | 'm365' | 'intune' | 'azure' | 'modern-workplace' | 'endpoint' | 'mdm' | 'cloud-computing'
  | 'entra' | 'conditional-access' | 'identity-security' | 'infosec-admin'
  | 'genai' | 'llm' | 'rag' | 'agents' | 'ai-automation' | 'ir'
  | 'client-server' | 'network' | 'troubleshooting' | 'managed-services' | 'automation-tech'
  | 'consulting' | 'presales' | 'process-analysis' | 'solution-design' | 'documentation' | 'sales-consulting'
  | 'python' | 'fastapi' | 'llamaindex' | 'ollama' | 'osticket' | 'php' | 'bash' | 'mariadb';

export interface Skill extends Beleg {
  id: SkillId;
  /** Kürzel fürs Periodensystem (1–2 Zeichen, sprachneutral). */
  symbol: string;
  name: L;
  category: SkillCategory;
  evidence: Evidence[];
}

function skill(id: SkillId, symbol: string, name: L | string, category: SkillCategory, evidence: Evidence[], quelle: Quelle = 'linkedin'): Skill {
  return {
    id,
    symbol,
    name: typeof name === 'string' ? { de: name, en: name } : name,
    category,
    evidence,
    quelle,
    status: 'belegt',
  };
}

const P = (id: ProfileRef): Evidence => ({ kind: 'profile', id });
const S = (id: Station['id']): Evidence => ({ kind: 'station', id });
const E = (id: Education['id']): Evidence => ({ kind: 'education', id });
const C = (id: Certification['id']): Evidence => ({ kind: 'cert', id });
const PR = (id: ProjectId): Evidence => ({ kind: 'project', id });
const ORB: Quelle = 'github:YannickBeck/Abgabe_Orbitalis';

export const SKILLS: Skill[] = [
  // Microsoft Cloud & Modern Workplace
  skill('m365', 'Ms', 'Microsoft 365', 'cloud', [P('summary'), P('focus')]),
  skill('intune', 'In', 'Microsoft Intune', 'cloud', [P('headline'), P('summary'), S('bechtle-junior')]),
  skill('azure', 'Az', 'Microsoft Azure', 'cloud', [P('headline'), P('summary'), P('focus')]),
  skill('modern-workplace', 'Mw', 'Modern Workplace', 'cloud', [P('headline'), P('summary'), S('bechtle-junior')]),
  skill('endpoint', 'Ep', 'Endpoint Management', 'cloud', [P('summary'), S('bechtle-junior')]),
  skill('mdm', 'Md', { de: 'Mobile-Device-Management', en: 'Mobile device management' }, 'cloud', [P('topSkills'), S('bechtle-junior')]),
  skill('cloud-computing', 'Cc', { de: 'Cloud-Computing', en: 'Cloud computing' }, 'cloud', [P('topSkills'), S('bechtle-studium')]),
  // Identity & Security
  skill('entra', 'En', 'Microsoft Entra ID', 'identity', [P('headline'), P('summary'), P('focus')]),
  skill('conditional-access', 'Ca', 'Conditional Access', 'identity', [P('focus')]),
  skill('identity-security', 'Id', 'Identity & Security', 'identity', [P('summary'), P('focus')]),
  skill('infosec-admin', 'Is', { de: 'Informationssicherheit-Administration', en: 'Information security administration' }, 'identity', [C('ms-infosec')]),
  // KI & Automatisierung
  skill('genai', 'Ga', 'Generative AI', 'ai', [P('summary'), S('bechtle-studium'), PR('bachelorarbeit')]),
  skill('llm', 'Ll', { de: 'Large Language Models', en: 'Large language models' }, 'ai', [P('summary'), P('focus'), PR('orbitalis')]),
  skill('rag', 'Rg', 'Retrieval-Augmented Generation', 'ai', [P('summary'), P('focus'), PR('bachelorarbeit'), PR('orbitalis')]),
  skill('agents', 'Ag', 'AI Agents', 'ai', [P('summary')]),
  skill('ai-automation', 'Au', 'AI Automation', 'ai', [P('summary'), P('focus')]),
  skill('ir', 'Ir', 'Information Retrieval', 'ai', [PR('bachelorarbeit')]),
  // Infrastruktur & Betrieb
  skill('client-server', 'Cs', { de: 'Client- und Serversysteme', en: 'Client and server systems' }, 'infra', [S('bechtle-ausbildung')]),
  skill('network', 'Nw', { de: 'Netzwerk und IT-Infrastruktur', en: 'Network and IT infrastructure' }, 'infra', [S('bechtle-ausbildung'), S('bechtle-studium')]),
  skill('troubleshooting', 'Tr', { de: 'Fehleranalyse und Troubleshooting', en: 'Fault analysis and troubleshooting' }, 'infra', [S('bechtle-ausbildung')]),
  skill('managed-services', 'Ma', 'Managed Services', 'infra', [S('bechtle-ausbildung')]),
  skill('automation-tech', 'At', { de: 'Automatisierungstechnik', en: 'Automation engineering' }, 'infra', [S('gebhardt'), E('dhbw-et')]),
  // Beratung & Presales
  skill('consulting', 'Co', 'IT Consulting', 'consulting', [P('focus'), S('bechtle-junior'), S('bechtle-studium')]),
  skill('presales', 'Ps', 'Presales', 'consulting', [S('bechtle-studium'), PR('bachelorarbeit')]),
  skill('process-analysis', 'Pa', { de: 'Prozessanalyse', en: 'Process analysis' }, 'consulting', [S('bechtle-studium')]),
  skill('solution-design', 'Ko', { de: 'Lösungskonzeption', en: 'Solution design' }, 'consulting', [P('summary'), S('bechtle-studium'), S('bechtle-junior')]),
  skill('documentation', 'Do', { de: 'Technische Dokumentation', en: 'Technical documentation' }, 'consulting', [S('bechtle-ausbildung'), S('bechtle-junior'), PR('orbitalis')]),
  skill('sales-consulting', 'Sc', 'Sales & Consulting', 'consulting', [P('headline'), P('focus'), E('dhbw-wi')]),
  // Projekttechnik (Orbitalis, README/Eigenleistungen)
  skill('python', 'Py', 'Python', 'build', [PR('orbitalis')], ORB),
  skill('fastapi', 'Fa', 'FastAPI', 'build', [PR('orbitalis')], ORB),
  skill('llamaindex', 'Li', 'LlamaIndex', 'build', [PR('orbitalis')], ORB),
  skill('ollama', 'Ol', 'Ollama', 'build', [PR('orbitalis')], ORB),
  skill('osticket', 'Ot', 'osTicket', 'build', [PR('orbitalis')], ORB),
  skill('php', 'Ph', 'PHP', 'build', [PR('orbitalis')], ORB),
  skill('bash', 'Sh', 'Bash', 'build', [PR('orbitalis')], ORB),
  skill('mariadb', 'Db', 'MariaDB', 'build', [PR('orbitalis')], ORB),
];

export function skillById(id: SkillId): Skill {
  const s = SKILLS.find((x) => x.id === id);
  if (!s) {
    throw new Error(`Unbekannte Fähigkeit: ${id}`);
  }
  return s;
}

/* =====================================================================
 * Erfolge (Abschnitt 05) – derzeit keine belegbaren Einträge.
 * Neue Einträge hier anlegen: Abschnitt und Navigationspunkt erscheinen dann automatisch.
 * ===================================================================== */

export interface Achievement extends Beleg {
  id: string;
  /** Große Zeile (z. B. Abschluss, Auszeichnung, belegte Kennzahl). */
  title: L;
  /** Kurzer Kontext. */
  detail?: L;
}

export const ACHIEVEMENTS: Achievement[] = [];

/* =====================================================================
 * Schwerpunkte (/leistungen) – Themen aus dem Profil, kein erfundenes Angebot.
 * ===================================================================== */

export interface FocusArea {
  id: 'cloud' | 'identity' | 'ai' | 'consulting';
  title: L;
  /** Satz aus der Zusammenfassung bzw. den Stationen. */
  text: Fact<L>;
  skills: SkillId[];
}

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: 'cloud',
    title: { de: 'Microsoft Cloud & Modern Workplace', en: 'Microsoft Cloud & Modern Workplace' },
    text: li<L>(
      {
        de: 'Konzeption und technische Umsetzung moderner Microsoft-Cloud-Umgebungen – mit Fokus auf Microsoft 365, Intune, Azure und Endpoint Management.',
        en: 'Design and technical implementation of modern Microsoft cloud environments – focused on Microsoft 365, Intune, Azure and endpoint management.',
      },
      'Zusammenfassung',
    ),
    skills: ['m365', 'intune', 'azure', 'endpoint', 'mdm', 'modern-workplace'],
  },
  {
    id: 'identity',
    title: { de: 'Identity & Security', en: 'Identity & Security' },
    text: li<L>(
      {
        de: 'Microsoft Entra ID und Conditional Access als Teil des technischen Fokus; dazu die Zertifizierung zur Informationssicherheit-Administration.',
        en: 'Microsoft Entra ID and Conditional Access as part of the technical focus; plus the certification in information security administration.',
      },
      'Zusammenfassung, Schwerpunkte, Certifications',
    ),
    skills: ['entra', 'conditional-access', 'identity-security', 'infosec-admin'],
  },
  {
    id: 'ai',
    title: { de: 'KI & Automatisierung', en: 'AI & Automation' },
    text: li<L>(
      {
        de: 'Generative AI, Large Language Models, RAG und AI Agents – und die Frage, wie sich KI sinnvoll und sicher in bestehende Unternehmensprozesse und IT-Landschaften integrieren lässt.',
        en: 'Generative AI, large language models, RAG and AI agents – and how AI can be integrated sensibly and securely into existing business processes and IT landscapes.',
      },
      'Zusammenfassung',
    ),
    skills: ['genai', 'llm', 'rag', 'agents', 'ai-automation'],
  },
  {
    id: 'consulting',
    title: { de: 'IT-Consulting & Presales', en: 'IT consulting & presales' },
    text: li<L>(
      {
        de: 'Technische Lösungen mit betriebswirtschaftlichen Anforderungen verbinden: Kundenanforderungen analysieren, Lösungsansätze konzipieren und bewerten, Presales-Themen begleiten.',
        en: 'Connecting technical solutions with business requirements: analysing customer requirements, designing and assessing solution approaches, supporting presales topics.',
      },
      'Zusammenfassung, Stationen Junior IT Consultant und Duales Studium',
    ),
    skills: ['consulting', 'presales', 'process-analysis', 'solution-design', 'sales-consulting'],
  },
];

/* =====================================================================
 * Fotos (Quelle: foto) – vom Nutzer geliefert, Metadaten entfernt.
 * ===================================================================== */

export interface Photo extends Beleg {
  src: string;
  width: number;
  height: number;
  alt: L;
}

export const PHOTOS = {
  /** Original: lehnt unter einem Glasvordach, Sonne von links. */
  full: {
    src: '/me/portrait.webp',
    width: 1086,
    height: 1448,
    alt: {
      de: 'Yannick Beck in beiger Jacke und schwarzem Rollkragen, an einen Stahlträger unter einem Glasvordach gelehnt',
      en: 'Yannick Beck in a beige jacket and black turtleneck, leaning against a steel beam under a glass canopy',
    },
    quelle: 'foto',
    status: 'belegt',
  },
  /** Freigestellt bis Oberschenkel (Einstieg, am unteren Rand ansetzen). */
  cutout: {
    src: '/me/portrait-cutout.webp',
    width: 482,
    height: 974,
    alt: { de: 'Yannick Beck', en: 'Yannick Beck' },
    quelle: 'foto',
    status: 'belegt',
  },
  /** 4:5, Kopf und Schultern mit Hintergrund (Karten). */
  card: {
    src: '/me/portrait-card.webp',
    width: 420,
    height: 525,
    alt: { de: 'Porträt von Yannick Beck', en: 'Portrait of Yannick Beck' },
    quelle: 'foto',
    status: 'belegt',
  },
  /** Quadratischer Kopf-Ausschnitt (Avatar, JSON-LD). */
  avatar: {
    src: '/me/portrait-avatar.webp',
    width: 400,
    height: 400,
    alt: { de: 'Porträt von Yannick Beck', en: 'Portrait of Yannick Beck' },
    quelle: 'foto',
    status: 'belegt',
  },
} satisfies Record<string, Photo>;
