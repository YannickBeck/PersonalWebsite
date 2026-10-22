import { EDUCATION, ORBITALIS_FLOW, THESIS, type Lang, type Project } from '@/content/profile';
import { getDictionary } from '@/i18n/dictionaries';
import styles from './project-visual.module.css';

/** Wortverbinder (U+2060, unsichtbar) nach dem Bindestrich: „KI-Modells“ bricht nicht am Strich. */
function keepCompounds(text: string): string {
  return text.replace(/(\S)-(?=\S)/g, '$1-\u2060');
}

/**
 * Bildfläche der zwei Projekte (Fix-Runde 1, DES1) – statt des generativen Covers (Raster,
 * Ringe, violetter Lichtpunkt, Code-Motiv ohne Bezug; Anti-Slop „Background Grid“, „blurred
 * radial orbs“, „Illustrations With No Connection“). Nur belegte Inhalte, Tinte auf Papier:
 *
 * - Orbitalis: der Ablauf laut README („Wie funktioniert das System?“) als Linienzeichnung –
 *   eine geordnete Liste mit Verbindungslinie, Technik in Mono. Platzhalter, bis es einen
 *   Screenshot des laufenden Systems gibt (Lücke orbitalis-media).
 * - Bachelorarbeit: ein typografisches Titelblatt – Abschluss klein, der volle Titel in der
 *   Akzent-Serif, die Hochschule darunter (Schwerpunkte stehen daneben als Liste, DES8).
 *
 * Lesbarer Text (kein Bild): Im Akkordeon trägt er Informationen, die sonst fehlen (Ablauf
 * bzw. voller Titel). `decorative` (Projektzeile auf /projekte, dort steht alles im Text und die
 * Fläche ist ein Maus-Link) blendet ihn für Screenreader aus.
 */
export function ProjectVisual({ project, lang, decorative = false }: { project: Project; lang: Lang; decorative?: boolean }) {
  const hidden = decorative ? true : undefined;
  if (project.id === 'orbitalis') {
    const labels = getDictionary(lang).projectVisual;
    return (
      <figure className={styles.visual} data-kind="flow" aria-hidden={hidden}>
        <figcaption className={styles.caption}>{labels.flow}</figcaption>
        <ol className={styles.flow}>
          {ORBITALIS_FLOW.value[lang].map((s, i) => (
            <li key={s.step} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.stepText}>
                {s.step}
                {s.tech ? <span className={styles.stepTech}>{s.tech}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </figure>
    );
  }
  const q = lang === 'de' ? ['„', '“'] : ['“', '”'];
  const degree = EDUCATION.find((e) => e.id === 'dhbw-wi')!;
  return (
    <div className={styles.visual} data-kind="title" aria-hidden={hidden}>
      <p className={styles.kicker}>{degree.degree[lang]}</p>
      {/* EIN Textknoten, linksbündig ohne balance: Die Serif lädt ohne Preload nach – so bleibt
          der Anfang des Titels beim Schriftwechsel stehen (kein Layout-Shift, Gate Fix-Runde 1;
          ein <span> um „KI-Modells“ ergab CLS 0,00007 auf /projekte bei 1920px, Abschluss-
          Fixes). Komposita mit Bindestrich bleiben per Wortverbinder zusammen (GES2: kein
          Zeilenende „KI-“) */}
      <p className={styles.thesisTitle} lang={lang}>
        {`${q[0]}${keepCompounds(THESIS.title[lang])}${q[1]}`}
      </p>
      <p className={styles.school}>{degree.school[lang]}</p>
    </div>
  );
}
