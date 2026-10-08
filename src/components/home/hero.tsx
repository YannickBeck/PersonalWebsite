import Image from 'next/image';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { PERSON, PHOTOS } from '@/content/profile';
import styles from './home.module.css';

/**
 * 00 Einstieg: riesiger, blasser Namenszug im Hintergrund (dekorativ, aria-hidden), davor die
 * freigestellte Person (am unteren Rand angeschnitten), links unten die Rolle aus der
 * LinkedIn-Headline, rechts die Aktionen (Kontakt als Tinten-Pille, Projekte).
 *
 * LCP: Das Porträt ist das größte Element – priority (Preload + fetchpriority=high),
 * unoptimized, weil die Datei schon ein kleines WebP in Originalauflösung ist (482 × 974,
 * 45 KB; der Optimierer könnte nichts Schärferes liefern). sizes passt zur gerenderten Breite.
 * H1 = „Yannick Beck, IT Consultant“ (Name nur für Screenreader/Crawler, sichtbar ist er der
 * Namenszug). Bewegung (Parallaxe, Einblenden) folgt als eigene Schicht in motion.css.
 */
export function Hero({ id, lang }: { id: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const photo = PHOTOS.cutout;
  return (
    <section id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className={styles.hero}>
      <div className={styles.heroStage}>
        <p className={`${styles.heroName} yb-display`} aria-hidden="true">
          <span>Yannick</span> <span>Beck</span>
        </p>
        <Image
          className={styles.heroPortrait}
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={PHOTOS.full.alt[lang]}
          priority
          unoptimized
          sizes="(max-width: 767px) 64vw, 380px"
        />
        <div className={styles.heroText}>
          <Heading level={1} id={`${id}-title`} className={`${styles.heroRole} yb-display`}>
            <span className="yb-sr-only">{PERSON.name}, </span>
            {PERSON.role.value[lang]}
          </Heading>
          <Text type="large" className={styles.heroFocus}>
            {PERSON.focusLine.value[lang]}
          </Text>
        </div>
        <HStack gap={2} wrap="wrap" className={styles.heroActions}>
          <Button label={dict.home.heroContact} variant="primary" size="lg" href={`#${dict.home.sections.contact.id}`} />
          <Button label={dict.home.heroProjects} variant="secondary" size="lg" href={`#${dict.home.sections.projects.id}`} />
        </HStack>
      </div>
    </section>
  );
}
