#!/usr/bin/env node
/**
 * View-Transition-Prüfung (B3, Feinschliff REG2: an den heutigen Inhalt angepasst – vorher zielte
 * sie auf gelöschte Demo-Projekte, Filter-Tabs und den nicht mehr gelisteten Blog-Link).
 *
 *   node scripts/vt-probe.mjs <baseUrl> [out.json] [--reduce] [--width=1440]
 *
 * Instrumentiert document.startViewTransition, sammelt je Schritt Typen und die Animationen der
 * ::view-transition-*-Pseudoelemente und prüft sie gegen die Erwartung (AGENTS.md „Motion & View
 * Transitions“). Schritte: Header → /projekte (vorwärts), Projektzeile → Detail (vorwärts + Morph
 * des Covers), „Weiteres Projekt“ hin (seitlich; die Bachelorarbeit hat kein Detail-Cover) und
 * zurück (seitlich + Morph), Zurück-Link (zurück + Rück-Morph), Header →
 * /cv (seitlich), Marke → / (zurück), Browser-Zurück/-Vorwärts (popstate), Fähigkeits-Chip einer
 * Projektseite → /#skill-… (zurück, Fokus auf der Kachel, REG3), /blog → Beitrag (vorwärts +
 * Morph), Sprachwechsel DE → EN (Dokumentwechsel, keine VT, lang=en), Theme (theme-Reveal).
 * Unter --reduce: Typen wie oben, aber keine Pseudo-Animation länger als 0 ms und kein
 * Theme-Reveal. Exit 1 bei einer Abweichung oder einem Konsolen-/Seitenfehler.
 *
 * Nach jedem Next-Upgrade zusammen mit scripts/backscroll.mjs laufen lassen, dann TESTED_NEXT in
 * src/lib/transitions.ts anheben (COD2). Klicks per Koordinaten: Playwrights click() scrollt
 * klebende Elemente vorher und verfälscht Scroll-Messungen. Schmal (--width=390) laufen die
 * Header-Ziele über den Drawer.
 *
 * Playwright ist keine Projekt-Abhängigkeit: Pfad per PLAYWRIGHT_MODULE (docs/gate.md).
 */
import fs from 'node:fs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const BASE = (positional[0] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = positional[1];
const REDUCE = args.includes('--reduce');
const W = Number((args.find((a) => a.startsWith('--width=')) || '--width=1440').split('=')[1]);
const H = W <= 400 ? 844 : 900;

const INSTRUMENT = () => {
  window.__vt = [];
  window.__doc = Math.random();
  const orig = document.startViewTransition?.bind(document);
  if (!orig) return;
  document.startViewTransition = (arg) => {
    const rec = { t: performance.now(), types: arg && typeof arg === 'object' && arg.types ? [...arg.types] : [], anims: [], ended: null };
    window.__vt.push(rec);
    const vt = orig(arg);
    const sample = () => {
      for (const a of document.getAnimations()) {
        const pe = a.effect?.pseudoElement;
        if (!pe || !pe.startsWith('::view-transition')) continue;
        const t = a.effect.getComputedTiming();
        const key = `${pe}|${a.animationName}`;
        if (!rec.anims.some((x) => x.key === key)) rec.anims.push({ key, pe, name: a.animationName, dur: Math.round(t.duration), delay: Math.round(t.delay) });
      }
    };
    vt.ready.then(() => {
      sample();
      requestAnimationFrame(sample);
    }).catch((e) => (rec.readyErr = String(e)));
    vt.finished.then(() => (rec.ended = Math.round(performance.now() - rec.t))).catch((e) => (rec.finErr = String(e)));
    return vt;
  };
};

