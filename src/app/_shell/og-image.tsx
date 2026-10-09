import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Lang } from '@/i18n/dictionaries';
import { PERSON } from '@/content/profile';
import { OG_SIZE } from '@/lib/og';

/**
 * Social-Media-Vorschaubild (og:image) beider Sprachen – beim Build statisch erzeugt
 * (Route src/app/og/[lang]/route.ts). Gestaltung wie der Einstieg: Papier, blasser
 * Namenszug, freigestellte Person, Rolle in Display-Versalien. Schriften/Porträt aus
 * src/assets/og (README dort: Herkunft, Lizenz).
 */
export { OG_ALT, OG_SIZE } from '@/lib/og';

const asset = (name: string) => readFile(join(process.cwd(), 'src/assets/og', name));

export async function renderOgImage(lang: Lang) {
  const [display, text, textBold, portrait] = await Promise.all([
    asset('sofia-sans-extra-condensed-800.woff'),
    asset('fustat-400.woff'),
    asset('fustat-600.woff'),
    asset('portrait-cutout.png'),
  ]);
  const portraitSrc = `data:image/png;base64,${portrait.toString('base64')}`;
  const ink = '#16151B';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#F7F4EE',
          fontFamily: 'Fustat',
          color: ink,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 40,
            right: 40,
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'Display',
            fontSize: 236,
            lineHeight: 1,
            letterSpacing: -2,
            color: 'rgba(22, 21, 27, 0.07)',
          }}
        >
          YANNICK BECK
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori/ImageResponse kennt nur <img> */}
        <img
          src={portraitSrc}
          width={300}
          height={606}
          alt=""
          style={{ position: 'absolute', right: 150, bottom: -60 }}
        />
        <div
          style={{
            position: 'absolute',
            left: 64,
            bottom: 64,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 600 }}>{PERSON.name}</div>
          <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 120, lineHeight: 0.9, letterSpacing: -1 }}>
            {PERSON.role.value[lang].toUpperCase()}
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#5C5850' }}>{PERSON.focusLine.value[lang].join(' · ')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 24, color: '#5C5850' }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: '#5B3FE0' }} />
            yannick-beck.de
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Display', data: display, weight: 800, style: 'normal' },
        { name: 'Fustat', data: text, weight: 400, style: 'normal' },
        { name: 'Fustat', data: textBold, weight: 600, style: 'normal' },
      ],
    },
  );
}
