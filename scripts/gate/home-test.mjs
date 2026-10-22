#!/usr/bin/env node
/**
 * Regressionstests der Startseiten-Interaktionen (Nachfolger der früheren b3-/b4-Tests,
 * Anleitung: docs/gate.md). Prüft gegen einen laufenden Build:
 *
 *   node scripts/gate/home-test.mjs <baseUrl> [outDir] [--only=<regex>] [--lang=de|en|both]
 *
 * - Abschnittsnavigation: „00 Start“ beim Laden aktiv (DES3), Klick → aria-current, Hash per
 *   replaceState (kein History-Eintrag), Fokus im Abschnitt, Ziel nicht unter den Leisten
 *   (A112), ←/→/Pos1/Ende, Fokusring nicht beschnitten (Fix-Runde 3), fokussierte Pille ganz im
 *   Scroller (A114), Einstiegs-Pillen setzen den Fokus in den Zielabschnitt (A111)
 * - Ausweiskarte: Umdrehen (aria-pressed, verdeckte Seite inert), Pfeiltasten, Ruhe (keine
 *   rAF-Aufrufe mehr), kein Seitenüberlauf
 * - Periodensystem: Tabs-Muster (roving tabindex, aria-selected, tabpanel), ←/→ umlaufend,
 *   ↑/↓ nach Lage, Pos1/Ende, Filter (aria-pressed, inert, Kacheln bleiben an ihrem Platz),
 *   Laden mit /#skill-rag (Raster und Detailfeld in Sicht), Sprung aus dem Akkordeon hebt einen
 *   verdeckenden Filter auf (A116)
 * - Projekt-Akkordeon: genau einer offen (aria-expanded/-disabled, inert), Fokus bleibt,
 *   Pfeiltasten, Namen beginnen mit Nummer (WCAG 2.5.3), nebeneinander ab 900px mit fester
 *   Reihenhöhe, gestapelt bei 768px (640–899px Container), holdPosition: der gewählte Kopf
 *   bleibt stehen (A111), „Zum Projekt“ aus dem Werdegang landet im Bild (A111)
 * - Werdegang: exklusive <details>, Tastatur, geöffnete Station bleibt stehen (A112)
 * - Laden mit #project-bachelorarbeit (768) bzw. #career-bechtle-junior (1440/390): Ziel offen
 *   und im Bild (A111/A112); holdPosition am Seitenanfang hält ein späteres Scrollen nicht zurück
 * - Band der Abschnittsnavigation nimmt Klicks selbst an, keine verdeckte Kachel (A113)
 * - Reduced Motion: 0 laufende Animationen nach Laden, Filter, Akkordeon, Werdegang, Karte
 *
 * Exit-Code 1 bei einem Fehlschlag; Ergebnis als JSON in [outDir]/home-test.json.
 * Playwright per PLAYWRIGHT_MODULE (wie scripts/vt-probe.mjs). Nur Klicks/Tasten, keine Formulare.
 */
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const opt = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const BASE = (positional[0] ?? '').replace(/\/$/, '');
const OUT = positional[1] ?? null;
const ONLY = opt('only', null);
const LANGS = opt('lang', 'both') === 'both' ? ['de', 'en'] : [opt('lang')];
if (!BASE) {
  console.error('Nutzung: node scripts/gate/home-test.mjs <baseUrl> [outDir] [--only=<regex>] [--lang=de|en|both]');
  process.exit(2);
}

const HOME = { de: '/', en: '/en' };
const browser = await chromium.launch({ channel: process.env.GATE_CHANNEL ?? 'chrome', headless: true });

/** Zähler für requestAnimationFrame (Ausweiskarte: Schleife endet in Ruhe). */
function countRaf() {
  window.__ybRaf = 0;
  const orig = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => {
    window.__ybRaf += 1;
    return orig(cb);
  };
}