const b = await chromium.launch({ channel: process.env.GATE_CHANNEL ?? 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: REDUCE ? 'reduce' : 'no-preference', colorScheme: 'light' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript(INSTRUMENT);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Mittelpunkt des ersten sichtbaren Treffers, vorher ohne Animation in die Mitte gescrollt. */
async function clickSel(sel, { scroll = true } = {}) {
  const c = await page.evaluate(
    ({ s, scroll }) => {
      const el = [...document.querySelectorAll(s)].find((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
      });
      if (!el) return null;
      if (scroll) el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    { s: sel, scroll },
  );
  if (!c) throw new Error(`nicht gefunden: ${sel}`);
  await page.mouse.click(c.x, c.y);
}

/** Header-Ziel anklicken; schmal (Links im Drawer) erst das Menü öffnen. */
async function header(sel) {
  const visible = await page.evaluate((s) => [...document.querySelectorAll(`header ${s}`)].some((e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden'), sel);
  if (visible) {
    await clickSel(`header ${sel}`, { scroll: false });
    return;
  }
  await clickSel('header button[aria-haspopup="dialog"]', { scroll: false });
  await sleep(700);
  await clickSel(`dialog ${sel}`, { scroll: false });
}

const steps = [];
async function step(label, expect, action, { settle = 1100 } = {}) {
  const before = await page.evaluate(() => ({ n: window.__vt?.length ?? 0, url: location.pathname, doc: window.__doc }));
  let error = null;
  try {
    await action();
  } catch (e) {
    error = String(e).slice(0, 200);
  }
  await sleep(settle);
  const after = await page.evaluate((n) => ({
    url: location.pathname + location.hash,
    lang: document.documentElement.lang,
    active: document.activeElement ? `${document.activeElement.tagName.toLowerCase()}${document.activeElement.id ? `#${document.activeElement.id}` : ''}` : null,
    vts: (window.__vt ?? []).slice(n).map((r) => ({ types: r.types, ended: r.ended, readyErr: r.readyErr, anims: r.anims.map((a) => ({ pe: a.pe, name: a.name, dur: a.dur, delay: a.delay })) })),
  }), (await page.evaluate(() => window.__doc)) === before.doc ? before.n : 0);
  const problems = [];
  if (error) problems.push(error);
  if (expect.url && !after.url.startsWith(expect.url)) problems.push(`URL ${after.url} statt ${expect.url}`);
  if (expect.lang && after.lang !== expect.lang) problems.push(`lang ${after.lang}`);
  const types = after.vts.flatMap((v) => v.types);
  if (expect.vt === 0 && after.vts.length) problems.push(`VT unerwartet: ${JSON.stringify(types)}`);
  if (expect.type && !types.includes(expect.type)) problems.push(`Typ ${expect.type} fehlt (${JSON.stringify(types)})`);
  const anims = after.vts.flatMap((v) => v.anims);
  // React bildet ein share-Paar nur, wenn alte und neue Fläche im Bild liegen – schmal steht das
  // Cover unter dem geklickten Button bzw. unter dem Titel der Detailseite, dort kein Morph
  if (expect.morph && !REDUCE && W >= 1024 && !anims.some((a) => /yb-cover/.test(a.pe))) problems.push('kein Morph-Paar yb-cover…');
  if (REDUCE && anims.some((a) => a.dur > 0)) problems.push(`Animation unter reduce: ${anims.filter((a) => a.dur > 0).map((a) => `${a.pe} ${a.dur}ms`).join(', ')}`);
  if (expect.focus && after.active !== expect.focus) problems.push(`Fokus ${after.active} statt ${expect.focus}`);
  if (after.vts.some((v) => v.readyErr)) problems.push(`VT-Fehler ${after.vts.map((v) => v.readyErr).filter(Boolean).join('; ')}`);
  const ok = problems.length === 0;
  steps.push({ label, from: before.url, ...after, ok, problems });
  console.log(`${ok ? 'OK    ' : 'FEHLER'} ${label}: ${before.url} → ${after.url} ${JSON.stringify(types)} ${anims.length} Animationen${problems.length ? ` – ${problems.join('; ')}` : ''}`);
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await sleep(500);
await step('Header → Projekte', { url: '/projekte', type: 'nav-forward' }, () => header('a[href="/projekte"]'));
await step('Projektzeile → Orbitalis (Morph)', { url: '/projekte/orbitalis', type: 'nav-forward', morph: true }, () => clickSel('main article a[href="/projekte/orbitalis"]:not([tabindex="-1"])'));
// Die Bachelorarbeit hat auf der Detailseite kein Cover (Titel in der Lede) – dorthin kein Morph
await step('Weiteres Projekt → Bachelorarbeit (seitlich)', { url: '/projekte/bachelorarbeit', type: 'nav-lateral' }, () => clickSel('main article a[href="/projekte/bachelorarbeit"]:not([tabindex="-1"])'));
await step('Weiteres Projekt → Orbitalis (seitlich + Morph)', { url: '/projekte/orbitalis', type: 'nav-lateral', morph: true }, () => clickSel('main article a[href="/projekte/orbitalis"]:not([tabindex="-1"])'));
await step('Zurück-Link → Projekte (Rück-Morph)', { url: '/projekte', type: 'nav-back', morph: true }, async () => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(150);
  await clickSel('main a[href="/projekte"]');
});
await step('Header → Lebenslauf (seitlich)', { url: '/cv', type: 'nav-lateral' }, () => header('a[href="/cv"]'));
await step('Marke → Startseite (zurück)', { url: '/', type: 'nav-back' }, () => clickSel('header a[href="/"]', { scroll: false }));
await step('Browser-Zurück (popstate)', { url: '/cv', type: REDUCE ? undefined : 'nav-back' }, () => page.goBack());
await step('Browser-Vorwärts (popstate)', { url: '/', type: REDUCE ? undefined : 'nav-forward' }, () => page.goForward());
await page.goto(`${BASE}/projekte/orbitalis`, { waitUntil: 'networkidle' });
await sleep(400);
await step('Fähigkeits-Chip → /#skill-rag (Fokus, REG3)', { url: '/#skill-rag', type: 'nav-back', focus: 'button#skill-rag' }, async () => {
  await page.evaluate(() => {
    const a = document.querySelector('main a[href="/#skill-rag"]');
    a.scrollIntoView({ block: 'center', behavior: 'instant' });
    a.focus();
  });
  await page.keyboard.press('Enter');
}, { settle: 1600 });
await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
await sleep(400);
await step('Blog → Beitrag (Morph)', { url: '/blog/', type: 'nav-forward', morph: true }, () => clickSel('main .astryx-clickable-card'));
await step('Sprachwechsel DE → EN (Dokumentwechsel)', { url: '/en', lang: 'en', vt: 0 }, () => header('a[href^="/en"]'), { settle: 1800 });
await step(REDUCE ? 'Theme unter reduce (kein Reveal)' : 'Theme-Wechsel (Reveal)', REDUCE ? { vt: 0 } : { type: 'theme' }, () => header('button[aria-label*="colour scheme"]'));

const failed = steps.filter((s) => !s.ok);
const res = { base: BASE, reduce: REDUCE, width: W, steps, errors, ok: failed.length === 0 && errors.length === 0 };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(`\n${steps.length - failed.length}/${steps.length} Schritte ok, Konsolen-/Seitenfehler: ${errors.length}${errors.length ? `\n  ${errors.join('\n  ')}` : ''}`);
await b.close();
process.exit(res.ok ? 0 : 1);
