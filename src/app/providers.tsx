'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { flushSync } from 'react-dom';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import { ybTheme } from '../theme/yb';
import { THEME_STORAGE_KEY } from '../theme/theme-boot';
import { RouteLangContext, useResolvedRouteLang } from '@/i18n/route-lang';
import { ASTRYX_DE } from '@/i18n/astryx-de';
import { TransitionLink } from '@/components/transition-link';
import { suppressTransitions } from '@/lib/instant';

/** Deutsche Astryx-Texte (M8/VV3): Auszug aus dem de-DE-Katalog, s. astryx-de.ts. */
const ASTRYX_MESSAGES = { 'de-DE': ASTRYX_DE };

/** system = keine gespeicherte Wahl, folgt prefers-color-scheme (E2). */
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = 'light' | 'dark';

interface ThemeModeValue {
  mode: ThemeMode;
  /** Tatsächlich sichtbares Schema; null nur während SSR/Hydration (noch unbekannt). */
  resolvedMode: ResolvedThemeMode | null;
  /**
   * Zwei-Zustand-Schalter hell ↔ dunkel; speichert die Wahl. origin = Mittelpunkt des
   * Schalters (Viewport-Koordinaten) für den Kreis-Reveal.
   */
  toggleMode: (origin?: { x: number; y: number }) => void;
}

const ThemeModeContext = createContext<ThemeModeValue>({
  mode: 'system',
  resolvedMode: null,
  toggleMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeSystemScheme(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function readSystemScheme(): ResolvedThemeMode {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * Theme-Wechsel als Kreis-Reveal vom Schalter aus (X5, B3). Fallback = sofortiger Wechsel:
 * - ohne View Transitions bzw. ohne Transition-Types (Chrome < 125, Safari < 18.2,
 *   Firefox < 147): dort wirft startViewTransition({types}) einen TypeError (XV1),
 * - unter prefers-reduced-motion: reduce,
 * - wenn gerade eine andere View Transition läuft (z. B. Seitenwechsel): keine zweite.
 * Während des Wechsels trägt <html> data-yb-vt="theme": motion.css nimmt Header/Footer
 * die eigenen Namen (sonst stünden sie in neuen Farben auf altem Grund, XV1);
 * suppressTransitions() schaltet CSS-Transitions ab (kein Farb-Nachziehen von 150 ms).
 */
function switchThemeWithTransition(apply: () => void, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const done = () => root.removeAttribute('data-yb-vt');
  suppressTransitions();

  const vtInterface = (window as unknown as { ViewTransition?: { prototype: object } }).ViewTransition;
  const supportsTypes =
    typeof document.startViewTransition === 'function' && !!vtInterface && 'types' in vtInterface.prototype;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;
  try {
    busy = root.matches(':active-view-transition');
  } catch {
    busy = false;
  }
  if (!supportsTypes || reduce || busy) {
    flushSync(apply);
    done();
    return;
  }

  const x = origin?.x ?? window.innerWidth;
  const y = origin?.y ?? 0;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty('--yb-reveal-x', `${Math.round(x)}px`);
  root.style.setProperty('--yb-reveal-y', `${Math.round(y)}px`);
  root.style.setProperty('--yb-reveal-r', `${Math.ceil(r)}px`);
  root.setAttribute('data-yb-vt', 'theme');
  try {
    const vt = document.startViewTransition({ update: () => flushSync(apply), types: ['theme'] });
    // Übersprungen (z. B. Seitenwechsel startet eine eigene VT): kein unbehandelter Fehler
    vt.ready.catch(() => {});
    vt.finished.then(done, done);
  } catch {
    flushSync(apply);
    done();
  }
}

function readStoredMode(): ThemeMode | null {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Seitensprache für alle Client-Komponenten (route-lang.ts, JURY1-1)
  const lang = useResolvedRouteLang();
  const [mode, setMode] = useState<ThemeMode>('system');
  const systemScheme = useSyncExternalStore<ResolvedThemeMode | null>(
    subscribeSystemScheme,
    readSystemScheme,
    () => null,
  );

  // useLayoutEffect (nicht useEffect): Theme entfernt beim Hydrieren mit mode="system"
  // das vom Boot-Script gesetzte <html data-theme>; die gespeicherte Wahl muss deshalb
  // noch vor dem ersten Paint nach der Hydration zurück, sonst blitzt das falsche Schema.
  // Ein Lazy-Initializer ginge nicht: er erzeugt einen Attribut-Mismatch am Theme-Wrapper.
  useLayoutEffect(() => {
    const saved = readStoredMode();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliger Abgleich mit localStorage vor dem Paint (siehe oben)
      setMode(saved);
    }
  }, []);

  const resolvedMode: ResolvedThemeMode | null = mode === 'system' ? systemScheme : mode;

  const toggleMode = useCallback(
    (origin?: { x: number; y: number }) => {
      const current = mode === 'system' ? readSystemScheme() : mode;
      const next: ResolvedThemeMode = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      switchThemeWithTransition(() => setMode(next), origin);
    },
    [mode],
  );

  const value = useMemo(() => ({ mode, resolvedMode, toggleMode }), [mode, resolvedMode, toggleMode]);

  return (
    <RouteLangContext.Provider value={lang}>
      <ThemeModeContext.Provider value={value}>
        <Theme theme={ybTheme} mode={mode}>
          <InternationalizationProvider locale={lang === 'en' ? 'en' : 'de-DE'} messages={ASTRYX_MESSAGES}>
            <LinkProvider component={TransitionLink}>{children}</LinkProvider>
          </InternationalizationProvider>
        </Theme>
      </ThemeModeContext.Provider>
    </RouteLangContext.Provider>
  );
}