async function open(lang, { width = 1440, height, reduce = false, hash = '' } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height: height ?? (width <= 400 ? 844 : width <= 800 ? 1024 : 900) },
    reducedMotion: reduce ? 'reduce' : 'no-preference',
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(countRaf);
  await page.goto(`${BASE}${HOME[lang]}${hash}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  return { page, ctx, errors };
}

/** Unterkante der klebenden Leisten (Header + Abschnittsnavigation, falls sie klebt). */
const barsBottom = (page) =>
  page.evaluate(() => {
    const h = document.querySelector('.yb-vt-header')?.getBoundingClientRect().bottom ?? 0;
    const navEl = document.querySelector('.yb-section-nav');
    const n = navEl && getComputedStyle(navEl).position === 'sticky' ? navEl.getBoundingClientRect().bottom : 0;
    return Math.round(Math.max(h, n));
  });

/** Wartet, bis scrollY sich über drei Frames nicht mehr ändert (weiches Scrollen). */
const settle = (page, extra = 150) =>
  page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        let last = -1;
        let same = 0;
        const t0 = performance.now();
        const tick = () => {
          const y = Math.round(scrollY);
          same = y === last ? same + 1 : 0;
          last = y;
          if (same >= 3 || performance.now() - t0 > 4000) {
            setTimeout(resolve, ms);
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      }),
    extra,
  );

const rectOf = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) {
      return null;
    }
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), height: Math.round(r.height), width: Math.round(r.width) };
  }, selector);

/** Scrollt so, dass das Element mit Oberkante bei y steht (ohne weiches Scrollen). */
const placeAt = (page, selector, y) =>
  page.evaluate(
    ([sel, target]) => {
      const el = document.querySelector(sel);
      const top = el.getBoundingClientRect().top + scrollY;
      window.scrollTo({ top: top - target, behavior: 'instant' });
    },
    [selector, y],
  );

const activeInfo = (page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    return a ? { tag: a.tagName, id: a.id, skill: a.dataset?.skill ?? null, text: (a.textContent || '').trim().slice(0, 60), inSection: a.closest('section[id]')?.id ?? null } : null;
  });

// ---------------------------------------------------------------------------------------------
// Tests: [Name, Sprachen, Funktion] – die Funktion wirft bei Fehlschlag (assert) und kann ein
// Detail-Objekt zurückgeben.

class Fail extends Error {}
function assert(cond, msg, detail) {
  if (!cond) {
    throw new Fail(`${msg}${detail !== undefined ? ` – ${JSON.stringify(detail)}` : ''}`);
  }
}

const tests = [];
const test = (name, langs, fn) => tests.push({ name, langs, fn });

// ---- Abschnittsnavigation ----------------------------------------------------------------------

test('Navigation: Pillen, „00 Start“ beim Laden aktiv (DES3)', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  const info = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.yb-section-nav a')];
    return { n: links.length, hrefs: links.map((a) => a.getAttribute('href')), current: links.findIndex((a) => a.getAttribute('aria-current') === 'true') };
  });
  await ctx.close();
  assert(info.n >= 5, 'mindestens 5 Pillen', info);
  assert(info.current === 0, 'erste Pille aktiv', info);
  return info;
});

test('Navigation: Klick → Abschnitt aktiv, Hash ohne History-Eintrag, Fokus im Abschnitt, nicht unter den Leisten', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  const target = await page.evaluate(() => document.querySelectorAll('.yb-section-nav a')[3].getAttribute('href'));
  const histBefore = await page.evaluate(() => history.length);
  await page.click(`.yb-section-nav a[href="${target}"]`);
  await settle(page, 300);
  const id = target.slice(1);
  const st = await page.evaluate((sid) => {
    const sec = document.getElementById(sid);
    const head = sec.querySelector('h2') ?? sec;
    return {
      hash: location.hash,
      hist: history.length,
      current: document.querySelector('.yb-section-nav a[aria-current="true"]')?.getAttribute('href'),
      focusIn: sec.contains(document.activeElement),
      headTop: Math.round(head.getBoundingClientRect().top),
    };
  }, id);
  const bars = await barsBottom(page);
  await ctx.close();
  assert(st.hash === target, 'Hash gesetzt', st);
  assert(st.hist === histBefore, 'kein neuer History-Eintrag', { before: histBefore, after: st.hist });
  assert(st.current === target, 'Pille aktiv', st);
  assert(st.focusIn, 'Fokus im Abschnitt', st);
  assert(st.headTop >= bars - 1, 'Überschrift nicht unter den Leisten', { ...st, bars });
  return { ...st, bars };
});

test('Navigation: ←/→/Pos1/Ende zwischen den Pillen', ['de'], async (lang) => {
  const { page, ctx } = await open(lang);
  await page.focus('.yb-section-nav a');
  const idx = () => page.evaluate(() => [...document.querySelectorAll('.yb-section-nav a')].indexOf(document.activeElement));
  await page.keyboard.press('ArrowRight');
  const r1 = await idx();
  await page.keyboard.press('End');
  const r2 = await idx();
  const n = await page.evaluate(() => document.querySelectorAll('.yb-section-nav a').length);
  await page.keyboard.press('ArrowLeft');
  const r3 = await idx();
  await page.keyboard.press('Home');
  const r4 = await idx();
  await ctx.close();
  assert(r1 === 1 && r2 === n - 1 && r3 === n - 2 && r4 === 0, 'Tastenfolge', { r1, r2, r3, r4, n });
  return { r1, r2, r3, r4 };
});

test('Navigation @390: Fokusring der Pillen nicht beschnitten (Fix-Runde 3)', ['de'], async (lang) => {
  const { page, ctx } = await open(lang, { width: 390 });
  await page.focus('.yb-section-nav a');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  const m = await page.evaluate(() => {
    const a = document.activeElement;
    const list = a.closest('ul');
    const cs = getComputedStyle(a);
    const ext = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth);
    const r = a.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    return { outline: cs.outlineStyle, ext, clipTop: Math.max(0, Math.round(l.top - (r.top - ext))), clipBottom: Math.max(0, Math.round(r.bottom + ext - l.bottom)) };
  });
  await ctx.close();
  assert(m.outline !== 'none' && m.ext > 0, 'Fokusring vorhanden', m);
  assert(m.clipTop === 0 && m.clipBottom === 0, 'Fokusring oben/unten nicht abgeschnitten', m);
  return m;
});

test('Navigation @390: fokussierte letzte Pille ganz im Scroller (A114)', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang, { width: 390 });
  await page.focus('.yb-section-nav a');
  await page.keyboard.press('End');
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const a = document.activeElement;
    const list = a.closest('ul');
    const r = a.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    return { text: a.textContent.trim(), cutLeft: Math.max(0, Math.round(l.left - r.left)), cutRight: Math.max(0, Math.round(r.right - l.right)) };
  });
  await ctx.close();
  assert(m.cutLeft === 0 && m.cutRight === 0, 'Pille nicht abgeschnitten', m);
  return m;
});

test('Einstieg: Pille „Projekte“ setzt den Fokus in den Abschnitt (A111)', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  const href = await page.evaluate(() => document.querySelectorAll('.yb-hero-actions a')[1]?.getAttribute('href'));
  await page.click(`.yb-hero-actions a[href="${href}"]`);
  await settle(page, 300);
  const st = await activeInfo(page);
  const hash = await page.evaluate(() => location.hash);
  await ctx.close();
  assert(href && hash === href, 'Hash gesetzt', { href, hash });
  assert(st?.inSection === href.slice(1), 'Fokus im Zielabschnitt', st);
  return st;
});

// ---- Ausweiskarte --------------------------------------------------------------------------------

const BADGE_BTN = 'button[aria-pressed][aria-keyshortcuts]';
const badgeState = (page) =>
  page.evaluate((sel) => {
    const b = document.querySelector(sel);
    const g = b.closest('[role="group"]');
    return {
      pressed: b.getAttribute('aria-pressed'),
      frontInert: g.querySelector('[data-face="front"]').inert,
      backInert: g.querySelector('[data-face="back"]').inert,
      backLinks: g.querySelectorAll('[data-face="back"] a[href]').length,
    };
  }, BADGE_BTN);

test('Ausweiskarte: umdrehen, verdeckte Seite inert', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  await page.locator(BADGE_BTN).scrollIntoViewIfNeeded();
  const s0 = await badgeState(page);
  // Die Seite wechselt mit der Drehung (Feder, unter no-preference bis ~1 s) – darauf warten
  const pressed = (v) => page.waitForFunction(([sel, want]) => document.querySelector(sel).getAttribute('aria-pressed') === want, [BADGE_BTN, v], { timeout: 3000 }).catch(() => {});
  await page.click(BADGE_BTN);
  await pressed('true');
  await page.waitForTimeout(100);
  const s1 = await badgeState(page);
  await page.click(BADGE_BTN);
  await pressed('false');
  await page.waitForTimeout(100);
  const s2 = await badgeState(page);
  await ctx.close();
  assert(s0.pressed === 'false' && !s0.frontInert && s0.backInert, 'Ausgang: Vorderseite', s0);
  assert(s1.pressed === 'true' && s1.frontInert && !s1.backInert && s1.backLinks > 0, 'umgedreht: Rückseite mit Link', s1);
  assert(s2.pressed === 'false' && !s2.frontInert, 'zurück', s2);
  return { s0, s1 };
});

test('Ausweiskarte: Pfeiltasten schwenken, Schleife endet in Ruhe, kein Überlauf @390', ['de'], async (lang) => {
  const { page, ctx, errors } = await open(lang, { width: 390 });
  await page.locator(BADGE_BTN).scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const cardTransform = () => page.evaluate((sel) => getComputedStyle(document.querySelector(sel).closest('[role="group"]').querySelector('[data-face="front"]').parentElement).transform, BADGE_BTN);
  const t0 = await cardTransform();
  await page.focus(BADGE_BTN);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const t1 = await cardTransform();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.waitForTimeout(5000);
  const raf = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const start = window.__ybRaf;
        setTimeout(() => resolve(window.__ybRaf - start), 1000);
      }),
  );
  await ctx.close();
  assert(errors.length === 0, 'keine Fehler', errors);
  assert(t0 !== t1, 'Karte schwenkt', { t0, t1 });
  assert(overflow <= 0, 'kein Seitenüberlauf', { overflow });
  assert(raf === 0, 'keine rAF-Aufrufe in Ruhe', { raf });
  return { raf, overflow };
});

// ---- Periodensystem -----------------------------------------------------------------------------

const tilesInfo = (page) =>
  page.evaluate(() => {
    const tiles = [...document.querySelectorAll('[role="tablist"] [role="tab"]')];
    const sel = tiles.filter((t) => t.getAttribute('aria-selected') === 'true');
    const panel = document.querySelector('[role="tabpanel"]');
    return {
      n: tiles.length,
      tabbable: tiles.filter((t) => t.tabIndex === 0).map((t) => t.id),
      selected: sel.map((t) => t.id),
      panelFor: panel?.getAttribute('aria-labelledby'),
      inert: tiles.filter((t) => t.inert).length,
    };
  });

test('Periodensystem: Tabs-Muster (eine Kachel im Tab-Fluss, Detailfeld gehört zu ihr)', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  const i = await tilesInfo(page);
  await ctx.close();
  assert(i.n > 0 && i.tabbable.length === 1 && i.selected.length === 1, 'genau eine gewählte, fokussierbare Kachel', i);
  assert(i.tabbable[0] === i.selected[0] && i.panelFor === i.selected[0], 'tabpanel gehört zur gewählten Kachel', i);
  return { tiles: i.n, selected: i.selected[0] };
});

test('Periodensystem: ←/→ umlaufend, Pos1/Ende, ↑/↓ nach Lage', ['de'], async (lang) => {
  const { page, ctx } = await open(lang);
  await page.locator('[role="tab"][tabindex="0"]').scrollIntoViewIfNeeded();
  await page.focus('[role="tab"][tabindex="0"]');
  const order = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map((t) => t.dataset.skill));
  const cur = async () => (await activeInfo(page)).skill;
  const seq = {};
  await page.keyboard.press('Home');
  seq.home = await cur();
  await page.keyboard.press('ArrowRight');
  seq.right = await cur();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  seq.wrap = await cur();
  await page.keyboard.press('End');
  seq.end = await cur();
  await page.keyboard.press('Home');
  const r0 = await page.evaluate(() => document.activeElement.getBoundingClientRect().toJSON());
  await page.keyboard.press('ArrowDown');
  const r1 = await page.evaluate(() => document.activeElement.getBoundingClientRect().toJSON());
  const sel = await tilesInfo(page);
  await ctx.close();
  assert(seq.home === order[0] && seq.right === order[1], 'Pos1 und →', { seq, first: order.slice(0, 2) });
  assert(seq.wrap === order[order.length - 1] && seq.end === order[order.length - 1], '← am Anfang springt ans Ende, Ende', { seq, last: order[order.length - 1] });
  assert(r1.top > r0.top + 1 && Math.abs(r1.left - r0.left) < r0.width, '↓ eine Zeile tiefer, gleiche Spalte', { r0: [r0.left, r0.top], r1: [r1.left, r1.top] });
  assert(sel.selected.length === 1 && sel.tabbable[0] === sel.selected[0], 'Auswahl folgt dem Fokus', sel);
  return seq;
});

test('Periodensystem: Filter (aria-pressed, inert, Kacheln bleiben stehen, erneut = aus)', ['de'], async (lang) => {
  const { page, ctx } = await open(lang);
  await page.locator('[role="tablist"]').scrollIntoViewIfNeeded();
  const pills = await page.evaluate(() => [...document.querySelectorAll('.yb-skill-pill')].map((b) => ({ cat: b.dataset.category ?? null, pressed: b.getAttribute('aria-pressed') })));
  const cat = pills.filter((p) => p.cat)[1].cat;
  const before = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map((t) => Math.round(t.getBoundingClientRect().left) + ':' + Math.round(t.getBoundingClientRect().top + scrollY)));
  await page.click(`.yb-skill-pill[data-category="${cat}"]`);
  await page.waitForTimeout(300);
  const st = await page.evaluate((c) => {
    const tiles = [...document.querySelectorAll('[role="tab"]')];
    return {
      pressed: document.querySelector(`.yb-skill-pill[data-category="${c}"]`).getAttribute('aria-pressed'),
      wrongInert: tiles.filter((t) => (t.dataset.category === c) === t.inert).map((t) => t.id),
      selectedCat: tiles.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.category,
      pos: tiles.map((t) => Math.round(t.getBoundingClientRect().left) + ':' + Math.round(t.getBoundingClientRect().top + scrollY)),
    };
  }, cat);
  await page.click(`.yb-skill-pill[data-category="${cat}"]`);
  await page.waitForTimeout(300);
  const off = await tilesInfo(page);
  await ctx.close();
  assert(pills[0].cat === null && pills[0].pressed === 'true', '„Alle“ ist anfangs gedrückt', pills[0]);
  assert(st.pressed === 'true' && st.wrongInert.length === 0, 'genau die anderen Kategorien inert', st.wrongInert);
  assert(st.selectedCat === cat, 'Auswahl wechselt in die Kategorie', st.selectedCat);
  assert(JSON.stringify(st.pos) === JSON.stringify(before), 'Kacheln bleiben an ihrem Platz');
  assert(off.inert === 0, 'erneut drücken hebt den Filter auf', off);
  return { cat };
});

test('Periodensystem: Laden mit #skill-rag – Kachel gewählt, Raster und Detailfeld in Sicht (Fix-Runde 3)', ['de', 'en'], async (lang) => {
  const out = {};
  for (const width of [1440, 390]) {
    const { page, ctx } = await open(lang, { width, hash: '#skill-rag' });
    await page.waitForTimeout(800);
    const st = await page.evaluate(() => {
      const t = document.getElementById('skill-rag');
      const list = t.closest('[role="tablist"]').getBoundingClientRect();
      const panel = document.querySelector('[role="tabpanel"]').getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      return { selected: t.getAttribute('aria-selected'), gridTop: Math.round(list.top), panelTop: Math.round(panel.top), tileTop: Math.round(tr.top), tileBottom: Math.round(tr.bottom), vh: innerHeight };
    });
    const bars = await barsBottom(page);
    await ctx.close();
    out[width] = { ...st, bars };
    assert(st.selected === 'true', `@${width} Kachel gewählt`, st);
    assert(st.tileTop >= bars - 1 && st.tileBottom <= st.vh, `@${width} Kachel sichtbar, nicht unter den Leisten`, out[width]);
    if (width === 1440) {
      assert(st.gridTop >= bars - 1, '@1440 Rasterkopf nicht unter den Leisten', out[width]);
      assert(st.panelTop >= bars - 1 && st.panelTop < st.vh, '@1440 Detailfeld in Sicht', out[width]);
    }
  }
  return out;
});

test('Periodensystem: Sprung aus dem Akkordeon hebt verdeckenden Filter auf, Fokus auf der Kachel (A116)', ['de'], async (lang) => {
  const { page, ctx } = await open(lang);
  const ragCat = await page.evaluate(() => document.getElementById('skill-rag').dataset.category);
  const other = await page.evaluate((c) => [...document.querySelectorAll('.yb-skill-pill[data-category]')].map((b) => b.dataset.category).find((x) => x !== c), ragCat);
  await page.locator('[role="tablist"]').scrollIntoViewIfNeeded();
  await page.click(`.yb-skill-pill[data-category="${other}"]`);
  await page.waitForTimeout(200);
  const inertBefore = await page.evaluate(() => document.getElementById('skill-rag').inert);
  const link = page.locator('.yb-acc-item[data-open="true"] a[data-jump][href="#skill-rag"]').first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await settle(page, 500);
  const st = await page.evaluate(() => {
    const t = document.getElementById('skill-rag');
    return { selected: t.getAttribute('aria-selected'), inert: t.inert, focused: document.activeElement === t, top: Math.round(t.getBoundingClientRect().top), vh: innerHeight };
  });
  const bars = await barsBottom(page);
  await ctx.close();
  assert(inertBefore === true, 'Filter verdeckt die Kachel vorher', { other, ragCat });
  assert(st.selected === 'true' && !st.inert && st.focused, 'Kachel gewählt, nicht inert, fokussiert', st);
  assert(st.top >= bars - 1 && st.top < st.vh, 'Kachel im Bild', { ...st, bars });
  return st;
});

// ---- Projekt-Akkordeon --------------------------------------------------------------------------

/**
 * Kopf eines Akkordeon-Eintrags anklicken wie eine Person: geschlossen nebeneinander ist der
 * Button nur über den Streifen erreichbar (Trefferfläche per ::after) – Playwrights Klick auf die
 * Button-Mitte träfe dort den beschnittenen Inhalt. Gesucht wird ein Punkt (Streifen- bzw.
 * Button-Mitte), an dem elementFromPoint den Button liefert.
 */
async function clickHead(page, itemId) {
  await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'center', behavior: 'instant' }), itemId);
  await page.waitForTimeout(100);
  const pt = await page.evaluate((id) => {
    const li = document.getElementById(id);
    const b = li.querySelector('[data-acc-trigger]');
    const cands = [li.querySelector('.yb-acc-strip'), b].filter(Boolean).map((el) => el.getBoundingClientRect());
    for (const r of cands) {
      if (r.width < 1 || r.height < 1) {
        continue;
      }
      const x = r.left + r.width / 2;
      const y = Math.min(Math.max(r.top + Math.min(r.height / 2, 40), 1), innerHeight - 1);
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === b || b.contains(hit))) {
        return { x, y };
      }
    }
    return null;
  }, itemId);
  if (!pt) {
    throw new Fail(`Kopf von #${itemId} nicht anklickbar (kein Punkt trifft den Button)`);
  }
  await page.mouse.click(pt.x, pt.y);
}

