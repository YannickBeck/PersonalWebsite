#!/usr/bin/env node
/**
 * Ghost-Mock für Builds und Gate (Content API v5, nur lesend, ohne Abhängigkeiten).
 *
 *   node scripts/ghost-mock/server.mjs [--port=2368] [--host=127.0.0.1] [--fixtures=<dir>] [--quiet]
 *   GHOST_URL=http://127.0.0.1:2368 GHOST_CONTENT_KEY=<26 Hex-Zeichen, Fake> pnpm build
 *
 * Abgeleitet aus src/lib/ghost.ts und @tryghost/content-api 1.12 (lib/content-api.js):
 * - URLs: /ghost/api/content/<resource>/ (v5/v6; v2–v4 und canary mit Präfix werden ebenso
 *   bedient), Einzelabruf /<resource>/<id>/ bzw. /<resource>/slug/<slug>/.
 * - Ressourcen: posts, pages, tags, authors (browse + read), settings, tiers, newsletters
 *   (browse), offers (read → 404, es gibt keine).
 * - Parameter: key (Pflicht wie bei Ghost), filter (NQL-Teilmenge, s. u.), fields, include
 *   (tags, authors, count.posts), formats (html, plaintext), order, limit (Zahl oder „all“), page.
 * - Antworten wie Ghost: browse {<resource>: [...], meta: {pagination}}, read {<resource>: [x]}
 *   ohne meta (der Client entpackt dann das eine Objekt), Fehler {errors: [{message, type}]}.
 *   Interne Tags (#lang-de → Slug hash-lang-de) kommen wie bei Ghost mit include=tags zurück;
 *   /tags/ ohne Filter liefert wie Ghost nur öffentliche Tags.
 * - NQL: Bedingungen feld:wert, feld:-wert, feld:[a,b], feld:-[a,b], feld:>wert (>=, <, <=),
 *   feld:~wert (~^, ~$), verknüpft mit + (und) und , (oder), Klammern, Werte auch in '…'.
 *   Felder: tag/tags (Tag-Slugs), primary_tag, author/authors, primary_author und jedes
 *   einfache Feld (slug, id, featured, visibility, published_at …).
 *
 * Inhalte: fixtures/*.json (Beiträge spiegeln die live sichtbaren Ghost-Beiträge, Quelle je
 * Eintrag im Feld „_quelle“; Felder mit „_“ gehen nie in die Antwort). Kein echter Key, keine
 * echten Daten außer den öffentlich sichtbaren Beitragstexten.
 *
 * Schlüssel: jeder 26-stellige Hex-Wert wird angenommen (wie ihn der Client verlangt); mit
 * GHOST_MOCK_KEY nur genau dieser (sonst 401 wie Ghost). Ohne key: 403 wie Ghost.
 *
 * Steuerung: GET /__mock/health (läuft? mit Kennung), GET /__mock/requests (letzte Abrufe,
 * ohne key), POST /__mock/shutdown (beenden). Idempotent: Läuft auf dem Port schon dieser Mock,
 * meldet der Start das und endet mit 0; belegt etwas anderes den Port, endet er mit 1.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVICE = 'yb-ghost-mock';
const VERSION = 1;
const here = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const PORT = Number(opt('port', process.env.GHOST_MOCK_PORT ?? 2368));
const HOST = opt('host', process.env.GHOST_MOCK_HOST ?? '127.0.0.1');
const FIXTURES = path.resolve(opt('fixtures', path.join(here, 'fixtures')));
const QUIET = args.includes('--quiet');
const STRICT_KEY = process.env.GHOST_MOCK_KEY ?? null;

const log = (...m) => {
  if (!QUIET) {
    console.log(`[${SERVICE}]`, ...m);
  }
};

// ---------------------------------------------------------------------------------------------
// Fixtures

function readJson(name, fallback) {
  const file = path.join(FIXTURES, name);
  if (!fs.existsSync(file)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith('_')));
const TAGS = readJson('tags.json', []).map(clean);
const AUTHORS = readJson('authors.json', []).map(clean);
const POSTS = readJson('posts.json', []).map(clean);
const PAGES = readJson('pages.json', []).map(clean);
const SETTINGS = clean(readJson('settings.json', {}));

const tagBySlug = new Map(TAGS.map((t) => [t.slug, t]));
const authorBySlug = new Map(AUTHORS.map((a) => [a.slug, a]));
for (const item of [...POSTS, ...PAGES]) {
  for (const slug of item.tags ?? []) {
    if (!tagBySlug.has(slug)) {
      throw new Error(`Fixture ${item.slug}: unbekannter Tag „${slug}“ (tags.json)`);
    }
  }
  for (const slug of item.authors ?? []) {
    if (!authorBySlug.has(slug)) {
      throw new Error(`Fixture ${item.slug}: unbekannter Autor „${slug}“ (authors.json)`);
    }
  }
}

const plaintext = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Wörter/275 wie Ghosts readingTime (ohne Bildzuschlag); kurze Beiträge → 0. */
const readingTime = (html) => Math.round(plaintext(html).split(' ').filter(Boolean).length / 275);

