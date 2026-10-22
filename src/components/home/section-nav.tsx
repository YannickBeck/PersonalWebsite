'use client';

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
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
 * - Aktiver Abschnitt: der letzte, dessen Oberkante die Messlinie überschritten hat
 *   (aria-current="true"). Die Linie liegt dort, wo die Leiste KLEBT (Header + Leiste + 20 %
 *   der Höhe) – nicht an ihrer aktuellen Lage: Vor dem Kleben steht sie am Bühnenende, die
 *   Linie lag dann ~200px tiefer und markierte beim Laden „01“ statt „00 Start“ (DES3).
 *   Mobil scrollt die Leiste die aktive Pille horizontal in Sicht (nie vertikal).
 * - Klick: sanftes Scrollen nur bei prefers-reduced-motion: no-preference, Fokus auf die
 *   Abschnittsüberschrift (Tastatur/Screenreader landen im Abschnitt), URL per replaceState –
 *   kein History-Eintrag ohne Next-State (FUN2, route-transition.tsx).
 * - Tastatur: Tab wie gewohnt; zusätzlich ←/→ sowie Pos1/Ende zwischen den Pillen. Die
 *   fokussierte Pille rückt waagerecht ganz in den Scroller, samt Fokusring (Abschluss-Fixes
 *   A114: Chrome scrollte den Scroller beim Fokus nicht – bei 390px blieb von „04 Werdegang“
 *   bzw. „05 Contact“ nur ein Bogen des Rings sichtbar). Nur der Scroller, nie die Seite.
 * - Ab 768px steht „Auf dieser Seite“ vor den Pillen (DES14): Header und Leiste nennen teils
 *   dieselben Begriffe („Über mich“, „Projekte“, „Kontakt“), führen aber oben auf Unterseiten
 *   und hier zu Abschnitten. Für Screenreader sagt das aria-label der Navigation dasselbe.
 *   Mobil liegen die Header-Links im Menü – dort gibt es keine Doppelung.
 * - Header-Höhe (Touch: größere Bedienelemente) als --yb-header-h und Leistenhöhe als
 *   --yb-section-nav-h am <html> (ResizeObserver): globals.css setzt daraus auf der Startseite
 *   scroll-padding-top, damit Fokus und Sprungziele nie unter den klebenden Leisten liegen
 *   (WCAG 2.4.11, A112). Bei geringer Höhe (≤ 500px, z. B. 200 % Zoom, Handy quer) klebt die
 *   Leiste nicht (A120) – dann zählt nur der Header.
 */
export function SectionNav({ items, label, hint }: { items: SectionNavItem[]; label: string; hint: string }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');
  const listRef = useRef<HTMLUListElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Header- und Leistenhöhe veröffentlichen
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.yb-vt-header');
    const nav = navRef.current;
    const root = document.documentElement;
    if (!header || !nav) {
      return;
    }
    const update = () => {
      root.style.setProperty('--yb-header-h', `${Math.round(header.getBoundingClientRect().height)}px`);
      root.style.setProperty('--yb-section-nav-h', `${Math.round(nav.getBoundingClientRect().height)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    ro.observe(nav);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--yb-header-h');
      root.style.removeProperty('--yb-section-nav-h');
    };
  }, []);

  // Aktiven Abschnitt aus der Scroll-Position bestimmen (rAF-gedrosselt, passiv)
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const nav = navRef.current;
      const header = document.querySelector<HTMLElement>('.yb-vt-header');
      // Messlinie aus der Klebeposition (Header-Unterkante + Leistenhöhe), nicht aus der
      // aktuellen Lage der Leiste (DES3)
      const stuckBottom = (header ? header.getBoundingClientRect().bottom : 0) + (nav ? nav.offsetHeight : 0);
      const line = stuckBottom + window.innerHeight * 0.2;
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
    // scroll-padding-top der Startseite (Header + Leiste) bestimmt, wo der Abschnitt landet
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const focusTarget = target.querySelector<HTMLElement>('[data-section-focus]') ?? target;
    focusTarget.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, '', `#${id}`);
    setActive(id);
  };

  // Fokussierte Pille samt Ring (Polster = scroll-padding-inline) waagerecht in Sicht (A114)
  const onFocus = (event: FocusEvent<HTMLUListElement>) => {
    const list = listRef.current;
    const link = event.target;
    if (!list || !(link instanceof HTMLAnchorElement) || list.scrollWidth <= list.clientWidth) {
      return;
    }
    const pad = parseFloat(getComputedStyle(list).scrollPaddingInlineStart) || 0;
    const box = list.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    const dx = r.right + pad > box.right ? r.right + pad - box.right : r.left - pad < box.left ? r.left - pad - box.left : 0;
    if (dx !== 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollBy({ left: dx, behavior: reduce ? 'auto' : 'smooth' });
    }
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
    <nav ref={navRef} aria-label={label} className={`${styles.sectionNav} yb-section-nav print-hide`}>
      <div className={styles.sectionNavBar}>
        <span className={styles.sectionNavHint} aria-hidden="true">
          {hint}
        </span>
        <ul ref={listRef} className={styles.sectionNavList} onKeyDown={onKeyDown} onFocus={onFocus}>
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
      </div>
    </nav>
  );
}
