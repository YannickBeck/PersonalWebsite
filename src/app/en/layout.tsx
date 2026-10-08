import type { Metadata } from 'next';
import { RootShell, rootMetadata } from '../_shell/root-shell';

/**
 * Root-Layout Englisch (/en/*): <html lang="en"> schon im Server-HTML (Agenten-Lesbarkeit).
 * Gegenstück: src/app/(de)/layout.tsx. Wechsel DE ↔ EN = vollständiger Seitenaufruf.
 */
export const metadata: Metadata = rootMetadata('en');

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