const accState = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.yb-acc-item')].map((li) => {
      const b = li.querySelector('[data-acc-trigger]');
      const r = li.getBoundingClientRect();
      return {
        id: li.id,
        open: li.dataset.open,
        expanded: b.getAttribute('aria-expanded'),
        disabled: b.getAttribute('aria-disabled'),
        panelInert: li.querySelector('.yb-acc-panel').inert,
        name: b.textContent.trim().slice(0, 40),
        top: Math.round(r.top + scrollY),
        bottom: Math.round(r.bottom + scrollY),
        left: Math.round(r.left),
        rowH: Math.round(li.parentElement.getBoundingClientRect().height),
      };
    }),
  );

test('Akkordeon: genau einer offen, Wechsel per Klick, Fokus bleibt, Namen mit Nummer', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  const s0 = await accState(page);
  const second = `#${s0[1].id} [data-acc-trigger]`;
  await clickHead(page, s0[1].id);
  await page.waitForTimeout(700);
  const s1 = await accState(page);
  const focus = await page.evaluate((sel) => document.activeElement === document.querySelector(sel), second);
  await ctx.close();
  assert(s0.length === 2, 'zwei Projekte', s0.length);
  assert(s0[0].open === 'true' && s0[0].expanded === 'true' && s0[0].disabled === 'true' && !s0[0].panelInert, 'erstes offen (aria-disabled)', s0[0]);
  assert(s0[1].open === 'false' && s0[1].expanded === 'false' && s0[1].panelInert, 'zweites zu, Inhalt inert', s0[1]);
  assert(s1[1].open === 'true' && s1[0].open === 'false' && s1[0].panelInert, 'Wechsel exklusiv', s1);
  assert(focus, 'Fokus bleibt auf dem Kopf');
  assert(s0.every((s) => /^\d{2} /.test(s.name)), 'Name beginnt mit Nummer (WCAG 2.5.3)', s0.map((s) => s.name));
  return s1.map((s) => s.name);
});

