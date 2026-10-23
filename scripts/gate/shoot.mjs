#!/usr/bin/env node
/**
 * Screenshot-Gate (AGENTS.md „Screenshot-Gate vor Commit“, Anleitung: docs/gate.md).
 *
 *   node scripts/gate/shoot.mjs <baseUrl> <outDir> [Optionen]
 *
 * Läuft jede Seite × Breite × Farbschema einmal in Chromium (Playwright, channel „chrome“) und misst:
 * - Status (erwartet 200 bzw. 404 für die 404-Proben)
 * - horizontaler Überlauf (scrollWidth > clientWidth, mit den auslösenden Elementen)
 * - CLS beim Laden mit Quelle (PerformanceObserver ab Navigationsbeginn, vor jeder Eingabe)
 * - Konsolenfehler und Seitenfehler (die 404-Ressourcenmeldung einer 404-Seite für ihre eigene
 *   URL wird ignoriert), fehlgeschlagene Abrufe derselben Herkunft
 * - Überschriften: genau eine H1, erste Überschrift H1, keine Sprünge (ohne inerte/versteckte)
 * - Kantenspreizung Marke/H1/Footer (linke Kante des sichtbaren Inhalts, Soll 0 px)
 * - Grid-Belegung (Astryx-Grid mit leeren Spuren, obwohl ≥ 3 Einträge da sind; Spuren ohne max)
 * - Lücken-Zähler [data-yb-gap] und Rechtstext-Lücken [data-yb-legal-open]
 * - Fokus-Stichprobe per Tab: Fokus sichtbar (Stil-Unterschied fokussiert/unfokussiert an
 *   Element, Vorfahren oder ::before/::after), Fokus verdeckt (Mittelpunkt unter Header/Leiste),
 *   kleine Ziele (< 24 × 24 px, ohne Links im Fließtext)
 * - Screenshots: erster Bildschirm (PNG) und ganze Seite (JPEG), Einstiegs-/Reveal-Animationen
 *   und Übergänge sind dafür neutralisiert (erst nach der CLS-Messung)
 * Dazu einmal je Basis-URL die Agenten-Prüfungen per HTTP (lang, JSON-LD, og:*, llms.txt,
 * Markdown-Weiche, 308 des Ghost-Testprojekts, Sitemap/llms.txt ohne Testprojekt, noindex) und
 * im Browser (404-Proben ohne JavaScript, keine wirkungslosen Tab-Stopps ohne JavaScript auf allen
 * Seiten, Titel der Bachelorarbeit im Barrierefreiheitsbaum).
 *
 * Seitenliste: PUBLIC_ROUTES + NOINDEX_ROUTES aus src/lib/routes.ts (DE und /en), Detailseiten
 * aus den Links von /projekte, /en/projekte, /blog, /en/blog (ohne „demo-“-Slugs, sonst hätte der
 * Vorschau-Build eine andere Liste), 404-Proben (global DE/EN, Projekt- und Blog-Slug DE/EN).
 *
 * Optionen:
 *   --quick              nur 390 und 1440 px
 *   --widths=390,1440    eigene Breiten
 *   --schemes=light      nur hell (Standard: light,dark)
 *   --pages=/,/cv        feste Seitenliste (ersetzt die Erkennung); --add=/x,/y ergänzt sie
 *   --only=<regex>       nur Pfade, die passen
 *   --sitemap            zusätzlich alle Pfade aus <baseUrl>/sitemap.xml
 *   --with-demo          Demo-Artikel/-Projekte nicht ausfiltern
 *   --concurrency=3      parallele Läufe
 *   --tabs=60            Tab-Schritte je Lauf (0 = keine Fokus-Stichprobe)
 *   --reduce             prefers-reduced-motion: reduce
 *   --no-full            keine Ganzseiten-Screenshots; --no-shots: gar keine
 *   --no-agent           keine Agenten-Prüfungen
 *   --no-fail            Exit-Code immer 0 (z. B. Vorher-Aufnahmen der Live-Seite)
 *   --allow-analytics    Analytics-Skripte (Cloudflare u. a.) nicht abfangen – sonst bekommen sie
 *                        eine leere Antwort, damit Gate-Läufe nie als Besuch zählen
 *   --label=prod         Bezeichnung im Bericht
 *   --repo=<dir>         Repo für src/lib/routes.ts (Standard: dieses Repo)
 *
 * Ergebnis: <outDir>/metrics.json (alle Läufe + Agenten-Prüfungen), <outDir>/summary.md,
 * <outDir>/shots/*.png, <outDir>/full/*.jpg. Exit-Code 1, wenn eine Abnahme-Metrik anschlägt.
 *
 * Playwright ist keine Projekt-Abhängigkeit: Modul per PLAYWRIGHT_MODULE (z. B.
 * /pfad/node_modules/playwright/index.mjs) oder global installiertes „playwright“ – wie
 * scripts/vt-probe.mjs. Nur lesende Abrufe, es wird nichts abgeschickt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = (positional[0] ?? '').replace(/\/$/, '');
const OUT = positional[1];
if (!BASE || !OUT) {
  console.error('Nutzung: node scripts/gate/shoot.mjs <baseUrl> <outDir> [--quick] [--widths=…] [--pages=…] [--no-fail] …');
  process.exit(2);
}
const REPO = path.resolve(opt('repo', path.join(here, '..', '..')));
const QUICK = flag('quick');
const WIDTHS = opt('widths', QUICK ? '390,1440' : '390,768,1024,1440,1920')
  .split(',')
  .map(Number)
  .filter(Boolean);
const SCHEMES = opt('schemes', 'light,dark').split(',');
const CONCURRENCY = Math.max(1, Number(opt('concurrency', 3)));
const TABS = Math.max(0, Number(opt('tabs', 60)));
const REDUCE = flag('reduce');
const SHOTS = !flag('no-shots');
const FULL = SHOTS && !flag('no-full');
const LABEL = opt('label', path.basename(path.resolve(OUT)));
const ONLY = opt('only', null);
const BLOCK = flag('allow-analytics') ? null : /^https?:\/\/([a-z0-9-]+\.)*(cloudflareinsights\.com|google-analytics\.com|googletagmanager\.com|plausible\.io)\//;
const HEIGHT = (w) => (w <= 400 ? 844 : w <= 800 ? 1024 : w <= 1100 ? 768 : w <= 1500 ? 900 : 1080);

const NEUTRALIZE = `*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}`;

fs.mkdirSync(OUT, { recursive: true });
if (SHOTS) {
  fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
}
if (FULL) {
  fs.mkdirSync(path.join(OUT, 'full'), { recursive: true });
}

// ---------------------------------------------------------------------------------------------
// Seitenliste

function routesFromRepo() {
  const file = path.join(REPO, 'src', 'lib', 'routes.ts');
  const src = fs.readFileSync(file, 'utf8');
  const arr = (name) => {
    const m = new RegExp(`export const ${name}[^=]*=\\s*(?:new Set<string>\\()?\\[([^\\]]*)\\]`).exec(src);
    return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
  };
  return { pub: arr('PUBLIC_ROUTES'), noindex: arr('NOINDEX_ROUTES'), unlisted: arr('UNLISTED_ROUTES') };
}

const en = (p) => (p === '/' ? '/en' : `/en${p}`);

async function fetchText(url, init = {}) {
  const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...init });
  return { status: r.status, headers: r.headers, text: await r.text() };
}

async function discoverDetails(withDemo) {
  const found = new Set();
  for (const [list, re] of [
    ['/projekte', /href="(\/projekte\/[a-z0-9-]+)"/g],
    ['/en/projekte', /href="(\/en\/projekte\/[a-z0-9-]+)"/g],
    ['/blog', /href="(\/blog\/[a-z0-9-]+)"/g],
    ['/en/blog', /href="(\/en\/blog\/[a-z0-9-]+)"/g],
  ]) {
    try {
      const { status, text } = await fetchText(`${BASE}${list}`);
      if (status !== 200) {
        continue;
      }
      for (const m of text.matchAll(re)) {
        const slug = m[1].split('/').pop();
        if (!withDemo && slug.startsWith('demo-')) {
          continue;
        }
        found.add(m[1]);
      }
    } catch {
      // Liste nicht erreichbar → keine Detailseiten daraus
    }
  }
  return [...found].sort();
}

async function sitemapPaths() {
  try {
    const { status, text } = await fetchText(`${BASE}/sitemap.xml`);
    if (status !== 200) {
      return [];
    }
    return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/');
  } catch {
    return [];
  }
}

// 404-Proben: global (Pfad ohne Route), Projekt-Slug (dynamicParams = false) und Blog-Slug
// (src/proxy.ts → globale 404, docs/blog-404.md) – alle liefern die globale 404 (Sprache aus dem
// Proxy-Header, je Abruf gerendert).
const NOT_FOUND = [
  '/gibt-es-nicht-404',
  '/en/gibt-es-nicht-404',
  '/projekte/unbekannt-404',
  '/blog/unbekannt-404',
  '/en/blog/unbekannt-404',
];

async function pageList(routes) {
  let pages;
  if (opt('pages', null)) {
    pages = opt('pages').split(',').filter(Boolean);
  } else {
    const stat = [...routes.pub, ...routes.noindex];
    pages = [...stat, ...stat.map(en), ...(await discoverDetails(flag('with-demo'))), ...NOT_FOUND];
    if (flag('sitemap')) {
      pages.push(...(await sitemapPaths()));
    }
  }
  if (opt('add', null)) {
    pages.push(...opt('add').split(',').filter(Boolean));
  }
  pages = [...new Set(pages)];
  if (ONLY) {
    const re = new RegExp(ONLY);
    pages = pages.filter((p) => re.test(p));
  }
  return pages;
}

const expectedStatus = (p) => (NOT_FOUND.includes(p) || /-404$/.test(p) ? 404 : 200);
const slugOf = (p) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '_'));

// ---------------------------------------------------------------------------------------------
// Im Browser

/** Vor jedem Dokument: CLS-Beobachter (gepuffert, ab Navigationsbeginn). */
function initScript() {
  const describe = (n) => {
    if (!n || n.nodeType !== 1) {
      return n ? `#${n.nodeName}` : null;
    }
    const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    const text = (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${cls.map((c) => `.${c}`).join('')}${text ? ` „${text}“` : ''}`;
  };
  const rect = (r) => (r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null);
  window.__ybGate = { cls: 0, shifts: [] };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) {
          continue;
        }
        window.__ybGate.cls += e.value;
        window.__ybGate.shifts.push({
          value: Number(e.value.toFixed(5)),
          t: Math.round(e.startTime),
          sources: (e.sources || []).map((s) => ({ node: describe(s.node), prev: rect(s.previousRect), cur: rect(s.currentRect) })),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    window.__ybGate.unsupported = true;
  }
}

/** Messungen nach dem Laden (Animationen sind dann neutralisiert). */
function measure() {
  const doc = document.documentElement;
  const describe = (n) => {
    const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    const text = (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${cls.map((c) => `.${c}`).join('')}${text ? ` „${text}“` : ''}`;
  };
  const visibleEl = (el) => el.checkVisibility ? el.checkVisibility({ visibilityProperty: true }) : el.getClientRects().length > 0;
  const tiny = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) {
      return true;
    }
    const cs = getComputedStyle(el);
    return cs.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%/.test(cs.clipPath);
  };
  const hiddenish = (el, root) => {
    for (let e = el; e && e !== root.parentElement; e = e.parentElement) {
      // aria-hidden zählt hier nicht: dekorative Marken (z. B. das YB-Zeichen) bilden die Kante
      if (tiny(e) || getComputedStyle(e).visibility === 'hidden') {
        return true;
      }
    }
    return false;
  };
  const paints = (el) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const transparent = bg === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(bg);
    return !transparent || cs.backgroundImage !== 'none' || el.tagName === 'IMG' || el.tagName.toLowerCase() === 'svg';
  };
  const contentLeft = (root) => {
    if (!root) {
      return null;
    }
    let min = Infinity;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === 3) {
        if (!n.textContent.trim() || hiddenish(n.parentElement, root)) {
          continue;
        }
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) {
          if (r.width > 1 && r.height > 1) {
            min = Math.min(min, r.left);
          }
        }
      } else if (paints(n) && !hiddenish(n, root)) {
        const r = n.getBoundingClientRect();
        if (r.width > 1 && r.height > 1) {
          min = Math.min(min, r.left);
        }
      }
    }
    return Number.isFinite(min) ? Math.round(min * 10) / 10 : null;
  };

  // Überlauf
  const overflow = Math.max(doc.scrollWidth, document.body.scrollWidth) - doc.clientWidth;
  const offenders = [];
  if (overflow > 0) {
    const clipped = (el) => {
      for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
        const ox = getComputedStyle(e).overflowX;
        if (ox !== 'visible') {
          return true;
        }
      }
      return false;
    };
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right > doc.clientWidth + 1 && r.width > 0 && !clipped(el)) {
        offenders.push({ el: describe(el), right: Math.round(r.right) });
        if (offenders.length >= 6) {
          break;
        }
      }
    }
  }

  // Überschriften
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => !h.closest('[hidden],[aria-hidden="true"],[inert],template,noscript') && visibleEl(h))
    .map((h) => ({ level: Number(h.tagName[1]), text: (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60) }));
  const headingIssues = [];
  const h1 = headings.filter((h) => h.level === 1).length;
  if (h1 !== 1) {
    headingIssues.push(`${h1}× H1`);
  }
  if (headings.length && headings[0].level !== 1) {
    headingIssues.push(`erste Überschrift H${headings[0].level} „${headings[0].text}“`);
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      headingIssues.push(`Sprung H${headings[i - 1].level}→H${headings[i].level} „${headings[i].text}“`);
    }
  }

  // Kanten: Marke (erster Link im Header), H1, Footer
  // Seitenrahmen: Header/Footer außerhalb von <main> (nicht die eines Artikels)
  const header = [...document.querySelectorAll('header')].find((h) => !h.closest('main')) ?? null;
  const brand = header ? [...header.querySelectorAll('a[href]')].find((a) => visibleEl(a) && !hiddenish(a, a)) : null;
  const h1El = [...document.querySelectorAll('h1')].find((h) => visibleEl(h) && !h.closest('[inert],[aria-hidden="true"]'));
  const footer = [...document.querySelectorAll('footer')].find((f) => !f.closest('main')) ?? null;
  const edges = { brand: contentLeft(brand), h1: contentLeft(h1El), footer: contentLeft(footer) };
  const present = Object.values(edges).filter((v) => v !== null);
  const edgeSpread = present.length >= 2 ? Math.round((Math.max(...present) - Math.min(...present)) * 10) / 10 : null;

  // Grids (Astryx)
  const grids = [];
  for (const g of document.querySelectorAll('.astryx-grid')) {
    if (!visibleEl(g) || g.closest('[inert]')) {
      continue;
    }
    const tracks = getComputedStyle(g).gridTemplateColumns.split(' ').filter((t) => /px$/.test(t)).length;
    const items = [...g.children].filter((c) => getComputedStyle(c).display !== 'none').length;
    const style = g.getAttribute('style') || '';
    const noMax = /auto-fill|auto-fit/.test(style) && !/calc\(\(100% -/.test(style);
    const underfilled = items >= 3 && tracks > items;
    if (underfilled || noMax) {
      grids.push({ el: describe(g), tracks, items, underfilled, noMax });
    }
  }

  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null;
  return {
    title: document.title,
    lang: doc.getAttribute('lang'),
    robots,
    h1Text: h1El ? (h1El.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) : null,
    overflow,
    offenders,
    headings: headings.length,
    headingIssues,
    edges,
    edgeSpread,
    grids,
    gaps: document.querySelectorAll('[data-yb-gap]').length,
    legalOpen: document.querySelectorAll('[data-yb-legal-open]').length,
    docHeight: doc.scrollHeight,
  };
}

/** Fokus-Stichprobe für das aktuell fokussierte Element. */
function focusProbe() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) {
    return { none: true };
  }
  const describe = (n) => {
    const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    const text = (n.getAttribute('aria-label') || n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${cls.map((c) => `.${c}`).join('')}${text ? ` „${text}“` : ''}`;
  };
  const chain = [el];
  for (let i = 0, p = el.parentElement; i < 3 && p; i++, p = p.parentElement) {
    chain.push(p);
  }
  const props = ['outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset', 'boxShadow', 'borderTopColor', 'borderBottomColor', 'borderBottomWidth', 'backgroundColor', 'textDecorationLine', 'color', 'opacity', 'transform'];
  const snap = () =>
    chain.flatMap((e) => [null, '::before', '::after'].map((ps) => {
      const cs = getComputedStyle(e, ps);
      return props.map((p) => cs[p]).join('|');
    }));
  const focused = snap();
  const r = el.getBoundingClientRect();
  // verdeckt? Mittelpunkt unter einem anderen Element (klebender Header/Leiste)
  let obscuredBy = null;
  const cx = r.left + r.width / 2;
  const cy = r.top + Math.min(r.height / 2, 12);
  if (r.width > 0 && r.height > 0 && cy >= 0 && cy < innerHeight && cx >= 0 && cx < innerWidth) {
    const hit = document.elementFromPoint(cx, cy);
    if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
      for (let e = hit; e; e = e.parentElement) {
        const pos = getComputedStyle(e).position;
        if (pos === 'sticky' || pos === 'fixed') {
          obscuredBy = describe(e);
          break;
        }
      }
    }
  }
  el.blur();
  const blurred = snap();
  el.focus({ preventScroll: true });
  const visible = focused.some((s, i) => s !== blurred[i]);
  const inlineText = el.tagName === 'A' && getComputedStyle(el).display === 'inline' &&
    [...(el.parentElement?.childNodes ?? [])].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim());
  return {
    el: describe(el),
    key: `${el.tagName}|${el.id}|${el.getAttribute('href') ?? ''}|${Math.round(r.left)}|${Math.round(r.top + scrollY)}`,
    w: Math.round(r.width),
    h: Math.round(r.height),
    visible,
    obscuredBy,
    small: !inlineText && (r.width < 24 || r.height < 24),
  };
}

// ---------------------------------------------------------------------------------------------
// Ein Lauf

async function run(browser, p, width, scheme) {
  const ctx = await browser.newContext({
    viewport: { width, height: HEIGHT(width) },
    colorScheme: scheme,
    reducedMotion: REDUCE ? 'reduce' : 'no-preference',
    deviceScaleFactor: 1,
  });
  if (BLOCK) {
    // Das Gate ist kein Besuch: Analytics-Skripte bekommen eine leere Antwort (kein Beacon)
    await ctx.route(BLOCK, (route) => route.fulfill({ status: 204, body: '' }));
  }
  const page = await ctx.newPage();
  await page.addInitScript(initScript);
  const url = `${BASE}${p}`;
  const origin = new URL(BASE).origin;
  const consoleRaw = [];
  const consoleErrors = [];
  const badRequests = [];
  let status = null;
  page.on('console', (m) => {
    if (m.type() === 'error') {
      consoleRaw.push({ text: m.text(), loc: m.location()?.url ?? '' });
    }
  });
  page.on('pageerror', (e) => consoleRaw.push({ text: `pageerror: ${String(e).slice(0, 200)}`, loc: '' }));
  page.on('requestfailed', (req) => {
    const f = req.failure()?.errorText ?? '';
    if (req.url().startsWith(origin) && !/ERR_ABORTED/.test(f)) {
      badRequests.push(`${f} ${req.url().replace(origin, '')}`);
    }
  });
  page.on('response', (res) => {
    if (res.url().startsWith(origin) && res.status() >= 400 && res.request().resourceType() !== 'document') {
      badRequests.push(`${res.status()} ${res.url().replace(origin, '')}`);
    }
  });

  const result = { path: p, width, scheme, expected: expectedStatus(p) };
  const t0 = Date.now();
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    status = resp?.status() ?? null;
    result.status = status;
    result.finalPath = new URL(page.url()).pathname;
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(400);
    result.loadMs = Date.now() - t0;
    const cls = await page.evaluate(() => window.__ybGate);
    result.cls = Number((cls?.cls ?? 0).toFixed(5));
    result.shifts = cls?.shifts ?? [];

    await page.addStyleTag({ content: NEUTRALIZE });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    Object.assign(result, await page.evaluate(measure));

    if (SHOTS) {
      const name = `${slugOf(p)}__${width}__${scheme}`;
      await page.screenshot({ path: path.join(OUT, 'shots', `${name}.png`) });
      if (FULL) {
        await page.screenshot({ path: path.join(OUT, 'full', `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 70 }).catch((e) => {
          result.fullShotError = String(e).slice(0, 120);
        });
      }
    }

    if (TABS > 0) {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.activeElement?.blur?.();
      });
      const seen = new Set();
      const stops = [];
      for (let i = 0; i < TABS; i++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(focusProbe);
        if (f.none || seen.has(f.key)) {
          break;
        }
        seen.add(f.key);
        stops.push(f);
      }
      result.focus = {
        stops: stops.length,
        invisible: stops.filter((s) => !s.visible).map((s) => s.el),
        obscured: stops.filter((s) => s.obscuredBy).map((s) => `${s.el} unter ${s.obscuredBy}`),
        small: stops.filter((s) => s.small).map((s) => `${s.el} ${s.w}×${s.h}`),
      };
    }
  } catch (e) {
    result.error = String(e).slice(0, 300);
  }
  // Die 404-Seite meldet ihre eigene URL als fehlgeschlagene Ressource – erwartet, kein Befund.
  // Erst hier filtern: Die Meldung kommt, bevor goto() den Status liefert.
  for (const { text, loc } of consoleRaw) {
    const own404 = status === 404 && /status of 404/.test(text) && loc.split('?')[0].replace(/\/$/, '') === url.replace(/\/$/, '');
    if (!own404) {
      consoleErrors.push(`${text.slice(0, 200)}${loc ? ` (${loc.replace(origin, '')})` : ''}`);
    }
  }
  result.consoleErrors = consoleErrors;
  result.badRequests = [...new Set(badRequests)];
  await ctx.close();
  return result;
}

