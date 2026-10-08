import type { Lang } from '@/i18n/dictionaries';

/** Maße und Alt-Text des Vorschaubilds (og:image, src/app/og/[lang]/route.ts). */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT: Record<Lang, string> = {
  de: 'Yannick Beck – IT Consultant, Microsoft Cloud & AI, Modern Workplace',
  en: 'Yannick Beck – IT Consultant, Microsoft Cloud & AI, Modern Workplace',
};
