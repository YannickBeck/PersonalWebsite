'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@astryxdesign/core/TopNav';
import { TopNavItem } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary, langFromPath, mirrorPath } from '@/i18n/dictionaries';

export function SiteHeader() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);

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
        <Button
          variant="ghost"
          label={dict.switcherLabel}
          href={mirrorPath(pathname, dict.switcherTarget)}
        />
      }
    />
  );
}
