import { NextResponse, type NextRequest } from 'next/server';
import { isKnownPostSlug } from '@/lib/blog-slugs';
import { wantsMarkdown } from '@/lib/markdown-accept';

/**
 * Proxy (Next 16, früher Middleware) – nur für Blog-Detailseiten (Feinschliff, docs/blog-404.md).
 *
 * Unbekannter Slug → Rewrite auf einen Pfad ohne Route. Next antwortet dann mit der statischen
 * globalen 404 (src/app/global-not-found.tsx, Status 404, lang/Text je Sprache per Boot-Script,
 * Inhalt ohne JavaScript) – wie bei /projekte/<unbekannt> (dynamicParams = false). Bekannte und
 * neue Beiträge laufen unverändert weiter in /blog/[slug] (ISR, Webhook → /api/revalidate), ein
 * neuer Beitrag braucht also keinen Neubau. Ist Ghost nicht erreichbar, entscheidet wie vorher
 * die Seite selbst.
 *
 * Markdown-Abrufe (Accept: text/markdown) bleiben unberührt: /api/md antwortet selbst, auch mit
 * der Markdown-404.
 */
export async function proxy(request: NextRequest) {
  if (wantsMarkdown(request.headers.get('accept'))) {
    return NextResponse.next();
  }
  const { pathname } = request.nextUrl;
  const match = /^(\/en)?\/blog\/([^/]+)$/.exec(pathname);
  if (!match) {
    return NextResponse.next();
  }
  let slug: string;
  try {
    slug = decodeURIComponent(match[2]);
  } catch {
    slug = match[2];
  }
  const known = await isKnownPostSlug(slug, match[1] ? 'en' : 'de');
  if (known === false) {
    // Unterpfad ohne Route (/blog/[slug] hat keine Unterseiten) → globale 404
    return NextResponse.rewrite(new URL(`${pathname}/_404`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/blog/:slug', '/en/blog/:slug'],
};
