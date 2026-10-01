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
import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { ybTheme } from '../theme/yb';
import { THEME_STORAGE_KEY } from '../theme/theme-boot';

/** system = keine gespeicherte Wahl, folgt prefers-color-scheme (E2). */
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = 'light' | 'dark';

interface ThemeModeValue {
  mode: ThemeMode;
  /** Tatsächlich sichtbares Schema; null nur während SSR/Hydration (noch unbekannt). */
  resolvedMode: ResolvedThemeMode | null;
  /** Zwei-Zustand-Schalter hell ↔ dunkel; speichert die Wahl. */
  toggleMode: () => void;
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

function readStoredMode(): ThemeMode | null {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
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

  const toggleMode = useCallback(() => {
    const current = mode === 'system' ? readSystemScheme() : mode;
    const next: ResolvedThemeMode = current === 'dark' ? 'light' : 'dark';
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setMode(next);
  }, [mode]);

  const value = useMemo(() => ({ mode, resolvedMode, toggleMode }), [mode, resolvedMode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <Theme theme={ybTheme} mode={mode}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </ThemeModeContext.Provider>
  );
}
