/**
 * Ansichtshelfer für das Content-Modell (profile.ts): Links, Beleg-Beschriftungen,
 * Abschnittsliste der Startseite. Server- und Client-tauglich (keine Hooks).
 */
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { SHOW_GAPS } from '@/lib/gaps';
import {
  ACHIEVEMENTS,
  CERTIFICATIONS,
  EDUCATION,
  PROJECTS,
  STATIONS,
  type Evidence,
  type Project,
} from '@/content/profile';

export function projectHref(project: Project, lang: Lang): string {
  return withLang(`/projekte/${project.slug[lang]}`, lang);
}

const PROFILE_LABEL: Record<Lang, Record<string, string>> = {
  de: {
    headline: 'LinkedIn-Headline',
    summary: 'Profil-Zusammenfassung',
    focus: 'Schwerpunkte im Profil',
    topSkills: 'Top-Kenntnisse im Profil',
  },
  en: {
    headline: 'LinkedIn headline',
    summary: 'Profile summary',
    focus: 'Focus list in my profile',
    topSkills: 'Top skills in my profile',
  },
};

/** Beschriftung + Ziel eines Belegs (Station, Projekt, Zertifikat …). */
export function evidenceLink(ev: Evidence, lang: Lang): { label: string; href: string; kind: Evidence['kind'] } {
  switch (ev.kind) {
    case 'station': {
      const s = STATIONS.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: `${s.role[lang]} · ${s.org}`, href: `${withLang('/cv', lang)}#${s.id}` };
    }
    case 'education': {
      const e = EDUCATION.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: `${e.degree[lang]} · ${e.school}`, href: `${withLang('/cv', lang)}#${e.id}` };
    }
    case 'cert': {
      const c = CERTIFICATIONS.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: c.name[lang], href: `${withLang('/cv', lang)}#${c.id}` };
    }
    case 'project': {
      const p = PROJECTS.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: p.shortTitle[lang], href: projectHref(p, lang) };
    }
    case 'profile':
      return { kind: ev.kind, label: PROFILE_LABEL[lang][ev.id], href: withLang('/ueber-mich', lang) };
  }
}

export type HomeSectionKey = 'start' | 'about' | 'skills' | 'projects' | 'career' | 'achievements' | 'contact';

export interface HomeSectionInfo {
  key: HomeSectionKey;
  id: string;
  label: string;
  /** „00“, „01“ … – fortlaufend über die sichtbaren Abschnitte. */
  number: string;
}

/**
 * Abschnitte der Startseite in Reihenfolge. „Erfolge“ erscheint nur mit belegten Einträgen
 * (ACHIEVEMENTS) – in der Vorschau zusätzlich als Lücke. Nummern zählen die sichtbaren
 * Abschnitte, damit in Produktion keine Lücke in der Zählung entsteht.
 */
export function homeSections(lang: Lang): HomeSectionInfo[] {
  const s = getDictionary(lang).home.sections;
  const keys: HomeSectionKey[] = ['start', 'about', 'skills', 'projects', 'career'];
  if (ACHIEVEMENTS.length > 0 || SHOW_GAPS) {
    keys.push('achievements');
  }
  keys.push('contact');
  return keys.map((key, i) => ({ key, id: s[key].id, label: s[key].label, number: String(i).padStart(2, '0') }));
}

/** Karten-Daten (ContentCard) für ein Projekt aus dem Content-Modell. */
export function projectCard(project: Project, lang: Lang) {
  const year = project.period.status === 'belegt' ? project.period.value[lang] : null;
  return {
    kind: 'project' as const,
    slug: project.slug[lang],
    title: project.title[lang],
    href: projectHref(project, lang),
    excerpt: project.teaser[lang],
    image: null,
    demo: false,
    date: year ? `${year}-06-30T12:00:00.000Z` : undefined,
    category: project.id === 'orbitalis' ? 'automation' : undefined,
    categoryLabel: project.kind[lang],
    topics: project.tags.slice(0, 3).map((t) => ({ slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: t })),
  };
}
