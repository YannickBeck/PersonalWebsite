'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@astryxdesign/core/TopNav';
import { TopNavItem } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { useThemeMode } from '@/app/providers';
import { getDictionary, langFromPath, mirrorPath } from '@/i18n/dictionaries';

const MODE_LABEL: Record<string, string> = {
  system: 'Modus: System',
  light: 'Modus: Hell',
  dark: 'Modus: Dunkel',
};

export function SiteHeader() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  const { mode, cycleMode } = useThemeMode();

  return (
    <TopNav
      heading={dict.brand}
      startContent={dict.nav.map((item) => (
        <TopNavItem
          key={item.href}
          label={item.label}
          href={item.href}
          isSelected={pathname === item.href}
        />
      ))}
      endContent={
        <HStack gap={1}>
          <Button
            variant="ghost"
            label={dict.switcherLabel}
            href={mirrorPath(pathname, dict.switcherTarget)}
          />
          <Button variant="ghost" label={MODE_LABEL[mode]} onClick={cycleMode} />
        </HStack>
      }
    />
  );
}
