import GhostContentAPI from '@tryghost/content-api';
import type { GhostAPI } from '@tryghost/content-api';
import type { Lang } from '@/i18n/dictionaries';

const LANG_TAG: Record<Lang, string> = {
  de: 'hash-lang-de',
  en: 'hash-lang-en',
};

export interface GhostItem {
  slug: string;
  title?: string;
  excerpt?: string;
  custom_excerpt?: string;
  feature_image?: string | null;
  published_at?: string;
  html?: string;
  tags?: { slug?: string; name?: string }[];
}

let api: GhostAPI | null = null;

export function getApi(): GhostAPI {
  if (!api) {
    const url = process.env.GHOST_URL;
    const key = process.env.GHOST_CONTENT_KEY;
    if (!url || !key) {
      throw new Error('GHOST_URL / GHOST_CONTENT_KEY missing');
    }
    api = new GhostContentAPI({ url, key, version: 'v5.0' });
  }
  return api;
}

function langOk(item: GhostItem, lang: Lang): boolean {
  return (item.tags ?? []).some((t) => t.slug === LANG_TAG[lang]);
}

function timeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Ghost timeout')), ms),
    ),
  ]);
}

/** Projekte einer Sprache (Tag project + Sprach-Tag). [] bei Fehler (Build-Resilienz). */
export async function getProjects(lang: Lang): Promise<GhostItem[]> {
  try {
    const posts = (await timeout(
      getApi().posts.browse({
        limit: 'all',
        include: 'tags',
        fields: 'slug,title,excerpt,custom_excerpt,feature_image,published_at',
        filter: `tag:project+tag:${LANG_TAG[lang]}`,
        order: 'published_at DESC',
      }),
    )) as unknown as GhostItem[];
    return posts.filter((p) => langOk(p, lang));
  } catch {
    return [];
  }
}

/** Blogposts einer Sprache (Sprach-Tag, ohne Projekte). [] bei Fehler (Build-Resilienz). */
export async function getPosts(lang: Lang): Promise<GhostItem[]> {
  try {
    const posts = (await timeout(
      getApi().posts.browse({
        limit: 'all',
        include: 'tags',
        fields: 'slug,title,excerpt,custom_excerpt,feature_image,published_at',
        filter: `tag:${LANG_TAG[lang]}+tag:-project`,
        order: 'published_at DESC',
      }),
    )) as unknown as GhostItem[];
    return posts.filter((p) => langOk(p, lang));
  } catch {
    return [];
  }
}

/** Einzelner Beitrag per Slug (nur wenn Sprach-Tag passt). */
export async function getBySlug(
  slug: string,
  lang: Lang,
): Promise<GhostItem | undefined> {
  try {
    const post = (await timeout(
      getApi().posts.read({ slug }, { include: ['tags', 'authors'] }),
    )) as unknown as GhostItem;
    return langOk(post, lang) ? post : undefined;
  } catch {
    return undefined;
  }
}

export async function getProjectSlugs(lang: Lang): Promise<string[]> {
  return (await getProjects(lang)).map((p) => p.slug);
}

export async function getPostSlugs(lang: Lang): Promise<string[]> {
  return (await getPosts(lang)).map((p) => p.slug);
}