// ---------------------------------------------------------------------------------------------
// Darstellung wie die Content API

function tagOut(tag, base, counts) {
  const out = {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description ?? null,
    feature_image: tag.feature_image ?? null,
    visibility: tag.visibility ?? 'public',
    og_image: null,
    og_title: null,
    og_description: null,
    twitter_image: null,
    twitter_title: null,
    twitter_description: null,
    meta_title: null,
    meta_description: null,
    codeinjection_head: null,
    codeinjection_foot: null,
    canonical_url: null,
    accent_color: null,
    url: tag.visibility === 'internal' ? `${base}/404/` : `${base}/tag/${tag.slug}/`,
  };
  if (counts) {
    out.count = { posts: POSTS.filter((p) => (p.tags ?? []).includes(tag.slug)).length };
  }
  return out;
}

function authorOut(author, base, counts) {
  const out = { ...author, url: `${base}/author/${author.slug}/` };
  if (counts) {
    out.count = { posts: POSTS.filter((p) => (p.authors ?? []).includes(author.slug)).length };
  }
  return out;
}

function postOut(item, base, { include, formats, isPage }) {
  const tags = (item.tags ?? []).map((s) => tagOut(tagBySlug.get(s), base, false));
  const authors = (item.authors ?? []).map((s) => authorOut(authorBySlug.get(s), base, false));
  const text = plaintext(item.html);
  const out = {
    id: item.id,
    uuid: item.uuid,
    title: item.title,
    slug: item.slug,
    comment_id: item.id,
    feature_image: item.feature_image ?? null,
    featured: item.featured ?? false,
    visibility: item.visibility ?? 'public',
    created_at: item.created_at ?? item.published_at,
    updated_at: item.updated_at ?? item.published_at,
    published_at: item.published_at,
    custom_excerpt: item.custom_excerpt ?? null,
    codeinjection_head: null,
    codeinjection_foot: null,
    custom_template: null,
    canonical_url: null,
    url: `${base}/${item.slug}/`,
    excerpt: item.custom_excerpt || text.slice(0, 500),
    reading_time: readingTime(item.html),
    access: true,
    comments: false,
    og_image: null,
    og_title: null,
    og_description: null,
    twitter_image: null,
    twitter_title: null,
    twitter_description: null,
    meta_title: null,
    meta_description: null,
    email_subject: null,
    frontmatter: null,
    feature_image_alt: item.feature_image_alt ?? null,
    feature_image_caption: item.feature_image_caption ?? null,
  };
  if (isPage) {
    delete out.email_subject;
  }
  if (formats.includes('html')) {
    out.html = item.html ?? '';
  }
  if (formats.includes('plaintext')) {
    out.plaintext = text;
  }
  if (include.includes('tags')) {
    out.tags = tags;
    out.primary_tag = tags.find((t) => t.visibility === 'public') ?? null;
  }
  if (include.includes('authors')) {
    out.authors = authors;
    out.primary_author = authors[0] ?? null;
  }
  return out;
}

/** fields=a,b: nur diese Felder; per include angeforderte Relationen bleiben (wie Ghost). */
function pickFields(obj, fields, include) {
  if (!fields.length) {
    return obj;
  }
  const keep = new Set(fields);
  if (include.includes('tags')) {
    keep.add('tags');
  }
  if (include.includes('authors')) {
    keep.add('authors');
  }
  if (include.includes('count.posts')) {
    keep.add('count');
  }
  return Object.fromEntries(Object.entries(obj).filter(([k]) => keep.has(k)));
}

