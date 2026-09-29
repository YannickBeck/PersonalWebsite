export type Lang = 'de' | 'en';

export const LANGS: Lang[] = ['de', 'en'];
export const DEFAULT_LANG: Lang = 'de';

export function langFromPath(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de';
}

/** Pfad in die andere Sprache spiegeln: /projekte <-> /en/projekte */
export function mirrorPath(pathname: string, lang: Lang): string {
  const rest = langFromPath(pathname) === 'en' ? pathname.replace(/^\/en(\/|$)/, '/') : pathname;
  const clean = rest === '' ? '/' : rest;
  return lang === 'en' ? (clean === '/' ? '/en' : `/en${clean}`) : clean;
}

export function withLang(href: string, lang: Lang): string {
  return lang === 'en' ? (href === '/' ? '/en' : `/en${href}`) : href;
}

const de = {
  brand: 'Yannick Beck',
  nav: [
    { label: 'Projekte', href: '/projekte' },
    { label: 'Blog', href: '/blog' },
    { label: 'Leistungen', href: '/leistungen' },
    { label: 'CV', href: '/cv' },
    { label: 'Kontakt', href: '/kontakt' },
  ],
  switcherLabel: 'EN',
  switcherTarget: 'en' as Lang,
  homeEyebrow: 'Hallo, ich bin Yannick',
  homeTitle: 'Ich baue Software — und schreibe darüber.',
  homeLede:
    'Willkommen auf meiner persönlichen Website. Hier findest du ausgewählte Projekte, Artikel aus meinem Blog und Wege, mit mir in Kontakt zu treten.',
  homeTerminal: ['$ whoami', 'yannick-beck', '$ cat schwerpunkte.txt', 'Webentwicklung · CMS · Automatisierung'],
  homeStack: 'Gebaut mit Next.js · Astryx · Ghost',
  homeProjectsTitle: 'Ausgewählte Projekte',
  homeAllProjects: 'Alle Projekte',
  homePostsTitle: 'Neueste Artikel',
  homeAllPosts: 'Alle Artikel',
  homeContactTitle: 'Kontakt',
  relatedTitle: 'Das könnte dich auch interessieren',
  homeContactLede: 'Fragen, Feedback oder ein spannendes Projekt? Schreib mir.',
  viewProjects: 'Projekte ansehen',
  contact: 'Kontakt',
  searchLabel: 'Beiträge durchsuchen',
  searchPlaceholder: 'Suchen …',
  footer: '© 2026 Yannick Beck — gebaut mit Next.js, Astryx und Ghost.',
  pages: {
    projekte: {
      title: 'Projekte',
      lede: 'Auswahl meiner Arbeiten aus den letzten Jahren.',
      placeholder: 'Weitere Projekte folgen in Kürze.',
    },
    blog: {
      title: 'Blog',
      lede: 'Artikel und Notizen zu Software, CMS und Automatisierung.',
      placeholder: 'Weitere Artikel folgen in Kürze.',
    },
    leistungen: {
      title: 'Leistungen',
      lede: 'Wobei ich helfen kann — Details folgen.',
      items: ['Beratung', 'Umsetzung', 'Begleitung'],
    },
    cv: {
      title: 'CV',
      lede: 'Stationen, Talks und Publikationen — wird noch befüllt.',
      placeholder: 'Timeline folgt.',
    },
    'ueber-mich': {
      title: 'Über mich',
      lede: 'Kurzporträt — Text folgt.',
    },
    uses: {
      title: 'Uses',
      lede: 'Werkzeuge und Setup, mit denen ich arbeite — Liste folgt.',
    },
    kontakt: {
      title: 'Kontakt',
      lede: 'Am schnellsten per E-Mail. Ein Formular folgt.',
      cta: 'E-Mail schreiben',
    },
    newsletter: {
      title: 'Newsletter',
      lede: 'Neue Artikel per E-Mail — Anmeldung über Ghost folgt in Phase 4.',
    },
    impressum: {
      title: 'Impressum',
      lede: 'Angaben gemäß § 5 TMG — folgt.',
    },
    datenschutz: {
      title: 'Datenschutz',
      lede: 'Datenschutzerklärung — folgt.',
    },
  },
};

export type Dictionary = typeof de;

const en: Dictionary = {
  brand: 'Yannick Beck',
  nav: [
    { label: 'Projects', href: '/en/projekte' },
    { label: 'Blog', href: '/en/blog' },
    { label: 'Services', href: '/en/leistungen' },
    { label: 'CV', href: '/en/cv' },
    { label: 'Contact', href: '/en/kontakt' },
  ],
  switcherLabel: 'DE',
  switcherTarget: 'de' as Lang,
  homeEyebrow: "Hi, I'm Yannick",
  homeTitle: 'I build software — and write about it.',
  homeLede:
    'Welcome to my personal website. Here you find selected projects, articles from my blog and ways to get in touch.',
  homeTerminal: ['$ whoami', 'yannick-beck', '$ cat focus.txt', 'Web development · CMS · Automation'],
  homeStack: 'Built with Next.js · Astryx · Ghost',
  homeProjectsTitle: 'Selected projects',
  homeAllProjects: 'All projects',
  homePostsTitle: 'Latest articles',
  homeAllPosts: 'All articles',
  homeContactTitle: 'Contact',
  relatedTitle: 'You might also like',
  homeContactLede: 'Questions, feedback or an exciting project? Write me.',
  viewProjects: 'View projects',
  contact: 'Contact',
  searchLabel: 'Search posts',
  searchPlaceholder: 'Search …',
  footer: '© 2026 Yannick Beck — built with Next.js, Astryx and Ghost.',
  pages: {
    projekte: {
      title: 'Projects',
      lede: 'Selected work from recent years.',
      placeholder: 'More projects coming soon.',
    },
    blog: {
      title: 'Blog',
      lede: 'Articles and notes on software, CMS and automation.',
      placeholder: 'More articles coming soon.',
    },
    leistungen: {
      title: 'Services',
      lede: 'How I can help — details to follow.',
      items: ['Consulting', 'Implementation', 'Support'],
    },
    cv: {
      title: 'CV',
      lede: 'Positions, talks and publications — to be filled in.',
      placeholder: 'Timeline follows.',
    },
    'ueber-mich': {
      title: 'About me',
      lede: 'Short portrait — text to follow.',
    },
    uses: {
      title: 'Uses',
      lede: 'Tools and setup I work with — list to follow.',
    },
    kontakt: {
      title: 'Contact',
      lede: 'Fastest via email. A form will follow.',
      cta: 'Write email',
    },
    newsletter: {
      title: 'Newsletter',
      lede: 'New articles by email — Ghost signup follows in phase 4.',
    },
    impressum: {
      title: 'Imprint',
      lede: 'Legal notice — to follow.',
    },
    datenschutz: {
      title: 'Privacy',
      lede: 'Privacy policy — to follow.',
    },
  },
};

export const dictionaries: Record<Lang, Dictionary> = { de, en };
export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}
