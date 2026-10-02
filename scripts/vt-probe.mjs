#!/usr/bin/env node
/**
 * View-Transition-Prüfung (B3): instrumentiert document.startViewTransition und sammelt
 * während jeder Aktion die laufenden Animationen der ::view-transition-*-Pseudoelemente.
 * Nutzung: node vt-probe.mjs <baseUrl> <out.json> [--reduce] [--width=1440]
 */
// Playwright ist keine Projekt-Abhängigkeit: Pfad per PLAYWRIGHT_MODULE (z. B. ein lokales
// node_modules/playwright/index.mjs) oder global installiertes „playwright“.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
import fs from 'node:fs';

const args = process.argv.slice(2);
const BASE = (args[0] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = args[1];
const REDUCE = args.includes('--reduce');
const W = Number((args.find((a) => a.startsWith('--width=')) || '--width=1440').split('=')[1]);
const H = W <= 400 ? 844 : 900;

const INSTRUMENT = () => {
  window.__vt = [];
  const orig = document.startViewTransition?.bind(document);
  if (!orig) return;
  document.startViewTransition = (arg) => {
    const rec = { t: performance.now(), types: arg && typeof arg === 'object' && arg.types ? [...arg.types] : [], anims: [], ended: null, names: [] };
    window.__vt.push(rec);
    const vt = orig(arg);
    const sample = () => {
      for (const a of document.getAnimations()) {
        const pe = a.effect?.pseudoElement;
        if (!pe) continue;
        const t = a.effect.getComputedTiming();
        const key = `${pe}|${a.animationName}`;
        if (!rec.anims.some((x) => x.key === key)) rec.anims.push({ key, pe, name: a.animationName, dur: Math.round(t.duration), delay: Math.round(t.delay) });
      }
    };
    vt.ready.then(() => {
      sample();
      rec.ready = Math.round(performance.now() - rec.t);
      requestAnimationFrame(sample);
    }).catch((e) => (rec.readyErr = String(e)));
    vt.finished.then(() => (rec.ended = Math.round(performance.now() - rec.t))).catch((e) => (rec.finErr = String(e)));
    return vt;
  };
};

const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: REDUCE ? 'reduce' : 'no-preference', colorScheme: 'dark' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript(INSTRUMENT);

const steps = [];
async function step(label, action, { settle = 900 } = {}) {
  const before = await page.evaluate(() => ({ n: window.__vt.length, url: location.pathname, y: Math.round(scrollY) }));
  await action();
  await page.waitForTimeout(settle);
  const after = await page.evaluate((n) => ({
    url: location.pathname,
    y: Math.round(scrollY),
    nav: document.documentElement.hasAttribute('data-yb-nav'),
    vts: window.__vt.slice(n).map((r) => ({ types: r.types, ready: r.ready, ended: r.ended, readyErr: r.readyErr, anims: r.anims.map((a) => { const x = { ...a }; delete x.key; return x; }) })),
    running: document.getAnimations().filter((a) => a.playState === 'running').map((a) => `${a.effect?.target?.className?.baseVal ?? a.effect?.target?.className ?? ''}`.slice(0, 40) + ' ' + (a.animationName || a.transitionProperty)),
  }), before.n);
  steps.push({ label, from: before.url, fromY: before.y, ...after });
  console.log(label, before.url, '→', after.url, JSON.stringify(after.vts.map((v) => [v.types.join(','), v.ended, v.anims.map((a) => `${a.pe}:${a.name}:${a.dur}+${a.delay}`)])));
}

const card = (href) => page.locator(`main .astryx-clickable-card:has(a[href="${href}"])`).first();

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await step('header → Projekte (forward)', () => page.locator('header a[href="/projekte"]').first().click());
await step('Karte → Demo-Projekt (forward + Morph)', () => card('/projekte/demo-projekt-webseite').click());
await step('Related-Karte → anderes Projekt (lateral + Morph)', async () => {
  const c = page.locator('main .astryx-carousel .astryx-clickable-card').first();
  await c.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await c.click();
});
await step('BackLink → Projekte (back + Rück-Morph)', async () => {
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.locator('main a[href="/projekte"]').first().click();
});
await step('Filter Tab (filter)', () => page.locator('main .astryx-tab').nth(1).click());
await step('Filter Tab zurück (filter)', () => page.locator('main .astryx-tab').nth(0).click());
await step('Projekte → Blog (lateral)', () => page.locator('header a[href="/blog"]').first().click());
await step('Blog → Ghost-Artikel (forward + Morph)', () => card('/blog/hallo-welt-warum-diese-website').click());
await step('Sprachwechsel DE → EN (lateral)', () => page.locator('header a[href^="/en"]').first().click());
await step('EN → Startseite per Marke (back)', () => page.locator('header a[href="/en"]').first().click());
await step('Browser-Zurück (popstate)', () => page.goBack());
await step('Browser-Vorwärts (popstate)', () => page.goForward());
await step('Theme-Wechsel (theme)', () => page.locator('header button[aria-label*="Farbschema"], header button[aria-label*="colour scheme"]').first().click());

const res = { base: BASE, reduce: REDUCE, width: W, steps, errors };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log('errors', errors);
await b.close();
