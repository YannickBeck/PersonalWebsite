import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { SKILL_CATEGORIES } from '@/content/profile';
import { skillTiles } from '@/content/profile-view';
import { HomeSection } from './home-section';
import { SkillTable } from './skill-table';
import styles from './skills.module.css';

/**
 * 02 Fähigkeiten: Periodensystem aus dem Content-Modell (SKILLS, profile.ts) – quadratische
 * Kacheln mit Nummer, Kürzel und Kurzname, farbig nach Kategorie; Filter-Pillen; Detailfeld mit
 * Monogramm bzw. Logo, Kategorie und Belegen (Verweise auf Werdegang und Projekte der
 * Startseite). Interaktion im Client-Blatt skill-table.tsx (Daten serialisiert, kein
 * Content-Modell im Browser-Bundle).
 *
 * Darunter dieselben Angaben als reine Textliste für Screenreader (ohne Links, damit keine
 * unsichtbaren Tab-Stopps entstehen) – auch für Agenten im HTML. Ohne JavaScript ist sie
 * sichtbar (skills.module.css `.textList`): Das Raster bleibt als Übersicht ohne Bedienung, das
 * Detailfeld fehlt, die Liste enthält alle Kacheln mit Belegen (Feinschliff; Rest-Feinschliff
 * GES2: Lesebreite, Name und Belege je eine Zeile, Belegart mit Doppelpunkt, Farbpunkt der
 * Kategorie wie an den Filter-Pillen).
 */
export function SkillsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const tiles = skillTiles(lang);
  // Name der Filter-Pille beginnt mit dem sichtbaren Kurzwort (WCAG 2.5.3, Fix-Runde 3): der
  // volle Bereichsname, wenn er damit anfängt („KI & Automatisierung“), sonst „Cloud (Microsoft
  // Cloud & Modern Workplace)“ – vorher hieß „Technik“ für Sprachsteuerung „Projekttechnik …“
  const categories = SKILL_CATEGORIES.map((c) => {
    const label = c.label[lang];
    const short = c.short[lang];
    return { id: c.id, label, short, name: label.toLowerCase().startsWith(short.toLowerCase()) ? label : `${short} (${label})` };
  });
  return (
    <HomeSection id={id} number={number} title={h.skillsTitle} lede={h.skillsLede}>
      <SkillTable
        baseId={id}
        tiles={tiles}
        categories={categories}
        labels={{
          filter: h.skillsFilterLabel,
          all: h.skillsFilterAll,
          table: h.skillsTableLabel,
          hint: h.skillsHint,
          evidence: h.skillsEvidence,
          source: h.skillsSource,
          license: h.skillsLicense,
          newTab: dict.newTab,
          kinds: h.evidenceKinds,
        }}
      />
      <div className={styles.textList}>
        <h3>{h.skillsListTitle}</h3>
        <div className={styles.textListGroups}>
          {categories.map((c) => (
            <div key={c.id} className={styles.textListGroup}>
              <h4 className="yb-cat" data-category={c.id}>
                <span className={styles.swatch} aria-hidden="true" />
                {c.label}
              </h4>
              <ul>
                {tiles
                  .filter((t) => t.category === c.id)
                  .map((t) => (
                    <li key={t.id}>
                      {/* Name und Belege je eine Zeile (ohne JavaScript sichtbar); Screenreader
                          hören „Name (Kürzel). Belegt durch: Art: Fundstelle; …“ */}
                      <span className={styles.textListName}>
                        <span lang={t.nameLang}>{t.name}</span> ({t.symbol})
                      </span>
                      <span className="yb-sr-only">. {h.skillsEvidence}: </span>
                      <span className={styles.textListEvidence}>
                        {t.evidence.map((ev, i) => (
                          <span key={`${ev.kind}-${ev.label}`}>
                            {i > 0 ? '; ' : ''}
                            {h.evidenceKinds[ev.kind]}: <span lang={ev.lang}>{ev.label}</span>
                            {/* Zeitraum ohne Umbruch („(2020 – 2023)“ wie im Detailfeld) */}
                            {ev.note ? (
                              <>
                                {' '}
                                <span className={styles.textListNote}>({ev.note})</span>
                              </>
                            ) : null}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
