// Freisteller nacharbeiten (Fix-Runde 1, DES2): dunklen Rest des Stahlrahmens links von Kiefer
// und Hals entfernen, Kante 1px einziehen und weich auslaufen lassen, Farbsaum (Hintergrund-
// farbe in halbtransparenten Kantenpixeln) durch die Farbe des nächsten deckenden Inneren
// ersetzen. Ohne Metadaten (sharp schreibt ohne withMetadata() keine).
//
//   git show 51b4c02:public/me/portrait-cutout.webp > /tmp/cutout-original.webp
//   node scripts/portrait-matte.mjs /tmp/cutout-original.webp public/me/portrait-cutout.webp
//
// Eingabe ist der ursprünglich gelieferte Freisteller (zweimal angewendet zöge die Kante
// erneut ein). Koordinaten des Rahmen-Rests gelten nur für diese Datei (482 × 974).
// Die PNG-Kopie für das OG-Bild (src/assets/og/portrait-cutout.png) danach mit sharp erzeugen.
import { createRequire } from 'node:module';
// sharp ist eine Abhängigkeit von next (pnpm hebt sie nicht an), daher über next auflösen
const require = createRequire(createRequire(import.meta.url).resolve('next/package.json'));
const sharp = require('sharp');
const [, , src, out] = process.argv;
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const px = (x, y) => (y * W + x) * 4;
let removed = 0;
// 1. Rahmen-Rest links von Kiefer und Hals (dunkle, neutrale Pixel des Stahlrahmens hinter dem
//    Kopf): je Zeile von der linken Kante aus entfernen bis zum ersten warmen Pixel (Bart, Haut).
//    Bis Zeile 204 auch mittelgraue neutrale Pixel; ab 205 nur sehr dunkle – dort beginnt der
//    (ebenfalls neutrale, aber hellere) Rollkragen.
for (let y = 150; y <= 235; y++) {
  let started = false;
  for (let x = 200; x <= 250; x++) {
    const i = px(x, y);
    const a = data[i + 3];
    if (a === 0) { if (started) break; continue; }
    started = true;
    // halbtransparente Kantenpixel davor gehören zum Rahmen-Saum
    if (a < 160) { data[i + 3] = 0; removed++; continue; }
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b);
    const neutral = r - b <= 12 && Math.abs(r - g) <= 12 && Math.abs(g - b) <= 14;
    const frame = neutral && (y <= 204 ? mx <= 100 : mx <= 56);
    if (!frame) break;
    data[i + 3] = 0;
    removed++;
  }
}
// 2. Alpha: 1px einziehen (Minimum 3×3), dann 3×3 weichzeichnen
const alpha = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) alpha[i] = data[i * 4 + 3];
const eroded = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let m = 255;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const xx = x + dx, yy = y + dy;
    // Bildrand unten (Anschnitt) nicht einziehen
    if (yy >= H) continue;
    const v = xx < 0 || xx >= W || yy < 0 ? 0 : alpha[yy * W + xx];
    if (v < m) m = v;
  }
  eroded[y * W + x] = m;
}
const soft = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let sum = 0, n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const xx = x + dx, yy = y + dy;
    if (xx < 0 || xx >= W || yy < 0 || yy >= H) { n++; continue; }
    sum += eroded[yy * W + xx]; n++;
  }
  // nie mehr Deckkraft als vorher (kein Aufblähen in den Hintergrund)
  soft[y * W + x] = Math.min(alpha[y * W + x], Math.round(sum / n));
}
// 3. Farbsaum: halbtransparente Pixel bekommen die mittlere Farbe deckender Nachbarn (Radius 3)
let fixed = 0;
const R = 3;
const rgb = Buffer.from(data);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const a = soft[y * W + x];
  if (a === 0 || a >= 250) continue;
  let r = 0, g = 0, b = 0, w = 0;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const xx = x + dx, yy = y + dy;
    if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
    if (soft[yy * W + xx] < 250) continue;
    const i = px(xx, yy);
    const d = 1 / (1 + dx * dx + dy * dy);
    r += rgb[i] * d; g += rgb[i + 1] * d; b += rgb[i + 2] * d; w += d;
  }
  if (w > 0) {
    const i = px(x, y);
    data[i] = Math.round(r / w); data[i + 1] = Math.round(g / w); data[i + 2] = Math.round(b / w);
    fixed++;
  }
}
for (let i = 0; i < W * H; i++) data[i * 4 + 3] = soft[i];
let semi = 0;
for (let i = 0; i < W * H; i++) { const a = data[i * 4 + 3]; if (a > 0 && a < 255) semi++; }
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(out);
const m = await sharp(out).metadata();
console.log(JSON.stringify({ removed, fixed, semi, out, w: m.width, h: m.height, exif: !!m.exif, icc: !!m.icc, xmp: !!m.xmp }));
