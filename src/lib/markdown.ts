/**
 * Markdown-Fassungen für Agenten (Accept: text/markdown → next.config rewrites → /api/md) und
 * llms.txt. Inhalte ausschließlich aus dem Content-Modell (profile.ts) bzw. Ghost – dieselben
 * belegten Angaben wie die HTML-Seiten, offene Angaben fehlen (wie in Produktion).
 */
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import {
  ABOUT,
  CERTIFICATIONS,
  EDUCATION,
  FOCUS_AREAS,
  FOCUS_LIST,
  INTERESTS,
  INTRO,
  LANGUAGES,
  LINKEDIN_URL,
  PERSON,
  PROJECTS,
  SKILLS,
  SKILL_CATEGORIES,
  STATIONS,
  projectBySlug,
  skillById,
  type Project,
} from '@/content/profile';
import { IMPRINT, LEGAL_OPEN, PRIVACY, type LegalDoc } from '@/content/legal';
import { formatPeriod } from '@/lib/period';
import { KNOWN_ROUTES } from '@/lib/routes';
import { getBySlug, getPosts, getProjectSlugs } from '@/lib/ghost';
import { projectFullTitle } from '@/content/profile-view';
import { sentenceList } from '@/lib/period';
import { CONTACT_FORM_ENABLED, contactPageLede } from '@/lib/contact-flag';

export const SITE = 'https://yannick-beck.de';

const abs = (path: string) => `${SITE}${path === '/' ? '/' : path}`;

function header(lang: Lang): string {
  return `# ${PERSON.name} – ${PERSON.role.value[lang]}\n\n> ${PERSON.headline.value}\n> ${PERSON.location.value[lang]}`;
}

function projectsMd(lang: Lang, level = '##'): string {
  const dict = getDictionary(lang);
  return [
    `${level} ${dict.pages.projekte.title}`,
    '',
    ...PROJECTS.map((p) => `- [${projectFullTitle(p, lang)}](${abs(withLang(`/projekte/${p.slug[lang]}`, lang))}): ${p.teaser[lang]}`),
  ].join('\n');
}

function careerMd(lang: Lang, detailed: boolean): string {
  const dict = getDictionary(lang);
  const out: string[] = [`## ${dict.cvStationsTitle}`, ''];
  for (const s of STATIONS) {
    out.push(`- **${s.role[lang]}**, ${s.org}${s.place ? `, ${s.place[lang]}` : ''} (${formatPeriod(s.start, s.end, lang)})`);
    if (detailed) {
      if (s.summary) {
        out.push(`  ${s.summary[lang]}`);
      }
      for (const pt of s.points[lang]) {
        out.push(`  - ${pt}`);
      }
      if (s.thesis) {
        const q = lang === 'de' ? ['„', '“'] : ['“', '”'];
        out.push(`  - ${dict.cvThesisLabel}: ${q[0]}${s.thesis.title[lang]}${q[1]} (${sentenceList(s.thesis.focus[lang], lang)})`);
      }
    }
  }
  out.push('', `## ${dict.cvEducationTitle}`, '');
  for (const e of EDUCATION) {
    out.push(`- ${e.degree[lang]}, ${e.school[lang]} (${formatPeriod(e.start, e.end, lang)})`);
  }
  out.push('', `## ${dict.cvCertsTitle}`, '');
  for (const c of CERTIFICATIONS) {
    out.push(`- ${c.name[lang]} (${c.issuer})`);
  }
  out.push('', `## ${dict.cvLanguagesTitle}`, '');
  for (const l of LANGUAGES.value) {
    out.push(`- ${l.name[lang]}: ${l.level[lang]}`);
  }
  return out.join('\n');
}

