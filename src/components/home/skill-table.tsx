'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import type { SkillCategory } from '@/content/profile';
import type { HomeEvidence, SkillTileData } from '@/content/profile-view';
import { onJump } from './home-jump';
import styles from './skills.module.css';

export interface SkillTableLabels {
  filter: string;
  all: string;
  table: string;
  hint: string;
  evidence: string;
  source: string;
  license: string;
  /** „öffnet in neuem Tab“ (A126) */
  newTab: string;
  kinds: Record<HomeEvidence['kind'], string>;
}

export interface SkillTableProps {
  /** Basis für IDs (Abschnitts-ID). */
  baseId: string;
  tiles: SkillTileData[];
  categories: { id: SkillCategory; label: string; short: string }[];
  labels: SkillTableLabels;
}

const two = (n: number) => String(n).padStart(2, '0');

/**
 * 02 Fähigkeiten: Periodensystem (Client-Blatt; Daten serverseitig aus dem Content-Modell,
 * siehe skills-section.tsx).
 *
 * Muster: Tabs (WAI-ARIA APG) – jede Kachel ist ein Tab, das Detailfeld das Tabpanel.
 * - Roving tabindex: genau eine Kachel ist im Tab-Fluss (die gewählte). Auswahl folgt dem Fokus.
 *   ←/→ eine Kachel weiter (am Ende umlaufend), ↑/↓ die Kachel darüber bzw. darunter (nach
 *   Lage auf dem Bildschirm, damit es bei jeder Spaltenzahl stimmt), Pos1/Ende.
 * - Filter: Pillen mit aria-pressed (eine Kategorie oder „Alle“; erneutes Drücken hebt den
 *   Filter auf). Andere Kacheln bleiben an ihrem Platz, werden blass und `inert` (nicht
 *   fokussierbar, nicht im Accessibility-Baum) – das Raster springt nicht.
 * - Sprungziel `#skill-<id>` (Projekt-Akkordeon, Projektseiten): wählt die Kachel, hebt einen
 *   Filter auf, der sie verdeckt (home-jump.tsx).
 * - Hover ist nie nötig: Klick/Tippen/Tastatur wählen, das Detailfeld zeigt alles. Eine
 *   vollständige Textliste für Screenreader rendert skills-section.tsx serverseitig.
 * - Name der Kachel aus ihrem Inhalt (A114, Label-in-Name): sichtbares Kürzel + Kurzname und,
 *   wo er fehlt oder abweicht, der volle Name als sr-only („Ms, Microsoft 365“). Die Nummer
 *   bleibt dekorativ.
 * - Auswahl per Zeiger (Klick/Tippen), während das Detailfeld unter dem Raster außer Sicht
 *   liegt (schmale Breiten): das Feld rückt in Sicht (block: nearest, A118). Pfeiltasten
 *   scrollen nicht – dort wäre das bei jedem Schritt störend.
 */
