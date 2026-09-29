'use client';

import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { gothicTheme } from '@astryxdesign/theme-gothic/built';

/** Gothic ist dark-only — der Modus ist fest auf dunkel gestellt. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={gothicTheme} mode="dark">
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
