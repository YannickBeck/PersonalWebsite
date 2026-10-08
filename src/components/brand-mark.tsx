import styles from './brand-mark.module.css';

/**
 * Wortmarken-Zeichen: Monogramm „YB“ in der Display-Versal-Grotesk auf einer Tinten-Pille
 * (hell: Tinte, dunkel: Papier). Ersetzt das frühere Terminal-Prompt-Zeichen (Anti-Slop:
 * kein Fake-Terminal). Rein dekorativ – der Name steht als Text daneben.
 */
export function BrandMark() {
  return (
    <span className={`${styles.mark} yb-display`} aria-hidden="true">
      YB
    </span>
  );
}
