import Image from 'next/image';
import { CoverArt } from '@/components/cover-art';

/**
 * Cover für Cards: echtes Bild (Ghost/Platzhalter-SVG) oder farbcodiertes
 * Muster als Fallback. Keine kaputten Bilder — es gibt immer eine Darstellung.
 */
export function ItemCover({
  src,
  alt,
  seed,
}: {
  src: string | null;
  alt: string;
  seed: string;
}) {
  if (!src) {
    return <CoverArt seed={seed} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={1280}
      height={800}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 560px"
      style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
    />
  );
}
