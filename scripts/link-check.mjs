#!/usr/bin/env node
/**
 * Tote Links finden (Redesign B4): lädt alle Seiten (Sitemap + nicht gelistete Seiten +
 * 404-Stichproben), sammelt jedes interne href aus dem Server-HTML und prüft
 *   - Status 200 ohne Weiterleitung (interne Links sollen direkt treffen),
 *   - Sprungziele (#id) existieren auf der Zielseite (id="…" im Server-HTML).
 *
 *   node scripts/link-check.mjs <baseUrl>
 *
 * Externe Links (LinkedIn, GitHub) werden nur aufgelistet, nicht abgerufen. Nur lesende GETs.
 * Exit-Code 1 bei toten Links oder fehlenden Sprungzielen.
 */
const base = process.argv[2];
if (!base) {
  console.error('usage: node scripts/link-check.mjs <baseUrl>');
  process.exit(2);
}

const html = new Map();
async function get(path) {
  if (html.has(path)) {
    return html.get(path);
  }
  const res = await fetch(base + path, { redirect: 'manual', headers: { accept: 'text/html' } });
  const body = res.headers.get('content-type')?.includes('text/html') ? await res.text() : '';
  const entry = { status: res.status, location: res.headers.get('location'), body };
  html.set(path, entry);
  return entry;
}

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const pages = new Set([...sitemap.matchAll(/<loc>https:\/\/yannick-beck\.de([^<]*)<\/loc>/g)].map((m) => m[1] || '/'));
for (const p of ['/uses', '/en/uses', '/content-status', '/en/content-status', '/gibt-es-nicht', '/en/gibt-es-nicht']) {
  pages.add(p);
}

const internal = new Map(); // ziel -> Set(quelle)
const external = new Set();
for (const page of pages) {
  const { body } = await get(page);
  for (const m of body.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:)?\/\//.test(href) && !href.includes('yannick-beck.de')) {
      external.add(href);
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      external.add(href);
      continue;
    }
    const abs = new URL(href, `https://yannick-beck.de${page}`);
    const key = abs.pathname + abs.hash;
    if (!internal.has(key)) {
      internal.set(key, new Set());
    }
    internal.get(key).add(page);
  }
}

let bad = 0;
const out = [];
for (const [target, sources] of [...internal.entries()].sort()) {
  const [path, hash] = target.split('#');
  const res = await get(path);
  let problem = null;
  if (res.status !== 200) {
    problem = `Status ${res.status}${res.location ? ` → ${res.location}` : ''}`;
  } else if (hash && !new RegExp(`\\sid="${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(res.body)) {
    problem = `Sprungziel #${hash} fehlt`;
  }
  if (problem) {
    bad++;
    out.push(`FAIL ${target}: ${problem} (aus ${[...sources].slice(0, 4).join(', ')}${sources.size > 4 ? ' …' : ''})`);
  }
}
console.log(out.join('\n') || 'Keine toten internen Links.');
console.log(`\n${pages.size} Seiten, ${internal.size} interne Ziele geprüft, ${bad} Befunde. Externe Ziele (nicht abgerufen):`);
console.log([...external].sort().map((e) => `  ${e}`).join('\n'));
process.exit(bad ? 1 : 0);