// ---------------------------------------------------------------------------------------------
// Agenten-Prüfungen (HTTP, ohne Browser)

async function agentChecks(pages, routes) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail });
  const htmlOf = new Map();
  for (const p of pages) {
    try {
      htmlOf.set(p, await fetchText(`${BASE}${p}`));
    } catch (e) {
      htmlOf.set(p, { status: 0, text: '', error: String(e) });
    }
  }
  const isEn = (p) => p === '/en' || p.startsWith('/en/');

  // lang im Server-HTML, auch der 404-Proben (Rest-Feinschliff: die globale 404 bekommt die
  // Sprache vom Proxy-Header; vorher war sie EIN statisches HTML mit lang="de", und nur der
  // Browser-Lauf prüfte lang unter /en – Befund „langDom“)
  const wrongLang = [];
  for (const [p, r] of htmlOf) {
    if (r.status !== 200 && r.status !== 404) {
      continue;
    }
    const lang = /<html[^>]*\slang="([^"]+)"/.exec(r.text)?.[1] ?? null;
    if (lang !== (isEn(p) ? 'en' : 'de')) {
      wrongLang.push(`${p}: ${lang}`);
    }
  }
  add('lang je Sprache im Server-HTML (200-Seiten und 404-Proben)', wrongLang.length === 0, wrongLang.length ? wrongLang : `${[...htmlOf.values()].filter((r) => r.status === 200 || r.status === 404).length} Seiten`);

  // JSON-LD Person + WebSite auf / und /en
  for (const p of ['/', '/en']) {
    const r = htmlOf.get(p) ?? (await fetchText(`${BASE}${p}`));
    const types = new Set();
    for (const m of r.text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(m[1]);
        const walk = (x) => {
          if (Array.isArray(x)) {
            x.forEach(walk);
          } else if (x && typeof x === 'object') {
            [].concat(x['@type'] ?? []).forEach((t) => types.add(t));
            if (x['@graph']) {
              walk(x['@graph']);
            }
          }
        };
        walk(data);
      } catch {
        types.add('UNGÜLTIG');
      }
    }
    add(`JSON-LD Person + WebSite auf ${p}`, types.has('Person') && types.has('WebSite') && !types.has('UNGÜLTIG'), [...types].join(', ') || 'keins');
  }

  // og:image / og:type auf allen 200-Seiten, Bild abrufbar auf / und /en
  const ogMissing = [];
  for (const [p, r] of htmlOf) {
    if (r.status !== 200) {
      continue;
    }
    const img = /<meta property="og:image" content="([^"]+)"/.exec(r.text)?.[1];
    const type = /<meta property="og:type" content="([^"]+)"/.exec(r.text)?.[1];
    if (!img || !type) {
      ogMissing.push(`${p}: ${img ? '' : 'og:image '}${type ? '' : 'og:type'}`.trim());
    }
  }
  add('og:image und og:type auf allen 200-Seiten', ogMissing.length === 0, ogMissing.length ? ogMissing : 'vollständig');
  for (const p of ['/', '/en']) {
    const img = /<meta property="og:image" content="([^"]+)"/.exec(htmlOf.get(p)?.text ?? '')?.[1];
    let detail = 'kein og:image';
    let ok = false;
    if (img) {
      const u = new URL(img);
      const local = `${BASE}${u.pathname}${u.search}`;
      try {
        const r = await fetch(local, { signal: AbortSignal.timeout(20000) });
        ok = r.status === 200 && /^image\//.test(r.headers.get('content-type') ?? '');
        detail = `${u.pathname} → ${r.status} ${r.headers.get('content-type')}`;
      } catch (e) {
        detail = String(e);
      }
    }
    add(`og:image abrufbar (${p})`, ok, detail);
  }

  // llms.txt
  const llms = await fetchText(`${BASE}/llms.txt`);
  add('/llms.txt', llms.status === 200 && /text\/(plain|markdown)/.test(llms.headers.get('content-type') ?? '') && /^# /m.test(llms.text), `${llms.status} ${llms.headers.get('content-type')}, ${llms.text.length} Zeichen`);

  // Markdown-Weiche
  const md = async (p, accept = 'text/markdown') => {
    const r = await fetchText(`${BASE}${p}`, { headers: { accept } });
    return { status: r.status, ct: r.headers.get('content-type') ?? '', vary: r.headers.get('vary') ?? '', len: r.text.length, location: r.headers.get('location') };
  };
  for (const [p, want] of [['/', 200], ['/en', 200], ['/gibt-es-nicht-md-404', 404]]) {
    const r = await md(p);
    add(`Accept: text/markdown auf ${p} → ${want}`, r.status === want && /text\/markdown/.test(r.ct) && /accept/i.test(r.vary), `${r.status} ${r.ct}, Vary: ${r.vary}`);
  }
  const q0 = await md('/', 'text/markdown;q=0, text/html');
  add('text/markdown;q=0 → HTML (PER8)', q0.status === 200 && /text\/html/.test(q0.ct), `${q0.status} ${q0.ct}`);
  const llmsMd = await md('/llms.txt');
  add('Dateien behalten mit Accept: text/markdown ihr Original (PER1)', llmsMd.status === 200 && llmsMd.ct === (llms.headers.get('content-type') ?? ''), `${llmsMd.status} ${llmsMd.ct}`);

  // Ghost-Testprojekt → 308 (HTML und Markdown)
  const samples = [
    ['/projekte/beispielprojekt-me-website', '/projekte'],
    ['/en/projekte/sample-project-me-website', '/en/projekte'],
    ['/blog/beispielprojekt-me-website', '/projekte'],
    ['/en/blog/sample-project-me-website', '/en/projekte'],
  ];
  for (const accept of ['text/html', 'text/markdown']) {
    const bad = [];
    for (const [p, target] of samples) {
      const r = await md(p, accept);
      const loc = r.location ? new URL(r.location, BASE).pathname : null;
      if (r.status !== 308 || loc !== target) {
        bad.push(`${p}: ${r.status} → ${loc}`);
      }
    }
    add(`Ghost-Testprojekt → 308 (${accept})`, bad.length === 0, bad.length ? bad : `${samples.length} Pfade`);
  }

  // Sitemap und llms.txt ohne Testprojekt; Sitemap-Ziele 200 und indexierbar
  const sitemap = await fetchText(`${BASE}/sitemap.xml`);
  const sampleRe = /beispielprojekt-me-website|sample-project-me-website/;
  add('Sitemap und llms.txt ohne Ghost-Testprojekt', sitemap.status === 200 && !sampleRe.test(sitemap.text) && !sampleRe.test(llms.text), `Sitemap ${sitemap.status}${sampleRe.test(sitemap.text) ? ' enthält es' : ''}${sampleRe.test(llms.text) ? ', llms.txt enthält es' : ''}`);
  const locs = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const badLocs = [];
  for (const p of locs) {
    const r = htmlOf.get(p) ?? (await fetchText(`${BASE}${p}`).catch(() => ({ status: 0, text: '' })));
    const robots = /<meta name="robots" content="([^"]+)"/.exec(r.text)?.[1] ?? '';
    if (r.status !== 200 || /noindex/.test(robots)) {
      badLocs.push(`${p}: ${r.status}${robots ? ` ${robots}` : ''}`);
    }
  }
  add('Sitemap-Ziele 200 und indexierbar', locs.length > 0 && badLocs.length === 0, badLocs.length ? badLocs : `${locs.length} Ziele`);

  // noindex für nicht gelistete Seiten
  const unl = [...routes.unlisted, ...routes.noindex].flatMap((p) => [p, en(p)]);
  const indexable = [];
  for (const p of unl) {
    const r = htmlOf.get(p) ?? (await fetchText(`${BASE}${p}`));
    const robots = /<meta name="robots" content="([^"]+)"/.exec(r.text)?.[1] ?? '';
    if (r.status === 200 && !/noindex/.test(robots)) {
      indexable.push(p);
    }
  }
  add('noindex auf nicht gelisteten Seiten', indexable.length === 0, indexable.length ? indexable : unl.join(' '));

  // robots.txt
  const robotsTxt = await fetchText(`${BASE}/robots.txt`);
  add('/robots.txt mit Sitemap-Zeile', robotsTxt.status === 200 && /^sitemap:/im.test(robotsTxt.text), `${robotsTxt.status}`);

  // 404-Proben im Server-HTML (Feinschliff): Status 404, echtes Dokument statt der leeren
  // __next_error__-Hülle eines Laufzeit-notFound(), lang gesetzt, H1 mit Text, Stylesheets
  // abrufbar, nicht im Cache abgelegt. lang je Sprache prüft die Prüfung oben, den Inhalt ohne
  // JavaScript noJsChecks().
  const bad404 = [];
  for (const p of NOT_FOUND) {
    const r = htmlOf.get(p) ?? (await fetchText(`${BASE}${p}`));
    const problems = [];
    if (r.status !== 404) {
      problems.push(`Status ${r.status}`);
    }
    if (/<html[^>]*id="__next_error__"/.test(r.text)) {
      problems.push('__next_error__-Hülle');
    }
    if (!/<html[^>]*\slang="[a-z]{2}"/.test(r.text)) {
      problems.push('ohne lang');
    }
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(r.text)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
    if (!h1) {
      problems.push('ohne H1-Text');
    }
    const css = [...r.text.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    if (!css.length) {
      problems.push('ohne Stylesheet');
    }
    for (const href of css) {
      const c = await fetch(new URL(href, BASE), { signal: AbortSignal.timeout(20000) }).catch(() => null);
      if (!c || c.status !== 200 || !/text\/css/.test(c.headers.get('content-type') ?? '')) {
        problems.push(`CSS ${href}: ${c?.status ?? 'Fehler'}`);
      }
    }
    if (/s-maxage=\d{4,}/.test(r.headers?.get?.('cache-control') ?? '')) {
      problems.push(`Cache-Control ${r.headers.get('cache-control')}`);
    }
    if (problems.length) {
      bad404.push(`${p}: ${problems.join(', ')}`);
    }
  }
  add('404-Proben: Status 404, lang, H1, CSS im Server-HTML', bad404.length === 0, bad404.length ? bad404 : NOT_FOUND.join(' '));
  return checks;
}

