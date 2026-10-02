'use client';

import type { ReactNode } from 'react';
import { useRouteLang } from '@/i18n/route-lang';

/**
 * Wählt die 404-Fassung nach der Seitensprache (JURY1-1). Beide Fassungen kommen fertig vom
 * Server (Slots) – im Client-Bundle steht nur diese Auswahl, nicht der 404-Inhalt.
 */
export function NotFoundLangSwitch({ de, en }: { de: ReactNode; en: ReactNode }) {
  return useRouteLang() === 'en' ? en : de;
}