export function SkillTable({ baseId, tiles, categories, labels }: SkillTableProps) {
  const [selected, setSelected] = useState(tiles[0]?.id);
  const [filter, setFilter] = useState<SkillCategory | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tableId = `${baseId}-table`;
  const panelId = `${baseId}-panel`;
  const hintId = `${baseId}-hint`;

  const visible = (t: SkillTileData) => filter === null || t.category === filter;
  const current = tiles.find((t) => t.id === selected) ?? tiles[0];

  // Sprungziel: Kachel wählen (Filter aufheben, wenn er sie verdeckt)
  useEffect(
    () =>
      onJump((id) => {
        const hit = tiles.find((t) => t.anchor === id);
        if (!hit) {
          return;
        }
        setFilter((f) => (f === null || f === hit.category ? f : null));
        setSelected(hit.id);
      }),
    [tiles],
  );

  const chooseFilter = (cat: SkillCategory | null) => {
    const next = cat === filter ? null : cat;
    setFilter(next);
    if (next && current.category !== next) {
      const first = tiles.find((t) => t.category === next);
      if (first) {
        setSelected(first.id);
      }
    }
  };

  /** Zeiger-Auswahl (event.detail > 0; Enter/Leertaste liefern 0): Detailfeld in Sicht holen. */
  const pick = (event: MouseEvent<HTMLButtonElement>, id: SkillTileData['id']) => {
    setSelected(id);
    if (event.detail === 0) {
      return;
    }
    window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const r = panel.getBoundingClientRect();
      // Sichtbar genug: Kopf des Feldes (Kachel + Name) steht im Fenster
      if (r.top >= 0 && r.top + Math.min(r.height, 220) <= window.innerHeight) {
        return;
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    });
  };

  const focusTile = (id: string) => {
    setSelected(id as SkillTileData['id']);
    listRef.current?.querySelector<HTMLElement>(`[data-skill="${id}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = tiles.filter(visible);
    const active = document.activeElement as HTMLElement | null;
    const index = enabled.findIndex((t) => t.id === active?.dataset.skill);
    if (index < 0 || !active) {
      return;
    }
    let target: string | undefined;
    switch (event.key) {
      case 'ArrowRight':
        target = enabled[(index + 1) % enabled.length].id;
        break;
      case 'ArrowLeft':
        target = enabled[(index - 1 + enabled.length) % enabled.length].id;
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        // Nächste Zeile nach Bildschirmlage, darin die waagerecht nächste Kachel
        const dir = event.key === 'ArrowDown' ? 1 : -1;
        const r0 = active.getBoundingClientRect();
        const cx = r0.left + r0.width / 2;
        let best: { id: string; dy: number; dx: number } | null = null;
        for (const t of enabled) {
          const el = listRef.current?.querySelector<HTMLElement>(`[data-skill="${t.id}"]`);
          if (!el || el === active) {
            continue;
          }
          const r = el.getBoundingClientRect();
          const dy = dir * (r.top - r0.top);
          if (dy <= 1) {
            continue;
          }
          const dx = Math.abs(r.left + r.width / 2 - cx);
          if (!best || dy < best.dy - 1 || (Math.abs(dy - best.dy) <= 1 && dx < best.dx)) {
            best = { id: t.id, dy, dx };
          }
        }
        target = best?.id;
        if (!target) {
          event.preventDefault();
          return;
        }
        break;
      }
      case 'Home':
        target = enabled[0].id;
        break;
      case 'End':
        target = enabled[enabled.length - 1].id;
        break;
      default:
        return;
    }
    event.preventDefault();
    focusTile(target);
  };

  const category = categories.find((c) => c.id === current.category);

  return (
    <div className={styles.skills}>
      <div role="group" aria-label={labels.filter} className={styles.filters}>
        <button type="button" className={`${styles.pill} yb-skill-pill`} aria-pressed={filter === null} onClick={() => chooseFilter(null)}>
          {labels.all}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.pill} yb-skill-pill yb-cat`}
            data-category={c.id}
            aria-pressed={filter === c.id}
            aria-label={c.label}
            onClick={() => chooseFilter(c.id)}
          >
            <span className={styles.swatch} aria-hidden="true" />
            {c.short}
          </button>
        ))}
      </div>

      <div id={tableId} className={styles.table}>
        <div
          ref={listRef}
          role="tablist"
          aria-label={labels.table}
          aria-describedby={hintId}
          className={styles.grid}
          onKeyDown={onKeyDown}
        >
          {tiles.map((t) => {
            const on = visible(t);
            const isSelected = t.id === current.id;
            return (
              <button
                key={t.id}
                id={t.anchor}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected && on ? 0 : -1}
                inert={!on}
                data-skill={t.id}
                data-category={t.category}
                data-jump-focus=""
                data-jump-scroll={tableId}
                className={`${styles.tile} yb-skill-tile yb-cat`}
                onClick={(event) => pick(event, t.id)}
              >
                <span className={styles.tileNum} aria-hidden="true">
                  {two(t.n)}
                </span>
                <span className={styles.tileSymbol}>{t.symbol}</span>
                <span className={styles.tileName}>
                  <span className="yb-sr-only">, </span>
                  {t.tile}
                </span>
                {/* voller Name für Screenreader – ausgeblendet, wo der sichtbare Kurzname ihn schon nennt */}
                <span className={`${styles.tileFull} yb-sr-only`} data-same={t.tile.replace(/\u00AD/g, '') === t.name ? '' : undefined}>
                  , {t.name}
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={panelRef}
          role="tabpanel"
          id={panelId}
          aria-labelledby={current.anchor}
          className={`${styles.detail} yb-cat`}
          data-category={current.category}
        >
          <div className={styles.element}>
            <div className={styles.elementTop} aria-hidden="true">
              <span className={styles.elementNum}>{two(current.n)}</span>
              {current.logo ? <span className={styles.elementSymbolSmall}>{current.symbol}</span> : null}
            </div>
            {current.logo ? (
              <span
                className={styles.elementLogo}
                aria-hidden="true"
                style={{ '--yb-logo': `url(${current.logo.src})` } as CSSProperties}
              />
            ) : (
              <span className={styles.elementSymbol} aria-hidden="true">
                {current.symbol}
              </span>
            )}
            <h3 className={styles.detailName}>{current.name}</h3>
            <p className={styles.detailCategory}>
              <span className={styles.swatch} aria-hidden="true" />
              {category?.label}
            </p>
          </div>

          <div className={styles.detailBody}>
            <p className={styles.detailLabel}>{labels.evidence}</p>
            <ul className={styles.evidence}>
              {current.evidence.map((ev) => (
                <li key={`${ev.kind}-${ev.label}`} className={styles.evidenceItem}>
                  <span className={styles.evidenceKind}>{labels.kinds[ev.kind]}</span>
                  <span className={styles.evidenceText}>
                    {ev.href ? (
                      <a href={ev.href} data-jump="" lang={ev.lang} className={`${styles.evidenceLink}`}>
                        {ev.label}
                      </a>
                    ) : (
                      <span lang={ev.lang}>{ev.label}</span>
                    )}
                    {ev.note ? <span className={styles.evidenceNote}>{ev.note}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            {current.source || current.logo ? (
            <p className={styles.detailSource}>
              {current.source ? (
                <>
                  {labels.source}: {current.source}
                </>
              ) : null}
              {current.logo ? (
                <>
                  {current.source ? <br /> : null}
                  {current.logo.credit} ·{' '}
                  <a href={current.logo.licenseUrl} target="_blank" rel="noopener noreferrer license" className={styles.detailSourceLink}>
                    {labels.license} {current.logo.license}
                    <span className="yb-sr-only"> ({labels.newTab})</span>
                  </a>
                </>
              ) : null}
            </p>
            ) : null}
          </div>
        </div>
      </div>

      <p id={hintId} className={styles.hint}>
        {labels.hint}
      </p>
    </div>
  );
}
