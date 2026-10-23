#!/usr/bin/env node
/**
 * Browser-Zurück/-Vorwärts: Scroll-Wiederherstellung (B3; Feinschliff REG1/REG2: auf die
 * Startseite umgestellt – vorher lief es auf /blog, das in Produktion nur einen Beitrag hat und
 * nicht weit genug scrollt).
 *
 *   node scripts/backscroll.mjs <baseUrl> [out.json] [--reduce-only|--motion-only]
 *
 * Je Szenario: Startseite (bzw. /projekte) laden, Lage herstellen (Scrollen, Pille der
 * Abschnittsnavigation – setzt den Anker per replaceState), über Header-Link bzw. mobil über den
 * Drawer wegnavigieren, Browser-Zurück. Erwartet: dieselbe Scroll-Position wie beim Verlassen
 * (±2 px), auch wenn ein Anker in der URL steht (REG1: vorher sprang Zurück dann zum Abschnitt),
 * danach Vorwärts und wieder Zurück. Läuft standardmäßig unter no-preference UND reduce
 * (unter reduce fängt route-transition.tsx popstate ebenfalls ab: derselbe Weg ohne Animation,
 * Typ nav-none – Feinschliff REG1; vorher Nexts Standardweg, Chrome suchte dabei den Anker).
 * Klicks per Koordinaten (Maus bzw. Touch): Playwrights click() scrollt klebende Elemente vorher.
 * Exit 1 bei einer Abweichung oder einem Konsolen-/Seitenfehler.
 *
 * Playwright ist keine Projekt-Abhängigkeit: Pfad per PLAYWRIGHT_MODULE (docs/gate.md).
 */
import fs from 'node:fs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const BASE = (positional[0] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = positional[1];
const MODES = args.includes('--reduce-only') ? ['reduce'] : args.includes('--motion-only') ? ['no-preference'] : ['no-preference', 'reduce'];
const TOUCH = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch({ channel: process.env.GATE_CHANNEL ?? 'chrome', headless: true });
const out = [];

async function center(p, sel, { scroll = false } = {}) {
  return p.evaluate(
    ({ s, scroll }) => {
      const el = [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
      if (!el) return null;
      if (scroll) el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    { s: sel, scroll },
  );
}

async function tapOrClick(p, touch, c) {
  if (touch) await p.touchscreen.tap(c.x, c.y);
  else await p.mouse.click(c.x, c.y);
}

const y = (p) => p.evaluate(() => Math.round(window.scrollY));
const scrollTo = (top) => async (p) => p.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), top);
/** Pille der Abschnittsnavigation antippen (Anker per replaceState), optional danach an den Anfang. */
const pill = (index, thenTop = false) => async (p, touch) => {
  const c = await p.evaluate((k) => {
    const el = document.querySelectorAll('.yb-section-nav a')[k];
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, index);
  await tapOrClick(p, touch, c);
  await sleep(1200);
  if (thenTop) await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
};

async function scenario(mode, label, { touch = false, start = '/', pre, target }) {
  const ctx = await b.newContext({ ...(touch ? TOUCH : { viewport: { width: 1440, height: 900 } }), reducedMotion: mode });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(BASE + start, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await sleep(800);
  await pre(p, touch);
  await sleep(500);
  const leave = await p.evaluate(() => ({ y: Math.round(window.scrollY), hash: window.location.hash }));
  if (touch) {
    await tapOrClick(p, true, await center(p, 'header button[aria-haspopup="dialog"]'));
    await sleep(800);
    await tapOrClick(p, true, await center(p, `dialog a[href="${target}"]`));
  } else {
    await tapOrClick(p, false, await center(p, `header a[href="${target}"]`));
  }
  await p.waitForURL(`**${target}`, { timeout: 5000 }).catch(() => {});
  await sleep(1200);
  const thereY = 300;
  await scrollTo(thereY)(p);
  await sleep(200);
  await p.goBack();
  await sleep(1600);
  const back = await p.evaluate(() => ({ path: window.location.pathname + window.location.hash, y: Math.round(window.scrollY) }));
  await p.goForward();
  await sleep(1600);
  const fwd = await p.evaluate(() => ({ path: window.location.pathname, y: Math.round(window.scrollY) }));
  await p.goBack();
  await sleep(1600);
  const back2 = await y(p);
  const ok = Math.abs(back.y - leave.y) <= 2 && Math.abs(back2 - leave.y) <= 2 && fwd.path === target && errs.length === 0;
  const row = { mode, label, leaveY: leave.y, hash: leave.hash, backPath: back.path, backY: back.y, fwdPath: fwd.path, fwdY: fwd.y, back2Y: back2, ok, errs: errs.length };
  out.push(row);
  console.log(`${ok ? 'OK    ' : 'FEHLER'} [${mode}] ${label}: verlassen ${leave.y}${leave.hash} → zurück ${back.y}, vorwärts ${fwd.path} ${fwd.y}, wieder zurück ${back2}${errs.length ? ` – ${errs.length} Fehler` : ''}`);
  await ctx.close();
}

for (const mode of MODES) {
  await scenario(mode, '1440 Header-Link, y=1500', { pre: scrollTo(1500), target: '/projekte' });
  await scenario(mode, '1440 Header-Link, y=0', { pre: scrollTo(0), target: '/projekte' });
  await scenario(mode, '1440 Pille „Projekte“ (Anker), Header-Link', { pre: pill(3), target: '/cv' });
  await scenario(mode, '1440 Pille (Anker), dann y=0, Header-Link', { pre: pill(3, true), target: '/cv' });
  await scenario(mode, '1440 /projekte y=600, Header-Link', { start: '/projekte', pre: scrollTo(600), target: '/cv' });
  await scenario(mode, '390 Drawer, y=1500', { touch: true, pre: scrollTo(1500), target: '/projekte' });
  await scenario(mode, '390 Drawer nach Pille (Anker)', { touch: true, pre: pill(3), target: '/projekte' });
  await scenario(mode, '390 Drawer nach Pille (Anker), dann y=0', { touch: true, pre: pill(3, true), target: '/projekte' });
  await scenario(mode, 'EN 390 Drawer nach Pille (Anker), dann y=0', { touch: true, start: '/en', pre: pill(3, true), target: '/en/projekte' });
}
await b.close();
const failed = out.filter((r) => !r.ok);
console.log(`\n${out.length - failed.length}/${out.length} Szenarien ok`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ base: BASE, scenarios: out }, null, 1));
process.exit(failed.length ? 1 : 0);
