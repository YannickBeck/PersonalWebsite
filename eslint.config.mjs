import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Von `astryx theme build` generiert (nicht von Hand bearbeiten)
    "src/theme/yb.js",
    "src/theme/yb.d.ts",
    "src/theme/yb.variants.d.ts",
  ]),
]);

export default eslintConfig;
