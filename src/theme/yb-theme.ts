/**
 * YB brand theme — Astryx custom theme für yannick-beck.de.
 *
 * Basis: gothic (dark editorial) + Electric-Blue-Akzent + Dracula-Syntax.
 * Bauen nach jeder Änderung: pnpm exec astryx theme build src/theme/yb-theme.ts
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {dracula} from '@astryxdesign/core/theme/syntax';
import {gothicTheme} from '@astryxdesign/theme-gothic';

export const ybTheme = defineTheme({
  name: 'yb',
  extends: gothicTheme,
  color: {accent: '#2F81F7', neutralStyle: 'cool', contrast: 'standard'},
  syntax: dracula,
  tokens: {
    '--focus-outline-color': 'var(--color-accent)',
  },
  components: {
    button: {
      base: {fontWeight: 'var(--font-weight-semibold)'},
    },
  },
});