// ---------------------------------------------------------------------------------------------
// NQL (Teilmenge)

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i += 1;
    } else if ('+,()[]:'.includes(c)) {
      tokens.push({ t: c });
      i += 1;
    } else if (c === '-' && tokens.length && tokens[tokens.length - 1].t === ':') {
      tokens.push({ t: 'not' });
      i += 1;
    } else if (c === '>' || c === '<') {
      const op = src[i + 1] === '=' ? `${c}=` : c;
      tokens.push({ t: 'op', v: op });
      i += op.length;
    } else if (c === '~') {
      const op = src[i + 1] === '^' || src[i + 1] === '$' ? `~${src[i + 1]}` : '~';
      tokens.push({ t: 'op', v: op });
      i += op.length;
    } else if (c === "'" || c === '"') {
      let j = i + 1;
      let v = '';
      while (j < src.length && src[j] !== c) {
        if (src[j] === '\\' && j + 1 < src.length) {
          j += 1;
        }
        v += src[j];
        j += 1;
      }
      if (j >= src.length) {
        throw new Error(`NQL: offenes Anführungszeichen in „${src}“`);
      }
      tokens.push({ t: 'val', v });
      i = j + 1;
    } else {
      let j = i;
      while (j < src.length && !/[\s+,()[\]:]/.test(src[j])) {
        j += 1;
      }
      tokens.push({ t: 'val', v: src.slice(i, j) });
      i = j;
    }
  }
  return tokens;
}

function parseNql(src) {
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const take = (t) => {
    const tok = tokens[pos];
    if (!tok || (t && tok.t !== t)) {
      throw new Error(`NQL: erwartet ${t ?? 'Token'} an Stelle ${pos} in „${src}“`);
    }
    pos += 1;
    return tok;
  };
  const value = () => {
    const tok = take('val');
    return tok.v;
  };
  function term() {
    if (peek()?.t === '(') {
      take('(');
      const e = orExpr();
      take(')');
      return e;
    }
    const field = value();
    take(':');
    let negate = false;
    if (peek()?.t === 'not') {
      take('not');
      negate = true;
    }
    if (peek()?.t === '[') {
      take('[');
      const list = [value()];
      while (peek()?.t === ',') {
        take(',');
        list.push(value());
      }
      take(']');
      return { type: 'cmp', field, op: 'in', value: list, negate };
    }
    let op = '=';
    if (peek()?.t === 'op') {
      op = take('op').v;
    }
    return { type: 'cmp', field, op, value: value(), negate };
  }
  function andExpr() {
    const parts = [term()];
    while (peek()?.t === '+') {
      take('+');
      parts.push(term());
    }
    return parts.length === 1 ? parts[0] : { type: 'and', parts };
  }
  function orExpr() {
    const parts = [andExpr()];
    while (peek()?.t === ',') {
      take(',');
      parts.push(andExpr());
    }
    return parts.length === 1 ? parts[0] : { type: 'or', parts };
  }
  const tree = orExpr();
  if (pos !== tokens.length) {
    throw new Error(`NQL: unerwartetes „${tokens[pos].t}“ in „${src}“`);
  }
  return tree;
}

/** Werte eines Feldes (Liste, damit Tags/Autoren und einfache Felder gleich behandelt werden). */
function fieldValues(item, field) {
  const f = field.replace(/\.slug$/, '');
  switch (f) {
    case 'tag':
    case 'tags':
      return item.tags ?? [];
    case 'primary_tag':
      return (item.tags ?? []).filter((s) => tagBySlug.get(s)?.visibility !== 'internal').slice(0, 1);
    case 'author':
    case 'authors':
      return item.authors ?? [];
    case 'primary_author':
      return (item.authors ?? []).slice(0, 1);
    default: {
      const v = item[f];
      return [v === undefined ? null : v];
    }
  }
}

function matchOne(actual, op, expected, field) {
  const a = actual === null ? 'null' : String(actual);
  const e = String(expected);
  const isDate = /_at$/.test(field);
  const num = (x) => (isDate ? Date.parse(x) : Number(x));
  switch (op) {
    case '=':
      return a.toLowerCase() === e.toLowerCase();
    case 'in':
      return expected.some((x) => a.toLowerCase() === String(x).toLowerCase());
    case '>':
      return num(a) > num(e);
    case '>=':
      return num(a) >= num(e);
    case '<':
      return num(a) < num(e);
    case '<=':
      return num(a) <= num(e);
    case '~':
      return a.toLowerCase().includes(e.toLowerCase());
    case '~^':
      return a.toLowerCase().startsWith(e.toLowerCase());
    case '~$':
      return a.toLowerCase().endsWith(e.toLowerCase());
    default:
      throw new Error(`NQL: Operator ${op} nicht unterstützt`);
  }
}

