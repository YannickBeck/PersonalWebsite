'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { ExternalArrow } from '@/components/icons';
import styles from './id-badge.module.css';

export interface IdBadgeData {
  photo: { src: string; width: number; height: number; alt: string };
  name: string;
  role: string;
  org: string;
  /** Stationen bei einem Arbeitgeber (DES7: Arbeitgeber einmal im Label, nicht je Zeile). */
  stations: { id: string; years: string; title: string }[];
  /** Zertifikate: Aussteller + Kurzname (lang, wenn er nicht die Seitensprache ist). */
  certs: { id: string; issuer: string; title: string; lang?: string }[];
  linkedin: string;
  labels: {
    group: string;
    flip: string;
    hint: string;
    stations: string;
    certs: string;
    linkedin: string;
    linkedinExternal: string;
  };
}

/* Federn (Einheiten: Grad, Sekunden). Drehen/Kippen knapp unterkritisch gedämpft (kleines
   Überschwingen), das Pendel leicht gedämpft: Periode ≈ 1 s, aus 4° in < 4 s zur Ruhe. */
const K_TURN = 170;
const D_TURN = 22;
const K_SWING = 38;
const D_SWING = 2.6;
const DEG_PER_PX = 0.6;
const TILT_PER_PX = 0.15;
const TILT_MAX = 14;
const LEAN_MAX = 4;
const KEY_STEP = 15;
const KEY_MAX = 45;
const TAP_SLOP = 6;
const ENTER_IMPULSE = 22;

interface Motion {
  ry: number;
  vy: number;
  rx: number;
  vx: number;
  sw: number;
  vs: number;
}