test('Akkordeon: Pfeiltasten zwischen den Köpfen', ['de'], async (lang) => {
  const { page, ctx } = await open(lang);
  const first = '.yb-acc-item:first-child [data-acc-trigger]';
  await page.locator(first).scrollIntoViewIfNeeded();
  await page.focus(first);
  await page.keyboard.press('ArrowRight');
  const a = await page.evaluate(() => document.activeElement.closest('.yb-acc-item')?.id);
  await page.keyboard.press('Home');
  const b = await page.evaluate(() => document.activeElement.closest('.yb-acc-item')?.id);
  const ids = (await accState(page)).map((s) => s.id);
  await ctx.close();
  assert(a === ids[1] && b === ids[0], '→ und Pos1', { a, b, ids });
  return { a, b };
});

test('Akkordeon @1440: nebeneinander, Reihenhöhe fest beim Wechsel', ['de'], async (lang) => {
  const { page, ctx } = await open(lang, { width: 1440 });
  const s0 = await accState(page);
  await clickHead(page, s0[1].id);
  await page.waitForTimeout(900);
  const s1 = await accState(page);
  await ctx.close();
  assert(Math.abs(s0[0].top - s0[1].top) <= 1 && s0[1].left > s0[0].left, 'nebeneinander', s0);
  assert(Math.abs(s0[0].rowH - s1[0].rowH) <= 1, 'Reihenhöhe unverändert', { before: s0[0].rowH, after: s1[0].rowH });
  return { rowH: s1[0].rowH };
});

