import styles from './ghost-content.module.css';

/** Rendert Ghost-HTML (eigene CMS-Quelle, daher vertrauenswürdig). */
export function GhostHtml({ html }: { html: string }) {
  return (
    <article
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
