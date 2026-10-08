import { anchor, type LabelChip, type SkillChip as SkillChipData } from '@/content/profile-view';
import { withLang, type Lang } from '@/i18n/dictionaries';
import { TransitionLink } from '@/components/transition-link';
import styles from './skill-chip.module.css';

/**
 * Kleine Kachel einer Fähigkeit (Kürzel + Name, Farbe der Kategorie) als Verweis ins
 * Periodensystem der Startseite (#skill-<id>). Auf der Startseite ein Anker mit data-jump
 * (wählt die Kachel, home-jump.tsx), auf anderen Seiten ein Seitenwechsel zur Startseite.
 * Das Kürzel ist dekorativ, der Name ist der Linktext.
 */
export function SkillChipLink({ chip, href, jump = false }: { chip: SkillChipData; href: string; jump?: boolean }) {
  const content = (
    <>
      <span className={styles.symbol} aria-hidden="true">
        {chip.symbol}
      </span>
      {chip.label}
    </>
  );
  const className = `${styles.chip} yb-cat yb-skill-chip`;
  return jump ? (
    <a href={href} data-jump="" data-category={chip.category} className={className}>
      {content}
    </a>
  ) : (
    <TransitionLink href={href} data-category={chip.category} className={className}>
      {content}
    </TransitionLink>
  );
}

/** Tag ohne eigene Kachel (z. B. „Debian 13“): gleiche Form, neutral, kein Link. */
export function PlainChip({ label }: { label: string }) {
  return <span className={`${styles.chip} ${styles.plain}`}>{label}</span>;
}

export function ChipList({ children, labelledBy }: { children: React.ReactNode; labelledBy?: string }) {
  return (
    <ul className={styles.list} aria-labelledby={labelledBy}>
      {children}
    </ul>
  );
}

/**
 * Marken aus Profil-Bezeichnungen (labelChips in profile-view.ts): Fähigkeiten verlinken ins
 * Periodensystem der Startseite (/#skill-<id>), alles andere bleibt eine neutrale Marke.
 * Für Unterseiten (Lebenslauf, Über mich, Schwerpunkte).
 */
export function LabelChipList({ chips, lang, labelledBy }: { chips: LabelChip[]; lang: Lang; labelledBy?: string }) {
  const home = withLang('/', lang);
  return (
    <ChipList labelledBy={labelledBy}>
      {chips.map((c) => (
        <li key={c.kind === 'skill' ? c.chip.id : c.label}>
          {c.kind === 'skill' ? (
            <SkillChipLink chip={c.chip} href={`${home}#${anchor.skill(c.chip.id)}`} />
          ) : (
            <PlainChip label={c.label} />
          )}
        </li>
      ))}
    </ChipList>
  );
}
