#!/usr/bin/env node
/**
 * Gedrosselter Mobil-Lauf (AGENTS.md, Gate-Schritt 5b; Anleitung: docs/gate.md).
 *
 *   node scripts/gate/perf.mjs <baseUrl> [outDir] [--runs=8] [--pages=/,/en] [--profile=slow4g|lighthouse]
 *
 * Je Lauf ein frischer Kontext (390×844 @3x, Touch, Cache aus), Netz- und CPU-Drosselung per CDP:
 * - slow4g (Standard): Chrome-DevTools-Voreinstellung „Slow 4G“ – 562,5 ms Latenz,
 *   1,44 Mbit/s herunter, 675 kbit/s hoch – plus 4× CPU.
 * - lighthouse: 150 ms, 1,6 Mbit/s / 750 kbit/s, 4× CPU (die Werte der Lighthouse-Simulation,
 *   hier aber angewandt statt simuliert – so maß die Abschluss-Jury).
 * Gemessen ab Navigationsbeginn (gepufferte PerformanceObserver, vor jeder Eingabe):
 * FCP, LCP mit Element (Tag, id/Klasse, Bild-URL), CLS mit den verschiebenden Elementen,
 * übertragenes JavaScript (CDP, encodedDataLength aller Skript-Antworten) und ob ein
 * noModule-Skript geladen wurde (sollte nie passieren).
 * Ausgabe: Tabelle je Lauf, Min/Median/Max je Seite; mit outDir zusätzlich perf.json.
 * Exit 0 (Bericht, keine Abnahme – „CLS 0“ gilt ungedrosselt im Gate); Exit 1 nur bei Ladefehlern.
 *
 * Lokal über HTTP/1.1 (Standalone-Server) – Werte sind untereinander vergleichbar, nicht mit
 * einem Produktions-CDN. Playwright ist keine Projekt-Abhängigkeit: PLAYWRIGHT_MODULE (docs/gate.md).
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
const OUT = positional[1];
if (!BASE) {
  console.error('Nutzung: node scripts/gate/perf.mjs <baseUrl> [outDir] [--runs=8] [--pages=/] [--profile=slow4g|lighthouse]');
  process.exit(2);
}
const RUNS = Math.max(1, Number(opt('runs', 8)));
const PAGES = opt('pages', '/').split(',').filter(Boolean);
const PROFILES = {
  slow4g: { latency: 562.5, down: (1.6 * 1000 * 1000 * 0.9) / 8, up: (750 * 1000 * 0.9) / 8, cpu: 4, name: 'DevTools „Slow 4G“ (562,5 ms, 1,44/0,675 Mbit/s), 4× CPU' },
  lighthouse: { latency: 150, down: (1.6 * 1024 * 1024) / 8, up: (750 * 1024) / 8, cpu: 4, name: 'Lighthouse-Werte angewandt (150 ms, 1,6/0,75 Mbit/s), 4× CPU' },
};
const PROFILE = PROFILES[opt('profile', 'slow4g')];
if (!PROFILE) {
  console.error(`unbekanntes Profil: ${opt('profile')}`);
  process.exit(2);
}

const browser = await chromium.launch({ channel: process.env.GATE_CHANNEL ?? 'chrome', headless: true });
const runs = [];
let failures = 0;
for (const pagePath of PAGES) {
  for (let i = 0; i < RUNS; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    // Analytics nie mitzählen (wie shoot.mjs)
    await ctx.route(/cloudflareinsights\.com|google-analytics\.com|googletagmanager\.com|plausible\.io/, (r) => r.fulfill({ status: 204, body: '' }));
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: PROFILE.latency, downloadThroughput: PROFILE.down, uploadThroughput: PROFILE.up });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: PROFILE.cpu });
    const scripts = new Map();
    cdp.on('Network.responseReceived', (e) => {
      if (e.type === 'Script') scripts.set(e.requestId, { url: e.response.url, bytes: 0 });
    });
    cdp.on('Network.loadingFinished', (e) => {
      const s = scripts.get(e.requestId);
      if (s) s.bytes = e.encodedDataLength;
    });
    await page.addInitScript(() => {
      const describe = (n) => {
        if (!n || n.nodeType !== 1) return null;
        const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
        return `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${cls.map((c) => `.${c}`).join('')}`;
      };
      window.__perf = { lcp: null, lcpEl: null, lcpUrl: null, cls: 0, shifts: [] };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__perf.lcp = e.startTime;
          window.__perf.lcpEl = describe(e.element);
          window.__perf.lcpUrl = e.url || null;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput) continue;
          window.__perf.cls += e.value;
          window.__perf.shifts.push({ value: Number(e.value.toFixed(5)), sources: (e.sources ?? []).map((s) => describe(s.node)).filter(Boolean) });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    let row;
    try {
      const resp = await page.goto(BASE + pagePath, { waitUntil: 'load', timeout: 90000 });
      await page.waitForTimeout(3000);
      const r = await page.evaluate(() => ({
        ...window.__perf,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
        noModule: [...document.querySelectorAll('script[nomodule]')].map((s) => s.src),
      }));
      const loaded = [...scripts.values()];
      const noModuleLoaded = loaded.filter((s) => r.noModule.includes(s.url)).length;
      row = {
        page: pagePath,
        run: i + 1,
        status: resp?.status() ?? 0,
        fcp: r.fcp === null ? null : Math.round(r.fcp),
        lcp: r.lcp === null ? null : Math.round(r.lcp),
        lcpEl: r.lcpEl,
        lcpUrl: r.lcpUrl ? new URL(r.lcpUrl).pathname : null,
        cls: Number(r.cls.toFixed(5)),
        shifts: r.shifts,
        jsKB: Math.round(loaded.reduce((n, s) => n + s.bytes, 0) / 100) / 10,
        jsFiles: loaded.length,
        noModuleLoaded,
      };
    } catch (e) {
      failures += 1;
      row = { page: pagePath, run: i + 1, error: String(e).slice(0, 160) };
    }
    runs.push(row);
    console.log(JSON.stringify(row));
    await ctx.close();
  }
}
await browser.close();

const stats = (xs) => {
  const s = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  return s.length ? { min: s[0], median: s[Math.floor((s.length - 1) / 2)], max: s[s.length - 1] } : null;
};
const summary = PAGES.map((p) => {
  const rs = runs.filter((r) => r.page === p && !r.error);
  const els = [...new Set(rs.map((r) => r.lcpEl))];
  return {
    page: p,
    runs: rs.length,
    lcp: stats(rs.map((r) => r.lcp)),
    fcp: stats(rs.map((r) => r.fcp)),
    lcpElements: els,
    clsZero: `${rs.filter((r) => r.cls === 0).length}/${rs.length}`,
    clsMax: Math.max(0, ...rs.map((r) => r.cls)),
    jsKB: stats(rs.map((r) => r.jsKB)),
    noModuleLoaded: rs.reduce((n, r) => n + r.noModuleLoaded, 0),
  };
});
console.log(`\nProfil: ${PROFILE.name}, ${RUNS} Läufe je Seite, ${BASE}`);
for (const s of summary) {
  console.log(
    `${s.page}: LCP ${s.lcp?.min}–${s.lcp?.max} ms (Median ${s.lcp?.median}), FCP Median ${s.fcp?.median} ms, LCP-Element ${s.lcpElements.join(' | ')}, CLS 0 in ${s.clsZero} (max ${s.clsMax}), JS übertragen ${s.jsKB?.median} KB (Median), noModule geladen: ${s.noModuleLoaded}`,
  );
}
if (OUT) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'perf.json'), JSON.stringify({ base: BASE, profile: PROFILE, at: new Date().toISOString(), summary, runs }, null, 2));
  console.log(`Bericht: ${path.join(OUT, 'perf.json')}`);
}
process.exit(failures ? 1 : 0);