interface Drag {
  id: number;
  x0: number;
  y0: number;
  ry0: number;
  lastX: number;
  lastT: number;
  /** Zeigergeschwindigkeit in px/s (geglättet). */
  speed: number;
  moved: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Zielwinkel: Seite (0 vorne, 1 hinten, weiter gezählt in Drehrichtung) plus Schwenk. */
const targetOf = (side: number, yaw: number) => side * 180 + yaw;

/**
 * 01 Über mich: Ausweiskarte an einem Band – CSS-3D, keine Bibliothek.
 *
 * Bedienung (alles ohne Hover erreichbar)
 * - Ziehen (Pointer Events + Pointer-Capture): waagerecht dreht, senkrecht kippt die Karte;
 *   beim Loslassen dreht sie auf die nähere Seite (mit Schwung auch auf die andere).
 *   `touch-action: pan-y` – senkrechtes Wischen scrollt die Seite weiter.
 * - Tippen/Klicken auf die Karte und der Button „Karte umdrehen“ (Enter/Leertaste) drehen um.
 * - ← / → am Button schwenken die Karte in 15°-Schritten (bis ±45°), der Button bleibt der
 *   eine Tab-Stopp; Umdrehen setzt den Schwenk zurück.
 * - Die verdeckte Seite ist `inert` (nicht fokussierbar, nicht im Accessibility-Baum).
 *
 * Bewegung
 * - Leichte Physik per rAF mit Stop-Bedingung (alle Abweichungen und Geschwindigkeiten unter
 *   Schwelle → Werte einrasten, Schleife endet). Nur transform → kein Layout-Shift, die Bühne
 *   hat feste Maße.
 * - Pendeln nur unter prefers-reduced-motion: no-preference: ein kurzer Anstoß, wenn die
 *   Karte zum ersten Mal sichtbar wird (klingt in < 5 s aus, WCAG 2.2.2), und Schwung beim
 *   Ziehen. Unter „reduce“: keine Animation – Ziehen folgt dem Finger direkt, Loslassen und
 *   Umdrehen springen ohne Übergang.
 */
export function IdBadge({ data }: { data: IdBadgeData }) {
  const hintId = useId();
  const [face, setFace] = useState<'front' | 'back'>('front');
  const faceRef = useRef<'front' | 'back'>('front');
  const swingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const motion = useRef<Motion>({ ry: 0, vy: 0, rx: 0, vx: 0, sw: 0, vs: 0 });
  const side = useRef(0); // 0 = vorne, 1 = hinten (Zielseite)
  const yaw = useRef(0); // Schwenk per Pfeiltaste
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const last = useRef(0);
  const reduced = useRef(false);

  const render = useCallback(() => {
    const m = motion.current;
    if (swingRef.current) {
      swingRef.current.style.transform = m.sw ? `rotate(${m.sw.toFixed(3)}deg)` : '';
    }
    if (cardRef.current) {
      // Perspektive in der eigenen Transformation: Fluchtpunkt = Kartenmitte
      cardRef.current.style.transform =
        m.ry || m.rx ? `perspective(1000px) rotateX(${m.rx.toFixed(3)}deg) rotateY(${m.ry.toFixed(3)}deg)` : '';
      // Glanzstreifen nur während der Drehung: wandert mit sin(Winkel), Deckkraft |sin| → in Ruhe unsichtbar
      const sheen = Math.sin((m.ry * Math.PI) / 180);
      cardRef.current.style.setProperty('--yb-sheen', sheen.toFixed(3));
      cardRef.current.style.setProperty('--yb-sheen-o', Math.abs(sheen).toFixed(3));
    }
    const visible = Math.cos((m.ry * Math.PI) / 180) >= 0 ? 'front' : 'back';
    if (visible !== faceRef.current) {
      faceRef.current = visible;
      setFace(visible);
    }
  }, []);

  const step = useCallback(
    function loop(now: number) {
      const m = motion.current;
      const dt = Math.min(1 / 30, Math.max(0, (now - (last.current || now)) / 1000));
      last.current = now;
      const d = drag.current;
      if (d?.moved) {
        // Beim Ziehen folgen Drehung und Kippen dem Zeiger; das Pendel lehnt sich in die Bewegung
        const lean = clamp(-d.speed * 0.01, -LEAN_MAX, LEAN_MAX);
        m.vs += (K_SWING * (lean - m.sw) - D_SWING * 2 * m.vs) * dt;
        m.sw += m.vs * dt;
      } else {
        const ty = targetOf(side.current, yaw.current);
        m.vy += (K_TURN * (ty - m.ry) - D_TURN * m.vy) * dt;
        m.ry += m.vy * dt;
        m.vx += (K_TURN * (0 - m.rx) - D_TURN * m.vx) * dt;
        m.rx += m.vx * dt;
        m.vs += (K_SWING * (0 - m.sw) - D_SWING * m.vs) * dt;
        m.sw += m.vs * dt;
        const resting =
          Math.abs(ty - m.ry) < 0.05 &&
          Math.abs(m.vy) < 0.05 &&
          Math.abs(m.rx) < 0.05 &&
          Math.abs(m.vx) < 0.05 &&
          Math.abs(m.sw) < 0.03 &&
          Math.abs(m.vs) < 0.03;
        if (resting) {
          // Einrasten, Winkel normalisieren (360° = 0°), Schleife beenden
          side.current = ((side.current % 2) + 2) % 2;
          Object.assign(m, { ry: targetOf(side.current, yaw.current), vy: 0, rx: 0, vx: 0, sw: 0, vs: 0 });
          render();
          frame.current = 0;
          last.current = 0;
          return;
        }
      }
      render();
      frame.current = window.requestAnimationFrame(loop);
    },
    [render],
  );

  const kick = useCallback(() => {
    if (reduced.current) {
      // Ohne Animation: Zielzustand sofort
      const m = motion.current;
      if (!drag.current?.moved) {
        side.current = ((side.current % 2) + 2) % 2;
        Object.assign(m, { ry: targetOf(side.current, yaw.current), vy: 0, rx: 0, vx: 0, sw: 0, vs: 0 });
      }
      render();
      return;
    }
    if (!frame.current) {
      last.current = 0;
      frame.current = window.requestAnimationFrame(step);
    }
  }, [render, step]);

  // Reduced Motion verfolgen; erster Anstoß, wenn die Karte sichtbar wird (nur no-preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reduced.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    let io: IntersectionObserver | null = null;
    if (rigRef.current && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            if (!reduced.current && !drag.current) {
              motion.current.vs += ENTER_IMPULSE;
              kick();
            }
          }
        },
        { threshold: 0.6 },
      );
      io.observe(rigRef.current);
    }
    return () => {
      mq.removeEventListener('change', sync);
      io?.disconnect();
      if (frame.current) {
        window.cancelAnimationFrame(frame.current);
        frame.current = 0;
      }
    };
  }, [kick]);

  const flip = useCallback(() => {
    // Zur anderen Seite in Drehrichtung des letzten Zustands (ry wächst weiter)
    const current = Math.round(motion.current.ry / 180);
    side.current = current + 1;
    yaw.current = 0;
    motion.current.vs += reduced.current ? 0 : 8;
    kick();
  }, [kick]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('a, button')) {
      return;
    }
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      ry0: motion.current.ry,
      lastX: e.clientX,
      lastT: e.timeStamp,
      speed: 0,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) {
      return;
    }
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.moved && Math.hypot(dx, dy) < TAP_SLOP) {
      return;
    }
    d.moved = true;
    const dtMs = Math.max(1, e.timeStamp - d.lastT);
    const inst = ((e.clientX - d.lastX) / dtMs) * 1000;
    d.speed = d.speed * 0.6 + inst * 0.4;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    const m = motion.current;
    m.ry = d.ry0 + dx * DEG_PER_PX;
    m.rx = clamp(-dy * TILT_PER_PX, -TILT_MAX, TILT_MAX);
    m.vy = 0;
    m.vx = 0;
    if (reduced.current) {
      render();
    } else {
      kick();
    }
  };

  const release = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) {
      return;
    }
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.moved) {
      if (!cancelled) {
        flip();
      }
      return;
    }
    // Nähere Seite, mit Schwung (0,15 s vorausgeschaut) auch die nächste
    const m = motion.current;
    const fling = cancelled ? 0 : d.speed * DEG_PER_PX * 0.15;
    side.current = Math.round((m.ry + fling) / 180);
    yaw.current = 0;
    m.vy = cancelled ? 0 : clamp(d.speed * DEG_PER_PX, -900, 900);
    kick();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }
    e.preventDefault();
    const dir = e.key === 'ArrowLeft' ? -1 : 1;
    yaw.current = clamp(yaw.current + dir * KEY_STEP, -KEY_MAX, KEY_MAX);
    if (!reduced.current) {
      motion.current.vs += dir * 6;
    }
    kick();
  };

  const back = face === 'back';

  return (
    <div className={styles.badge} role="group" aria-label={data.labels.group}>
      <div ref={rigRef} className={styles.rig}>
        <div ref={swingRef} className={styles.swing}>
          <div className={styles.strap} aria-hidden="true">
            <span className={styles.strapText}>
              {data.name} · {data.name} · {data.name}
            </span>
          </div>
          <div className={styles.clip} aria-hidden="true" />
          <div
            ref={cardRef}
            className={styles.card}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => release(e, false)}
            onPointerCancel={(e) => release(e, true)}
            onLostPointerCapture={(e) => release(e, true)}
          >
            <div className={styles.face} data-face="front" inert={back}>
              <span className={styles.slot} aria-hidden="true" />
              <Image
                className={`${styles.photo} yb-image-outline`}
                src={data.photo.src}
                width={data.photo.width}
                height={data.photo.height}
                alt={data.photo.alt}
                sizes="(max-width: 767px) 240px, 256px"
                draggable={false}
              />
              <div className={styles.frontText}>
                <p className={styles.name}>{data.name}</p>
                <p className={`${styles.role} yb-display`}>{data.role}</p>
                <p className={styles.org}>{data.org}</p>
              </div>
            </div>
            <div className={`${styles.face} ${styles.back}`} data-face="back" inert={!back}>
              <span className={styles.slot} aria-hidden="true" />
              <p className={styles.backName}>{data.name}</p>
              <p className={styles.label}>{data.labels.stations}</p>
              <ol className={styles.stations}>
                {data.stations.map((s) => (
                  <li key={s.id} className={styles.station}>
                    <span className={styles.years}>{s.years}</span>
                    <span className={styles.stationTitle}>{s.title}</span>
                  </li>
                ))}
              </ol>
              <p className={styles.label}>{data.labels.certs}</p>
              <ul className={styles.facts}>
                {data.certs.map((c) => (
                  <li key={c.id}>
                    <span className={styles.factName}>{c.issuer}</span>{' '}
                    <span className={styles.factNote} lang={c.lang}>
                      {c.title}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                className={styles.linkedin}
                href={data.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={data.labels.linkedinExternal}
              >
                {data.labels.linkedin}
                <ExternalArrow />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <Button
          label={data.labels.flip}
          variant="secondary"
          size="sm"
          aria-pressed={back}
          aria-describedby={hintId}
          aria-keyshortcuts="ArrowLeft ArrowRight"
          onClick={flip}
          onKeyDown={onKeyDown}
        />
        <Text type="supporting" color="secondary" id={hintId} className={styles.hint}>
          {data.labels.hint}
        </Text>
      </div>
    </div>
  );
}
