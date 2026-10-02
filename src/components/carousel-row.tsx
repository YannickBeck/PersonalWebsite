import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Carousel } from '@astryxdesign/core/Carousel';
import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { ContentCard, type ContentCardData } from '@/components/content-card';
import { SectionHeader } from '@/components/section-header';
import type { Lang } from '@/i18n/dictionaries';
import styles from './carousel-row.module.css';

/*
 * „Slides“ (E5): Astryx Carousel – natives Scroll-Snap, APG-Carousel-Pattern ohne
 * Auto-Rotation, Pfeile erscheinen nur, wenn es in die Richtung weitergeht, mobil wischbar,
 * unter Reduced Motion springt es statt zu gleiten (Astryx selbst). 0 KB eigene Logik.
 */

/** „Das könnte dich auch interessieren“ auf Detailseiten (Demo-Projekt, Ghost, Artikel). */
export function RelatedCarousel({
  title,
  items,
  lang,
}: {
  title: string;
  items: ContentCardData[];
  lang: Lang;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Section>
      <VStack gap={6}>
        <SectionHeader title={title} />
        <Carousel aria-label={title} hasSnap gap={4} className={styles.row}>
          {items.map((p) => (
            <ContentCard key={p.slug} item={p} lang={lang} reveal={false} className={styles.card} />
          ))}
        </Carousel>
      </VStack>
    </Section>
  );
}

/** Bild-Galerie (nur echte Bilder – Platzhalter gelten als „kein Bild“, V6). */
export function GalleryCarousel({
  title,
  images,
}: {
  title: string;
  images: { src: string; alt: string }[];
}) {
  if (images.length === 0) {
    return null;
  }
  return (
    <Section>
      <VStack gap={6}>
        <SectionHeader title={title} />
        <Carousel aria-label={title} hasSnap gap={4} className={styles.row}>
          {images.map((g) => (
            <AspectRatio key={g.src} ratio={16 / 10} className={styles.image}>
              <Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(max-width: 768px) 84vw, 680px" />
            </AspectRatio>
          ))}
        </Carousel>
      </VStack>
    </Section>
  );
}
