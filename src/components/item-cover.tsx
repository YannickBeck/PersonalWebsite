import Image from 'next/image';
import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { CoverArt, type CoverMotif } from '@/components/cover-art';
import { realImage } from '@/lib/images';
import styles from './item-cover.module.css';

/**
 * Ein Cover-Slot für Karten und Detailseiten (L6, V6): festes Seitenverhältnis 16:10,
 * damit Überschriften in jeder Kartenreihe fluchten. Echtes Bild (Ghost feature_image)
 * oder – bei fehlendem Bild bzw. /placeholders/*.svg – das generative CoverArt.
 * In Karten dekorativ (alt=""), weil der Titel daneben als Überschrift steht (T9).
 *
 * eager (COD1/COD3): sichtbares LCP-Bild (Detail-Hero, erste Kartenreihe) sofort und mit
 * hoher Priorität laden – loading="eager" + fetchPriority="high" statt des seit Next 16
 * veralteten priority (image.md). Alle übrigen Bilder bleiben lazy.
 * .yb-cover-media (COD4): eigenes Ziel für den Cover-Zoom (motion.css §5a), unabhängig vom
 * internen Markup von AspectRatio.
 */
export function ItemCover({
  src,
  alt = '',
  seed,
  label,
  motif,
  variant = 'card',
  eager = false,
}: {
  src: string | null | undefined;
  alt?: string;
  seed: string;
  label?: string;
  motif?: CoverMotif;
  variant?: 'card' | 'hero';
  eager?: boolean;
}) {
  const image = realImage(src);
  return (
    <AspectRatio
      ratio={16 / 10}
      className={`${variant === 'hero' ? styles.hero : styles.card} yb-cover`}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          sizes={variant === 'hero' ? '(max-width: 768px) 100vw, 720px' : '(max-width: 768px) 100vw, 360px'}
          className={`${styles.image} yb-cover-media`}
        />
      ) : (
        <CoverArt seed={seed} label={label} motif={motif} size={variant} />
      )}
    </AspectRatio>
  );
}