for (const width of [768, 390]) {
  test(`Akkordeon @${width}: gestapelt, gewählter Kopf bleibt stehen (holdPosition, A111)`, ['de', 'en'], async (lang) => {
    const { page, ctx } = await open(lang, { width });
    const s0 = await accState(page);
    const sel = `#${s0[1].id} [data-acc-trigger]`;
    await placeAt(page, sel, 300);
    await page.waitForTimeout(150);
    const before = await rectOf(page, sel);
    await page.click(sel);
    await page.waitForTimeout(1000);
    const after = await rectOf(page, sel);
    const s1 = await accState(page);
    const bars = await barsBottom(page);
    await ctx.close();
    assert(s0[1].top >= s0[0].bottom - 1, 'untereinander', { first: s0[0], second: s0[1] });
    assert(s1[1].open === 'true', 'zweites offen', s1[1]);
    const delta = after.top - before.top;
    assert(Math.abs(delta) <= 2, 'Kopf bleibt an seiner Stelle (±2 px)', { before: before.top, after: after.top, delta });
    assert(after.top >= bars - 1, 'Kopf nicht unter den Leisten', { top: after.top, bars });
    return { delta };
  });
}

test('Akkordeon @768: „Zum Projekt“ aus dem Werdegang landet im Bild (A111)', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang, { width: 768 });
  const link = page.locator('details[open] a[data-jump][href^="#project-"]').first();
  const href = await link.getAttribute('href');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await settle(page, 600);
  const st = await page.evaluate((id) => {
    const li = document.querySelector(id);
    const b = li.querySelector('[data-acc-trigger]');
    const r = b.getBoundingClientRect();
    return { open: li.dataset.open, focused: document.activeElement === b, top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight };
  }, href);
  const bars = await barsBottom(page);
  await ctx.close();
  assert(st.open === 'true' && st.focused, 'Projekt offen, Kopf fokussiert', st);
  assert(st.top >= bars - 1 && st.bottom <= st.vh, 'Kopf im Bild, nicht unter den Leisten', { ...st, bars });
  return { ...st, bars };
});

