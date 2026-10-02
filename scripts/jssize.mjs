// JS/CSS-Größen (gzip -9 und brotli) eines Next-Builds: gesamt + je prerenderter Seite.
// Nutzung: node jssize.mjs <projektdir> [label]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dir = process.argv[2];
const label = process.argv[3] ?? dir;
const next = path.join(dir, '.next');
const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const br = (buf) => zlib.brotliCompressSync(buf).length;

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const staticFiles = walk(path.join(next, 'static'));
const total = { js: { raw: 0, gz: 0, br: 0, n: 0 }, css: { raw: 0, gz: 0, br: 0, n: 0 } };
const sizeOf = new Map();
for (const f of staticFiles) {
  const ext = f.endsWith('.js') ? 'js' : f.endsWith('.css') ? 'css' : null;
  if (!ext) continue;
  const buf = fs.readFileSync(f);
  const s = { raw: buf.length, gz: gz(buf), br: br(buf) };
  sizeOf.set('/_next/' + path.relative(next, f).split(path.sep).join('/'), s);
  total[ext].raw += s.raw;
  total[ext].gz += s.gz;
  total[ext].br += s.br;
  total[ext].n += 1;
}

const htmlFiles = walk(path.join(next, 'server', 'app')).filter((f) => f.endsWith('.html'));
const pages = {};
const union = new Set();
const unionCss = new Set();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const route = '/' + path.relative(path.join(next, 'server', 'app'), f).replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  const js = new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+\.js)(?:\?[^"]*)?"/g)].map((m) => m[1]));
  const css = new Set([...html.matchAll(/href="(\/_next\/static\/[^"?]+\.css)(?:\?[^"]*)?"/g)].map((m) => m[1]));
  let jsGz = 0;
  let cssGz = 0;
  const missing = [];
  for (const u of js) {
    const s = sizeOf.get(u);
    if (s) jsGz += s.gz;
    else missing.push(u);
    union.add(u);
  }
  for (const u of css) {
    const s = sizeOf.get(u);
    if (s) cssGz += s.gz;
    unionCss.add(u);
  }
  pages[route] = { jsFiles: js.size, jsGz, cssGz, missing: missing.length };
}
let unionGz = 0;
for (const u of union) unionGz += sizeOf.get(u)?.gz ?? 0;
let unionCssGz = 0;
for (const u of unionCss) unionCssGz += sizeOf.get(u)?.gz ?? 0;

const out = { label, total, unionReferencedJsGz: unionGz, unionReferencedCssGz: unionCssGz, pages };
console.log(JSON.stringify(out, null, 2));
