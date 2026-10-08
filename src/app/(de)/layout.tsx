import type { Metadata } from 'next';
import { RootShell, rootMetadata } from '../_shell/root-shell';

/** Root-Layout Deutsch (alle Routen ohne /en). Gegenstück: src/app/en/layout.tsx. */
export const metadata: Metadata = rootMetadata('de');

export default function GermanRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="de">{children}</RootShell>;
}