test('Akkordeon @768: holdPosition am Seitenanfang hält ein späteres Scrollen nicht zurück', ['de'], async (lang) => {
  // Öffnen bei scrollY 0: Der Ausgleich nach oben ist nicht ausführbar. Vorher versuchte es jeder
  // Frame erneut und holte ein Scrollen in der Haltezeit wieder zurück (576–1055px).
  const { page, ctx } = await open(lang, { width: 768 });
  const st = await page.evaluate(async () => {
    const btn = document.querySelector('#project-bachelorarbeit [data-acc-trigger]');
    btn.click();
    await new Promise((r) => setTimeout(r, 300));
    window.scrollTo({ top: btn.getBoundingClientRect().top + scrollY - 200, behavior: 'instant' });
    const placed = Math.round(btn.getBoundingClientRect().top);
    await new Promise((r) => setTimeout(r, 1300));
    return { placed, after: Math.round(btn.getBoundingClientRect().top) };
  });
  await ctx.close();
  assert(Math.abs(st.after - st.placed) <= 2, 'Kopf bleibt, wohin gescrollt wurde (±2 px)', st);
  return st;
});

for (const [hash, width] of [
  ['#project-bachelorarbeit', 768],
  ['#career-bechtle-junior', 1440],
  ['#career-bechtle-junior', 390],
]) {
  test(`Laden mit ${hash} @${width}: Ziel offen, nicht unter den Leisten, im Bild (A111/A112)`, ['de'], async (lang) => {
    const { page, ctx } = await open(lang, { width, hash });
    await page.waitForTimeout(400);
    const st = await page.evaluate((h) => {
      const el = document.querySelector(h);
      const f = el.querySelector('[data-acc-trigger]') ?? el.querySelector('summary');
      const r = f.getBoundingClientRect();
      return { open: el.dataset.open ?? String(el.open), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight };
    }, hash);
    const bars = await barsBottom(page);
    await ctx.close();
    assert(st.open === 'true', 'Ziel offen', st);
    assert(st.top >= bars - 1 && st.bottom <= st.vh, 'im Bild, nicht unter den Leisten', { ...st, bars });
    return { ...st, bars };
  });
}

