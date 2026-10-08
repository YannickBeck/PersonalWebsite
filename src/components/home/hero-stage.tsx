'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Zeiger-Parallaxe nur mit feinem Zeiger, Hover und ohne Reduced Motion. */
const POINTER_QUERY = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

/**
 * Bühne des Einstiegs (Client-Blatt, ~1 KB): veröffentlicht die Zeigerposition über der Bühne
 * als --yb-px/--yb-py (−1 … 1) – Namenszug und Person verschieben sich daran minimal
 * gegeneinander (motion.css §3b, `translate` mit weicher Transition). rAF-gedrosselt, nur
 * Maus; ohne passende Media-Query (Touch, Reduced Motion) hängt kein Listener und die Werte
 * bleiben 0 → statisch. Inhalte kommen als Server-Kinder.
 */
export function HeroStage({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const mq = window.matchMedia(POINTER_QUERY);
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      el.style.setProperty('--yb-px', x.toFixed(3));
      el.style.setProperty('--yb-py', y.toFixed(3));
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(apply);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        return;
      }
      const r = el.getBoundingClientRect();
      x = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      y = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      schedule();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };
    let attached = false;
    const sync = () => {
      if (mq.matches && !attached) {
        el.addEventListener('pointermove', onMove, { passive: true });
        el.addEventListener('pointerleave', onLeave);
        attached = true;
      } else if (!mq.matches && attached) {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        attached = false;
        onLeave();
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
