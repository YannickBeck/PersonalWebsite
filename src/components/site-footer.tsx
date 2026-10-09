'use client';

import { usePathname } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { BrandMark } from '@/components/brand-mark';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { LINKEDIN_URL } from '@/content/links';
import { SHOW_GAPS } from '@/lib/gaps';
import { isUnlisted } from '@/lib/routes';
import { useRouteLang } from '@/i18n/route-lang';
import styles from './site-footer.module.css';

type FooterGroup = { title: string; links: { label: string; href: string; external?: string }[] };

/**
 * Linkgruppe als eigene <nav> mit Namen statt H3 (T9: keine Überschriften-Sprünge
 * h1 → h3 auf jeder Seite). Der sichtbare Gruppentitel ist ein Label.
 */
function Group({ group, isCurrent }: { group: FooterGroup; isCurrent: (href: string) => boolean }) {
  return (
    <VStack as="nav" aria-label={group.title} gap={2}>
      <Text type="label" color="secondary">
        {group.title}
      </Text>
      <VStack gap={0} as="ul" className={styles.list}>
        {group.links.map((l) => (
          <li key={l.href} className={styles.item}>
            {l.external ? (
              <Link href={l.href} color="primary" target="_blank" rel="noopener noreferrer" aria-label={l.external}>
                {l.label} ↗
              </Link>
            ) : (
              <Link
                href={l.href}
                color={isCurrent(l.href) ? 'accent' : 'primary'}
                aria-current={isCurrent(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </VStack>
    </VStack>
  );
}

/**
 * Linkgruppen (Nutzerentscheidung): alle Seiten erreichbar, Kontaktwege nur Formular + LinkedIn
 * (keine öffentliche E-Mail, kein GitHub). Nicht gelistete Bereiche (UNLISTED_ROUTES) sind nicht
 * verlinkt (URLs bleiben erreichbar); /content-status nur in der Vorschau.
 */
function groups(lang: Lang): FooterGroup[] {
  const dict = getDictionary(lang);
  const g = dict.footerGroups;
  const p = dict.pages;
  // Nicht gelistete Bereiche (routes.ts UNLISTED_ROUTES: /uses, bis zu eigenen Beiträgen auch
  // /blog und /newsletter – JURY1-4) fehlen hier; ihre URLs bleiben erreichbar.
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
      { label: p.kontakt.title, href: withLang('/kontakt', lang) },
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
  return [pages, contact, legal];
}

export function SiteFooter() {
  const pathname = usePathname();
  const lang = useRouteLang();
  const dict = getDictionary(lang);
  const isCurrent = (href: string) => pathname === href;
  return (
    <footer>
      <VStack gap={8} paddingBlockStart={6} paddingBlockEnd={2}>
        <Grid columns={{ minWidth: 150, max: 3 }} gap={6}>
          {groups(lang).map((g) => (
            <Group key={g.title} group={g} isCurrent={isCurrent} />
          ))}
        </Grid>
        <HStack gap={3} wrap="wrap" vAlign="center" justify="between">
          <HStack gap={2} vAlign="center">
            <BrandMark />
            <Text type="supporting" color="secondary">
              {dict.footer} · {dict.footerTagline}
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            {dict.footerBuiltWith}
          </Text>
        </HStack>
      </VStack>
    </footer>
  );
}
