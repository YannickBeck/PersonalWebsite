import { NextResponse, type NextRequest } from 'next/server';
import { isKnownPostSlug } from '@/lib/blog-slugs';
import { wantsMarkdown } from '@/lib/markdown-accept';
import { LANG_HEADER } from '@/lib/not-found-lang';

/**
 * Proxy (Next 16, früher Middleware): Blog-Detailseiten und die Sprache der globalen 404.
 *
 * 1. Blog (Feinschliff, docs/blog-404.md): Unbekannter Slug → Rewrite auf einen Pfad ohne Route.
 *    Next antwortet dann mit der globalen 404 (src/app/global-not-found.tsx, Status 404,
 *    no-store, Inhalt ohne JavaScript) – wie bei /projekte/<unbekannt> (dynamicParams = false).
 *    Bekannte und neue Beiträge laufen unverändert weiter in /blog/[slug] (ISR, Webhook →
 *    /api/revalidate), ein neuer Beitrag braucht also keinen Neubau. Ist Ghost nicht erreichbar,
 *    entscheidet wie vorher die Seite selbst.
 * 2. Sprache der globalen 404 (Rest-Feinschliff, docs/blog-404.md „Englische 404“): Für /en/*
 *    setzt der Proxy den Anfrage-Header `x-yb-lang: en`. Die globale 404 kennt den Pfad nicht
 *    (Next ruft sie ohne Props auf, wenn keine Route passt) und liest die Sprache daraus – so
 *    steht lang="en" schon im Server-HTML, und ohne JavaScript erscheint die englische Fassung.
 *    Vorher war sie EIN statisches HTML mit lang="de", erst das Boot-Script schaltete um.
 *    Seiten mit Route lesen den Header nicht und bleiben statisch.
 *
 * Markdown-Abrufe (Accept: text/markdown) bleiben unberührt: /api/md antwortet selbst, auch mit
 * der Markdown-404.
 */
export async function proxy(request: NextRequest) {
  if (wantsMarkdown(request.headers.get('accept'))) {
    return NextResponse.next();
  }
  const { pathname } = request.nextUrl;
  // Sprache für die globale 404 (nur sie liest den Header). Unter /blog entfernt; auf den übrigen
  // DE-Pfaden läuft der Proxy nicht – ein selbst mitgeschickter Header ändert dort nur die
  // Sprache der eigenen 404-Antwort (no-store, nichts wird für andere abgelegt).
  const headers = new Headers(request.headers);
  if (/^\/en(\/|$)/.test(pathname)) {
    headers.set(LANG_HEADER, 'en');
  } else {
    headers.delete(LANG_HEADER);
  }
  const match = /^(\/en)?\/blog\/([^/]+)$/.exec(pathname);
  if (!match) {
    return NextResponse.next({ request: { headers } });
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
    return NextResponse.rewrite(new URL(`${pathname}/_404`, request.url), { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

// /en/:path* schließt /en selbst ein; DE-Pfade außer dem Blog brauchen den Proxy nicht (die
// globale 404 ist ohne Header deutsch)
export const config = {
  matcher: ['/blog/:slug', '/en/:path*'],
};
