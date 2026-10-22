import type { Lang } from '@/i18n/dictionaries';
import { SHOW_GAPS } from '@/lib/gaps';
import { demoArticleBySlug } from '@/content/demo-articles';

/**
 * Welche Blog-Slugs gibt es gerade? Für src/proxy.ts (Feinschliff, docs/blog-404.md).
 *
 * Hintergrund: /blog/[slug] lässt neue Ghost-Beiträge ohne Neubau zu (dynamicParams bleibt true,
 * Webhook → /api/revalidate). Ein unbekannter Slug endete dort in notFound() zur Laufzeit – Next
 * 16.3.6 rendert das auf dem Server als leere `<html id="__next_error__">`-Hülle (React rendert
 * Fehlergrenzen beim SSR nicht; erst der Browser zeigt mit JS die 404). Der Proxy fragt deshalb
 * vorher hier nach und schickt unbekannte Slugs auf die statische globale 404.
 *
 * Eine Liste je Sprache (nur `slug`, gleicher Filter wie getPosts in ghost.ts), im Speicher:
 * frisch für 60 s; fehlt ein Slug, höchstens alle 10 s neu laden (gerade veröffentlichte
 * Beiträge erscheinen so spätestens nach 10 s). Ghost nicht erreichbar → `undefined`, der
 * Proxy lässt die Anfrage dann durch (Verhalten wie vorher). Der Speicher ist nur ein
 * Zwischenspeicher: Ohne ihn (laut Proxy-Doku keine Garantie für Modul-Zustand) wird bei jedem
 * Abruf neu geladen, das Ergebnis bleibt richtig.
 */

const LANG_TAG: Record<Lang, string> = { de: 'hash-lang-de', en: 'hash-lang-en' };
const FRESH_MS = 60_000;
const RETRY_MS = 10_000;
const TIMEOUT_MS = 3_000;

interface SlugList {
  at: number;
  slugs: Set<string>;
}

const lists = new Map<Lang, SlugList>();
const loading = new Map<Lang, Promise<SlugList | undefined>>();

async function fetchList(lang: Lang): Promise<SlugList | undefined> {
  const base = process.env.GHOST_URL;
  const key = process.env.GHOST_CONTENT_KEY;
  if (!base || !key) {
    return undefined;
  }
  const url = new URL(`${base.replace(/\/+$/, '')}/ghost/api/content/posts/`);
  url.searchParams.set('key', key);
  url.searchParams.set('filter', `tag:${LANG_TAG[lang]}+tag:-project`);
  url.searchParams.set('fields', 'slug');
  url.searchParams.set('limit', 'all');
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Version': 'v5.0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      return undefined;
    }
    const data = (await res.json()) as { posts?: { slug?: unknown }[] };
    if (!Array.isArray(data.posts)) {
      return undefined;
    }
    const slugs = data.posts.map((p) => p.slug).filter((s): s is string => typeof s === 'string');
    return { at: Date.now(), slugs: new Set(slugs) };
  } catch {
    return undefined;
  }
}

function load(lang: Lang): Promise<SlugList | undefined> {
  let pending = loading.get(lang);
  if (!pending) {
    pending = fetchList(lang).then((list) => {
      loading.delete(lang);
      if (list) {
        lists.set(lang, list);
      }
      return list;
    });
    loading.set(lang, pending);
  }
  return pending;
}

/**
 * true = Beitrag existiert, false = sicher unbekannt, undefined = nicht prüfbar (Ghost nicht
 * erreichbar bzw. nicht konfiguriert).
 */
export async function isKnownPostSlug(slug: string, lang: Lang): Promise<boolean | undefined> {
  if (SHOW_GAPS && demoArticleBySlug(slug, lang)) {
    return true;
  }
  let list = lists.get(lang);
  if (!list || Date.now() - list.at > FRESH_MS) {
    list = (await load(lang)) ?? list;
  }
  if (!list) {
    return undefined;
  }
  if (list.slugs.has(slug)) {
    return true;
  }
  if (Date.now() - list.at > RETRY_MS) {
    const fresh = await load(lang);
    if (!fresh) {
      return undefined;
    }
    return fresh.slugs.has(slug);
  }
  return false;
}
