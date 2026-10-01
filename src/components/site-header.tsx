'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from '@astryxdesign/core/TopNav';
import { TopNavHeading } from '@astryxdesign/core/TopNav';
import { TopNavItem } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Link } from '@astryxdesign/core/Link';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  getDictionary,
  langFromPath,
  mirrorPath,
  withLang,
  type Lang,
} from '@/i18n/dictionaries';
import { TRANSLATION_MAP } from '@/i18n/translations';
import styles from './site-header.module.css';

/**
 * Sprachwechsel über Übersetzungszuordnung: Detailseiten springen zum
 * Gegenstück, sonst zur anderssprachigen Startseite (keine 404-Links).
 */
export function switchTarget(pathname: string, target: Lang): string {
  const segs = pathname.split('/').filter(Boolean);
  const noPrefix = segs[0] === 'en' ? segs.slice(1) : segs;
  if (
    (noPrefix[0] === 'projekte' || noPrefix[0] === 'blog') &&
    noPrefix[1]
  ) {
    const counterpart = TRANSLATION_MAP[noPrefix[1]];
    if (counterpart) {
      return withLang(`/${noPrefix[0]}/${counterpart}`, target);
    }
    return target === 'en' ? '/en' : '/';
  }
  return mirrorPath(pathname, target);
}

export function SiteHeader() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  // Menü gilt nur für den Pfad, auf dem es geöffnet wurde: ein Routenwechsel schließt es
  // ohne Effekt (kein setState im Effekt, react-hooks/set-state-in-effect).
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const panelRef = useRef<HTMLDivElement>(null);
  const homeHref = lang === 'en' ? '/en' : '/';

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPath(null);
      }
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('a')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header>
      <div className={styles.desktop}>
        <TopNav
          heading={
            <TopNavHeading heading={dict.brand} headingHref={homeHref} />
          }
          startContent={dict.nav.map((item) => (
            <TopNavItem
              key={item.href}
              label={item.label}
              href={item.href}
              isSelected={pathname === item.href}
            />
          ))}
          endContent={
            <HStack gap={1}>
              <Button
                variant="ghost"
                label={dict.switcherLabel}
                href={switchTarget(pathname, dict.switcherTarget)}
              />
              <ThemeToggle lang={lang} />
            </HStack>
          }
        />
      </div>
      <div className={styles.mobileBar}>
        <Link href={homeHref}>{dict.brand}</Link>
        <HStack gap={1}>
          <Button
            variant="ghost"
            label={dict.switcherLabel}
            href={switchTarget(pathname, dict.switcherTarget)}
          />
          <ThemeToggle lang={lang} />
          <Button
            variant="ghost"
            label={menuOpen ? dict.menuClose : dict.menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? '✕' : '☰'}
          </Button>
        </HStack>
      </div>
      {menuOpen && (
        <div
          className={styles.mobilePanel}
          id="mobile-nav"
          ref={panelRef}
          role="navigation"
          aria-label={lang === 'en' ? 'Menu' : 'Menü'}
        >
          <VStack gap={2}>
            {dict.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </VStack>
        </div>
      )}
    </header>
  );
}