function contactMd(lang: Lang): string {
  const dict = getDictionary(lang);
  return [
    `## ${dict.contact}`,
    '',
    // ohne freigeschaltetes Formular (DES6) nur die Kontaktseite, kein „Kontaktformular“
    CONTACT_FORM_ENABLED
      ? `- ${lang === 'de' ? 'Kontaktformular' : 'Contact form'}: ${abs(withLang('/kontakt', lang))}`
      : `- ${lang === 'de' ? 'Kontaktseite' : 'Contact page'}: ${abs(withLang('/kontakt', lang))}`,
    `- LinkedIn: ${LINKEDIN_URL}`,
  ].join('\n');
}

export function homeMarkdown(lang: Lang): string {
  const dict = getDictionary(lang);
  const skills = SKILL_CATEGORIES.map(
    (c) => `- **${c.label[lang]}:** ${SKILLS.filter((s) => s.category === c.id).map((s) => s.name[lang]).join(', ')}`,
  );
  const other = lang === 'de' ? 'English version' : 'Deutsche Fassung';
  return [
    header(lang),
    '',
    INTRO.value[lang].join('\n\n'),
    '',
    `## ${dict.home.sections.skills.label}`,
    '',
    ...skills,
    '',
    projectsMd(lang),
    '',
    careerMd(lang, false),
    '',
    contactMd(lang),
    '',
    '---',
    '',
    `- ${dict.pages['ueber-mich'].title}: ${abs(withLang('/ueber-mich', lang))}`,
    `- ${dict.pages.cv.title}: ${abs(withLang('/cv', lang))}`,
    `- ${dict.pages.leistungen.title}: ${abs(withLang('/leistungen', lang))}`,
    `- ${other}: ${abs(withLang('/', lang === 'de' ? 'en' : 'de'))}`,
    `- llms.txt: ${SITE}/llms.txt`,
    '',
  ].join('\n');
}

function aboutMarkdown(lang: Lang): string {
  const dict = getDictionary(lang);
  return [
    `# ${dict.pages['ueber-mich'].title} – ${PERSON.name}`,
    '',
    ABOUT.value[lang].join('\n\n'),
    '',
    `## ${dict.aboutFocusTitle}`,
    '',
    FOCUS_LIST.value.join(' · '),
    '',
    `## ${dict.aboutInterestsTitle}`,
    '',
    INTERESTS.value[lang].join(' · '),
    '',
    contactMd(lang),
    '',
  ].join('\n');
}

function cvMarkdown(lang: Lang): string {
  const dict = getDictionary(lang);
  return [`# ${dict.pages.cv.title} – ${PERSON.name}`, '', `${PERSON.role.value[lang]} · ${PERSON.location.value[lang]} · ${LINKEDIN_URL}`, '', careerMd(lang, true), ''].join('\n');
}

function projectMarkdown(project: Project, lang: Lang): string {
  const dict = getDictionary(lang);
  const out = [`# ${projectFullTitle(project, lang)}`, '', project.teaser[lang], '', `## ${dict.sectionSituation}`, '', project.situation.value[lang].join('\n\n'), '', `## ${dict.sectionContribution}`, '', ...project.contribution.value[lang].map((c) => `- ${c}`)];
  if (project.result.status === 'belegt') {
    out.push('', `## ${dict.sectionOutcome}`, '', project.result.value[lang].join('\n\n'));
  }
  out.push('', `**${dict.factsStack}:** ${project.tags.join(', ')}`);
  for (const l of project.links) {
    out.push(`- ${l.label[lang]}: ${l.href}`);
  }
  out.push('');
  return out.join('\n');
}

function servicesMarkdown(lang: Lang): string {
  const dict = getDictionary(lang);
  const out = [`# ${dict.pages.leistungen.title} – ${PERSON.name}`, '', dict.pages.leistungen.lede, ''];
  for (const a of FOCUS_AREAS) {
    out.push(`## ${a.title[lang]}`, '', a.text.value[lang], '', `${dict.servicesSkills}: ${a.skills.map((id) => skillById(id).name[lang]).join(', ')}`, '');
  }
  out.push(contactMd(lang), '');
  return out.join('\n');
}

