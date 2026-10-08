'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import styles from './home.module.css';

export interface SectionNavItem {
  id: string;
  label: string;
  number: string;
}

/**
 * Abschnittsnavigation der Startseite: kompakte Pillenleiste, klebt unter dem Header.
 *
 * - Ohne JS: normale Anker-Links (#ueber-mich …), alles erreichbar.
 * - Aktiver Abschnitt: der letzte, dessen Oberkante die Linie unter Header + Leiste
 *   überschritten hat (aria-current="true"); mobil scrollt die Leiste die aktive Pille
 *   horizontal in Sicht (nie vertikal).
 * - Klick: sanftes Scrollen nur bei prefers-reduced-motion: no-preference, Fokus auf die
 *   Abschnittsüberschrift (Tastatur/Screenreader landen im Abschnitt), URL per replaceState –
 *   kein History-Eintrag ohne Next-State (FUN2, route-transition.tsx).
 * - Tastatur: Tab wie gewohnt; zusätzlich ←/→ sowie Pos1/Ende zwischen den Pillen.
 * - Header-Höhe (Touch: größere Bedienelemente) als --yb-header-h am <html> (ResizeObserver),
 *   damit Leiste und scroll-margin der Abschnitte darunter ansetzen.
 */
export function SectionNav({ items, label }: { items: SectionNavItem[]; label: string }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');
  const listRef = useRef<HTMLUListElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Header-Höhe veröffentlichen
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.yb-vt-header');
    const root = document.documentElement;
    if (!header) {
      return;
    }
    const update = () => root.style.setProperty('--yb-header-h', `${Math.round(header.getBoundingClientRect().height)}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--yb-header-h');
    };
  }, []);

  // Aktiven Abschnitt aus der Scroll-Position bestimmen (rAF-gedrosselt, passiv)
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const nav = navRef.current;
      const line = (nav ? nav.getBoundingClientRect().bottom : 0) + window.innerHeight * 0.2;
      let current = items[0]?.id ?? '';
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) {
          current = item.id;
        }
      }
      // Seitenende erreicht: letzter Abschnitt aktiv (kurze Abschnitte erreichen die Linie nie)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = items[items.length - 1]?.id ?? current;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [items]);

  // Aktive Pille horizontal in Sicht halten (nur der Scroller, nie die Seite)
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) {
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
  }, [active]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const focusTarget = target.querySelector<HTMLElement>('[data-section-focus]') ?? target;
    focusTarget.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, '', `#${id}`);
    setActive(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const links = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) {
      return;
    }
    const next =
      event.key === 'ArrowRight'
        ? Math.min(index + 1, links.length - 1)
        : event.key === 'ArrowLeft'
          ? Math.max(index - 1, 0)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? links.length - 1
              : -1;
    if (next >= 0) {
      event.preventDefault();
      links[next].focus();
    }
  };

  return (
    <nav ref={navRef} aria-label={label} className={`${styles.sectionNav} print-hide`}>
      <ul ref={listRef} className={styles.sectionNavList} onKeyDown={onKeyDown}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`${styles.sectionNavLink} yb-section-nav-link`}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(event) => onClick(event, item.id)}
            >
              <span className={`${styles.sectionNavNumber} yb-display`} aria-hidden="true">
                {item.number}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
