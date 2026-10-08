import type { NextRequest } from 'next/server';
import { renderOgImage } from '@/app/_shell/og-image';

/**
 * Social-Media-Vorschaubild unter stabiler URL (/og/de, /og/en), statisch beim Build erzeugt.
 * Bewusst kein opengraph-image.tsx: Next hängt der Datei in einer Route-Gruppe einen Hash an
 * (/opengraph-image-xyz), und Seiten mit eigenem openGraph-Objekt (pageMeta) erben das Bild
 * nicht – pageMeta (src/lib/seo.ts) verweist deshalb ausdrücklich auf diese Route.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: 'de' }, { lang: 'en' }];
}

export async function GET(_request: NextRequest, ctx: RouteContext<'/og/[lang]'>) {
  const { lang } = await ctx.params;
  return renderOgImage(lang === 'en' ? 'en' : 'de');
}