/** Rechtstexte aus src/content/legal.ts – offene Pflichtangaben wie auf der HTML-Seite als „OFFEN: …“. */
function legalMarkdown(doc: LegalDoc, title: string, lang: Lang): string {
  const out = [`# ${title}`, '', `> ${doc.notice[lang]}`, ''];
  for (const block of doc.blocks) {
    out.push(`## ${block.heading[lang]}`, '');
    for (const e of block.entries) {
      if (e.heading) {
        out.push(`### ${e.heading[lang]}`, '');
      }
      for (const t of e.text?.[lang] ?? []) {
        out.push(t, '');
      }
      for (const l of e.links ?? []) {
        out.push(`- ${l.label[lang]}: ${l.external ? l.href : abs(withLang(l.href, lang))}`);
      }
      if (e.links?.length) {
        out.push('');
      }
      if (e.open) {
        out.push(`${LEGAL_OPEN[lang]}: ${e.open[lang]}`, '');
      }
    }
  }
  return out.join('\n');
}

/** Werkzeuge aus Orbitalis (TEX17): Projekttechnik-Kacheln + Tags ohne Kachel, keine Konzepte wie RAG. */
export function usesTools(project: Project, lang: Lang): string[] {
  const tools = project.skills.map((id) => skillById(id)).filter((sk) => sk.category === 'build').map((sk) => (sk.tile ?? sk.name)[lang]);
  const names = new Set(project.skills.map((id) => skillById(id)).flatMap((sk) => [sk.name.de, sk.name.en].map((v) => v.toLowerCase())));
  return [...tools, ...project.tags.filter((t) => !names.has(t.toLowerCase()))];
}

function usesMarkdown(lang: Lang): string {
  const dict = getDictionary(lang);
  const orbitalis = PROJECTS.find((p) => p.id === 'orbitalis')!;
  return [
    `# ${dict.pages.uses.title}`,
    '',
    dict.pages.uses.lede,
    '',
    `${dict.usesFromProjects[0]}[${orbitalis.shortTitle[lang]}](${abs(withLang(`/projekte/${orbitalis.slug[lang]}`, lang))})${dict.usesFromProjects[1]}: ${usesTools(orbitalis, lang).join(', ')}`,
    '',
  ].join('\n');
}

function newsletterMarkdown(lang: Lang): string {
  const dict = getDictionary(lang);
  return [
    `# ${dict.pages.newsletter.title}`,
    '',
    dict.pages.newsletter.lede,
    '',
    dict.newsletterAlternatives,
    '',
    `- ${dict.blogRss}: ${abs(withLang('/rss.xml', lang))}`,
    `- LinkedIn: ${LINKEDIN_URL}`,
    '',
  ].join('\n');
}

/** Seiten ohne eigenes Markdown-Modell: Titel, Lede und Verweis auf die HTML-Fassung. */
function pointerMarkdown(path: string, lang: Lang): string | null {
  const dict = getDictionary(lang);
  const key = path.split('/').filter(Boolean)[0] as keyof typeof dict.pages | undefined;
  const page = key ? dict.pages[key] : undefined;
  if (!page) {
    return null;
  }
  const extra = key === 'kontakt' ? `\n\n${contactMd(lang)}` : '';
  const lede = key === 'kontakt' ? contactPageLede(lang) : page.lede;
  return `# ${page.title}\n\n${lede}${extra}\n\n${lang === 'de' ? 'HTML-Fassung' : 'HTML version'}: ${abs(withLang(path, lang))}\n`;
}

export function notFoundMarkdown(path: string, lang: Lang): string {
  return lang === 'de'
    ? `# 404 – Seite nicht gefunden\n\nUnter \`${path}\` gibt es auf yannick-beck.de keine Seite.\n\n- Startseite: ${SITE}/\n- Sitemap: ${SITE}/sitemap.xml\n- Überblick für Agenten: ${SITE}/llms.txt\n`
    : `# 404 – Page not found\n\nThere is no page at \`${path}\` on yannick-beck.de.\n\n- Homepage: ${SITE}/en\n- Sitemap: ${SITE}/sitemap.xml\n- Overview for agents: ${SITE}/llms.txt\n`;
}

