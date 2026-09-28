'use client';

import { TopNav } from '@astryxdesign/core/TopNav';
import { TopNavItem } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { useThemeMode } from '@/app/providers';

const NAV = [
  { label: 'Projekte', href: '/projekte' },
  { label: 'Blog', href: '/blog' },
  { label: 'Leistungen', href: '/leistungen' },
  { label: 'CV', href: '/cv' },
  { label: 'Kontakt', href: '/kontakt' },
];

const MODE_LABEL: Record<string, string> = {
  system: 'Modus: System',
  light: 'Modus: Hell',
  dark: 'Modus: Dunkel',
};

export function SiteHeader() {
  const { mode, cycleMode } = useThemeMode();
  return (
    <TopNav
      heading="Yannick Beck"
      startContent={NAV.map((item) => (
        <TopNavItem key={item.href} label={item.label} href={item.href} />
      ))}
      endContent={
        <Button variant="ghost" label={MODE_LABEL[mode]} onClick={cycleMode} />
      }
    />
  );
}
