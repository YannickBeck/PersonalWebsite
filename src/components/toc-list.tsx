'use client';

import { useEffect, useState } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { Link } from '@astryxdesign/core/Link';
import type { TocEntry } from '@/components/reading-layout';
import styles from './reading-layout.module.css';

/**
 * Inhaltsverzeichnis mit aktivem Abschnitt (VIS3): IntersectionObserver auf die h2 der
 * Lesespalte; der zuletzt über die obere Viewport-Kante gerutschte Abschnitt ist aktiv
 * (Akzent-Strich + aria-current="location"). Wenige hundert Byte, keine Bibliothek (E5).
 * Ohne JS: normale Ankerliste.
 */
export function TocList({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) {
            visible.add(r.target.id);
          } else {
            visible.delete(r.target.id);
          }
        }
        // Oberster sichtbarer Abschnitt; ist keiner sichtbar, der letzte darüber
        const top = headings.find((h) => visible.has(h.id));
        const above = [...headings].reverse().find((h) => h.getBoundingClientRect().top < 0);
        setActive((top ?? above)?.id ?? null);
      },
      // Bereich: unter dem Sticky-Header bis zur Viewport-Mitte
      { rootMargin: '-80px 0px -50% 0px' },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <VStack as="ol" gap={0} className={styles.toc}>
      {entries.map((h) => (
        <li key={h.id} className={`${styles.tocItem} ${active === h.id ? styles.tocActive : ''}`}>
          <Link
            href={`#${h.id}`}
            color={active === h.id ? 'primary' : 'secondary'}
            aria-current={active === h.id ? 'location' : undefined}
          >
            {h.text}
          </Link>
        </li>
      ))}
    </VStack>
  );
}