/** Ghost-Beitrag: Titel, Auszug und ein klarer Verweis auf den Volltext (HTML). */
function ghostMd(post: { title?: string | null; custom_excerpt?: string | null; excerpt?: string | null }, bare: string, lang: Lang): string {
  const full = lang === 'de' ? 'Volltext' : 'Full text';
  return `# ${post.title ?? bare}\n\n${post.custom_excerpt || post.excerpt || ''}\n\n${full}: ${abs(withLang(bare, lang))}\n`;
}

/** Markdown zu einem Pfad (mit /en-Präfix) – null = unbekannt (404). */
export async function markdownFor(pathname: string): Promise<{ lang: Lang; body: string; noindex?: boolean } | null> {
  const lang: Lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de';
  const bare = (lang === 'en' ? pathname.replace(/^\/en/, '') : pathname).replace(/\/$/, '') || '/';
  const segs = bare.split('/').filter(Boolean);

  if (bare === '/') {
    return { lang, body: homeMarkdown(lang) };
  }
  if (bare === '/ueber-mich') {
    return { lang, body: aboutMarkdown(lang) };
  }
  if (bare === '/cv') {
    return { lang, body: cvMarkdown(lang) };
  }
  if (bare === '/leistungen') {
    return { lang, body: servicesMarkdown(lang) };
  }
  if (bare === '/projekte') {
    return { lang, body: `${projectsMd(lang, '#')}\n` };
  }
  if (segs[0] === 'projekte' && segs.length === 2) {
    const project = projectBySlug(segs[1], lang);
    if (project) {
      return { lang, body: projectMarkdown(project, lang) };
    }
    // Wie die HTML-Route (PER5): nur Ghost-Beiträge mit Tag „project“ der Sprache – und die
    // sind dort noindex (Nutzerentscheidung: nur zwei Projekte), also auch hier
    if (!(await getProjectSlugs(lang)).includes(segs[1])) {
      return null;
    }
    const post = await getBySlug(segs[1], lang);
    return post ? { lang, body: ghostMd(post, bare, lang), noindex: true } : null;
  }
  if (bare === '/blog') {
    const posts = await getPosts(lang);
    const dict = getDictionary(lang);
    const list = posts.map((p) => `- [${p.title ?? p.slug}](${abs(withLang(`/blog/${p.slug}`, lang))})${p.custom_excerpt ? ` – ${p.custom_excerpt}` : ''}`);
    return { lang, body: `# ${dict.pages.blog.title}\n\n${list.join('\n')}\n` };
  }
  if (segs[0] === 'blog' && segs.length === 2) {
    const post = await getBySlug(segs[1], lang);
    return post ? { lang, body: ghostMd(post, bare, lang) } : null;
  }
  if (bare === '/impressum' || bare === '/datenschutz') {
    const dict = getDictionary(lang);
    const doc = bare === '/impressum' ? IMPRINT : PRIVACY;
    return { lang, body: legalMarkdown(doc, dict.pages[bare === '/impressum' ? 'impressum' : 'datenschutz'].title, lang) };
  }
  if (bare === '/uses') {
    return { lang, body: usesMarkdown(lang) };
  }
  if (bare === '/newsletter') {
    return { lang, body: newsletterMarkdown(lang) };
  }
  if (bare === '/content-status') {
    const dict = getDictionary(lang);
    return { lang, body: `# ${dict.statusTitle}\n\n${dict.statusLede}\n\n${abs(withLang(bare, lang))}\n` };
  }
  if (KNOWN_ROUTES.has(bare)) {
    const body = pointerMarkdown(bare, lang);
    return body ? { lang, body } : null;
  }
  return null;
}
