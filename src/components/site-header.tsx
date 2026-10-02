'use client';

import { useState, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { useRouteLang } from '@/i18n/route-lang';
import { counterpartPath } from '@/lib/routes';
import { navTransitionTypes } from '@/lib/transitions';
import { markNavigationStart } from '@/components/route-transition';
import styles from './site-header.module.css';

/**
 * Sprachwechsel über Übersetzungszuordnung: Detailseiten springen zum
 * Gegenstück, bekannte Seiten werden gespiegelt, alles andere (404, /_not-found)
 * führt auf die anderssprachige Startseite – nie auf eine weitere 404 (T6).
 */
export function switchTarget(pathname: string, target: Lang): string {
  const home = target === 'en' ? '/en' : '/';
  const segs = pathname.split('/').filter(Boolean);
  const bare = `/${(segs[0] === 'en' ? segs.slice(1) : segs).join('/')}`;
  const other = counterpartPath(bare);
  return other ? withLang(other, target) : home;
}

/**
 * Wartezeit, bis der Drawer zu ist (MOT2): Astryx schließt den <dialog> nach 60 % seiner
 * Haltezeit (--duration-medium, MobileNav resolveCloseDelay); bis dahin ist die Slide-out-
 * Bewegung (ease-standard) fast fertig. Danach erst navigieren – sonst verschwanden Drawer
 * und Abdunklung hart, die alte Seite blitzte ungedimmt auf und es folgte ein Leerbild.
 */
function drawerCloseMs(): number {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--duration-medium').trim();
  const ms = raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : NaN;
  return Number.isFinite(ms) ? Math.round(ms * 0.6) : 210;
}

/** Aktive Seite: exakter Treffer oder Unterseite (Projekt-/Artikel-Detail markiert „Projekte“/„Blog“). */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const lang = useRouteLang();
  const dict = getDictionary(lang);
  // Drawer gilt nur für den Pfad, auf dem er geöffnet wurde: Navigation schließt ihn
  // ohne Effekt (kein setState im Effekt, react-hooks/set-state-in-effect).
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const homeHref = lang === 'en' ? '/en' : '/';
  const langHref = switchTarget(pathname, dict.switcherTarget);
  const router = useRouter();

  // Links im Drawer: erst schließen, dann navigieren (MOT2). Modifier-Klicks (neuer Tab)
  // bleiben beim Browser.
  const navigateFromDrawer = (href: string) => (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    setMenuOpen(false);
    if (href === pathname) {
      return;
    }
    window.setTimeout(() => {
      markNavigationStart();
      router.push(href, { transitionTypes: navTransitionTypes(pathname, href) });
    }, drawerCloseMs());
  };

  return (
    <header>
      <TopNav
        label={dict.menuTitle}
        heading={<TopNavHeading logo={<BrandMark />} heading={dict.brand} headingHref={homeHref} />}
        startContent={dict.nav.map((item) => (
          <TopNavItem
            key={item.href}
            className={`${styles.desktopOnly} yb-nav-item`}
            label={item.label}
            href={item.href}
            isSelected={isActive(pathname, item.href)}
          >
            {item.label}
            {/* Unterstrich-Indikator (motion.css §5): Hover wächst er ein, die aktive Seite
                trägt ihn; beim Seitenwechsel gleitet er per View Transition zum neuen Punkt. */}
            <span className="yb-nav-indicator" aria-hidden="true" />
          </TopNavItem>
        ))}
        endContent={
          <HStack gap={1} vAlign="center">
            {/* Sichtbar „EN“/„DE“, Name „English (EN)“/„Deutsch (DE)“ (A124, enthält das sichtbare
                Kürzel); hrefLang/lang setzt TransitionLink für Links in die andere Sprache. */}
            <Button
              className={styles.langInBar}
              variant="ghost"
              label={dict.switcherLabel}
              aria-label={dict.switcherName}
              href={langHref}
            />
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
                onClick={navigateFromDrawer(item.href)}
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
            <Button
              variant="ghost"
              label={dict.switcherLabel}
              aria-label={dict.switcherName}
              href={langHref}
              onClick={navigateFromDrawer(langHref)}
            />
          </HStack>
        </VStack>
      </MobileNav>
    </header>
  );
}
