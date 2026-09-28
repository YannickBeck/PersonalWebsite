'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { langFromPath } from '@/i18n/dictionaries';

/** Hält <html lang> mit der Route synchron (/en/* → "en", sonst "de"). */
export function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = langFromPath(pathname);
  }, [pathname]);
  return null;
}
