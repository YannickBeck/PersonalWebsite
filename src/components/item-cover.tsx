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
 */
export function ItemCover({
  src,
  alt = '',
  seed,
  label,
  motif,
  variant = 'card',
  priority = false,
}: {
  src: string | null | undefined;
  alt?: string;
  seed: string;
  label?: string;
  motif?: CoverMotif;
  variant?: 'card' | 'hero';
  priority?: boolean;
}) {
  const image = realImage(src);
  return (
    <AspectRatio
      ratio={16 / 10}
      className={variant === 'hero' ? styles.hero : styles.card}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes={variant === 'hero' ? '(max-width: 768px) 100vw, 720px' : '(max-width: 768px) 100vw, 360px'}
          className={styles.image}
        />
      ) : (
        <CoverArt seed={seed} label={label} motif={motif} size={variant} />
      )}
    </AspectRatio>
  );
}