// ---- Band der Abschnittsnavigation --------------------------------------------------------------

for (const width of [1440, 390]) {
  test(`Band @${width}: Klick aufs leere Papier wählt keine verdeckte Kachel (A113)`, ['de'], async (lang) => {
    const { page, ctx } = await open(lang, { width });
    await page.evaluate(() => {
      const t = document.querySelector('[role="tablist"]');
      window.scrollTo({ top: t.getBoundingClientRect().top + scrollY + 40, behavior: 'instant' });
    });
    await page.waitForTimeout(300);
    const pts = await page.evaluate(() => {
      const n = document.querySelector('.yb-section-nav').getBoundingClientRect();
      const l = document.querySelector('.yb-section-nav ul').getBoundingClientRect();
      const midY = Math.round((n.top + n.bottom) / 2);
      const out = [[Math.round((l.left + l.right) / 2), Math.round(n.top) + 3], [Math.round((l.left + l.right) / 2), Math.round(n.bottom) - 3], [4, midY], [innerWidth - 4, midY]];
      if (l.left - n.left >= 10) out.push([Math.round((n.left + l.left) / 2), midY]);
      return out;
    });
    const hits = [];
    for (const [x, y] of pts) {
      const before = await page.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.skill ?? null);
      const inNav = await page.evaluate(([px, py]) => !!document.elementFromPoint(px, py)?.closest('.yb-section-nav'), [x, y]);
      await page.mouse.click(x, y);
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.skill ?? null);
      hits.push({ x, y, inNav, changed: before !== after });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await ctx.close();
    assert(hits.every((h) => h.inNav), 'Band nimmt den Klick an (auch im Seitenrand)', hits);
    assert(hits.every((h) => !h.changed), 'keine Kachel gewählt', hits);
    assert(overflow === 0, 'kein Seitenüberlauf durch das Band', overflow);
    return hits.length;
  });
}

