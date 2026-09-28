import type { Lang } from '@/i18n/dictionaries';
import { getPosts } from '@/lib/ghost';

const SITE = 'https://yannick-beck.de';

function prefix(lang: Lang): string {
  return lang === 'en' ? `${SITE}/en` : SITE;
}

function rss(lang: Lang, title: string, description: string, items: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0"><channel>` +
    `<title>${title}</title><link>${prefix(lang)}/blog</link>` +
    `<description>${description}</description>` +
    items +
    `</channel></rss>`
  );
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function rssHandler(lang: Lang, title: string, description: string) {
  return async () => {
    const posts = await getPosts(lang);
    const items = posts
      .map((p) => {
        const url = `${prefix(lang)}/blog/${p.slug}`;
        const date = p.published_at ? new Date(p.published_at).toUTCString() : '';
        return (
          `<item><title>${esc(p.title ?? p.slug)}</title><link>${url}</link>` +
          `<guid>${url}</guid>` +
          (date ? `<pubDate>${date}</pubDate>` : '') +
          (p.custom_excerpt || p.excerpt
            ? `<description>${esc(p.custom_excerpt ?? p.excerpt ?? '')}</description>`
            : '') +
          `</item>`
        );
      })
      .join('');
    return new Response(rss(lang, title, description, items), {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  };
}
