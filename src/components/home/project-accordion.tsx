'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { onJump } from './home-jump';
import styles from './projects.module.css';

export interface AccordionItem {
  id: string;
  /** Sprungziel (#project-<id>). */
  anchor: string;
  number: string;
  kind: string;
  period: string | null;
  title: string;
  shortTitle: string;
  /** Vorschau-Platzhalter neben der Meta-Zeile (nur mit NEXT_PUBLIC_SHOW_GAPS, sonst null). */
  metaExtra?: ReactNode;
  /** Inhalt (serverseitig gerendert: Cover, Ausgangslage, Beitrag, Ergebnis, Kacheln, Links). */
  panel: ReactNode;
}

/**
 * 03 Projekte: horizontales Akkordeon (Client-Blatt; Inhalte kommen fertig gerendert vom
 * Server, projects-section.tsx).
 *
 * Muster: Akkordeon (WAI-ARIA APG) mit genau einem offenen Eintrag. Jeder Eintrag hat EINEN
 * Kopf-Button in einer H3 (aria-expanded, aria-controls). Der offene lässt sich nicht
 * zuklappen (aria-disabled), damit immer ein Projekt sichtbar ist. Geschlossen ist derselbe
 * Button der schmale Streifen mit senkrechtem Titel (Trefferfläche = ganzer Streifen); der
 * Fokus bleibt beim Öffnen auf ihm. ←/→ (und ↑/↓) wechseln zwischen den Köpfen, Pos1/Ende.
 * Der Inhalt des geschlossenen Eintrags ist `inert`.
 *
 * Layout (projects.module.css): Ab 640px Breite nebeneinander; beide Inhalte sind immer in
 * voller Breite gesetzt, der geschlossene Eintrag beschneidet nur – die Höhe der Reihe ist
 * damit die des längeren Projekts und ändert sich beim Wechsel nicht. Schmaler: Akkordeon
 * untereinander. Übergänge: motion.css §7 (nur no-preference).
 */
export function ProjectAccordion({ items, label }: { items: AccordionItem[]; label: string }) {
  const [open, setOpen] = useState(items[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(
    () =>
      onJump((id) => {
        const hit = items.find((it) => it.anchor === id);
        if (hit) {
          setOpen(hit.id);
        }
      }),
    [items],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[data-acc-trigger]') ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) {
      return;
    }
    const last = buttons.length - 1;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? Math.min(index + 1, last)
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? Math.max(index - 1, 0)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    if (next >= 0) {
      event.preventDefault();
      buttons[next].focus();
    }
  };

  return (
    <div className={styles.accordion}>
      <ul ref={listRef} className={styles.list} aria-label={label} onKeyDown={onKeyDown}>
        {items.map((it) => {
          const isOpen = it.id === open;
          const buttonId = `${it.anchor}-button`;
          const panelId = `${it.anchor}-panel`;
          return (
            <li key={it.id} id={it.anchor} className={`${styles.item} yb-acc-item`} data-open={isOpen}>
              <div className={`${styles.inner} yb-acc-inner`}>
                <div className={`${styles.head} yb-acc-fade`}>
                  <p className={styles.meta}>
                    <span className={`${styles.number} yb-display`} aria-hidden="true">
                      {it.number}
                    </span>
                    <span className={styles.kind}>{it.kind}</span>
                    {it.period ? <span className={styles.period}>{it.period}</span> : null}
                    {it.metaExtra}
                  </p>
                  <h3 className={styles.title}>
                    <button
                      id={buttonId}
                      type="button"
                      className={styles.trigger}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      aria-disabled={isOpen || undefined}
                      data-acc-trigger=""
                      data-jump-focus=""
                      onClick={() => setOpen(it.id)}
                    >
                      {it.title}
                      <span className={styles.chevron} aria-hidden="true" />
                    </button>
                  </h3>
                </div>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`${styles.panel} yb-acc-panel`}
                  inert={!isOpen}
                >
                  <div className={`${styles.panelInner} yb-acc-fade`}>{it.panel}</div>
                </div>
              </div>
              <span className={`${styles.strip} yb-acc-strip`} aria-hidden="true">
                <span className={`${styles.stripNumber} yb-display`}>{it.number}</span>
                <span className={styles.stripTitle}>{it.shortTitle}</span>
                <span className={styles.stripEnd}>
                  {it.kind !== it.shortTitle ? <span className={styles.stripKind}>{it.kind}</span> : null}
                  <span className={styles.stripPlus} />
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
