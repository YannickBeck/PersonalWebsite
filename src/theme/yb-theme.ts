/**
 * YB brand theme — Astryx custom theme für yannick-beck.de.
 *
 * Dunkles Tech-Design: tiefes Nachtblau, Electric-Violet-Akzent, Fustat + JetBrains Mono.
 * Bauen nach jeder Änderung: pnpm exec astryx theme build src/theme/yb-theme.ts
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {dracula} from '@astryxdesign/core/theme/syntax';
import {gothicTheme} from '@astryxdesign/theme-gothic';

export const ybTheme = defineTheme({
  name: 'yb',
  extends: gothicTheme,
  color: {accent: '#7C5CF0', neutralStyle: 'cool', contrast: 'standard'},
  syntax: dracula,
  tokens: {
    '--color-background-body': ['#F5F3FA', '#0A0E1A'],
    '--color-background-surface': ['#FFFFFF', '#101624'],
    '--focus-outline-color': 'var(--color-accent)',
  },
  components: {
    button: {
      base: {fontWeight: 'var(--font-weight-semibold)'},
    },
  },
});
