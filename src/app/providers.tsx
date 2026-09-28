'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

type ThemeMode = 'system' | 'light' | 'dark';

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  cycleMode: () => void;
}>({ mode: 'system', cycleMode: () => {} });

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const cycleMode = useCallback(() => {
    setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]);
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, cycleMode }}>
      <Theme theme={neutralTheme} mode={mode}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </ThemeModeContext.Provider>
  );
}
