'use client';

import { usePathname } from 'next/navigation';
import { langFromPath } from '@/i18n/dictionaries';

/**
 * Ghost Portal (Mitglieder/Newsletter, Ghost-nativ) für das externe Frontend.
 * data-key ist der öffentliche Content-API-Key (wie im Ghost-Theme auch).
 */
export function PortalScript() {
  const lang = langFromPath(usePathname());
  return (
    <script
      defer
      src="https://cdn.jsdelivr.net/ghost/portal@~2.51/umd/portal.min.js"
      data-i18n="true"
      data-ghost="https://cms.yannick-beck.de/"
      data-key="8203ccb5841dedc06465589e66"
      data-api="https://cms.yannick-beck.de/ghost/api/content/"
      data-locale={lang}
      crossOrigin="anonymous"
    />
  );
}