function evaluate(node, item) {
  if (node.type === 'and') {
    return node.parts.every((p) => evaluate(p, item));
  }
  if (node.type === 'or') {
    return node.parts.some((p) => evaluate(p, item));
  }
  const values = fieldValues(item, node.field);
  const hit = values.some((v) => matchOne(v, node.op, node.value, node.field));
  return node.negate ? !hit : hit;
}

// ---------------------------------------------------------------------------------------------
// Abfrage

function parseQuery(search) {
  // Eigenes Dekodieren: „+“ bleibt „+“ (NQL-Und), der Client kodiert es ohnehin als %2B.
  const out = {};
  for (const part of search.replace(/^\?/, '').split('&')) {
    if (!part) {
      continue;
    }
    const eq = part.indexOf('=');
    const k = decodeURIComponent(eq < 0 ? part : part.slice(0, eq));
    out[k] = eq < 0 ? '' : decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

const list = (v) =>
  String(v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

function sortItems(items, order, fallback) {
  const spec = list(order || fallback).map((s) => {
    const [field, dir = 'asc'] = s.split(/\s+/);
    return { field, desc: dir.toLowerCase() === 'desc' };
  });
  return [...items].sort((x, y) => {
    for (const { field, desc } of spec) {
      const a = x[field] ?? '';
      const b = y[field] ?? '';
      const cmp = /_at$/.test(field) ? Date.parse(a || 0) - Date.parse(b || 0) : String(a).localeCompare(String(b));
      if (cmp !== 0) {
        return desc ? -cmp : cmp;
      }
    }
    return 0;
  });
}

function paginate(items, q) {
  const total = items.length;
  if (String(q.limit) === 'all') {
    return { page: items, pagination: { page: 1, limit: 'all', pages: 1, total, next: null, prev: null } };
  }
  const limit = Math.max(1, Number(q.limit) || 15);
  const pages = Math.max(1, Math.ceil(total / limit));
  const pageNo = Math.max(1, Number(q.page) || 1);
  const start = (pageNo - 1) * limit;
  return {
    page: items.slice(start, start + limit),
    pagination: {
      page: pageNo,
      limit,
      pages,
      total,
      next: pageNo < pages ? pageNo + 1 : null,
      prev: pageNo > 1 ? pageNo - 1 : null,
    },
  };
}

class ApiError extends Error {
  constructor(status, type, message, context = null) {
    super(message);
    this.status = status;
    this.type = type;
    this.context = context;
  }
}

const notFound = (what) => new ApiError(404, 'NotFoundError', `Resource not found error, cannot read ${what}.`);

const RESOURCES = {
  posts: { items: () => POSTS, kind: 'post', order: 'published_at desc' },
  pages: { items: () => PAGES, kind: 'page', order: 'title asc' },
  tags: { items: () => TAGS, kind: 'tag', order: 'name asc' },
  authors: { items: () => AUTHORS, kind: 'author', order: 'name asc' },
};

function handleApi(resource, id, slug, q, base) {
  const include = list(q.include);
  const fields = list(q.fields);
  const formats = q.formats ? list(q.formats) : ['html'];

  if (resource === 'settings') {
    return { settings: { ...SETTINGS, url: `${base}/` }, meta: {} };
  }
  if (resource === 'tiers' || resource === 'newsletters') {
    return { [resource]: [], meta: { pagination: { page: 1, limit: 15, pages: 1, total: 0, next: null, prev: null } } };
  }
  if (resource === 'offers') {
    throw notFound('offer');
  }
  const def = RESOURCES[resource];
  if (!def) {
    throw new ApiError(404, 'NotFoundError', 'Resource not found');
  }

  let items = def.items();
  const render = (item) => {
    if (def.kind === 'post' || def.kind === 'page') {
      return postOut(item, base, { include, formats, isPage: def.kind === 'page' });
    }
    if (def.kind === 'tag') {
      return tagOut(item, base, include.includes('count.posts'));
    }
    return authorOut(item, base, include.includes('count.posts'));
  };

  if (id || slug) {
    const hit = items.find((it) => (id ? it.id === id : it.slug === slug));
    if (!hit) {
      throw notFound(def.kind);
    }
    return { [resource]: [pickFields(render(hit), fields, include)] };
  }

  let filter = q.filter;
  if (resource === 'tags' && !filter) {
    // Ghost: /tags/ der Content API ohne Filter nur öffentliche Tags
    filter = 'visibility:public';
  }
  if (filter) {
    let tree;
    try {
      tree = parseNql(filter);
    } catch (e) {
      throw new ApiError(400, 'BadRequestError', 'Error parsing filter', String(e.message));
    }
    items = items.filter((it) => evaluate(tree, it));
  }
  items = sortItems(items, q.order, def.order);
  const { page, pagination } = paginate(items, q);
  return { [resource]: page.map((it) => pickFields(render(it), fields, include)), meta: { pagination } };
}

// ---------------------------------------------------------------------------------------------
// HTTP

const recent = [];
const remember = (entry) => {
  recent.push(entry);
  if (recent.length > 200) {
    recent.shift();
  }
};

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'x-yb-ghost-mock': String(VERSION),
  });
  res.end(json);
}

