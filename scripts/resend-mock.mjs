// Lokaler Resend-Mock für Tests des Kontaktformulars (keine echten Keys, kein Netz).
//   node resend-mock.mjs <port>
//   POST /emails          → je nach Modus 200 {id} | 500 | 422 | Timeout (Modus "hang")
//   POST /__mode {mode}   → Modus setzen: ok | fail | invalid | hang
//   GET  /__log           → empfangene Anfragen (Header-Auszug + Body)
//   POST /__reset         → Log leeren, Modus ok
import http from 'node:http';
const port = Number(process.argv[2] || 3362);
let mode = 'ok';
let log = [];
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const json = (status, obj) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };
    if (req.url === '/__mode' && req.method === 'POST') { mode = JSON.parse(body).mode; return json(200, { mode }); }
    if (req.url === '/__reset' && req.method === 'POST') { mode = 'ok'; log = []; return json(200, { ok: true }); }
    if (req.url === '/__log') return json(200, log);
    if (req.url === '/emails' && req.method === 'POST') {
      let parsed = null;
      try { parsed = JSON.parse(body); } catch {}
      log.push({ at: Date.now(), mode, auth: req.headers.authorization, contentType: req.headers['content-type'], body: parsed });
      if (mode === 'fail') return json(500, { statusCode: 500, name: 'internal_server_error', message: 'mock failure' });
      if (mode === 'invalid') return json(422, { statusCode: 422, name: 'validation_error', message: 'mock validation' });
      if (mode === 'hang') return; // nie antworten → Zeitüberschreitung im Handler
      return json(200, { id: `mock-${log.length}` });
    }
    json(404, { error: 'not found' });
  });
});
server.listen(port, '127.0.0.1', () => console.log(`resend-mock auf ${port}`));
