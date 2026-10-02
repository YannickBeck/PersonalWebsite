/**
 * Demo-Artikel (fiktiv, demo: true) — je Sprache 6 Stück, alle Bausteine:
 * Intro, Zwischenüberschriften, Bild, Liste, Zitat, Tabelle, Code.
 */
import type { Lang } from '@/i18n/dictionaries';
import { TOPIC_LABELS } from './demo';

export type ArticleBlock =
  | { type: 'intro'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'code'; title: string; language: string; code: string }
  | { type: 'image'; src: string; alt: string; caption?: string };

export interface DemoArticle {
  demo: true;
  slug: string;
  lang: Lang;
  translationSlug: string;
  title: string;
  excerpt: string;
  topics: string[];
  date: string;
  readingMinutes: number;
  image: string;
  blocks: ArticleBlock[];
}

const IMG = [
  '/placeholders/article-1.svg',
  '/placeholders/article-2.svg',
  '/placeholders/article-3.svg',
];

export const DEMO_ARTICLES: DemoArticle[] = [
  {
    demo: true,
    slug: 'demo-warum-eigene-website',
    lang: 'de',
    translationSlug: 'demo-why-own-website',
    title: 'Warum eine eigene Website?',
    excerpt:
      'Plattformen kommen und gehen — die eigene Website bleibt. Eine Einordnung in fünf Minuten.',
    topics: ['web'],
    date: '2026-09-10',
    readingMinutes: 5,
    image: IMG[0],
    blocks: [
      { type: 'intro', text: 'Dieser Artikel zeigt alle Bausteine des Blogs: Zwischenüberschriften, Bilder, Listen, Zitate, Tabellen und Codeblöcke mit Kopierfunktion.' },
      { type: 'heading', text: 'Reichweite ist geliehen' },
      { type: 'paragraph', text: 'Profile auf Plattformen erreichen viele Menschen, gehören aber nie ganz einem selbst: Regeln, Reichweite und Darstellung ändern sich ohne Vorwarnung. Die eigene Website ist der ruhige Gegenpol — langsam im Aufbau, stabil im Bestand.' },
      { type: 'image', src: IMG[0], alt: 'Abstraktion aus Linien und Kreisen', caption: 'Illustration' },
      { type: 'heading', text: 'Was eine gute Website ausmacht' },
      { type: 'list', items: ['Eine klare Positionierung auf der Startseite', 'Ladezeiten unter zwei Sekunden im Labor', 'Lesbare Typografie mit ausreichendem Kontrast', 'Ein Impressum, das kein Rätsel aufgibt'] },
      { type: 'quote', text: 'Man besitzt nur, was man selbst betreiben kann.' },
      { type: 'table', head: ['Kanal', 'Kontrolle', 'Aufwand'], rows: [['Eigene Website', 'voll', 'mittel'], ['Social-Media-Profil', 'gering', 'niedrig'], ['Newsletter', 'hoch', 'mittel']] },
      { type: 'code', title: 'sitemap.ts', language: 'typescript', code: 'export default async function sitemap() {\n  return [{ url: "https://example.test/" }];\n}' },
      { type: 'paragraph', text: 'Fazit: Wer langfristig sichtbar bleiben will, baut sich ein eigenes Zuhause im Netz — und nutzt Plattformen als Zubringer, nicht als Fundament.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-why-own-website',
    lang: 'en',
    translationSlug: 'demo-warum-eigene-website',
    title: 'Why Run Your Own Website?',
    excerpt:
      'Platforms come and go — your own website stays. An assessment in five minutes.',
    topics: ['web'],
    date: '2026-09-10',
    readingMinutes: 5,
    image: IMG[0],
    blocks: [
      { type: 'intro', text: 'This article shows every blog building block: subheadings, images, lists, quotes, tables and code blocks with copy buttons.' },
      { type: 'heading', text: 'Reach is borrowed' },
      { type: 'paragraph', text: 'Platform profiles reach many people but never fully belong to you: rules, reach and presentation change without warning. Your own website is the calm counterpart — slow to build, stable to keep.' },
      { type: 'image', src: IMG[0], alt: 'Abstraction of lines and circles', caption: 'Illustration' },
      { type: 'heading', text: 'What makes a good website' },
      { type: 'list', items: ['Clear positioning on the homepage', 'Load times under two seconds in the lab', 'Readable typography with sufficient contrast', 'An imprint that is no puzzle'] },
      { type: 'quote', text: 'You only own what you can operate yourself.' },
      { type: 'table', head: ['Channel', 'Control', 'Effort'], rows: [['Own website', 'full', 'medium'], ['Social profile', 'low', 'low'], ['Newsletter', 'high', 'medium']] },
      { type: 'code', title: 'sitemap.ts', language: 'typescript', code: 'export default async function sitemap() {\n  return [{ url: "https://example.test/" }];\n}' },
      { type: 'paragraph', text: 'Conclusion: anyone who wants lasting visibility builds a home on the web — and uses platforms as feeders, not foundations.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-ghost-headless',
    lang: 'de',
    translationSlug: 'demo-ghost-headless-en',
    title: 'Ghost als Headless-CMS',
    excerpt: 'Inhalte in Ghost pflegen, überall ausliefern — so funktioniert das Headless-Prinzip.',
    topics: ['cms', 'ghost'],
    date: '2026-09-12',
    readingMinutes: 6,
    image: IMG[1],
    blocks: [
      { type: 'intro', text: 'Ghost ist als Blog-System gestartet, eignet sich aber hervorragend als Headless-CMS: Die Redaktion arbeitet in einer vertrauten Oberfläche, das Frontend bleibt frei wählbar.' },
      { type: 'heading', text: 'Das Prinzip in Kürze' },
      { type: 'paragraph', text: 'Inhalte werden einmal gepflegt und über eine API in beliebig vielen Kanälen ausgespielt: Website, Newsletter und Feeds aus derselben Quelle. Diese Website nutzt genau dieses Muster.' },
      { type: 'list', items: ['Redaktion in Ghost, Auslieferung per Content-API', 'Vorschau und Freigabe bleiben erhalten', 'Mitglieder und Newsletter inklusive'] },
      { type: 'image', src: IMG[1], alt: 'CMS-Schema als Abstraktion', caption: 'Illustration' },
      { type: 'heading', text: 'Abfrage mit Filter' },
      { type: 'code', title: 'filter.ts', language: 'typescript', code: 'const posts = await api.posts.browse({\n  filter: "tag:project+tag:hash-lang-de",\n  include: "tags",\n});' },
      { type: 'quote', text: 'Trenne Pflege und Darstellung — beide Seiten werden einfacher.' },
      { type: 'table', head: ['Ansatz', 'Pflege', 'Freiheit'], rows: [['Klassisches Theme', 'einfach', 'gering'], ['Headless-API', 'einfach', 'hoch'], ['Eigenbau-CMS', 'aufwendig', 'maximal']] },
      { type: 'paragraph', text: 'Fazit: Für inhaltsgetriebene Seiten ist Headless der sweet spot zwischen Komfort und Kontrolle — sofern man das Frontend selbst betreiben will.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-ghost-headless-en',
    lang: 'en',
    translationSlug: 'demo-ghost-headless',
    title: 'Ghost as a Headless CMS',
    excerpt: 'Maintain content in Ghost, deliver it anywhere — how the headless principle works.',
    topics: ['cms', 'ghost'],
    date: '2026-09-12',
    readingMinutes: 6,
    image: IMG[1],
    blocks: [
      { type: 'intro', text: 'Ghost started as a blogging platform but works excellently as a headless CMS: editors keep a familiar UI while the frontend stays freely choosable.' },
      { type: 'heading', text: 'The principle in brief' },
      { type: 'paragraph', text: 'Content is maintained once and served through an API to any number of channels: website, newsletter and feeds from a single source. This site uses exactly that pattern.' },
      { type: 'list', items: ['Editing in Ghost, delivery via Content API', 'Preview and approvals preserved', 'Members and newsletter included'] },
      { type: 'image', src: IMG[1], alt: 'CMS schema as abstraction', caption: 'Illustration' },
      { type: 'heading', text: 'Querying with filters' },
      { type: 'code', title: 'filter.ts', language: 'typescript', code: 'const posts = await api.posts.browse({\n  filter: "tag:project+tag:hash-lang-en",\n  include: "tags",\n});' },
      { type: 'quote', text: 'Separate maintenance from presentation — both sides get simpler.' },
      { type: 'table', head: ['Approach', 'Maintenance', 'Freedom'], rows: [['Classic theme', 'easy', 'low'], ['Headless API', 'easy', 'high'], ['Custom CMS', 'costly', 'maximal']] },
      { type: 'paragraph', text: 'Conclusion: for content-driven sites, headless is the sweet spot between comfort and control — provided you want to operate the frontend yourself.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-automatisierung-alltag',
    lang: 'de',
    translationSlug: 'demo-automation-everyday',
    title: 'Automatisierung im Alltag',
    excerpt: 'Kleine Skripte, große Wirkung — drei Beispiele aus dem Arbeitsalltag.',
    topics: ['automation', 'tooling'],
    date: '2026-09-15',
    readingMinutes: 4,
    image: IMG[2],
    blocks: [
      { type: 'intro', text: 'Automatisierung muss nicht groß sein, um zu wirken. Die besten Kandidaten sind Aufgaben, die oft vorkommen, immer gleich ablaufen und niemanden klüger machen.' },
      { type: 'heading', text: 'Drei Beispiele' },
      { type: 'list', items: ['Nächtliches Backup mit Rotationsregel statt Handarbeit', 'Abhängigkeits-Updates mit automatischem Testlauf', 'Statusberichte, die sich aus Tickets selbst schreiben'] },
      { type: 'code', title: 'backup.sh', language: 'bash', code: '#!/bin/bash\nset -e\ntar czf "backup-$(date +%F).tar.gz" ./data\nfind ./backups -mtime +7 -delete' },
      { type: 'quote', text: 'Automatisiere erst beim dritten Mal — die ersten beiden Male lernst du die Aufgabe kennen.' },
      { type: 'table', head: ['Aufgabe', 'Häufigkeit', 'Ersparnis'], rows: [['Backup', 'täglich', '10 Min./Woche'], ['Updates', 'wöchentlich', '30 Min./Woche'], ['Berichte', 'wöchentlich', '1 Std./Woche']] },
      { type: 'image', src: IMG[2], alt: 'Pipeline als Abstraktion', caption: 'Illustration' },
      { type: 'paragraph', text: 'Fazit: Fang mit dem Ärgernis an, das dich wöchentlich Zeit kostet — nicht mit dem spannendsten Werkzeug.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-automation-everyday',
    lang: 'en',
    translationSlug: 'demo-automatisierung-alltag',
    title: 'Everyday Automation',
    excerpt: 'Small scripts, big impact — three examples from daily work.',
    topics: ['automation', 'tooling'],
    date: '2026-09-15',
    readingMinutes: 4,
    image: IMG[2],
    blocks: [
      { type: 'intro', text: 'Automation does not need to be big to matter. The best candidates are tasks that recur often, always run the same way, and make nobody smarter.' },
      { type: 'heading', text: 'Three examples' },
      { type: 'list', items: ['Nightly backup with rotation instead of manual work', 'Dependency updates with automatic test runs', 'Status reports that write themselves from tickets'] },
      { type: 'code', title: 'backup.sh', language: 'bash', code: '#!/bin/bash\nset -e\ntar czf "backup-$(date +%F).tar.gz" ./data\nfind ./backups -mtime +7 -delete' },
      { type: 'quote', text: 'Automate only the third time — the first two teach you the task.' },
      { type: 'table', head: ['Task', 'Frequency', 'Saved'], rows: [['Backup', 'daily', '10 min/week'], ['Updates', 'weekly', '30 min/week'], ['Reports', 'weekly', '1 hr/week']] },
      { type: 'image', src: IMG[2], alt: 'Pipeline as abstraction', caption: 'Illustration' },
      { type: 'paragraph', text: 'Conclusion: start with the annoyance that costs you time weekly — not with the most exciting tool.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-nextjs-rendering',
    lang: 'de',
    translationSlug: 'demo-nextjs-rendering-en',
    title: 'Rendering in Next.js verstehen',
    excerpt: 'Statisch, dynamisch, inkrementell — wann welche Rendering-Strategie passt.',
    topics: ['web', 'nextjs'],
    date: '2026-09-18',
    readingMinutes: 7,
    image: IMG[0],
    blocks: [
      { type: 'intro', text: 'Next.js bietet mehrere Rendering-Strategien. Die Wahl beeinflusst Ladezeit, Aktualität und Serverlast — dieser Artikel ordnet sie.' },
      { type: 'heading', text: 'Die drei Strategien' },
      { type: 'table', head: ['Strategie', 'Wann', 'Aktualität'], rows: [['Statisch (SSG)', 'Marketingseiten, Blog', 'per Revalidierung'], ['Dynamisch (SSR)', 'personalisierte Inhalte', 'pro Anfrage'], ['Inkrementell (ISR)', 'Kataloge, Feeds', 'Zeit- oder Event-Steuerung']] },
      { type: 'paragraph', text: 'Statische Seiten liefern am schnellsten aus, weil zur Anfragezeit nichts mehr berechnet wird. Der Preis: Inhalte altern, bis neu generiert wird.' },
      { type: 'heading', text: 'Revalidierung in der Praxis' },
      { type: 'code', title: 'page.tsx', language: 'typescript', code: 'export const revalidate = 60;\n\nexport default async function Page() {\n  const posts = await getPosts("de");\n  return <PostList posts={posts} />;\n}' },
      { type: 'list', items: ['Zeitsteuerung für Kataloge und Übersichten', 'Ereignissteuerung per Webhook bei Inhaltsänderung', 'Manuelle Freigabe für heikle Veröffentlichungen'] },
      { type: 'quote', text: 'Statisch ausliefern, gezielt aktualisieren — das ist der ganze Trick.' },
      { type: 'image', src: IMG[0], alt: 'Rendering-Schema als Abstraktion', caption: 'Illustration' },
      { type: 'paragraph', text: 'Fazit: Für die meisten inhaltsgetriebenen Seiten reicht statisch plus Revalidierung — dynamisches Rendering nur dort, wo Inhalte wirklich pro Anfrage anders sind.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-nextjs-rendering-en',
    lang: 'en',
    translationSlug: 'demo-nextjs-rendering',
    title: 'Understanding Rendering in Next.js',
    excerpt: 'Static, dynamic, incremental — which rendering strategy fits when.',
    topics: ['web', 'nextjs'],
    date: '2026-09-18',
    readingMinutes: 7,
    image: IMG[0],
    blocks: [
      { type: 'intro', text: 'Next.js offers several rendering strategies. The choice affects load time, freshness and server load — this article sorts them out.' },
      { type: 'heading', text: 'The three strategies' },
      { type: 'table', head: ['Strategy', 'When', 'Freshness'], rows: [['Static (SSG)', 'marketing pages, blog', 'via revalidation'], ['Dynamic (SSR)', 'personalized content', 'per request'], ['Incremental (ISR)', 'catalogs, feeds', 'time or event driven']] },
      { type: 'paragraph', text: 'Static pages deliver fastest because nothing is computed at request time. The price: content ages until regenerated.' },
      { type: 'heading', text: 'Revalidation in practice' },
      { type: 'code', title: 'page.tsx', language: 'typescript', code: 'export const revalidate = 60;\n\nexport default async function Page() {\n  const posts = await getPosts("en");\n  return <PostList posts={posts} />;\n}' },
      { type: 'list', items: ['Time-based for catalogs and overviews', 'Event-based via webhook on content change', 'Manual release for sensitive publications'] },
      { type: 'quote', text: 'Serve statically, refresh deliberately — that is the whole trick.' },
      { type: 'image', src: IMG[0], alt: 'Rendering schema as abstraction', caption: 'Illustration' },
      { type: 'paragraph', text: 'Conclusion: static plus revalidation covers most content-driven sites — dynamic rendering only where content truly differs per request.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-content-modellierung',
    lang: 'de',
    translationSlug: 'demo-content-modeling',
    title: 'Inhalte modellieren statt sammeln',
    excerpt: 'Gute Websites entstehen am Datenmodell — Typen, Felder und Regeln vor dem ersten Artikel.',
    topics: ['cms'],
    date: '2026-09-20',
    readingMinutes: 5,
    image: IMG[1],
    blocks: [
      { type: 'intro', text: 'Die meisten CMS-Projekte scheitern nicht an Technik, sondern an Beliebigkeit: Alles ist irgendwie Text. Ein klares Content-Modell ändert das.' },
      { type: 'heading', text: 'Typen statt Töpfe' },
      { type: 'paragraph', text: 'Statt eines generischen „Inhalts" definiert man Typen mit Zweck: Projekt, Artikel, Person, Referenz. Jeder Typ bekommt genau die Felder, die seine Darstellung braucht — nicht mehr.' },
      { type: 'list', items: ['Pflichtfelder für Titelbild und Kurzbeschreibung', 'Einheitliche Slug-Regeln ohne Sonderfälle', 'Tags aus kontrolliertem Vokabular statt Freitext'] },
      { type: 'table', head: ['Typ', 'Pflichtfelder', 'Darstellung'], rows: [['Projekt', 'Cover, Zeitraum, Rolle', 'Karte + Detail'], ['Artikel', 'Teaser, Lesedauer', 'Liste + Artikel'], ['Person', 'Foto, Funktion', 'Portrait + Bio']] },
      { type: 'quote', text: 'Jedes optionale Feld, das niemand pflegt, ist ein kaputtes Layout von morgen.' },
      { type: 'code', title: 'schema.ts', language: 'typescript', code: 'interface Project {\n  slug: string;\n  cover: Image;      // required 16:10\n  outcomeOpen: boolean; // offenes Ergebnis erlaubt\n}' },
      { type: 'image', src: IMG[1], alt: 'Datenmodell als Abstraktion', caption: 'Illustration' },
      { type: 'paragraph', text: 'Fazit: Eine Stunde Modellierung spart zehn Stunden Aufräumen — und ist der Unterschied zwischen CMS und Content-Chaos.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-content-modeling',
    lang: 'en',
    translationSlug: 'demo-content-modellierung',
    title: 'Model Content Instead of Collecting It',
    excerpt: 'Good websites start at the data model — types, fields and rules before the first article.',
    topics: ['cms'],
    date: '2026-09-20',
    readingMinutes: 5,
    image: IMG[1],
    blocks: [
      { type: 'intro', text: 'Most CMS projects fail not on technology but on arbitrariness: everything is somehow text. A clear content model changes that.' },
      { type: 'heading', text: 'Types instead of buckets' },
      { type: 'paragraph', text: 'Instead of generic "content", define types with purpose: project, article, person, reference. Each type gets exactly the fields its presentation needs — no more.' },
      { type: 'list', items: ['Required fields for cover image and excerpt', 'Uniform slug rules without special cases', 'Tags from controlled vocabulary, not free text'] },
      { type: 'table', head: ['Type', 'Required fields', 'Presentation'], rows: [['Project', 'cover, period, role', 'card + detail'], ['Article', 'teaser, reading time', 'list + article'], ['Person', 'photo, role', 'portrait + bio']] },
      { type: 'quote', text: 'Every optional field nobody maintains is a broken layout tomorrow.' },
      { type: 'code', title: 'schema.ts', language: 'typescript', code: 'interface Project {\n  slug: string;\n  cover: Image;      // required 16:10\n  outcomeOpen: boolean; // open outcome allowed\n}' },
      { type: 'image', src: IMG[1], alt: 'Data model as abstraction', caption: 'Illustration' },
      { type: 'paragraph', text: 'Conclusion: one hour of modeling saves ten hours of cleanup — and separates CMS from content chaos.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-ci-cd-sideprojects',
    lang: 'de',
    translationSlug: 'demo-ci-cd-sideprojects-en',
    title: 'CI/CD für Nebenprojekte',
    excerpt: 'Tests, Vorschau-Umgebungen und ein Rollback-Plan — auch für Projekte mit einem Team von einer Person.',
    topics: ['automation', 'tooling'],
    date: '2026-09-22',
    readingMinutes: 6,
    image: IMG[2],
    blocks: [
      { type: 'intro', text: 'Continuous Delivery klingt nach Konzern, lohnt sich aber gerade bei Nebenprojekten: Dort fehlt die Zeit für Handarbeit — und Fehler fallen nachts auf.' },
      { type: 'heading', text: 'Das Mindestgerüst' },
      { type: 'list', items: ['Lint und Typcheck bei jedem Push', 'Tests vor dem Zusammenführen', 'Vorschau-URL pro Pull-Request', 'Ein-Klick-Rollback auf die Vorversion'] },
      { type: 'code', title: '.ci.yml', language: 'yaml', code: 'steps:\n  - lint\n  - typecheck\n  - test\n  - build\n  - preview # nur bei Grün' },
      { type: 'table', head: ['Schritt', 'Dauer', 'Nutzen'], rows: [['Lint+Typcheck', '2 Min.', 'Fehler vor Review'], ['Tests', '5 Min.', 'Schlaf bei Nacht'], ['Vorschau', '3 Min.', 'Feedback ohne Raten']] },
      { type: 'quote', text: 'Die beste Pipeline ist die, die man vergisst — bis sie einen Fehler fängt.' },
      { type: 'image', src: IMG[2], alt: 'Pipeline-Stufen als Abstraktion', caption: 'Illustration' },
      { type: 'paragraph', text: 'Fazit: Vier Schritte, einmal eingerichtet, hundertfach genutzt — die höchste Rendite pro investierter Stunde im gesamten Projekt.' },
    ],
  },
  {
    demo: true,
    slug: 'demo-ci-cd-sideprojects-en',
    lang: 'en',
    translationSlug: 'demo-ci-cd-sideprojects',
    title: 'CI/CD for Side Projects',
    excerpt: 'Tests, preview environments and a rollback plan — even for teams of one.',
    topics: ['automation', 'tooling'],
    date: '2026-09-22',
    readingMinutes: 6,
    image: IMG[2],
    blocks: [
      { type: 'intro', text: 'Continuous delivery sounds enterprise, but pays off especially for side projects: no time for manual work there — and failures strike at night.' },
      { type: 'heading', text: 'The minimum scaffold' },
      { type: 'list', items: ['Lint and typecheck on every push', 'Tests before merging', 'Preview URL per pull request', 'One-click rollback to the previous version'] },
      { type: 'code', title: '.ci.yml', language: 'yaml', code: 'steps:\n  - lint\n  - typecheck\n  - test\n  - build\n  - preview # only on green' },
      { type: 'table', head: ['Step', 'Duration', 'Benefit'], rows: [['Lint+typecheck', '2 min', 'bugs before review'], ['Tests', '5 min', 'sleep at night'], ['Preview', '3 min', 'feedback without guessing']] },
      { type: 'quote', text: 'The best pipeline is the one you forget — until it catches a bug.' },
      { type: 'image', src: IMG[2], alt: 'Pipeline stages as abstraction', caption: 'Illustration' },
      { type: 'paragraph', text: 'Conclusion: four steps, set up once, used a hundred times — the highest return per invested hour in the whole project.' },
    ],
  },
];

export function demoArticlesByLang(lang: Lang): DemoArticle[] {
  return DEMO_ARTICLES.filter((a) => a.lang === lang).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export function demoArticleBySlug(slug: string, lang: Lang): DemoArticle | undefined {
  return DEMO_ARTICLES.find((a) => a.slug === slug && a.lang === lang);
}

export function demoTopicsByLang(lang: Lang): { slug: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const a of DEMO_ARTICLES.filter((x) => x.lang === lang)) {
    for (const t of a.topics) {
      if (!seen.has(t)) {
        seen.set(t, TOPIC_LABELS[lang][t] ?? t);
      }
    }
  }
  return [...seen.entries()].map(([slug, label]) => ({ slug, label }));
}
