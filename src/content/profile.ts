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
  | 'station-en-role'
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
  | 'language-levels-de'
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
    id: 'station-en-role',
    label: {
      de: 'Englische Rollenbezeichnung bei GEBHARDT bestätigen',
      en: 'Confirm the English job title at GEBHARDT',
    },
    where: { de: 'Englische Seiten (Werdegang, CV)', en: 'English pages (career, CV)' },
    need: {
      de: 'LinkedIn nennt nur „Elektrotechniker – Automatisierung“. Die englischen Seiten zeigen „Electrical technician – automation“ (eigene Übersetzung, Rolle statt Fachgebiet) – bitte bestätigen oder die eigene Bezeichnung nennen.',
      en: 'LinkedIn only gives “Elektrotechniker – Automatisierung”. The English pages show “Electrical technician – automation” (own translation, a role rather than a field) – Yannick confirms it or names the title he prefers.',
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
    label: {
      de: 'Rahmen des Orbitalis-Projekts (Modul/Hochschule, Team oder Einzelarbeit, eigener Anteil)',
      en: 'Context of the Orbitalis project (course, team or solo, own share)',
    },
    where: { de: 'Projekte, /projekte/orbitalis', en: 'Projects, /en/projekte/orbitalis' },
    need: {
      de: 'Ein Satz zum Rahmen der Abgabe (Modul bzw. Hochschule), ob Einzel- oder Teamarbeit und welche Teile von Yannick stammen. Bis dahin heißt der Abschnitt „Was im Projekt neu gebaut wurde“.',
      en: 'One sentence on the submission context (course or university), whether it was solo or team work and which parts are Yannick’s. Until then the section is called “What the project added”.',
    },
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
    // Ohne feste Nummer: In Produktion fehlt der Abschnitt, 05 ist dort Kontakt (Feinschliff)
    where: { de: 'Startseite, Abschnitt Erfolge', en: 'Homepage, section Achievements' },
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
      de: 'Ghost enthält bisher den Beispielbeitrag „Hallo Welt“ (DE/EN) und den Ghost-Standardbeitrag „Coming soon“ (EN); der Projekt-Beispielbeitrag wird nicht gelistet. Bis zu eigenen Beiträgen stehen Blog und Newsletter nicht in Navigation, Footer und Sitemap (noindex, URLs erreichbar). Danach Beispielbeiträge in Ghost löschen und /blog, /newsletter aus UNLISTED_ROUTES (src/lib/routes.ts) nehmen.',
      en: 'Ghost currently holds the sample post “Hello World” (DE/EN) and Ghost’s default post “Coming soon” (EN); the sample project post is not listed. Until there are own posts, blog and newsletter are not in the navigation, footer or sitemap (noindex, URLs reachable). Then delete the sample posts in Ghost and remove /blog, /newsletter from UNLISTED_ROUTES (src/lib/routes.ts).',
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
      de: 'Resend-Konto mit bestätigter Absender-Domain; CONTACT_RESEND_API_KEY, CONTACT_FROM und CONTACT_TO zur Laufzeit setzen und mit NEXT_PUBLIC_CONTACT_FORM=1 neu bauen, danach Ende-zu-Ende-Test (docs/kontaktformular.md). Bis dahin zeigen Startseite und /kontakt nur LinkedIn mit dem Satz „Das Kontaktformular folgt noch“, Impressum und Datenschutz nennen kein Formular und /api/kontakt nimmt nichts an.',
      en: 'Resend account with a verified sender domain; set CONTACT_RESEND_API_KEY, CONTACT_FROM and CONTACT_TO at runtime, rebuild with NEXT_PUBLIC_CONTACT_FORM=1, then run an end-to-end test (docs/kontaktformular.md). Until then the homepage and /kontakt only show LinkedIn with “The contact form is still to come”, imprint and privacy policy do not mention a form and /api/kontakt accepts nothing.',
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
    need: {
      de: 'Ladungsfähige Anschrift und E-Mail-Adresse (§ 5 DDG verlangt eine – mit „keine öffentliche E-Mail“ abstimmen); ob die Angaben nach § 18 Abs. 2 MStV nötig sind; Impressumspflicht rechtlich prüfen. Eintragen an einer Stelle: LEGAL_PERSON in src/content/legal.ts (address, email, mstv; mstv: false, falls nicht nötig). Die Seite zeigt diese Punkte auch in Produktion als „OFFEN“.',
      en: 'Postal address and email address (§ 5 DDG requires one – reconcile with “no public email”); whether § 18 (2) MStV details are needed; check the imprint obligation legally. Entered in one place: LEGAL_PERSON in src/content/legal.ts (address, email, mstv; mstv: false if not needed). The page shows these items as “OPEN” in production too.',
    },
  },
  {
    id: 'legal-privacy',
    label: { de: 'Datenschutzerklärung vervollständigen', en: 'Complete the privacy policy' },
    where: { de: '/datenschutz', en: '/en/datenschutz' },
    need: {
      de: 'Verantwortliche Stelle (Anschrift, E-Mail; LEGAL_PERSON in src/content/legal.ts), Standort des Rechenzentrums, Auftragsverarbeitungsvertrag mit Hetzner und Speicherdauer der Server-Logs (in keiner Quelle belegt), bei Cloudflare Rechtsgrundlage, Übermittlung in die USA und Auftragsverarbeitungsvertrag (DPA), Stand der Analyse vor der Veröffentlichung – rechtlich prüfen lassen. Betroffenenrechte und Aufsichtsbehörde stehen seit 23.10.2026 im Text (Quellen in legal.ts). Mit freigeschaltetem Kontaktformular kommen Resend (Anbieter, Auftragsverarbeitung, Drittland), Speicherdauer und Rechtsgrundlage des Formulars dazu. Offene Punkte stehen auch in Produktion als „OFFEN“ auf der Seite.',
      en: 'Controller (address, email; LEGAL_PERSON in src/content/legal.ts), data centre location, data processing agreement with Hetzner and server log retention (not documented in any source), for Cloudflare the legal basis, the transfer to the USA and the data processing agreement (DPA), analytics status before publishing – have it legally reviewed. Data subject rights and the supervisory authority have been in the text since 23 Oct 2026 (sources in legal.ts). Once the contact form is enabled, Resend (provider, data processing agreement, third country), retention periods and the legal basis of the form are added. Open items are shown as “OPEN” on the page in production too.',
    },
  },
  {
    id: 'language-levels-de',
    label: { de: 'Deutsche Bezeichnung des Englisch-Niveaus', en: 'German label of the English level' },
    where: { de: 'Startseite (Kurz und knapp), /ueber-mich, /cv', en: 'German pages only' },
    need: {
      de: 'Der Export nennt „Professional Working“. Bitte die deutsche LinkedIn-Anzeige der Stufe nennen; bis dahin steht die wörtliche Übersetzung „berufliche Arbeitskenntnisse“.',
      en: 'The export says “Professional Working”. Please provide the German LinkedIn label of the level; until then the German pages use a literal translation.',
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
    'IT Consultant | Microsoft Cloud & AI | Modern Workplace | Azure | Entra ID | Intune | Wirtschaftsinformatik\u00a0– Sales & Consulting',
    'Headline',
  ),
  /** Zweite Zeile im Einstieg (Auszug aus der Headline): zwei Teile, im Einstieg je eine Zeile. */
  focusLine: li<L<string[]>>(
    { de: ['Microsoft Cloud & AI', 'Modern Workplace'], en: ['Microsoft Cloud & AI', 'Modern Workplace'] },
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
  /** EN: „IT service provider“ (Branche Systemhaus, alle Stationen seit 2020 bei Bechtle) – nicht
   *  „systems integration“, das wäre die Fachdisziplin (TEX9). */
  industry: li<L>(
    { de: 'IT-Systemhaus-Umfeld', en: 'IT service provider' },
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
      'Microsoft Cloud, Modern Workplace und Künstliche Intelligenz bilden meine fachlichen Schwerpunkte. Seit 2020 bin ich im IT-Systemhaus-Umfeld tätig. Mein Weg führte von der Ausbildung zum Fachinformatiker für Systemintegration bis zum Bachelor in Wirtschaftsinformatik mit der Studienrichtung Sales & Consulting.',
      'Mich interessiert nicht nur, ob eine Technologie technisch funktioniert, sondern welchen konkreten Mehrwert sie für Unternehmen, Administratoren und Anwender schafft.',
    ],
    en: [
      'Microsoft Cloud, Modern Workplace and artificial intelligence are my core areas. I have worked for an IT service provider since 2020. My path led from an apprenticeship as an IT specialist for system integration to a bachelor’s degree in business informatics with a focus on sales & consulting.',
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
      'Microsoft Cloud, Modern Workplace and artificial intelligence are my core areas. I have worked for an IT service provider since 2020. My path led from an apprenticeship as an IT specialist for system integration to a bachelor’s degree in business informatics with a focus on sales & consulting.',
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
      // wörtlich aus „Professional Working“; deutsche LinkedIn-Bezeichnung offen (language-levels-de, TEX13)
      level: { de: 'Berufliche Arbeitskenntnisse', en: 'Professional working proficiency' },
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
  /** EN-Rollenbezeichnung ist eine eigene Übersetzung, noch unbestätigt (Lücke station-en-role). */
  enRole?: Open;
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
      de: 'Duales Studium Wirtschaftsinformatik\u00a0– Sales & Consulting',
      en: 'Dual study programme, Business Informatics\u00a0– Sales & Consulting',
    },
    // weiche Trennstelle: auf der Ausweiskarte (≤ 320px) passte das Wort sonst nicht (A115)
    short: { de: 'Duales Studium Wirtschafts\u00ADinformatik', en: 'Dual study, business informatics' },
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
        'Deepening my knowledge of artificial intelligence, generative AI and data-driven applications',
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
    // EN: Rolle statt Fachgebiet (vorher „Electrical engineering – automation“, Jury Fix-Runde 3);
    // eigene Übersetzung, bis Yannick sie bestätigt (station-en-role)
    role: { de: 'Elektrotechniker\u00a0– Automatisierung', en: 'Electrical technician\u00a0– automation' },
    short: { de: 'Elektrotechniker\u00a0– Automatisierung', en: 'Electrical technician\u00a0– automation' },
    enRole: open('station-en-role', 'linkedin'),
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
  /** Name der Schule; EN einheitlich „Baden-Württemberg Cooperative State University (DHBW)“. */
  school: L;
  degree: L;
  start: YearMonth;
  end: YearMonth;
}

const DHBW: L = { de: 'Duale Hochschule Baden-Württemberg', en: 'Baden-Württemberg Cooperative State University (DHBW)' };

export const EDUCATION: Education[] = [
  {
    id: 'dhbw-wi',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: DHBW,
    degree: { de: 'Bachelor, Wirtschaftsinformatik\u00a0– Sales & Consulting', en: 'Bachelor, Business Informatics\u00a0– Sales & Consulting' },
    start: '2023-10',
    end: '2026-10',
  },
  {
    id: 'wvss',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: { de: 'Werner-von-Siemens-Schule Mannheim', en: 'Werner-von-Siemens-Schule Mannheim' },
    degree: { de: 'Fachinformatiker für Systemintegration', en: 'IT specialist for system integration (vocational school)' },
    start: '2020-08',
    end: '2023-07',
  },
  {
    id: 'dhbw-et',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: DHBW,
    degree: { de: 'Elektrotechnik\u00a0– Automation', en: 'Electrical engineering\u00a0– automation' },
    start: '2018-08',
    end: '2020-01',
  },
  {
    id: 'ess',
    quelle: 'linkedin',
    status: 'belegt',
    fundstelle: 'Ausbildung',
    school: { de: 'Ehrhart-Schott-Schule Schwetzingen', en: 'Ehrhart-Schott-Schule Schwetzingen' },
    degree: { de: 'Abitur\u00a0– Profil Technik und Management', en: 'Abitur (university entrance qualification)\u00a0– technology and management profile' },
    start: '2015-09',
    end: '2018-07',
  },
];

export interface Certification extends Beleg {
  id: 'kpn' | 'ms-infosec';
  /** Name laut LinkedIn. lang = Sprache des Namens (für lang-Auszeichnung auf EN-Seiten). */
  name: L;
  nameLang: L<Lang>;
  /** Kurzform ohne Aussteller (Ausweiskarte) – gekürzt aus `name`, nichts ergänzt. */
  short: L;
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
    short: { de: 'Informations\u00ADsicherheit-Administration', en: 'Informations\u00ADsicherheit-Administration' },
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
    short: { de: 'Technical Accreditation Exam', en: 'Technical Accreditation Exam' },
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

/**
 * Kurzfassung für das Projekt-Akkordeon der Startseite: ein Absatz und die Stichpunkte, gekürzt
 * aus den Belegen – nichts ergänzt. Ausgangslage und Ergebnis stehen auf der Detailseite
 * (Fix-Runde 3: die offene Orbitalis-Karte war ~1.150px hoch, bei offener Bachelorarbeit blieb
 * rund ein Drittel der festen Reihe leer).
 */
export interface ProjectBrief extends Beleg {
  /** Absatz unter dem Titel; fehlt → der Teaser des Projekts (Orbitalis). */
  summary?: L;
  points: L<string[]>;
  /**
   * Überschrift der Stichpunkte: 'added' = was im Projekt neu gebaut wurde (Orbitalis – wer
   * welchen Teil gebaut hat, ist offen: orbitalis-context, TEX2), 'focus' = Schwerpunkte
   * (Bachelorarbeit).
   */
  pointsLabel: 'added' | 'focus';
}

export interface Project {
  id: ProjectId;
  slug: L;
  /** Titel ohne die Art (die steht als Kennung davor: „Bachelorarbeit“, „Abgabeprojekt“). */
  title: L;
  /** Kurzer Titel für Streifen/Navigation. */
  shortTitle: L;
  /** Art des Projekts (Kennung bzw. Meta-Zeile). */
  kind: L;
  /** Ein bis zwei Sätze für Zeilen, Lede und Meta-Description. */
  teaser: L;
  /** Jahr/Zeitraum. 'submitted' = nur das Abgabejahr ist belegt (Feld „Abgabe“), 'period' = Zeitraum. */
  period: Maybe<L>;
  periodKind: 'period' | 'submitted';
  context: Maybe<L>;
  situation: Fact<L<string[]>>;
  /** Stichpunkte der Detailseite (Orbitalis: neu gebaute Teile; Bachelorarbeit: Schwerpunkte). */
  contribution: Fact<L<string[]>>;
  result: Maybe<L<string[]>>;
  brief: ProjectBrief;
  /** Technik/Themen als Tags (Eigennamen). */
  tags: string[];
  links: ProjectLink[];
  /** Fähigkeiten (SKILLS-IDs), die das Projekt belegt. */
  skills: SkillId[];
  /** Weitere offene Punkte (Vorschau). */
  gaps: GapId[];
  quellen: Quelle[];
}

/**
 * Ablauf von Orbitalis laut README („Wie funktioniert das System?“) – Grundlage der
 * Linienzeichnung (project-visual.tsx), solange es keinen Screenshot gibt (orbitalis-media).
 */
export const ORBITALIS_FLOW: Fact<L<{ step: string; tech?: string }[]>> = gh(
  'Abgabe_Orbitalis',
  {
    de: [
      { step: 'Ticket geht ein' },
      { step: 'Plugin analysiert den Kontext', tech: 'osTicket · PHP' },
      { step: 'RAG-Service sucht passende KB-Artikel', tech: 'FastAPI · LlamaIndex' },
      { step: 'Lokales Sprachmodell schreibt den Entwurf', tech: 'Ollama · gemma3:4b' },
      { step: 'Entwurf erscheint als interne Notiz' },
      { step: 'Support-Mitarbeiter prüft und sendet selbst' },
    ],
    en: [
      { step: 'A ticket comes in' },
      { step: 'The plugin analyses the context', tech: 'osTicket · PHP' },
      { step: 'The RAG service finds matching KB articles', tech: 'FastAPI · LlamaIndex' },
      { step: 'A local language model writes the draft', tech: 'Ollama · gemma3:4b' },
      { step: 'The draft appears as an internal note' },
      { step: 'A support agent reviews it and sends it manually' },
    ],
  },
  'README („Wie funktioniert das System?“, Komponenten)',
);

export const PROJECTS: Project[] = [
  {
    id: 'orbitalis',
    slug: { de: 'orbitalis', en: 'orbitalis' },
    title: {
      de: 'Orbitalis: osTicket mit lokalem KI-Antwortassistenten',
      en: 'Orbitalis: osTicket with a local AI reply assistant',
    },
    shortTitle: { de: 'Orbitalis', en: 'Orbitalis' },
    // „Submitted project“: abgegeben ist belegt (Commit „finalize submission“), eine Bewertung nicht (TEX15)
    kind: { de: 'Abgabeprojekt', en: 'Submitted project' },
    teaser: {
      de: 'Ein lokales Sprachmodell entwirft mit RAG Antworten auf Support-Tickets in osTicket und legt sie als interne Notiz ab. Alles läuft lokal, ohne Cloud-Dienst.',
      en: 'A local language model uses RAG to draft replies to osTicket support tickets and saves them as internal notes. Everything runs locally, with no cloud service.',
    },
    // Abgabejahr: Commit „docs: add AI Reply Assistant link and finalize submission“ vom 23.02.2026
    // im Vollrepo (TEX8) – kein Projektzeitraum belegt
    period: gh<L>('OrbitalisTicketSystem', { de: '2026', en: '2026' }, 'Commit „finalize submission“, 23.02.2026'),
    periodKind: 'submitted',
    context: open('orbitalis-context'),
    situation: gh<L<string[]>>(
      'Abgabe_Orbitalis',
      {
        de: [
          'Ausgangspunkt war osTicket, ein Open-Source-Helpdesk, und das Plugin „AI Reply Assistant“ (sasabajic, v1.0.4), ein einfacher LLM-Connector.',
          'Ziel: KI-gestützte Antwortvorschläge für Support-Tickets, vollständig lokal, ohne Cloud-Abhängigkeit und ohne Datenweitergabe an externe Dienste. Ein Support-Mitarbeiter prüft den Entwurf und schickt die Antwort selbst ab.',
        ],
        en: [
          'The starting point was osTicket, an open-source helpdesk, and the “AI Reply Assistant” plugin (sasabajic, v1.0.4), a simple LLM connector.',
          'Goal: AI-assisted reply suggestions for support tickets, fully local, without cloud dependency and without sending data to external services. A support agent reviews the draft and sends the reply manually.',
        ],
      },
      'README, Eigenleistungen/SUMMARY.md',
    ),
    // Nomen statt „ich habe …“: README_EIGENLEISTUNG nennt nicht, wer die Teile gebaut hat (TEX2)
    contribution: gh<L<string[]>>(
      'Abgabe_Orbitalis',
      {
        de: [
          'Neuer RAG-Service: Python/FastAPI mit LlamaIndex und Ollama-Embeddings, Endpunkte /query, /health und /reindex. Er liest FAQs und Kategorien direkt aus der osTicket-Datenbank und indexiert Änderungen alle 5 Minuten neu.',
          '10 neue PHP-Klassen im Plugin, darunter RAG-Client, Kontextaufbau, Antwort-Parser, PII-Redactor (E-Mail, Telefon, IBAN, IP), Rate-Limiter, Gating und Audit-Log.',
          'KB-Seeder: schema-agnostisch, idempotent, 370 Artikel für die Wissensdatenbank.',
          'Installationsskript für Debian 13: baut das System in 9 Schritten auf und prüft danach die KI-Kette (RAG-Abfrage und JSON-Antwort des Modells).',
        ],
        en: [
          'New RAG service: Python/FastAPI with LlamaIndex and Ollama embeddings, endpoints /query, /health and /reindex. It reads FAQs and categories straight from the osTicket database and re-indexes changes every 5 minutes.',
          '10 new PHP classes in the plugin, including a RAG client, context builder, response parser, PII redactor (email, phone, IBAN, IP), rate limiter, gating and audit log.',
          'KB seeder: schema-agnostic, idempotent, 370 articles for the knowledge base.',
          'Install script for Debian 13 that sets up the system in 9 steps and then checks the AI chain (RAG query and the model’s JSON response).',
        ],
      },
      'Eigenleistungen/SUMMARY.md',
    ),
    result: gh<L<string[]>>(
      'Abgabe_Orbitalis',
      {
        de: [
          'Zu einem Ticket erzeugt das System einen Antwortentwurf als interne Notiz, mit Quellen aus der Wissensdatenbank, vorgeschlagenen Tags und einer Konfidenz. Automatisch verschickt es nichts.',
          'Läuft lokal mit gemma3:4b und embeddinggemma über Ollama; 370 Dokumente indexiert.',
        ],
        en: [
          'For a ticket, the system creates a reply draft as an internal note, with sources from the knowledge base, suggested tags and a confidence value. Nothing is sent automatically.',
          'Runs locally with gemma3:4b and embeddinggemma via Ollama; 370 documents indexed.',
        ],
      },
      'README, Eigenleistungen/SUMMARY.md',
    ),
    // Absatz = Teaser (Ablauf und „sendet selbst“ zeigt die Grafik daneben)
    brief: {
      quelle: 'github:YannickBeck/Abgabe_Orbitalis',
      status: 'belegt',
      fundstelle: 'README, Eigenleistungen/SUMMARY.md (gekürzt)',
      points: {
        de: [
          'RAG-Service mit Python/FastAPI, LlamaIndex und Ollama-Embeddings',
          '10 neue PHP-Klassen im Plugin, u. a. PII-Redactor, Rate-Limiter und Audit-Log',
          'KB-Seeder, der die Wissensdatenbank mit 370 Artikeln befüllt',
          'Installationsskript für Debian 13, das danach die KI-Kette prüft',
        ],
        en: [
          'RAG service with Python/FastAPI, LlamaIndex and Ollama embeddings',
          '10 new PHP classes in the plugin, including a PII redactor, rate limiter and audit log',
          'KB seeder that fills the knowledge base with 370 articles',
          'Install script for Debian 13 that then checks the AI chain',
        ],
      },
      pointsLabel: 'added',
    },
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
    // Kurztitel ohne „Modell für …“ (klang nach selbst gebautem Modell, TEX11); der volle Titel
    // steht im Teaser (Lede) und im Titelblatt der Projekt-Grafik
    title: {
      de: 'KI-Unterstützung für Angebote im Presales',
      en: 'AI support for proposals in presales',
    },
    shortTitle: { de: 'Bachelorarbeit', en: 'Bachelor’s thesis' },
    kind: { de: 'Bachelorarbeit', en: 'Bachelor’s thesis' },
    teaser: {
      de: 'Untersuchung eines KI-Modells zur Unterstützung der Angebotserstellung im Presales-Prozess. Schwerpunkte: Generative AI, RAG und Information Retrieval.',
      en: 'An investigation of an AI model to support proposal creation in the presales process. Focus: generative AI, RAG and information retrieval.',
    },
    period: open('thesis-period'),
    periodKind: 'period',
    context: li<L>(
      {
        de: 'Abschlussarbeit im dualen Studium Wirtschaftsinformatik\u00a0– Sales & Consulting (Bechtle Mannheim, Duale Hochschule Baden-Württemberg).',
        en: 'Final thesis of the dual degree in Business Informatics\u00a0– Sales & Consulting at Bechtle Mannheim and the Baden-Württemberg Cooperative State University (DHBW).',
      },
      'Berufserfahrung → Duales Studium; Ausbildung',
    ),
    // ohne „Titel: …“ (voller Titel in der Lede) und ohne den Studiengang (steht unter „Rahmen“, DES8)
    situation: li<L<string[]>>(
      {
        de: [
          'Im dualen Studium habe ich an IT-Consulting- und Presales-Themen mitgearbeitet und mich in Artificial Intelligence und Generative AI vertieft.',
        ],
        en: [
          'During my dual degree, I contributed to IT consulting and presales topics and deepened my knowledge of artificial intelligence and generative AI.',
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
    brief: {
      quelle: 'linkedin',
      status: 'belegt',
      fundstelle: 'Berufserfahrung → Duales Studium (gekürzt)',
      // Der volle Titel steht im Akkordeon im Titelblatt der Projekt-Grafik (lesbarer Text); der
      // Teaser wiederholte ihn und die Schwerpunkte – deshalb ein eigener Absatz
      summary: {
        de: 'Abschlussarbeit im dualen Studium Wirtschaftsinformatik\u00a0– Sales & Consulting, in dem ich an IT-Consulting- und Presales-Themen mitgearbeitet habe.',
        en: 'Final thesis of the dual degree in Business Informatics\u00a0– Sales & Consulting, in which I contributed to IT consulting and presales topics.',
      },
      points: THESIS.focus,
      pointsLabel: 'focus',
    },
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
  // Kurzwort vorn (Fix-Runde 3, WCAG 2.5.3): Der Name der Filter-Pille beginnt mit dem sichtbaren Wort
  { id: 'infra', label: { de: 'Betrieb & Infrastruktur', en: 'Operations & Infrastructure' }, short: { de: 'Betrieb', en: 'Operations' } },
  { id: 'consulting', label: { de: 'Beratung & Presales', en: 'Consulting & Presales' }, short: { de: 'Beratung', en: 'Consulting' } },
  { id: 'build', label: { de: 'Technik (Orbitalis)', en: 'Stack (Orbitalis)' }, short: { de: 'Technik', en: 'Stack' } },
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
  | 'genai' | 'llm' | 'rag' | 'ai-automation' | 'ir'
  | 'client-server' | 'network' | 'troubleshooting' | 'managed-services' | 'automation-tech'
  | 'consulting' | 'presales' | 'process-analysis' | 'solution-design' | 'documentation' | 'sales-consulting'
  | 'python' | 'fastapi' | 'llamaindex' | 'ollama' | 'osticket' | 'php' | 'bash' | 'mariadb';

/**
 * Logos im Detailfeld des Periodensystems: einfarbige SVGs aus Simple Icons (über die Better-
 * Icons-CLI geholt) unter public/logos/<logo>.svg – nur Marken, deren Lizenz bzw. Richtlinie
 * die Verwendung erlaubt (Begründung je Logo: docs/skill-logos.md). Alle anderen Fähigkeiten
 * zeigen ihr Kürzel als Monogramm (z. B. Microsoft-Produkte: Logos nur mit Lizenz).
 */
export type SkillLogo = 'php' | 'fastapi';

/** Urheber und Lizenz je Logo – erscheint als Nachweis im Detailfeld (CC BY-SA verlangt ihn). */
export const SKILL_LOGOS: Record<SkillLogo, { credit: L; license: string; licenseUrl: string }> = {
  php: {
    credit: { de: 'Logo: Colin Viebrock, einfarbig angepasst', en: 'Logo: Colin Viebrock, single-colour adaptation' },
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  fastapi: {
    credit: { de: 'Logo: Sebastián Ramírez', en: 'Logo: Sebastián Ramírez' },
    license: 'MIT',
    licenseUrl: 'https://github.com/fastapi/fastapi/blob/master/LICENSE',
  },
};

export interface Skill extends Beleg {
  id: SkillId;
  /** Kürzel fürs Periodensystem (1–2 Zeichen, sprachneutral). */
  symbol: string;
  name: L;
  /** Kurzname auf der Kachel, wenn der Name zu lang ist (Abkürzung oder Eigenname aus dem Profil). */
  tile?: L;
  category: SkillCategory;
  evidence: Evidence[];
  logo?: SkillLogo;
}

function both(v: L | string): L {
  return typeof v === 'string' ? { de: v, en: v } : v;
}

function skill(
  id: SkillId,
  symbol: string,
  name: L | string,
  category: SkillCategory,
  evidence: Evidence[],
  opts: { quelle?: Quelle; tile?: L | string; logo?: SkillLogo } = {},
): Skill {
  return {
    id,
    symbol,
    name: both(name),
    tile: opts.tile === undefined ? undefined : both(opts.tile),
    category,
    evidence,
    logo: opts.logo,
    quelle: opts.quelle ?? 'linkedin',
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
  skill('intune', 'In', 'Microsoft Intune', 'cloud', [P('headline'), P('summary'), S('bechtle-junior')], { tile: 'Intune' }),
  skill('azure', 'Az', 'Microsoft Azure', 'cloud', [P('headline'), P('summary'), P('focus')], { tile: 'Azure' }),
  skill('modern-workplace', 'Mw', 'Modern Workplace', 'cloud', [P('headline'), P('summary'), S('bechtle-junior')]),
  skill('endpoint', 'Ep', 'Endpoint Management', 'cloud', [P('summary'), S('bechtle-junior')]),
  skill('mdm', 'Md', { de: 'Mobile-Device-Management', en: 'Mobile device management' }, 'cloud', [P('topSkills'), S('bechtle-junior')], { tile: 'MDM' }),
  skill('cloud-computing', 'Cc', { de: 'Cloud-Computing', en: 'Cloud computing' }, 'cloud', [P('topSkills'), S('bechtle-studium')]),
  // Identity & Security
  skill('entra', 'En', 'Microsoft Entra ID', 'identity', [P('headline'), P('summary'), P('focus')], { tile: 'Entra ID' }),
  skill('conditional-access', 'Ca', 'Conditional Access', 'identity', [P('focus')]),
  skill('identity-security', 'Id', 'Identity & Security', 'identity', [P('summary'), P('focus')]),
  skill('infosec-admin', 'Is', { de: 'Informationssicherheit-Administration', en: 'Information security administration' }, 'identity', [C('ms-infosec')], {
    tile: { de: 'Informations\u00ADsicherheit', en: 'Information security' },
  }),
  // KI & Automatisierung
  skill('genai', 'Ga', 'Generative AI', 'ai', [P('summary'), S('bechtle-studium'), PR('bachelorarbeit')]),
  skill('llm', 'Ll', { de: 'Large Language Models', en: 'Large language models' }, 'ai', [P('summary'), P('focus'), PR('orbitalis')], { tile: 'LLMs' }),
  skill('rag', 'Rg', 'Retrieval-Augmented Generation', 'ai', [P('summary'), P('focus'), PR('bachelorarbeit'), PR('orbitalis')], { tile: 'RAG' }),
  // AI Agents: laut Zusammenfassung nur ein Interesse („Besonders interessieren mich …“) – keine
  // Kachel, steht unter „Interessen“ (TEX4)
  skill('ai-automation', 'Au', 'AI Automation', 'ai', [P('summary'), P('focus')]),
  skill('ir', 'Ir', 'Information Retrieval', 'ai', [PR('bachelorarbeit')]),
  // Betrieb & Infrastruktur
  skill('client-server', 'Cs', { de: 'Client- und Serversysteme', en: 'Client and server systems' }, 'infra', [S('bechtle-ausbildung')], {
    tile: { de: 'Client & Server', en: 'Client & server' },
  }),
  skill('network', 'Nw', { de: 'Netzwerk und IT-Infrastruktur', en: 'Network and IT infrastructure' }, 'infra', [S('bechtle-ausbildung'), S('bechtle-studium')], {
    tile: { de: 'Netzwerk', en: 'Network' },
  }),
  skill('troubleshooting', 'Tr', { de: 'Fehleranalyse und Troubleshooting', en: 'Fault analysis and troubleshooting' }, 'infra', [S('bechtle-ausbildung')], {
    // weiche Trennstellen: im 8-Spalten-Raster brach das Wort sonst mitten im Wort (DES5)
    tile: 'Trouble\u00ADshooting',
  }),
  skill('managed-services', 'Ma', 'Managed Services', 'infra', [S('bechtle-ausbildung')]),
  skill('automation-tech', 'At', { de: 'Automatisierungstechnik', en: 'Automation engineering' }, 'infra', [S('gebhardt'), E('dhbw-et')], {
    // „Automatisierung“ wie in der Rolle bei GEBHARDT („Elektrotechniker – Automatisierung“):
    // „Automation“ stand direkt bei „Au – AI Automation“ und war verwechselbar (Fix-Runde 3);
    // „Automatisierungs-“ passt auch mit Trennstellen nicht in zwei Kachelzeilen (DES5)
    tile: { de: 'Automati\u00ADsierung', en: 'Automation engineering' },
  }),
  // Beratung & Presales
  skill('consulting', 'Co', 'IT Consulting', 'consulting', [P('focus'), S('bechtle-junior'), S('bechtle-studium')]),
  skill('presales', 'Ps', 'Presales', 'consulting', [S('bechtle-studium'), PR('bachelorarbeit')]),
  skill('process-analysis', 'Pa', { de: 'Prozessanalyse', en: 'Process analysis' }, 'consulting', [S('bechtle-studium')], {
    tile: { de: 'Prozess\u00ADanalyse', en: 'Process analysis' },
  }),
  skill('solution-design', 'Ko', { de: 'Lösungskonzeption', en: 'Solution design' }, 'consulting', [P('summary'), S('bechtle-studium'), S('bechtle-junior')], {
    tile: { de: 'Lösungs\u00ADkonzeption', en: 'Solution design' },
  }),
  skill('documentation', 'Do', { de: 'Technische Dokumentation', en: 'Technical documentation' }, 'consulting', [S('bechtle-ausbildung'), S('bechtle-junior'), PR('orbitalis')], {
    tile: { de: 'Dokumen\u00ADtation', en: 'Documen\u00ADtation' },
  }),
  skill('sales-consulting', 'Sc', 'Sales & Consulting', 'consulting', [P('headline'), P('focus'), E('dhbw-wi')]),
  // Technik (Orbitalis, README/Eigenleistungen)
  skill('python', 'Py', 'Python', 'build', [PR('orbitalis')], { quelle: ORB }),
  skill('fastapi', 'Fa', 'FastAPI', 'build', [PR('orbitalis')], { quelle: ORB, logo: 'fastapi' }),
  skill('llamaindex', 'Li', 'LlamaIndex', 'build', [PR('orbitalis')], { quelle: ORB }),
  skill('ollama', 'Ol', 'Ollama', 'build', [PR('orbitalis')], { quelle: ORB }),
  skill('osticket', 'Ot', 'osTicket', 'build', [PR('orbitalis')], { quelle: ORB }),
  skill('php', 'Ph', 'PHP', 'build', [PR('orbitalis')], { quelle: ORB, logo: 'php' }),
  skill('bash', 'Sh', 'Bash', 'build', [PR('orbitalis')], { quelle: ORB }),
  skill('mariadb', 'Db', 'MariaDB', 'build', [PR('orbitalis')], { quelle: ORB }),
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
        de: 'Konzeption und technische Umsetzung moderner Microsoft-Cloud-Umgebungen, vor allem mit Microsoft 365, Intune, Azure und Endpoint Management.',
        en: 'Design and technical implementation of modern Microsoft cloud environments, especially with Microsoft 365, Intune, Azure and endpoint management.',
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
        de: 'Zu meinem technischen Fokus gehören Microsoft Entra ID und Conditional Access. Außerdem habe ich die Microsoft-Zertifizierung zur Informationssicherheit-Administration abgelegt.',
        // „earned“ statt „hold“: Datum und Gültigkeit sind offen (cert-dates)
        en: 'My technical focus includes Microsoft Entra ID and Conditional Access. I have also earned the Microsoft certification in information security administration.',
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
        de: 'Ein weiterer Schwerpunkt ist KI und Automatisierung. Besonders interessieren mich Generative AI, Large Language Models, RAG und AI Agents und die Frage, wie sich KI sinnvoll und sicher in bestehende Unternehmensprozesse und IT-Landschaften integrieren lässt.',
        en: 'AI and automation are another focus. I am particularly interested in generative AI, large language models, RAG and AI agents, and in how AI can be integrated sensibly and securely into existing business processes and IT landscapes.',
      },
      'Zusammenfassung',
    ),
    skills: ['genai', 'llm', 'rag', 'ai-automation'],
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
    // nur, was der Freisteller zeigt (kein Stahlträger, kein Vordach – A119)
    alt: { de: 'Yannick Beck in beiger Jacke und schwarzem Rollkragen', en: 'Yannick Beck in a beige jacket and black turtleneck' },
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
