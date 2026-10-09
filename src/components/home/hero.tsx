import Image from 'next/image';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { PERSON, PHOTOS } from '@/content/profile';
import { HeroStage } from './hero-stage';
// Statisch importiert (PER6): liegt dann gehasht unter /_next/static/media mit
// „immutable“ – aus public/ kam es mit max-age=0 und wurde bei jedem Wiederbesuch vor dem LCP
// revalidiert. Die Datei in public/me/ bleibt für andere Verweise bestehen.
import portraitCutout from '../../../public/me/portrait-cutout.webp';
import styles from './home.module.css';

/**
 * 00 Einstieg: riesiger, blasser Namenszug im Hintergrund (dekorativ, aria-hidden), davor
 * zentral die freigestellte Person (am unteren Bühnenrand angeschnitten), links unten die Rolle
 * aus der LinkedIn-Headline, rechts die Aktionen (Kontakt als Tinten-Pille, Projekte).
 *
 * Ebenen: *Layer* (Position, Zeiger-Parallaxe per `translate`, Scroll-Drift per `transform`)
 * und darin das Element (Einblenden beim ersten Laden per `opacity`/`translate`) – so stören
 * sich die drei Bewegungen nicht. Alle drei nur unter no-preference (motion.css §3b); unter
 * Reduced Motion steht die Bühne still.
 *
 * LCP: Das Porträt ist das größte Element (gemessen) – loading="eager" + fetchPriority="high"
 * statt des in Next 16 veralteten `priority` (Doku image.md: „In most cases, you should use
 * loading="eager" or fetchPriority="high" instead of preload“; das <img> steht früh im
 * Server-HTML, der Preload-Scanner findet es ohnehin), unoptimized, weil die Datei schon ein kleines WebP in Originalauflösung ist (482 × 974,
 * 45 KB; der Optimierer könnte nichts Schärferes liefern, es gibt kein srcset). Feste Box aus
 * Bühnenhöhe × Seitenverhältnis → kein Layout-Shift. Das Einblenden startet bei Deckkraft 0,3
 * (nie unsichtbar, bleibt LCP-Kandidat wie die H1, MOT8).
 * H1 = „Yannick Beck, IT Consultant“ (Name nur für Screenreader/Crawler, sichtbar ist er der
 * Namenszug).
 */
export function Hero({ id, lang }: { id: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const photo = PHOTOS.cutout;
  return (
    <section id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className={`${styles.hero} yb-hero`}>
      <HeroStage className={styles.heroStage}>
        <div className={`${styles.heroNameLayer} yb-hero-name-layer`} aria-hidden="true">
          <p className={`${styles.heroName} yb-display yb-hero-name`}>
            <span>Yannick</span> <span>Beck</span>
          </p>
        </div>
        <div className={`${styles.heroPersonLayer} yb-hero-person-layer`}>
          <Image
            className={`${styles.heroPortrait} yb-hero-person`}
            src={portraitCutout}
            alt={photo.alt[lang]}
            loading="eager"
            fetchPriority="high"
            unoptimized
            draggable={false}
            sizes="(max-width: 599px) 62vw, 364px"
          />
        </div>
        <div className={`${styles.heroText} yb-enter yb-hero-text`}>
          <Heading level={1} id={`${id}-title`} className={`${styles.heroRole} yb-display`}>
            <span className="yb-sr-only">{PERSON.name}, </span>
            {PERSON.role.value[lang]}
          </Heading>
          <Text type="large" className={styles.heroFocus}>
            {/* Zwei Zeilen ohne Mittelpunkt (DES12: der Trenner hing sonst am Zeilenende) */}
            {PERSON.focusLine.value[lang].map((part, i) => (
              <span key={part} className={styles.heroFocusLine}>
                {i > 0 ? <span className="yb-sr-only">, </span> : null}
                {part}
              </span>
            ))}
          </Text>
        </div>
        <HStack gap={2} wrap="wrap" className={`${styles.heroActions} yb-enter yb-hero-actions`}>
          <Button label={dict.home.heroContact} variant="primary" size="lg" href={`#${dict.home.sections.contact.id}`} />
          <Button label={dict.home.heroProjects} variant="secondary" size="lg" href={`#${dict.home.sections.projects.id}`} />
        </HStack>
      </HeroStage>
    </section>
  );
}
