'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { ybTheme } from '../theme/yb';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'yb-theme-mode';

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  cycleMode: () => void;
}>({ mode: 'system', cycleMode: () => {} });

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export const MODE_LABEL: Record<ThemeMode, string> = {
  system: 'Modus: System',
  light: 'Modus: Hell',
  dark: 'Modus: Dunkel',
};

export const MODE_LABEL_EN: Record<ThemeMode, string> = {
  system: 'Mode: System',
  light: 'Mode: Light',
  dark: 'Mode: Dark',
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setMode(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);
  const cycleMode = useCallback(() => {
    setMode((m) => {
      const next = ORDER[(ORDER.indexOf(m) + 1) % ORDER.length];
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, cycleMode }}>
      <Theme theme={ybTheme} mode={mode}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </ThemeModeContext.Provider>
  );
}
