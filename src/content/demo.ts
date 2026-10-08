/**
 * Themen-Beschriftungen und Bereiche für Ghost-Tags und Demo-Artikel (Vorschau).
 * Die früheren Demo-Projekte sind entfernt: Projekte kommen ausschließlich aus dem
 * Content-Modell (src/content/profile.ts).
 */
import type { Lang } from '@/i18n/dictionaries';

export { TRANSLATION_MAP } from '@/i18n/translations';

export const TOPIC_LABELS: Record<Lang, Record<string, string>> = {
  de: {
    web: 'Webentwicklung',
    cms: 'CMS',
    automation: 'Automatisierung',
    nextjs: 'Next.js',
    ghost: 'Ghost',
    tooling: 'Werkzeuge',
  },
  en: {
    web: 'Web development',
    cms: 'CMS',
    automation: 'Automation',
    nextjs: 'Next.js',
    ghost: 'Ghost',
    tooling: 'Tooling',
  },
};

export type ProjectCategory = 'web' | 'cms' | 'automation';
