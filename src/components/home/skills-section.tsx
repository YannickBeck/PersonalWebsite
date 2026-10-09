import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { SKILL_CATEGORIES } from '@/content/profile';
import { skillTiles } from '@/content/profile-view';
import { HomeSection } from './home-section';
import { SkillTable } from './skill-table';

/**
 * 02 Fähigkeiten: Periodensystem aus dem Content-Modell (SKILLS, profile.ts) – quadratische
 * Kacheln mit Nummer, Kürzel und Kurzname, farbig nach Kategorie; Filter-Pillen; Detailfeld mit
 * Monogramm bzw. Logo, Kategorie und Belegen (Verweise auf Werdegang und Projekte der
 * Startseite). Interaktion im Client-Blatt skill-table.tsx (Daten serialisiert, kein
 * Content-Modell im Browser-Bundle).
 *
 * Darunter dieselben Angaben als reine Textliste für Screenreader (ohne Links, damit keine
 * unsichtbaren Tab-Stopps entstehen) – auch für Agenten und ohne JavaScript im HTML.
 */
export function SkillsSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const tiles = skillTiles(lang);
  const categories = SKILL_CATEGORIES.map((c) => ({ id: c.id, label: c.label[lang], short: c.short[lang] }));
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
      <div className="yb-sr-only">
        <h3>{h.skillsListTitle}</h3>
        {categories.map((c) => (
          <div key={c.id}>
            <h4>{c.label}</h4>
            <ul>
              {tiles
                .filter((t) => t.category === c.id)
                .map((t) => (
                  <li key={t.id}>
                    {t.name} ({t.symbol}). {h.skillsEvidence}:{' '}
                    {t.evidence.map((ev, i) => (
                      <span key={`${ev.kind}-${ev.label}`}>
                        {i > 0 ? '; ' : ''}
                        {h.evidenceKinds[ev.kind]} <span lang={ev.lang}>{ev.label}</span>
                        {ev.note ? ` (${ev.note})` : ''}
                      </span>
                    ))}
                    .
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
