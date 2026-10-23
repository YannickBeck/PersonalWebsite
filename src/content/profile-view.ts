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
  SKILLS,
  SKILL_CATEGORIES,
  SKILL_LOGOS,
  STATIONS,
  type Evidence,
  type L,
  type Project,
  type ProjectId,
  type Quelle,
  type Skill,
  type SkillCategory,
  type SkillId,
  type Station,
} from '@/content/profile';
import { formatYears } from '@/lib/period';

/**
 * Ort einer Station nur, wenn er nicht schon im Namen des Arbeitgebers steht („Bechtle
 * Mannheim · Mannheim“ → „Bechtle Mannheim“, Fix-Runde 3).
 */
export function stationPlace(station: Station, lang: Lang): string | null {
  const place = station.place?.[lang];
  return place && !station.org.includes(place) ? place : null;
}

export function projectHref(project: Project, lang: Lang): string {
  return withLang(`/projekte/${project.slug[lang]}`, lang);
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

/**
 * Voller Projekttitel für Meta-Titel, llms.txt und Markdown: Der Titel im Modell steht ohne die
 * Art (die zeigt die Kennung darüber). Enthält er den Kurztitel nicht („KI-Unterstützung …“),
 * kommt der Kurztitel davor („Bachelorarbeit: KI-Unterstützung …“, TEX11).
 */
export function projectFullTitle(project: Project, lang: Lang): string {
  const title = project.title[lang];
  const short = project.shortTitle[lang];
  return title.startsWith(short) ? title : `${short}: ${title}`;
}

/** Karten-Daten (ContentCard) für ein Projekt aus dem Content-Modell. */
export function projectCard(project: Project, lang: Lang) {
  const year = project.period.status === 'belegt' ? project.period.value[lang] : null;
  return {
    kind: 'project' as const,
    slug: project.slug[lang],
    title: projectFullTitle(project, lang),
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

/* =====================================================================
 * Startseite: Sprungziele und Verknüpfungen (Fähigkeit ↔ Projekt ↔ Werdegang)
 * ===================================================================== */

/**
 * Sprachneutrale Anker der Startseite. Links mit `data-jump` (home-jump.tsx) öffnen bzw.
 * wählen das Ziel (Kachel, Projekt, Werdegang-Eintrag), scrollen hin und setzen den Fokus;
 * ohne JS springt der Browser zum Anker.
 */
export const anchor = {
  skill: (id: SkillId) => `skill-${id}`,
  project: (id: ProjectId) => `project-${id}`,
  career: (id: string) => `career-${id}`,
};

export interface HomeEvidence {
  kind: Evidence['kind'];
  label: string;
  /** Anker auf der Startseite (data-jump); fehlt bei Profilstellen (reiner Text). */
  href?: string;
  /** Zeitraum in Jahren (Stationen, Ausbildung). */
  note?: string;
  /** Sprache des Labels, wenn sie von der Seite abweicht (deutscher Zertifikatsname auf EN). */
  lang?: Lang;
}

const PROFILE_PART: Record<Lang, Record<string, string>> = {
  de: { headline: 'Headline', summary: 'Zusammenfassung', focus: 'Schwerpunkte-Liste', topSkills: 'Top-Kenntnisse' },
  en: { headline: 'Headline', summary: 'Summary', focus: 'Focus list', topSkills: 'Top skills' },
};

/**
 * Beleg als Verweis innerhalb der Startseite (Werdegang, Projekte). Profilstellen (Headline,
 * Zusammenfassung …) bleiben Text: Quelle ist das LinkedIn-Profil, ein Link je Zeile auf
 * dieselbe Adresse brächte nichts.
 */
export function homeEvidence(ev: Evidence, lang: Lang): HomeEvidence {
  switch (ev.kind) {
    case 'station': {
      const s = STATIONS.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: `${s.role[lang]} · ${s.org}`, href: `#${anchor.career(s.id)}`, note: formatYears(s.start, s.end, lang) };
    }
    case 'education': {
      const e = EDUCATION.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: `${e.degree[lang]} · ${e.school[lang]}`, href: `#${anchor.career(e.id)}`, note: formatYears(e.start, e.end, lang) };
    }
    case 'cert': {
      const c = CERTIFICATIONS.find((x) => x.id === ev.id)!;
      return {
        kind: ev.kind,
        label: c.name[lang],
        href: `#${anchor.career(c.id)}`,
        lang: c.nameLang[lang] !== lang ? c.nameLang[lang] : undefined,
      };
    }
    case 'project': {
      const p = PROJECTS.find((x) => x.id === ev.id)!;
      return { kind: ev.kind, label: p.shortTitle[lang], href: `#${anchor.project(p.id)}` };
    }
    case 'profile':
      return { kind: ev.kind, label: PROFILE_PART[lang][ev.id] };
  }
}

const SOURCE_NAME: Record<Lang, Record<Quelle, string>> = {
  de: {
    linkedin: 'LinkedIn-Profil',
    'github:YannickBeck/Abgabe_Orbitalis': 'GitHub · Abgabe_Orbitalis',
    'github:YannickBeck/OrbitalisTicketSystem': 'GitHub · OrbitalisTicketSystem',
    foto: 'Foto',
  },
  en: {
    linkedin: 'LinkedIn profile',
    'github:YannickBeck/Abgabe_Orbitalis': 'GitHub · Abgabe_Orbitalis',
    'github:YannickBeck/OrbitalisTicketSystem': 'GitHub · OrbitalisTicketSystem',
    foto: 'Photo',
  },
};

export function sourceName(q: Quelle, lang: Lang): string {
  return SOURCE_NAME[lang][q];
}

/** Kachel-Daten fürs Periodensystem (serialisierbar, für das Client-Blatt skill-table.tsx). */
export interface SkillTileData {
  id: SkillId;
  anchor: string;
  /** Laufende Nummer (1 …) – Position im Raster, keine Bewertung. */
  n: number;
  symbol: string;
  name: string;
  tile: string;
  /**
   * Sprache von Name bzw. Kurzname, wenn sie von der Seite abweicht: englische Fachbegriffe auf
   * deutschen Seiten („Conditional Access“) → 'en' – Aussprache und Silbentrennung (Fix-Runde 3:
   * mobil stand „Conditio-nal Access“). Erkannt daran, dass DE- und EN-Name gleich lauten.
   */
  nameLang?: Lang;
  tileLang?: Lang;
  /** Kurzname = voller Name (dann kein zweiter, unsichtbarer Name in der Kachel). */
  same: boolean;
  category: SkillCategory;
  evidence: HomeEvidence[];
  /**
   * Quelle; leer, wenn sie schon aus den Belegen folgt (DES8): alle Belege sind Profilstellen,
   * oder die Quelle ist LinkedIn und eine Belegzeile heißt schon „LinkedIn-Profil: …“
   * (Rest-Feinschliff GES4 – vorher stand dann darunter noch „Quelle: LinkedIn-Profil“).
   */
  source: string;
  logo?: { src: string; credit: string; license: string; licenseUrl: string };
}

/** Fähigkeiten in Rasterreihenfolge: nach Kategorie (SKILL_CATEGORIES), darin wie in SKILLS. */
export function orderedSkills(): Skill[] {
  return SKILL_CATEGORIES.flatMap((c) => SKILLS.filter((s) => s.category === c.id));
}

/**
 * Belege fürs Detailfeld: mehrere Profilstellen in EINER Zeile („LinkedIn-Profil: Headline,
 * Zusammenfassung“) statt je Stelle eine Zeile mit derselben Art (DES8).
 */
function groupProfileEvidence(evidence: Evidence[], lang: Lang): HomeEvidence[] {
  const out: HomeEvidence[] = [];
  const parts: string[] = [];
  for (const ev of evidence) {
    if (ev.kind === 'profile') {
      parts.push(PROFILE_PART[lang][ev.id]);
    } else {
      out.push(homeEvidence(ev, lang));
    }
  }
  return parts.length ? [{ kind: 'profile', label: parts.join(', ') }, ...out] : out;
}

/** Englischer Begriff auf einer deutschen Seite? (DE- und EN-Fassung gleich, ohne Groß-/Kleinschreibung) */
export function englishOnGerman(value: L, lang: Lang): Lang | undefined {
  return lang === 'de' && value.de.replace(/\u00AD/g, '').toLowerCase() === value.en.replace(/\u00AD/g, '').toLowerCase() ? 'en' : undefined;
}

/** Nennen die Belege die Quelle schon (Belegart „LinkedIn-Profil“)? Dann keine Zeile „Quelle“ (DES8). */
function sourceInEvidence(s: Skill): boolean {
  const hasProfile = s.evidence.some((ev) => ev.kind === 'profile');
  return s.evidence.every((ev) => ev.kind === 'profile') || (s.quelle === 'linkedin' && hasProfile);
}

export function skillTiles(lang: Lang): SkillTileData[] {
  return orderedSkills().map((s, i) => ({
    id: s.id,
    anchor: anchor.skill(s.id),
    n: i + 1,
    symbol: s.symbol,
    name: s.name[lang],
    tile: (s.tile ?? s.name)[lang],
    nameLang: englishOnGerman(s.name, lang),
    tileLang: englishOnGerman(s.tile ?? s.name, lang),
    same: (s.tile ?? s.name)[lang].replace(/\u00AD/g, '') === s.name[lang],
    category: s.category,
    evidence: groupProfileEvidence(s.evidence, lang),
    source: sourceInEvidence(s) ? '' : sourceName(s.quelle, lang),
    logo: s.logo
      ? {
          src: `/logos/${s.logo}.svg`,
          credit: SKILL_LOGOS[s.logo].credit[lang],
          license: SKILL_LOGOS[s.logo].license,
          licenseUrl: SKILL_LOGOS[s.logo].licenseUrl,
        }
      : undefined,
  }));
}

/** Kompakte Fähigkeits-Marke (Projekt-Akkordeon, Projektseiten): Kürzel, Name, Kategorie. */
export interface SkillChip {
  id: SkillId;
  symbol: string;
  label: string;
  category: SkillCategory;
}

export function skillChips(ids: SkillId[], lang: Lang): SkillChip[] {
  return ids.map((id) => {
    const s = SKILLS.find((x) => x.id === id)!;
    return { id, symbol: s.symbol, label: (s.tile ?? s.name)[lang].replace(/\u00AD/g, ''), category: s.category };
  });
}

/** Tags eines Projekts, die keine Fähigkeit im Periodensystem haben (z. B. „Debian 13“). */
export function extraTags(project: Project): string[] {
  const names = new Set(
    project.skills.flatMap((id) => {
      const s = SKILLS.find((x) => x.id === id)!;
      return [s.name.de, s.name.en, s.tile?.de, s.tile?.en].filter(Boolean).map((v) => v!.toLowerCase());
    }),
  );
  return project.tags.filter((t) => !names.has(t.toLowerCase()));
}

/** Fähigkeit zu einer Profil-Bezeichnung (z. B. „Microsoft Intune“, „LLMs“) – Name oder Kurzname. */
export function skillIdFor(label: string): SkillId | undefined {
  const l = label.toLowerCase();
  return SKILLS.find((s) =>
    [s.name.de, s.name.en, s.tile?.de, s.tile?.en].some((v) => v?.replace(/­/g, '').toLowerCase() === l),
  )?.id;
}

/**
 * Bezeichnungen aus dem Profil (Schwerpunkte-Liste, Interessen) als Marken: mit Kachel im
 * Periodensystem → Fähigkeits-Kachel (Kürzel, Kategoriefarbe, Sprung auf /#skill-<id>),
 * sonst neutrale Marke. Die Beschriftung bleibt der Wortlaut des Profils.
 */
export type LabelChip = { kind: 'skill'; chip: SkillChip } | { kind: 'plain'; label: string };

export function labelChips(labels: string[]): LabelChip[] {
  return labels.map((label) => {
    const id = skillIdFor(label);
    if (!id) {
      return { kind: 'plain', label };
    }
    const s = SKILLS.find((x) => x.id === id)!;
    return { kind: 'skill', chip: { id, symbol: s.symbol, label, category: s.category } };
  });
}

/** Projekte, die mindestens eine der Fähigkeiten belegen (z. B. Schwerpunkt → Projekte). */
export function projectsForSkills(ids: SkillId[]): Project[] {
  return PROJECTS.filter((p) => p.skills.some((id) => ids.includes(id)));
}