// ---- Werdegang ----------------------------------------------------------------------------------

const careerState = (page) =>
  page.evaluate(() => [...document.querySelectorAll('details.yb-career-entry')].map((d) => ({ id: d.id, open: d.open, name: d.getAttribute('name') })));

test('Werdegang: exklusive <details>, Tastatur (Enter)', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang);
  const s0 = await careerState(page);
  const target = s0.find((d) => !d.open);
  await page.locator(`#${target.id} > summary`).scrollIntoViewIfNeeded();
  await page.focus(`#${target.id} > summary`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const s1 = await careerState(page);
  await ctx.close();
  assert(s0.length >= 2 && s0.every((d) => d.name && d.name === s0[0].name), 'gemeinsamer name', s0);
  assert(s0.filter((d) => d.open).length === 1, 'eine Station offen', s0);
  assert(s1.filter((d) => d.open).map((d) => d.id).join() === target.id, 'Enter öffnet, die andere schließt', s1);
  return s1.filter((d) => d.open).map((d) => d.id);
});

for (const width of [1440, 390]) {
  test(`Werdegang @${width}: Station unter der offenen bleibt beim Öffnen stehen (A112)`, ['de'], async (lang) => {
    const { page, ctx } = await open(lang, { width });
    const s0 = await careerState(page);
    const openIdx = s0.findIndex((d) => d.open);
    const target = s0.slice(openIdx + 1).find((d) => !d.open);
    const sel = `#${target.id} > summary`;
    await placeAt(page, sel, 400);
    await page.waitForTimeout(150);
    const before = await rectOf(page, sel);
    await page.click(sel);
    await page.waitForTimeout(900);
    const after = await rectOf(page, sel);
    const bars = await barsBottom(page);
    await ctx.close();
    const delta = after.top - before.top;
    assert(Math.abs(delta) <= 2, 'Zeile bleibt an ihrer Stelle (±2 px)', { before: before.top, after: after.top, delta });
    assert(after.top >= bars - 1, 'nicht unter den Leisten', { top: after.top, bars });
    return { delta };
  });
}

// ---- Reduced Motion -----------------------------------------------------------------------------

test('Reduce: 0 laufende Animationen nach Laden, Filter, Akkordeon, Werdegang, Karte', ['de', 'en'], async (lang) => {
  const { page, ctx } = await open(lang, { reduce: true });
  const running = () => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName ?? a.transitionProperty ?? a.constructor.name));
  const res = {};
  res.load = await running();
  await page.locator('.yb-skill-pill[data-category]').first().scrollIntoViewIfNeeded();
  await page.click('.yb-skill-pill[data-category]');
  await page.waitForTimeout(50);
  res.filter = await running();
  const s0 = await accState(page);
  await clickHead(page, s0[1].id);
  await page.waitForTimeout(50);
  res.accordion = await running();
  const c0 = await careerState(page);
  const target = c0.find((d) => !d.open);
  await page.locator(`#${target.id} > summary`).scrollIntoViewIfNeeded();
  await page.click(`#${target.id} > summary`);
  await page.waitForTimeout(50);
  res.career = await running();
  await page.locator(BADGE_BTN).scrollIntoViewIfNeeded();
  await page.click(BADGE_BTN);
  await page.waitForTimeout(50);
  res.badge = await running();
  await ctx.close();
  const total = Object.values(res).reduce((n, a) => n + a.length, 0);
  assert(total === 0, 'keine laufenden Animationen', res);
  return res;
});

// ---------------------------------------------------------------------------------------------

const results = [];
const re = ONLY ? new RegExp(ONLY) : null;
for (const t of tests) {
  for (const lang of t.langs.filter((l) => LANGS.includes(l))) {
    const name = `[${lang}] ${t.name}`;
    if (re && !re.test(name)) {
      continue;
    }
    const t0 = Date.now();
    try {
      const detail = await t.fn(lang);
      results.push({ name, ok: true, ms: Date.now() - t0, detail });
      console.log(`OK    ${name}`);
    } catch (e) {
      results.push({ name, ok: false, ms: Date.now() - t0, error: e instanceof Fail ? e.message : String(e).slice(0, 400) });
      console.log(`FAIL  ${name}\n      ${e instanceof Fail ? e.message : String(e).slice(0, 400)}`);
    }
  }
}
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} OK gegen ${BASE}`);
if (OUT) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'home-test.json'), JSON.stringify({ base: BASE, at: new Date().toISOString(), ok: results.length - failed.length, total: results.length, results }, null, 2));
}
process.exit(failed.length ? 1 : 0);
