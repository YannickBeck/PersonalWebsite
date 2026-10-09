#!/usr/bin/env node
/**
 * Alte und neue Adressen prüfen (Redesign B4, docs/urls.md).
 *
 *   node scripts/url-check.mjs <baseUrl> [--preview]
 *
 * Fragt jede Adresse ohne Weiterleitung ab (redirect: manual) und vergleicht Status und Ziel
 * mit der Erwartung. Grundlage: alle Adressen des Live-Stands 2d636c6 (Sitemap, Links der
 * Seiten, Demo-Slugs) plus die neuen Projektseiten. --preview: Build mit NEXT_PUBLIC_SHOW_GAPS=1
 * (Demo-Artikel vorhanden, keine Umleitung). Exit-Code 1 bei Abweichung. Nur lesende GETs.
 */
const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--'));
const preview = args.includes('--preview');
if (!base) {
  console.error('usage: node scripts/url-check.mjs <baseUrl> [--preview]');
  process.exit(2);
}

const STATIC = ['/', '/projekte', '/blog', '/leistungen', '/cv', '/ueber-mich', '/uses', '/kontakt', '/newsletter', '/impressum', '/datenschutz', '/content-status'];
const en = (p) => (p === '/' ? '/en' : `/en${p}`);

/** [Pfad, Status, Ziel bei Weiterleitung] */
const cases = [];
for (const p of STATIC) {
  cases.push([p, 200], [en(p), 200]);
}
// Detailseiten: Content-Modell + Ghost (Mock spiegelt die live sichtbaren Beiträge)
cases.push(
  ['/projekte/orbitalis', 200],
  ['/projekte/bachelorarbeit', 200],
  ['/en/projekte/orbitalis', 200],
  ['/en/projekte/bachelor-thesis', 200],
  ['/blog/hallo-welt-warum-diese-website', 200],
  ['/en/blog/hello-world-why-this-website', 200],
  ['/en/blog/coming-soon', 200],
);
// Ghost-Testprojekt mit Entwicklernotiz (Fix-Runde 3, src/lib/ghost-samples.ts) → Übersicht,
// auch unter /blog (der Blog rendert keine Beiträge mit Tag „project“)
cases.push(
  ['/projekte/beispielprojekt-me-website', 308, '/projekte'],
  ['/en/projekte/sample-project-me-website', 308, '/en/projekte'],
  ['/blog/beispielprojekt-me-website', 308, '/projekte'],
  ['/en/blog/sample-project-me-website', 308, '/en/projekte'],
);
// Alte Demo-Projekte (live 2d636c6) → Übersicht
for (const s of ['demo-projekt-webseite', 'demo-projekt-cms-migration', 'demo-projekt-deploy-pipeline']) {
  cases.push([`/projekte/${s}`, 308, '/projekte']);
}
for (const s of ['demo-project-website', 'demo-project-cms-migration', 'demo-project-deploy-pipeline']) {
  cases.push([`/en/projekte/${s}`, 308, '/en/projekte']);
}
// Alte Demo-Artikel: Produktion → Übersicht, Vorschau → vorhanden
for (const s of ['demo-warum-eigene-website', 'demo-ghost-headless', 'demo-automatisierung-alltag', 'demo-nextjs-rendering', 'demo-content-modellierung', 'demo-ci-cd-sideprojects']) {
  cases.push(preview ? [`/blog/${s}`, 200] : [`/blog/${s}`, 308, '/blog']);
}
for (const s of ['demo-why-own-website', 'demo-ghost-headless-en', 'demo-automation-everyday', 'demo-nextjs-rendering-en', 'demo-content-modeling', 'demo-ci-cd-sideprojects-en']) {
  cases.push(preview ? [`/en/blog/${s}`, 200] : [`/en/blog/${s}`, 308, '/en/blog']);
}
// Frühere Ghost-/Vertrauensanker-Pfade (next.config redirects)
cases.push(
  ['/about', 308, '/ueber-mich'],
  ['/coming-soon', 308, '/en/blog'],
  ['/tag/news', 308, '/blog'],
  ['/contact', 308, '/kontakt'],
  ['/privacy', 308, '/datenschutz'],
  ['/imprint', 308, '/impressum'],
  ['/projekte/', 308, '/projekte'],
);
// Feeds, Agenten, Assets
cases.push(
  ['/rss.xml', 200],
  ['/en/rss.xml', 200],
  ['/sitemap.xml', 200],
  ['/robots.txt', 200],
  ['/llms.txt', 200],
  ['/favicon.ico', 200],
  ['/og/de', 200],
  ['/og/en', 200],
  ['/me/portrait.webp', 200],
  ['/placeholders/project-web.svg', 200],
);
// Unbekannt → 404
cases.push(['/gibt-es-nicht', 404], ['/projekte/unbekannt', 404], ['/en/blog/unbekannt', 404], ['/blog/coming-soon', 404]);

let bad = 0;
const rows = [];
for (const [path, want, to] of cases) {
  const res = await fetch(base + path, { redirect: 'manual', headers: { accept: 'text/html' } });
  const loc = res.headers.get('location');
  const target = loc ? new URL(loc, base).pathname : null;
  const ok = res.status === want && (!to || target === to);
  if (!ok) {
    bad++;
  }
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${String(res.status).padEnd(3)} ${path}${target ? ` → ${target}` : ''}${ok ? '' : `  (erwartet ${want}${to ? ` → ${to}` : ''})`}`);
}
console.log(rows.join('\n'));
console.log(`\n${cases.length} Adressen, ${bad} Abweichungen (${preview ? 'Vorschau' : 'Produktion'})`);
process.exit(bad ? 1 : 0);