/**
 * 404-Proben ohne JavaScript im Browser (Feinschliff): H1 sichtbar und mit Text, Stylesheets
 * geladen und angewendet (Schrift der Seite statt Browser-Standard). Rest-Feinschliff: Sprache
 * der sichtbaren Fassung (lang am Dokument und an der sichtbaren H1) passt zum Pfad – vorher
 * zeigten /en-Pfade ohne JavaScript die deutsche Fassung.
 */
async function noJsChecks(browser) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const bad = [];
  for (const p of NOT_FOUND) {
    const page = await context.newPage();
    try {
      const resp = await page.goto(`${BASE}${p}`, { waitUntil: 'load', timeout: 30000 });
      const info = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const box = h1?.getBoundingClientRect();
        return {
          h1: (h1?.innerText ?? '').trim(),
          visible: Boolean(box && box.width > 0 && box.height > 0),
          sheets: document.styleSheets.length,
          font: getComputedStyle(document.body).fontFamily,
          lang: document.documentElement.lang,
          // sichtbare Fassung der H1 (global-not-found.tsx: ein Span je Sprache)
          h1Lang:
            [...(h1?.querySelectorAll('[lang]') ?? [])].find((el) => el.getBoundingClientRect().width > 0)?.getAttribute('lang') ??
            h1?.closest('[lang]')?.getAttribute('lang') ??
            null,
        };
      });
      const problems = [];
      if (resp?.status() !== 404) {
        problems.push(`Status ${resp?.status()}`);
      }
      if (!info.h1 || !info.visible) {
        problems.push(`H1 ${info.visible ? 'leer' : 'unsichtbar'}`);
      }
      if (!info.sheets || /^(times|serif|"?Times New Roman"?)/i.test(info.font)) {
        problems.push(`CSS nicht angewendet (${info.sheets} Stylesheets, Schrift ${info.font})`);
      }
      const want = p === '/en' || p.startsWith('/en/') ? 'en' : 'de';
      if (info.lang !== want || info.h1Lang !== want) {
        problems.push(`Sprache ${info.lang}/${info.h1Lang} statt ${want}`);
      }
      if (problems.length) {
        bad.push(`${p}: ${problems.join(', ')}`);
      }
    } catch (e) {
      bad.push(`${p}: ${String(e).slice(0, 120)}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
  return [{ name: '404-Proben ohne JavaScript: H1 sichtbar, CSS angewendet, Sprache wie der Pfad', ok: bad.length === 0, detail: bad.length ? bad : `${NOT_FOUND.length} Pfade` }];
}

/** Voller Titel der Bachelorarbeit (THESIS.title in src/content/profile.ts), je Sprache. */
function thesisTitleFromRepo() {
  const src = fs.readFileSync(path.join(REPO, 'src', 'content', 'profile.ts'), 'utf8');
  const m = /export const THESIS[^=]*=\s*\{\s*title:\s*\{\s*de:\s*'([^']+)',\s*en:\s*'([^']+)'/.exec(src);
  return m ? { de: m[1], en: m[2] } : null;
}

/**
 * Ohne JavaScript keine wirkungslosen Bedienelemente (Rest-Feinschliff REG1): Auf jeder Seite
 * (390 und 1440 px, javaScriptEnabled: false) die Tab-Folge ablaufen und jeden Stopp zählen,
 * der ohne Script nichts tut – Buttons (außer Absenden eines Formulars, das ohne Script
 * wirklich absendet), Rollen wie tab/switch/checkbox/menuitem, Felder in einem
 * <form method="dialog"> (dessen Absenden ohne Script nichts tut) und sonstige Elemente mit
 * tabindex. Links, <summary>, Felder echter Formulare und Scroll-Container mit tabindex (scrollen
 * per Tastatur, mit und ohne Script gleich) zählen nicht. Vorher (4221b3f): Kachel
 * des Periodensystems (Tab), zwei Kopf-Buttons des Akkordeons, „Drucken“ auf /cv; im
 * Formular-Build die Felder und „Nachricht senden“.
 */
async function noJsControlChecks(browser) {
  const targets = pages.filter((p) => expectedStatus(p) === 200);
  const bad = [];
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: width === 390 ? 844 : 900 } });
    for (const p of targets) {
      const page = await context.newPage();
      try {
        await page.goto(`${BASE}${p}`, { waitUntil: 'load', timeout: 30000 });
        const dead = [];
        const seen = new Set();
        for (let i = 0; i < 250; i++) {
          await page.keyboard.press('Tab');
          const stop = await page.evaluate(() => {
            const a = document.activeElement;
            if (!a || a === document.body) {
              return null;
            }
            const tag = a.tagName;
            const role = a.getAttribute('role');
            const form = a.closest('form');
            const dialogForm = form && (form.getAttribute('method') ?? '').toLowerCase() === 'dialog';
            const name = (a.getAttribute('aria-label') || a.textContent || a.getAttribute('name') || '').replace(/\s+/g, ' ').trim().slice(0, 50);
            const r = a.getBoundingClientRect();
            const id = `${tag}|${name}|${Math.round(r.left)}|${Math.round(r.top + scrollY)}`;
            let deadReason = null;
            if (tag === 'A' && a.hasAttribute('href')) {
              deadReason = null;
            } else if (tag === 'SUMMARY') {
              deadReason = null;
            } else if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
              deadReason = dialogForm || !form ? 'Feld ohne absendbares Formular' : null;
            } else if (tag === 'BUTTON') {
              const type = (a.getAttribute('type') ?? 'submit').toLowerCase();
              deadReason = type === 'submit' && form && !dialogForm ? null : 'Button';
            } else if (role) {
              deadReason = `Rolle ${role}`;
            } else if (a.hasAttribute('tabindex') && a.tabIndex >= 0 && a.id !== 'main') {
              // Scroll-Container mit tabindex (Karussell, Tabellen, Code) scrollen per Tastatur –
              // mit und ohne JavaScript gleich, kein Befund dieser Prüfung
              const cs = getComputedStyle(a);
              const scroller = /auto|scroll/.test(cs.overflowX) || /auto|scroll/.test(cs.overflowY);
              deadReason = scroller ? null : 'tabindex';
            }
            return { id, label: `${tag}${role ? `[${role}]` : ''} ${name}`, deadReason };
          });
          if (!stop || seen.has(stop.id)) {
            break;
          }
          seen.add(stop.id);
          if (stop.deadReason) {
            dead.push(`${stop.label} (${stop.deadReason})`);
          }
        }
        if (dead.length) {
          bad.push(`${p} @${width}: ${dead.join('; ')}`);
        }
      } catch (e) {
        bad.push(`${p} @${width}: ${String(e).slice(0, 120)}`);
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
  return [{ name: 'Ohne JavaScript keine wirkungslosen Tab-Stopps (390/1440)', ok: bad.length === 0, detail: bad.length ? bad : `${targets.length} Seiten` }];
}

/**
 * Bildinhalt im Barrierefreiheitsbaum (Feinschliff-Nachbesserung GES1): Auf jeder Projektseite
 * (Übersicht, Detailseiten mit „Weiteres Projekt“) muss der volle Titel der Bachelorarbeit im
 * Baum von <main> stehen. Das Titelblatt ist in der Projektzeile aria-hidden (Maus-Link); fehlt
 * der Ersatztext, hört ein Screenreader nur den Kurztitel. 1440 px, mit JavaScript.
 */
async function a11yTextChecks(browser) {
  const title = thesisTitleFromRepo();
  const targets = pages.filter((p) => /^(\/en)?\/projekte(\/|$)/.test(p) && expectedStatus(p) === 200);
  if (!targets.length) {
    return []; // --pages ohne Projektseiten
  }
  if (!title) {
    return [{ name: 'Titel der Bachelorarbeit im Barrierefreiheitsbaum der Projektseiten', ok: false, detail: 'THESIS.title nicht gefunden' }];
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const bad = [];
  for (const p of targets) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}${p}`, { waitUntil: 'load', timeout: 30000 });
      const snap = (await page.locator('main').ariaSnapshot()).replace(/\u2060/g, '').toLowerCase();
      const want = (p.startsWith('/en/') ? title.en : title.de).toLowerCase();
      if (!snap.includes(want)) {
        bad.push(`${p}: Titel fehlt`);
      }
    } catch (e) {
      bad.push(`${p}: ${String(e).slice(0, 120)}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
  return [{ name: 'Titel der Bachelorarbeit im Barrierefreiheitsbaum der Projektseiten', ok: bad.length === 0, detail: bad.length ? bad : `${targets.length} Seiten` }];
}

// ---------------------------------------------------------------------------------------------
// Ablauf

const routes = routesFromRepo();
const pages = await pageList(routes);
const runs = [];
for (const p of pages) {
  for (const w of WIDTHS) {
    for (const s of SCHEMES) {
      runs.push([p, w, s]);
    }
  }
}
console.log(`Gate ${LABEL}: ${pages.length} Seiten × ${WIDTHS.join('/')} × ${SCHEMES.join('/')} = ${runs.length} Läufe gegen ${BASE}${REDUCE ? ' (reduce)' : ''}`);

const browser = await chromium.launch({ channel: process.env.GATE_CHANNEL ?? 'chrome', headless: true });
const results = [];
let next = 0;
let done = 0;
const started = Date.now();
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < runs.length) {
      const [p, w, s] = runs[next++];
      results.push(await run(browser, p, w, s));
      done += 1;
      if (done % 20 === 0 || done === runs.length) {
        console.log(`  ${done}/${runs.length} (${Math.round((Date.now() - started) / 1000)} s)`);
      }
    }
  }),
);
const noJs = flag('no-agent') ? [] : [...(await noJsChecks(browser)), ...(await noJsControlChecks(browser)), ...(await a11yTextChecks(browser))];
await browser.close();
results.sort((a, b) => pages.indexOf(a.path) - pages.indexOf(b.path) || a.width - b.width || a.scheme.localeCompare(b.scheme));

const agent = flag('no-agent') ? [] : [...(await agentChecks(pages, routes)), ...noJs];

// ---------------------------------------------------------------------------------------------
// Auswertung

const key = (r) => `${r.path} @${r.width} ${r.scheme}`;
const find = {
  errors: results.filter((r) => r.error).map((r) => `${key(r)}: ${r.error}`),
  langDom: results.filter((r) => !r.error && r.lang !== (/^\/en(\/|$)/.test(r.path) ? 'en' : 'de')).map((r) => `${key(r)}: lang=${r.lang}`),
  status: results.filter((r) => r.status !== r.expected).map((r) => `${key(r)}: ${r.status} (erwartet ${r.expected})${r.finalPath && r.finalPath !== r.path ? ` → ${r.finalPath}` : ''}`),
  overflow: results.filter((r) => r.overflow > 0).map((r) => `${key(r)}: +${r.overflow}px ${r.offenders.map((o) => o.el).join('; ')}`),
  cls: results.filter((r) => r.cls > 0).map((r) => `${key(r)}: ${r.cls} ← ${r.shifts.flatMap((s) => s.sources.map((x) => x.node)).slice(0, 3).join('; ')}`),
  console: results.filter((r) => r.consoleErrors?.length).map((r) => `${key(r)}: ${r.consoleErrors.join(' | ')}`),
  requests: results.filter((r) => r.badRequests?.length).map((r) => `${key(r)}: ${r.badRequests.join(' | ')}`),
  headings: results.filter((r) => r.headingIssues?.length).map((r) => `${key(r)}: ${r.headingIssues.join('; ')}`),
  edges: results.filter((r) => r.edgeSpread !== null && r.edgeSpread > 1).map((r) => `${key(r)}: ${r.edgeSpread}px (Marke ${r.edges.brand}, H1 ${r.edges.h1}, Footer ${r.edges.footer})`),
  edgesMissing: results.filter((r) => !r.error && r.edges && Object.values(r.edges).some((v) => v === null)).map((r) => `${key(r)}: ${JSON.stringify(r.edges)}`),
  grids: results.filter((r) => r.grids?.some((g) => g.underfilled)).map((r) => `${key(r)}: ${r.grids.filter((g) => g.underfilled).map((g) => `${g.items} Einträge in ${g.tracks} Spuren`).join('; ')}`),
  gridsNoMax: results.filter((r) => r.grids?.some((g) => g.noMax)).map((r) => `${key(r)}: ${r.grids.filter((g) => g.noMax).map((g) => g.el).join('; ')}`),
  focusInvisible: results.filter((r) => r.focus?.invisible.length).map((r) => `${key(r)}: ${r.focus.invisible.join('; ')}`),
  focusObscured: results.filter((r) => r.focus?.obscured.length).map((r) => `${key(r)}: ${r.focus.obscured.join('; ')}`),
  focusSmall: results.filter((r) => r.focus?.small.length).map((r) => `${key(r)}: ${r.focus.small.join('; ')}`),
  agent: agent.filter((c) => !c.ok).map((c) => `${c.name}: ${JSON.stringify(c.detail)}`),
};
const count = (arr) => arr.length;
const perPage = (field) => {
  const m = new Map();
  for (const r of results) {
    if (r[field] && !m.has(r.path)) {
      m.set(r.path, r[field]);
    }
  }
  return Object.fromEntries(m);
};
const summary = {
  label: LABEL,
  base: BASE,
  at: new Date().toISOString(),
  pages: pages.length,
  widths: WIDTHS,
  schemes: SCHEMES,
  runs: results.length,
  reduce: REDUCE,
  seconds: Math.round((Date.now() - started) / 1000),
  counts: Object.fromEntries(Object.entries(find).map(([k, v]) => [k, count(v)])),
  smallTargets390: results.filter((r) => r.width === 390).reduce((n, r) => n + (r.focus?.small.length ?? 0), 0),
  gaps: perPage('gaps'),
  legalOpen: perPage('legalOpen'),
  clsMax: Math.max(0, ...results.map((r) => r.cls ?? 0)),
  agentOk: `${agent.filter((c) => c.ok).length}/${agent.length}`,
};
// Abnahme laut AGENTS.md: kleine Fokusziele, fehlende Kanten, Grids ohne max und
// fehlgeschlagene Abrufe sind Hinweise, keine Abnahme-Metrik.
const GATE = ['errors', 'langDom', 'status', 'overflow', 'cls', 'console', 'headings', 'edges', 'grids', 'focusInvisible', 'focusObscured', 'agent'];
summary.pass = GATE.every((k) => summary.counts[k] === 0);

fs.writeFileSync(path.join(OUT, 'metrics.json'), JSON.stringify({ summary, find, agent, pages, results }, null, 2));

const NAMES = {
  errors: 'Ladefehler',
  langDom: 'lang im Browser falsch',
  status: 'Status-Abweichungen',
  overflow: 'Horizontaler Überlauf',
  cls: 'CLS beim Laden > 0',
  console: 'Konsolenfehler',
  requests: 'Fehlgeschlagene Abrufe (Hinweis)',
  headings: 'Überschriften-Befunde',
  edges: 'Kantenspreizung > 1 px',
  edgesMissing: 'Kante nicht messbar (Hinweis)',
  grids: 'Unterbelegte Grids',
  gridsNoMax: 'Grids ohne max (Hinweis)',
  focusInvisible: 'Fokus nicht sichtbar',
  focusObscured: 'Fokus verdeckt',
  focusSmall: 'Kleine Fokusziele (Hinweis)',
  agent: 'Agenten-Prüfungen fehlgeschlagen',
};
const lines = [
  `# Screenshot-Gate ${LABEL}`,
  '',
  `${BASE} · ${pages.length} Seiten × ${WIDTHS.join('/')} px × ${SCHEMES.join('/')} = ${results.length} Läufe${REDUCE ? ' · reduce' : ''} · ${summary.seconds} s · ${summary.at}`,
  '',
  `**Ergebnis: ${summary.pass ? 'bestanden' : 'NICHT bestanden'}** (Abnahme: ${GATE.map((k) => NAMES[k]).join(', ')} = 0)`,
  '',
  '| Metrik | Anzahl |',
  '|---|---|',
  ...Object.keys(find).map((k) => `| ${NAMES[k]} | ${summary.counts[k]} |`),
  `| Kleine Fokusziele @390 | ${summary.smallTargets390} |`,
  `| Agenten-Prüfungen | ${summary.agentOk} |`,
  `| CLS max | ${summary.clsMax} |`,
  '',
  `Lücken [data-yb-gap] je Seite: ${JSON.stringify(summary.gaps)}`,
  '',
  `Rechtstext-Lücken [data-yb-legal-open] je Seite: ${JSON.stringify(summary.legalOpen)}`,
  '',
  '## Agenten-Prüfungen',
  '',
  ...agent.map((c) => `- ${c.ok ? 'OK' : 'FEHLER'} ${c.name}: ${Array.isArray(c.detail) ? c.detail.join('; ') : c.detail}`),
  '',
  '## Befunde',
  '',
];
for (const [k, v] of Object.entries(find)) {
  if (!v.length) {
    continue;
  }
  lines.push(`### ${NAMES[k]} (${v.length})`, '', ...v.slice(0, 60).map((x) => `- ${x}`));
  if (v.length > 60) {
    lines.push(`- … ${v.length - 60} weitere (metrics.json)`);
  }
  lines.push('');
}
fs.writeFileSync(path.join(OUT, 'summary.md'), `${lines.join('\n')}\n`);

console.log(lines.slice(0, 12 + Object.keys(find).length + 3).join('\n'));
console.log(`Agenten: ${summary.agentOk}${find.agent.length ? `\n  ${find.agent.join('\n  ')}` : ''}`);
console.log(`Bericht: ${path.join(OUT, 'summary.md')}`);
process.exit(summary.pass || flag('no-fail') ? 0 : 1);
