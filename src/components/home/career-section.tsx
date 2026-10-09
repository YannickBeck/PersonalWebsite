import { Button } from '@astryxdesign/core/Button';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { CERTIFICATIONS, EDUCATION, STATIONS, type Station } from '@/content/profile';
import { anchor } from '@/content/profile-view';
import { formatPeriod, formatYears } from '@/lib/period';
import { Gap } from '@/components/gap';
import { HomeSection } from './home-section';
import styles from './career.module.css';

/** Station mit etwas zum Aufklappen (Beschreibung, Stichpunkte, Abschlussarbeit). */
function hasDetails(s: Station): boolean {
  return Boolean(s.summary || s.points.de.length > 0 || s.closing || s.thesis);
}

/** Beim Laden offen: das Studium mit der Bachelorarbeit (zeigt den Balken und die Verknüpfung). */
const OPEN_BY_DEFAULT: Station['id'] = 'bechtle-studium';

/**
 * 04 Werdegang & Weiterbildung: links die große Überschrift (klebt beim Scrollen), rechts
 * Stationen, Ausbildung und Zertifikate aus dem Content-Modell.
 *
 * Stationen mit Beschreibung sind native <details>/<summary> (Disclosure ohne JavaScript,
 * Tastatur und Touch eingebaut, Screenreader hören „aufgeklappt/zugeklappt“). `name` macht
 * sie exklusiv: Der gewählte Eintrag wird zum dunklen Balken mit Zeitraum, Ort, Stichpunkten
 * aus LinkedIn und ggf. der Bachelorarbeit (Sprung ins Projekt-Akkordeon). Ausbildung und
 * Zertifikate haben nichts aufzuklappen und stehen als ruhige Zeilen da. Sprungziele
 * #career-<id> (aus dem Periodensystem) öffnen den Eintrag (home-jump.tsx).
 * Höhen-Übergang über ::details-content: motion.css §8 (nur mit Support und no-preference).
 */
export function CareerSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const dict = getDictionary(lang);
  const h = dict.home;
  const group = `${id}-entries`;
  return (
    <HomeSection
      id={id}
      number={number}
      title={h.careerTitle}
      lede={h.careerLede}
      split
      aside={<Button label={dict.pages.cv.title} variant="secondary" href={withLang('/cv', lang)} />}
    >
      <div className={styles.groups}>
        <div className={styles.group}>
          <h3 className={styles.groupTitle} id={`${id}-stations`}>
            {h.careerStations}
          </h3>
          <ol className={styles.list} aria-labelledby={`${id}-stations`}>
            {STATIONS.map((s) =>
              hasDetails(s) ? (
                <li key={s.id} className={styles.item}>
                  <details
                    id={anchor.career(s.id)}
                    name={group}
                    open={s.id === OPEN_BY_DEFAULT}
                    className={`${styles.entry} yb-career-entry`}
                  >
                    <summary className={styles.summary} data-jump-focus="">
                      <span className={styles.when}>{formatYears(s.start, s.end, lang)}</span>
                      <span className={styles.what}>
                        <span className={styles.role}>{s.role[lang]}</span>
                        <span className={styles.org}>{s.org}</span>
                      </span>
                      <span className={`${styles.toggle} yb-career-toggle`} aria-hidden="true" />
                    </summary>
                    <div className={styles.body}>
                      <dl className={styles.facts}>
                        <div>
                          <dt>{h.careerPeriod}</dt>
                          <dd>{formatPeriod(s.start, s.end, lang)}</dd>
                        </div>
                        {s.place ? (
                          <div>
                            <dt>{h.careerPlace}</dt>
                            <dd>{s.place[lang]}</dd>
                          </div>
                        ) : null}
                      </dl>
                      {s.summary ? <p className={styles.text}>{s.summary[lang]}</p> : null}
                      {s.points[lang].length > 0 ? (
                        <ul className={styles.points}>
                          {s.points[lang].map((p) => (
                            <li key={p.slice(0, 24)}>{p}</li>
                          ))}
                        </ul>
                      ) : null}
                      {s.closing ? <p className={styles.text}>{s.closing[lang]}</p> : null}
                      {s.thesis ? (
                        <p className={styles.thesis}>
                          <span className={styles.thesisLabel}>{h.careerThesis}</span>
                          {/* Anführungszeichen je Sprache (TEX15) */}
                          <span className={styles.thesisTitle}>{lang === 'de' ? `„${s.thesis.title[lang]}“` : `“${s.thesis.title[lang]}”`}</span>
                          <a href={`#${anchor.project(s.thesis.projectId)}`} data-jump="" className={`${styles.thesisLink}`}>
                            {h.careerToProject}
                          </a>
                        </p>
                      ) : null}
                    </div>
                  </details>
                </li>
              ) : (
                <li key={s.id} id={anchor.career(s.id)} tabIndex={-1} className={`${styles.item} ${styles.row} yb-jump-target`}>
                  <span className={styles.when}>{formatYears(s.start, s.end, lang)}</span>
                  <span className={styles.what}>
                    <span className={styles.role}>{s.role[lang]}</span>
                    <span className={styles.org}>
                      {s.org}
                      {s.place ? ` · ${s.place[lang]}` : ''}
                    </span>
                  </span>
                </li>
              ),
            )}
          </ol>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle} id={`${id}-education`}>
            {h.careerEducation}
          </h3>
          <ol className={styles.list} aria-labelledby={`${id}-education`}>
            {EDUCATION.map((e) => (
              <li key={e.id} id={anchor.career(e.id)} tabIndex={-1} className={`${styles.item} ${styles.row} yb-jump-target`}>
                <span className={styles.when}>{formatYears(e.start, e.end, lang)}</span>
                <span className={styles.what}>
                  <span className={styles.role}>{e.degree[lang]}</span>
                  <span className={styles.org}>{e.school[lang]}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle} id={`${id}-certs`}>
            {h.careerCerts}
          </h3>
          <ul className={styles.list} aria-labelledby={`${id}-certs`}>
            {CERTIFICATIONS.map((c) => (
              <li key={c.id} id={anchor.career(c.id)} tabIndex={-1} className={`${styles.item} ${styles.row} ${styles.rowNoWhen} yb-jump-target`}>
                <span className={styles.what}>
                  <span className={styles.role} lang={c.nameLang[lang] !== lang ? c.nameLang[lang] : undefined}>
                    {c.name[lang]}
                  </span>
                  <span className={styles.org}>{c.issuer}</span>
                  {/* Datum offen: in Produktion keine Zeile, in der Vorschau die Lücke */}
                  <Gap id="cert-dates" lang={lang} />
                  {lang === 'en' && c.enTitle ? <Gap id={c.enTitle.gap} lang={lang} /> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HomeSection>
  );
}
