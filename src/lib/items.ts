import type { Lang } from '@/i18n/dictionaries';
import { withLang } from '@/i18n/dictionaries';
import {
  getPosts as getGhostPosts,
  getProjects as getGhostProjects,
  type GhostItem,
} from '@/lib/ghost';
import {
  DEMO_PROJECTS,
  TOPIC_LABELS,
  type ProjectCategory,
} from '@/content/demo';
import { DEMO_ARTICLES } from '@/content/demo-articles';

export interface CardItem {
  kind: 'project' | 'post';
  slug: string;
  title: string;
  excerpt: string;
  date?: string;
  readingMinutes?: number;
  image: string | null;
  demo: boolean;
  category?: ProjectCategory;
  categoryLabel?: string;
  topics: { slug: string; label: string }[];
  href: string;
}

const LANG_TAG = { de: 'hash-lang-de', en: 'hash-lang-en' } as const;

export function ghostTopics(item: GhostItem, lang: Lang): { slug: string; label: string }[] {
  return (item.tags ?? [])
    .filter(
      (t) =>
        t.slug &&
        t.slug !== LANG_TAG[lang] &&
        t.slug !== 'project' &&
        !t.slug.startsWith('hash-'),
    )
    .map((t) => ({ slug: t.slug as string, label: t.name ?? prettyTag(t.slug as string) }));
}

function prettyTag(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function demoTopics(slugs: string[], lang: Lang): { slug: string; label: string }[] {
  return slugs.map((s) => ({ slug: s, label: TOPIC_LABELS[lang][s] ?? prettyTag(s) }));
}

/** Projekte: echte Ghost-Inhalte zuerst, dann Demo-Projekte. */
export async function getProjectCards(lang: Lang): Promise<CardItem[]> {
  const [ghost, demo] = await Promise.all([
    getGhostProjects(lang),
    Promise.resolve(DEMO_PROJECTS.filter((p) => p.lang === lang)),
  ]);
  const g: CardItem[] = ghost.map((p) => ({
    kind: 'project' as const,
    slug: p.slug,
    title: p.title ?? p.slug,
    excerpt: p.custom_excerpt || p.excerpt || '',
    date: p.published_at,
    image: p.feature_image ?? null,
    demo: false,
    topics: ghostTopics(p, lang),
    href: withLang(`/projekte/${p.slug}`, lang),
  }));
  const d: CardItem[] = demo.map((p) => ({
    kind: 'project' as const,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    image: p.cover,
    demo: true,
    category: p.category,
    categoryLabel: p.categoryLabel,
    topics: demoTopics(p.topics, lang),
    href: withLang(`/projekte/${p.slug}`, lang),
  }));
  return [...g, ...d];
}

/** Artikel: Ghost + Demo, nach Datum absteigend. */
export async function getPostCards(lang: Lang): Promise<CardItem[]> {
  const [ghost, demo] = await Promise.all([
    getGhostPosts(lang),
    Promise.resolve(DEMO_ARTICLES.filter((a) => a.lang === lang)),
  ]);
  const g: CardItem[] = ghost.map((p) => ({
    kind: 'post' as const,
    slug: p.slug,
    title: p.title ?? p.slug,
    excerpt: p.custom_excerpt || p.excerpt || '',
    date: p.published_at,
    readingMinutes: p.reading_time,
    image: p.feature_image ?? null,
    demo: false,
    topics: ghostTopics(p, lang),
    href: withLang(`/blog/${p.slug}`, lang),
  }));
  const d: CardItem[] = demo.map((a) => ({
    kind: 'post' as const,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    date: a.date,
    readingMinutes: a.readingMinutes,
    image: a.image,
    demo: true,
    topics: demoTopics(a.topics, lang),
    href: withLang(`/blog/${a.slug}`, lang),
  }));
  return [...g, ...d].sort((x, y) => (y.date ?? '').localeCompare(x.date ?? ''));
}
