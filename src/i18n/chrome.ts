import { getDictionary, withLang, type Lang } from './dictionaries';
import { isUnlisted } from '@/lib/routes';
import { LINKEDIN_URL } from '@/content/links';
import { SHOW_GAPS } from '@/lib/gaps';

/**
 * Texte für den Seitenrahmen (Header, Footer, Skip-Link, Vorschau-Hinweiszeile), auf dem Server
 * aus dem Dictionary zusammengestellt und als Props an die Client-Komponenten gereicht
 * (Feinschliff, Bundle). Vorher importierten diese Komponenten getDictionary – damit lag das
 * ganze Dictionary beider Sprachen (19,4 KiB roh, 6,7 KiB komprimiert laut
 * `next experimental-analyze`) in jedem Client-Bundle. Die Texte selbst bleiben in
 * dictionaries.ts (EINE Quelle).
 */

export interface ThemeLabels {
  toDark: string;
  toLight: string;
  toggle: string;
  scheme: string;
}

export interface HeaderLabels {
  brand: string;
  /** Hauptnavigation ohne nicht gelistete Bereiche (routes.ts UNLISTED_ROUTES) */
  nav: { label: string; href: string }[];
  menuTitle: string;
  menuOpen: string;
  switcherLabel: string;
  switcherName: string;
  switcherTarget: Lang;
  colorSchemeLabel: string;
  languageLabel: string;
  theme: ThemeLabels;
}

export type FooterLink = { label: string; href: string; external?: string };
export type FooterGroup = { title: string; links: FooterLink[] };

export interface FooterData {
  groups: FooterGroup[];
  footer: string;
  tagline: string;
  builtWith: string;
}

export interface PreviewNoticeLabels {
  label: string;
  line: string;
  statusTitle: string;
}

export function themeLabels(lang: Lang): ThemeLabels {
  const dict = getDictionary(lang);
  return { toDark: dict.themeToDark, toLight: dict.themeToLight, toggle: dict.themeToggle, scheme: dict.colorSchemeLabel };
}

export function headerLabels(lang: Lang): HeaderLabels {
  const dict = getDictionary(lang);
  return {
    brand: dict.brand,
    nav: dict.nav.filter((item) => !isUnlisted(item.href)).map((item) => ({ label: item.label, href: item.href })),
    menuTitle: dict.menuTitle,
    menuOpen: dict.menuOpen,
    switcherLabel: dict.switcherLabel,
    switcherName: dict.switcherName,
    switcherTarget: dict.switcherTarget,
    colorSchemeLabel: dict.colorSchemeLabel,
    languageLabel: dict.languageLabel,
    theme: themeLabels(lang),
  };
}

/**
 * Linkgruppen des Footers (Nutzerentscheidung): alle Seiten erreichbar, Kontaktwege nur Formular +
 * LinkedIn (keine öffentliche E-Mail, kein GitHub). Nicht gelistete Bereiche (UNLISTED_ROUTES:
 * /uses, bis zu eigenen Beiträgen auch /blog und /newsletter – JURY1-4) fehlen; ihre URLs bleiben
 * erreichbar. /content-status nur in der Vorschau.
 */
export function footerData(lang: Lang): FooterData {
  const dict = getDictionary(lang);
  const g = dict.footerGroups;
  const p = dict.pages;
  const pageLinks: [string, string][] = [
    [p['ueber-mich'].title, '/ueber-mich'],
    [p.projekte.title, '/projekte'],
    [p.leistungen.title, '/leistungen'],
    [p.cv.title, '/cv'],
    [p.blog.title, '/blog'],
    [p.newsletter.title, '/newsletter'],
  ];
  const pages: FooterGroup = {
    title: g.pages,
    links: pageLinks.filter(([, bare]) => !isUnlisted(bare)).map(([label, bare]) => ({ label, href: withLang(bare, lang) })),
  };
  const contact: FooterGroup = {
    title: g.contact,
    links: [
      { label: dict.footerContactLink, href: withLang('/kontakt', lang) },
      { label: dict.linkedinLabel, href: LINKEDIN_URL, external: dict.linkedinExternal },
    ],
  };
  const legal: FooterGroup = {
    title: g.legal,
    links: [
      { label: p.impressum.title, href: withLang('/impressum', lang) },
      { label: p.datenschutz.title, href: withLang('/datenschutz', lang) },
      ...(SHOW_GAPS ? [{ label: dict.statusTitle, href: withLang('/content-status', lang) }] : []),
    ],
  };
  return { groups: [pages, contact, legal], footer: dict.footer, tagline: dict.footerTagline, builtWith: dict.footerBuiltWith };
}

export function previewNoticeLabels(lang: Lang): PreviewNoticeLabels {
  const dict = getDictionary(lang);
  return { label: dict.previewNoticeLabel, line: dict.previewNoticeLine, statusTitle: dict.statusTitle };
}
