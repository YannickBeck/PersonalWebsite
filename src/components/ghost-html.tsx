import { getDictionary, type Lang } from '@/i18n/dictionaries';
import styles from './ghost-content.module.css';

/**
 * Codeblöcke aus Ghost scrollen in sich (Reflow, ghost-content.module.css). Damit sie auch
 * per Tastatur scrollbar sind (A113; Safari macht Scroller nicht selbst fokussierbar),
 * bekommen sie tabindex, eine Region-Rolle und einen Namen.
 */
function focusablePre(html: string, label: string): string {
  return html.replace(/<pre(\s|>)/g, `<pre tabindex="0" role="region" aria-label="${label}"$1`);
}

/** Rendert Ghost-HTML (eigene CMS-Quelle, daher vertrauenswürdig). */
export function GhostHtml({ html, lang }: { html: string; lang: Lang }) {
  return (
    <article
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: focusablePre(html, getDictionary(lang).codeExample) }}
    />
  );
}
