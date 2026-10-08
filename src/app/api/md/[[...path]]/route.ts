import type { NextRequest } from 'next/server';
import { markdownFor, notFoundMarkdown } from '@/lib/markdown';

/**
 * Markdown-Antworten für Agenten (acceptmarkdown.com): next.config leitet Anfragen mit
 * Accept: text/markdown hierher um (rewrites.beforeFiles, Pfad bleibt in der URL). Bekannte
 * Seiten → Markdown aus dem Content-Modell (200), alles andere → Markdown-404 (404).
 * Immer Content-Type text/markdown und Vary: Accept (dieselbe URL liefert sonst HTML).
 * Direkter Aufruf unter /api/md/… funktioniert ebenso (nur lesend, keine Eingaben gespeichert).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<'/api/md/[[...path]]'>) {
  const { path } = await ctx.params;
  const pathname = `/${(path ?? []).map((s) => decodeURIComponent(s)).join('/')}`;
  const found = await markdownFor(pathname);
  const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de';
  const headers = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Content-Language': found?.lang ?? lang,
    Vary: 'Accept',
    'Cache-Control': 'public, max-age=300',
  };
  if (!found) {
    return new Response(notFoundMarkdown(pathname, lang), { status: 404, headers });
  }
  return new Response(found.body, { status: 200, headers });
}
