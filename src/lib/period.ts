import type { Lang } from '@/i18n/dictionaries';
import { getDictionary } from '@/i18n/dictionaries';

const LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };

/** 'JJJJ-MM' → „Okt. 2023“ / „Oct 2023“ (feste Zeitzone: Server und Browser gleich). */
export function formatMonth(ym: string, lang: Lang): string {
  const [y, m] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE[lang], { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

/** Zeitraum „Okt. 2023 – Okt. 2026“; end null → „heute“. */
export function formatPeriod(start: string, end: string | null, lang: Lang): string {
  const to = end ? formatMonth(end, lang) : getDictionary(lang).today;
  return `${formatMonth(start, lang)} – ${to}`;
}

/** Zeitraum in zwei Teilen [„Okt. 2023 –“, „Okt. 2026“] – zum Umbrechen nur nach dem Strich. */
export function periodParts(start: string, end: string | null, lang: Lang): [string, string] {
  const to = end ? formatMonth(end, lang) : getDictionary(lang).today;
  return [`${formatMonth(start, lang)} –`, to];
}

/** Nur Jahre: „2023 – 2026“, „2026 – heute“, bei gleichem Jahr „2023“. */
export function formatYears(start: string, end: string | null, lang: Lang): string {
  const a = start.slice(0, 4);
  const b = end ? end.slice(0, 4) : getDictionary(lang).today;
  return a === b ? a : `${a} – ${b}`;
}

/** Maschinenlesbar für <time dateTime>. */
export function isoMonth(ym: string): string {
  return ym;
}

/**
 * Listenpunkte als Satzteil: „Generative AI, RAG …“. Englisch kleingeschrieben mitten im Satz
 * („Focus of the thesis: generative AI, retrieval-augmented generation …“, TEX15) – die Daten
 * bleiben Listenform mit großem Anfangsbuchstaben; Deutsch unverändert (Substantive).
 */
export function sentenceList(items: string[], lang: Lang): string {
  const parts = lang === 'en' ? items.map((t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t)) : items;
  return parts.join(', ');
}