const startedAt = new Date().toISOString();
const API = /^\/ghost\/api\/(?:(?:v[2-4]|canary)\/)?content\/([a-z]+)\/(?:(?:slug\/([^/]+)|([0-9a-f]{24}))\/)?$/;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
  const base = `http://${req.headers.host ?? `${HOST}:${PORT}`}`;

  if (url.pathname === '/__mock/health') {
    send(res, 200, { ok: true, service: SERVICE, version: VERSION, port: PORT, startedAt, posts: POSTS.length, pages: PAGES.length, tags: TAGS.length, fixtures: FIXTURES });
    return;
  }
  if (url.pathname === '/__mock/requests') {
    send(res, 200, { requests: recent });
    return;
  }
  if (url.pathname === '/__mock/shutdown' && req.method === 'POST') {
    send(res, 200, { ok: true, stopping: true });
    log('beendet (POST /__mock/shutdown)');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
    return;
  }

  const m = API.exec(url.pathname);
  const q = parseQuery(url.search);
  const shown = Object.fromEntries(Object.entries(q).filter(([k]) => k !== 'key'));
  if (!m) {
    remember({ t: new Date().toISOString(), method: req.method, path: url.pathname, query: shown, status: 404 });
    send(res, 404, { errors: [{ message: 'Resource not found', type: 'NotFoundError' }] });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, { errors: [{ message: 'Method not allowed', type: 'MethodNotAllowedError' }] });
    return;
  }
  let status = 200;
  try {
    if (!q.key) {
      throw new ApiError(
        403,
        'NoPermissionError',
        'Authorization failed',
        'Unable to determine the authenticated member or integration. Check the supplied Content API Key and ensure cookies are being passed through if member auth is failing.',
      );
    }
    if (!/^[0-9a-f]{26}$/.test(q.key) || (STRICT_KEY && q.key !== STRICT_KEY)) {
      throw new ApiError(401, 'UnauthorizedError', 'Unknown Content API Key');
    }
    const body = handleApi(m[1], m[3], m[2] ? decodeURIComponent(m[2]) : null, q, base);
    send(res, 200, body);
  } catch (e) {
    if (!(e instanceof ApiError)) {
      console.error(e);
    }
    status = e instanceof ApiError ? e.status : 500;
    send(res, status, {
      errors: [{ message: e.message, context: e.context ?? null, type: e instanceof ApiError ? e.type : 'InternalServerError', details: null, property: null, help: null, code: null, id: 'mock' }],
    });
  } finally {
    remember({ t: new Date().toISOString(), method: req.method, path: url.pathname, query: shown, status });
    log(status, url.pathname, JSON.stringify(shown));
  }
});

async function alreadyRunning() {
  try {
    const r = await fetch(`http://${HOST}:${PORT}/__mock/health`, { signal: AbortSignal.timeout(1000) });
    const j = await r.json();
    return j?.service === SERVICE;
  } catch {
    return false;
  }
}

if (await alreadyRunning()) {
  console.log(`[${SERVICE}] läuft bereits auf http://${HOST}:${PORT} – nichts zu tun.`);
  process.exit(0);
}

server.on('error', (e) => {
  console.error(`[${SERVICE}] Start fehlgeschlagen: ${e.code === 'EADDRINUSE' ? `Port ${PORT} ist von einem anderen Prozess belegt` : e.message}`);
  process.exit(1);
});
server.listen(PORT, HOST, () => {
  console.log(`[${SERVICE}] http://${HOST}:${PORT} – ${POSTS.length} Beiträge, ${PAGES.length} Seiten, ${TAGS.length} Tags (${FIXTURES})`);
});
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
