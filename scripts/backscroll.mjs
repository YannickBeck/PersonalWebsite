#!/usr/bin/env node
// Browser-Zurück/-Vorwärts: Scroll-Wiederherstellung + View Transitions (B3).
// Nutzung: node backscroll.mjs <baseUrl> [width]
// Playwright ist keine Projekt-Abhängigkeit: Pfad per PLAYWRIGHT_MODULE (z. B. ein lokales
// node_modules/playwright/index.mjs) oder global installiertes „playwright“.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const BASE = process.argv[2];
const W = Number(process.argv[3] || 1440);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: W < 500 ? 844 : 900 } });
await p.addInitScript(() => { window.__vt = []; const o = document.startViewTransition?.bind(document); if (o) document.startViewTransition = (a) => { window.__vt.push(a?.types ? [...a.types].join(',') : '(none)'); return o(a); }; });
const out = [];
const log = async (label) => { await p.waitForTimeout(1500); out.push({ label, ...(await p.evaluate(() => ({ path: location.pathname, y: Math.round(scrollY), vts: window.__vt.join(' | ') }))) }); };
const jump = (y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
await p.goto(BASE + '/blog', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
await jump(700);
await log('Liste bei 700');
// sichtbare Karte per Maus klicken (kein automatisches Scrollen durch Playwright)
const pt = await p.evaluate(() => {
  const c = [...document.querySelectorAll('main .astryx-clickable-card')].find((e) => { const r = e.getBoundingClientRect(); return r.top > 100 && r.top < innerHeight - 150; });
  const r = c.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + 40, href: c.querySelector('a').getAttribute('href') };
});
await p.mouse.click(pt.x, pt.y);
await log('Detail (' + pt.href + ')');
await jump(1200);
await log('Detail bei 1200');
await p.goBack();
await log('Zurück → Liste (erwartet 700)');
await p.goForward();
await log('Vorwärts → Detail (erwartet 1200)');
await p.goBack();
await log('Zurück → Liste (erwartet 700)');
console.table(out);
await b.close();
