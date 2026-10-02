'use client';

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from 'react';
import { Carousel, type CarouselHandle } from '@astryxdesign/core/Carousel';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { SectionHeader } from '@/components/section-header';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import styles from './carousel-row.module.css';

type Edges = { overflow: boolean; prev: boolean; next: boolean };

/** Position eines Kindes in Scroll-Koordinaten des Scrollers. */
function itemStart(scroller: HTMLElement, item: Element): number {
  return item.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
}

/**
 * Karussell mit eigener Steuerung im Abschnittskopf (A112, FUN3, MOT7, VIS16).
 *
 * Astryx zeichnet seine Pfeile in einem position:fixed-Overlay (Anchor Positioning): Der
 * Browser scrollt beim Tastaturfokus nicht dorthin, die Pfeile standen in der Tab-Folge vor
 * den Folien und lagen halb auf der dritten Karte. Deshalb hasButtons={false} und zwei
 * IconButtons rechts im SectionHeader – im DOM vor dem Scroller, normal im Fluss
 * (Fokus sichtbar), Größe md (Touch: 44px über die Theme-Adaptation).
 *
 * Schrittweite über handleRef.scrollTo(Index ± sichtbare Folien) statt scrollBy um eine
 * Breite: das Ziel ist immer eine Folienkante, also ein Snap-Punkt – WebKit blieb nach
 * smooth scrollBy zwischen zwei Snap-Punkten stehen (MOT7). Unter Reduced Motion springt
 * Astryx selbst (behavior auto).
 *
 * Randmaske aus (hasEdgeFade={false}): Sie schnitt die rechte Kartenkontur ab; ob es
 * weitergeht, zeigen die Pfeile im Kopf bzw. mobil die angeschnittene nächste Karte.
 */
export function CarouselShell({
  title,
  lang,
  action,
  children,
}: {
  title: string;
  lang: Lang;
  /** Weiterführung (z. B. „Alle Projekte“) vor den Pfeilen; mobil dann in eigener Zeile. */
  action?: ReactNode;
  children: ReactNode;
}) {
  const dict = getDictionary(lang);
  const handle = useRef<CarouselHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focused = useRef<'prev' | 'next' | null>(null);
  const [edges, setEdges] = useState<Edges>({ overflow: false, prev: false, next: false });

  useEffect(() => {
    const scroller = root.current?.querySelector<HTMLElement>('.astryx-carousel-scroller');
    if (!scroller) {
      return;
    }
    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const next = { overflow: max > 1, prev: scroller.scrollLeft > 1, next: scroller.scrollLeft < max - 1 };
      setEdges((old) => (old.overflow === next.overflow && old.prev === next.prev && old.next === next.next ? old : next));
    };
    // ResizeObserver meldet die Startgröße asynchron → Anfangszustand ohne setState im Effekt
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    scroller.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      scroller.removeEventListener('scroll', update);
    };
  }, []);

  // Wird der fokussierte Pfeil am Rand deaktiviert, geht der Fokus auf den anderen
  // (sonst fiele er auf <body>) – wie Astryx' eigene Pfeile.
  useEffect(() => {
    if (focused.current === 'next' && !edges.next && edges.prev) {
      prevRef.current?.focus({ preventScroll: true });
    } else if (focused.current === 'prev' && !edges.prev && edges.next) {
      nextRef.current?.focus({ preventScroll: true });
    }
  }, [edges]);

  const step = (direction: 1 | -1) => {
    const scroller = root.current?.querySelector<HTMLElement>('.astryx-carousel-scroller');
    const items = scroller ? [...scroller.children] : [];
    if (!scroller || items.length === 0) {
      return;
    }
    const starts = items.map((item) => itemStart(scroller, item));
    const width = items[0].getBoundingClientRect().width;
    const gap = items.length > 1 ? starts[1] - starts[0] - width : 0;
    const visible = Math.max(1, Math.floor((scroller.clientWidth + gap + 1) / (width + gap)));
    const current = Math.max(0, starts.findIndex((s) => s >= scroller.scrollLeft - 2));
    const target = Math.min(items.length - 1, Math.max(0, current + direction * visible));
    handle.current?.scrollTo(target);
  };

  // Welcher Pfeil den Fokus hält (für die Übergabe am Rand, Effekt oben)
  const onBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.disabled) {
      focused.current = null;
    }
  };

  return (
    <VStack gap={6} ref={root}>
      <SectionHeader
        title={title}
        keepActionInline={!action}
        action={
          <HStack gap={3} vAlign="center" wrap="wrap">
          {action}
          <HStack gap={2} className={edges.overflow ? undefined : styles.controlsIdle} aria-hidden={edges.overflow ? undefined : true}>
            <IconButton
              ref={prevRef}
              variant="secondary"
              label={dict.carouselPrev}
              icon={<Icon icon="chevronLeft" />}
              isDisabled={!edges.prev}
              onClick={() => step(-1)}
              onFocus={() => {
                focused.current = 'prev';
              }}
              onBlur={onBlur}
            />
            <IconButton
              ref={nextRef}
              variant="secondary"
              label={dict.carouselNext}
              icon={<Icon icon="chevronRight" />}
              isDisabled={!edges.next}
              onClick={() => step(1)}
              onFocus={() => {
                focused.current = 'next';
              }}
              onBlur={onBlur}
            />
          </HStack>
          </HStack>
        }
      />
      <Carousel
        aria-label={title}
        hasSnap
        hasButtons={false}
        hasEdgeFade={false}
        gap={4}
        handleRef={handle}
        className={styles.row}
      >
        {children}
      </Carousel>
    </VStack>
  );
}
