import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { ContentCard, type ContentCardData } from '@/components/content-card';
import { CarouselShell } from '@/components/carousel-shell';
import type { Lang } from '@/i18n/dictionaries';
import type { ReactNode } from 'react';
import styles from './carousel-row.module.css';

/*
 * „Slides“ (E5): Astryx Carousel – natives Scroll-Snap, APG-Carousel-Pattern ohne
 * Auto-Rotation, mobil wischbar, unter Reduced Motion springt es statt zu gleiten (Astryx
 * selbst). Vor/Zurück als eigene Pfeile im Abschnittskopf (CarouselShell, A112/MOT7).
 */

/** Kartenreihe als Karussell: Related auf Detailseiten und Teaser der Startseite (VIS9). */
export function CardCarousel({
  title,
  items,
  lang,
  action,
}: {
  title: string;
  items: ContentCardData[];
  lang: Lang;
  action?: ReactNode;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Section>
      <CarouselShell title={title} lang={lang} action={action}>
        {items.map((p) => (
          <ContentCard key={p.slug} item={p} lang={lang} reveal={false} className={styles.card} />
        ))}
      </CarouselShell>
    </Section>
  );
}

/** „Das könnte dich auch interessieren“ auf Detailseiten (Demo-Projekt, Ghost, Artikel). */
export function RelatedCarousel(props: { title: string; items: ContentCardData[]; lang: Lang }) {
  return <CardCarousel {...props} />;
}

/** Bild-Galerie (nur echte Bilder – Platzhalter gelten als „kein Bild“, V6). */
export function GalleryCarousel({
  title,
  images,
  lang,
}: {
  title: string;
  images: { src: string; alt: string }[];
  lang: Lang;
}) {
  if (images.length === 0) {
    return null;
  }
  return (
    <Section>
      <CarouselShell title={title} lang={lang}>
        {images.map((g) => (
          <AspectRatio key={g.src} ratio={16 / 10} className={styles.image}>
            <Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(max-width: 768px) 84vw, 680px" />
          </AspectRatio>
        ))}
      </CarouselShell>
    </Section>
  );
}
