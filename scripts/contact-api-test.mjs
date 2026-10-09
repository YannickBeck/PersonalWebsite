// API-Tests für /api/kontakt gegen den lokalen Resend-Mock (docs/kontaktformular.md).
//   node scripts/resend-mock.mjs 3362
//   (Server mit CONTACT_RESEND_API_KEY=re_test_fake_0000000000 CONTACT_TO=inbox@example.test
//    CONTACT_FROM='Website <kontakt@example.test>' CONTACT_RESEND_BASE_URL=http://127.0.0.1:3362)
//   node scripts/contact-api-test.mjs http://127.0.0.1:3302 http://127.0.0.1:3362
// Keine echten Keys. Dauer ≈ 30 s (Mindest-Ausfüllzeit 3 s je Fall).
const [base = 'http://127.0.0.1:3302', mock = 'http://127.0.0.1:3362'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ipN = 10;
const ip = () => `203.0.113.${ipN++}`;
const results = [];
function check(name, cond, info = '') {
  results.push({ name, ok: !!cond, info });
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' – ' + info : ''}`);
}
async function token() {
  const r = await fetch(`${base}/api/kontakt`);
  return (await r.json()).token;
}
const MARK = 'Zz9Testinhalt-Geheim';
function payload(tok, extra = {}) {
  return { name: `Erika ${MARK}`, email: 'erika@example.test', subject: `Betreff ${MARK}`, message: `Hallo Yannick, ${MARK}\nZeile 2`, consent: true, hp: '', token: tok, lang: 'de', ...extra };
}
async function post(body, headers = {}) {
  const r = await fetch(`${base}/api/kontakt`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip(), ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  let data = null;
  try { data = await r.json(); } catch {}
  return { status: r.status, data, retryAfter: r.headers.get('retry-after'), cache: r.headers.get('cache-control') };
}
const mockLog = async () => (await fetch(`${mock}/__log`)).json();
await fetch(`${mock}/__reset`, { method: 'POST' });

// 1. Status
const st = await (await fetch(`${base}/api/kontakt`)).json();
check('GET: available + Token (Ausgabe.Nonce.Signatur)', st.available === true && /^\d+\.[\w-]+\.[\w-]+$/.test(st.token));

// 2. Zu schnell
let r = await post(payload(await token()));
check('POST sofort → too_fast 400', r.status === 400 && r.data?.error === 'too_fast', JSON.stringify(r.data));

// 3. Erfolg
const t1 = await token();
await sleep(3200);
r = await post(payload(t1));
check('POST gültig nach 3,2 s → 200 ok', r.status === 200 && r.data?.ok === true, JSON.stringify(r.data));
check('Antwort no-store', r.cache === 'no-store');
let log = await mockLog();
const mail = log.at(-1);
check('Mock: genau 1 Mail empfangen', log.length === 1, `n=${log.length}`);
check('Mock: Bearer-Key', mail?.auth === 'Bearer re_test_fake_0000000000');
check('Mock: from/to/reply_to', mail?.body?.from === 'Website <kontakt@example.test>' && JSON.stringify(mail?.body?.to) === '["inbox@example.test"]' && mail?.body?.reply_to === 'erika@example.test', JSON.stringify({ from: mail?.body?.from, to: mail?.body?.to, reply_to: mail?.body?.reply_to }));
check('Mock: Betreff + Klartext mit Nachricht', mail?.body?.subject?.startsWith('Kontaktformular: Betreff') && mail?.body?.text?.includes(`Hallo Yannick, ${MARK}\nZeile 2`) && !('html' in (mail?.body ?? {})), mail?.body?.subject);

// 4. Token erneut
r = await post(payload(t1));
check('Gleiches Token erneut → rejected', r.status === 400 && r.data?.error === 'rejected', JSON.stringify(r.data));

// 5. Honeypot
const t2 = await token();
await sleep(3200);
r = await post(payload(t2, { hp: 'Spam GmbH' }));
log = await mockLog();
check('Honeypot gefüllt → rejected, keine Mail', r.status === 400 && r.data?.error === 'rejected' && log.length === 1, JSON.stringify(r.data));

// 6. Ungültige Felder
const t3 = await token();
await sleep(3200);
r = await post(payload(t3, { name: ' ', email: 'kein-mail', consent: false, message: 'x'.repeat(5001) }));
check('Ungültig → 400 invalid mit Feldern', r.status === 400 && r.data?.error === 'invalid' && r.data.fields?.name === 'required' && r.data.fields?.email === 'email' && r.data.fields?.consent === 'consent' && r.data.fields?.message === 'tooLong', JSON.stringify(r.data));
const t3b = await token();
await sleep(3200);
r = await post(payload(t3b, { name: 'A\r\nBcc: x@example.test' }));
log = await mockLog();
check('CR/LF im Namen → einzeilig im Betreff', r.status === 200 && !/[\r\n]/.test(log.at(-1)?.body?.subject ?? '\n'), log.at(-1)?.body?.subject);

// 7. Fehler beim Anbieter
await fetch(`${mock}/__mode`, { method: 'POST', body: JSON.stringify({ mode: 'fail' }) });
const t4 = await token();
await sleep(3200);
r = await post(payload(t4));
check('Resend 500 → 502 send_failed', r.status === 502 && r.data?.error === 'send_failed', JSON.stringify(r.data));
await fetch(`${mock}/__mode`, { method: 'POST', body: JSON.stringify({ mode: 'invalid' }) });
r = await post(payload(t4));
check('Resend 422 → 502 send_failed (Token bleibt nutzbar)', r.status === 502 && r.data?.error === 'send_failed', JSON.stringify(r.data));
await fetch(`${mock}/__mode`, { method: 'POST', body: JSON.stringify({ mode: 'ok' }) });
r = await post(payload(t4));
check('Nach Fehler mit gleichem Token erneut → 200', r.status === 200 && r.data?.ok === true, JSON.stringify(r.data));

// 7b. Eindeutige Tokens und atomare Einmal-Nutzung (FUN3)
const many = await Promise.all(Array.from({ length: 6 }, () => token()));
check('6 parallele GET → 6 verschiedene Tokens', new Set(many).size === 6, `${new Set(many).size} verschieden`);
const t5 = await token();
await sleep(3200);
const before = (await mockLog()).length;
const par = await Promise.all([post(payload(t5)), post(payload(t5)), post(payload(t5))]);
const after = (await mockLog()).length;
check('3 parallele POST mit demselben Token → genau 1× 200, 1 Mail', par.filter((x) => x.status === 200).length === 1 && after - before === 1, par.map((x) => x.status).join(' ') + ` mails=${after - before}`);

// 8. Herkunft/Format
r = await post(payload(await token()), { 'Sec-Fetch-Site': 'cross-site' });
check('Sec-Fetch-Site: cross-site → 400 bad_request', r.status === 400 && r.data?.error === 'bad_request');
const rf = await fetch(`${base}/api/kontakt`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Forwarded-For': ip() }, body: 'name=a' });
check('Formular-Kodierung statt JSON → 400', rf.status === 400);
r = await post('{kaputt');
check('Kaputtes JSON → 400 bad_request', r.status === 400 && r.data?.error === 'bad_request');
r = await post(JSON.stringify(payload('x', { message: 'x'.repeat(40000) })));
check('Zu groß (> 32 KB) → 413', r.status === 413);

// 9. Rate-Limit je IP
const fixed = '198.51.100.7';
const statuses = [];
for (let i = 0; i < 6; i++) {
  const x = await post('{kaputt', { 'X-Forwarded-For': fixed });
  statuses.push(x.status + (x.retryAfter ? `(${x.retryAfter}s)` : ''));
}
check('Rate-Limit: 6. Anfrage derselben IP → 429 + Retry-After', statuses.slice(0, 5).every((s) => s.startsWith('400')) && statuses[5].startsWith('429'), statuses.join(' '));
const cf = await post('{kaputt', { 'X-Forwarded-For': fixed, 'CF-Connecting-IP': '192.0.2.44' });
check('CF-Connecting-IP hat Vorrang (andere IP → nicht limitiert)', cf.status === 400, String(cf.status));

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} bestanden`);
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
