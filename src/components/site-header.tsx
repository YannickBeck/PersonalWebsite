'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { SideNavItem } from '@astryxdesign/core/SideNav';
import { ThemeToggle } from '@/components/theme-toggle';
import { BrandMark } from '@/components/brand-mark';
import {
  getDictionary,
  langFromPath,
  mirrorPath,
  withLang,
  type Lang,
} from '@/i18n/dictionaries';
import { TRANSLATION_MAP } from '@/i18n/translations';
import styles from './site-header.module.css';

/** Statische Routen, die es in beiden Sprachen gibt (ohne /en-Präfix). */
const KNOWN_PATHS = new Set([
  '/',
  '/projekte',
  '/blog',
  '/leistungen',
  '/cv',
  '/kontakt',
  '/ueber-mich',
  '/uses',
  '/newsletter',
  '/impressum',
  '/datenschutz',
  '/content-status',
]);

/**
 * Sprachwechsel über Übersetzungszuordnung: Detailseiten springen zum
 * Gegenstück, bekannte Seiten werden gespiegelt, alles andere (404, /_not-found)
 * führt auf die anderssprachige Startseite – nie auf eine weitere 404 (T6).
 */
export function switchTarget(pathname: string, target: Lang): string {
  const home = target === 'en' ? '/en' : '/';
  const segs = pathname.split('/').filter(Boolean);
  const noPrefix = segs[0] === 'en' ? segs.slice(1) : segs;
  if ((noPrefix[0] === 'projekte' || noPrefix[0] === 'blog') && noPrefix.length === 2) {
    const counterpart = TRANSLATION_MAP[noPrefix[1]];
    return counterpart ? withLang(`/${noPrefix[0]}/${counterpart}`, target) : home;
  }
  const bare = `/${noPrefix.join('/')}`;
  return KNOWN_PATHS.has(bare) ? mirrorPath(pathname, target) : home;
}

/** Aktive Seite: exakter Treffer oder Unterseite (Projekt-/Artikel-Detail markiert „Projekte“/„Blog“). */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  // Drawer gilt nur für den Pfad, auf dem er geöffnet wurde: Navigation schließt ihn
  // ohne Effekt (kein setState im Effekt, react-hooks/set-state-in-effect).
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const homeHref = lang === 'en' ? '/en' : '/';
  const langHref = switchTarget(pathname, dict.switcherTarget);

  return (
    <header>
      <TopNav
        label={dict.menuTitle}
        heading={<TopNavHeading logo={<BrandMark />} heading={dict.brand} headingHref={homeHref} />}
        startContent={dict.nav.map((item) => (
          <TopNavItem
            key={item.href}
            className={styles.desktopOnly}
            label={item.label}
            href={item.href}
            isSelected={isActive(pathname, item.href)}
          />
        ))}
        endContent={
          <HStack gap={1} vAlign="center">
            <Button className={styles.langInBar} variant="ghost" label={dict.switcherLabel} href={langHref} />
            <ThemeToggle lang={lang} />
            <IconButton
              className={styles.mobileOnly}
              variant="ghost"
              label={dict.menuOpen}
              icon={<Icon icon="menu" />}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
            />
          </HStack>
        }
      />
      <MobileNav isOpen={menuOpen} onOpenChange={setMenuOpen} side="end" header={dict.menuTitle}>
        <VStack gap={4}>
          <VStack gap={0.5} as="nav" aria-label={dict.menuTitle}>
            {dict.nav.map((item) => (
              <SideNavItem
                key={item.href}
                label={item.label}
                href={item.href}
                size="lg"
                isSelected={isActive(pathname, item.href)}
              />
            ))}
          </VStack>
          <Divider />
          <HStack gap={2} vAlign="center" justify="between" paddingInline={2}>
            <Text type="label" color="secondary">
              {dict.colorSchemeLabel}
            </Text>
            <ThemeToggle lang={lang} />
          </HStack>
          <HStack gap={2} vAlign="center" justify="between" paddingInline={2}>
            <Text type="label" color="secondary">
              {dict.languageLabel}
            </Text>
            <Button variant="ghost" label={dict.switcherLabel} href={langHref} />
          </HStack>
        </VStack>
      </MobileNav>
    </header>
  );
}
