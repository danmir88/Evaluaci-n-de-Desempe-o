'use strict';
// Servidor de la herramienta de Objetivos Ejecutivos FRIGOR.
// Sirve la página y una API JSON mínima. Guarda en Postgres si existe DATABASE_URL;
// si no, en un archivo JSON dentro de DATA_DIR (en Railway, montar un volumen ahí).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || '';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'storage');
const PAGE_FILE = path.join(__dirname, 'app', 'objetivos-frigor.html');
const LEGACY_FILE = path.join(__dirname, 'legacy', 'constructor-objetivos-2026.html');
const LEGACY_SHIM = path.join(__dirname, 'legacy', 'storage-compartido.js');
const COLLECTIONS = new Set(['objetivos', 'evaluaciones', 'cierres']);
const MAX_BODY = 8 * 1024 * 1024;

// ---------------- Almacenamiento ----------------
function fileStore(){
  const file = path.join(DATA_DIR, 'datos.json');
  fs.mkdirSync(DATA_DIR, {recursive: true});
  let state = {objetivos:{}, evaluaciones:{}, cierres:{}, config:{}, kv:{}, bitacora:[]};
  try{ state = Object.assign(state, JSON.parse(fs.readFileSync(file, 'utf8'))); }catch(e){ /* primer arranque */ }
  let writing = Promise.resolve();
  const persist = () => {
    const snapshot = JSON.stringify(state);
    writing = writing.then(() => fs.promises.writeFile(file + '.tmp', snapshot).then(() => fs.promises.rename(file + '.tmp', file)));
    return writing;
  };
  return {
    kind: 'archivo',
    async all(){ const {kv, ...rest} = state; return rest; },
    async get(col, id){ return (state[col] || {})[id] ?? null; },
    async put(col, id, data){ state[col][id] = data; await persist(); },
    async del(col, id){ delete state[col][id]; await persist(); },
    async setConfig(id, data){ state.config[id] = data; await persist(); },
    async log(entry){ state.bitacora.push(entry); state.bitacora = state.bitacora.slice(-5000); await persist(); },
  };
}

async function pgStore(url){
  const {Pool} = require('pg');
  const pool = new Pool({connectionString: url, ssl: /localhost|127\.0\.0\.1|\.railway\.internal/.test(url) ? false : {rejectUnauthorized: false}});
  await pool.query(`CREATE TABLE IF NOT EXISTS docs (
      col TEXT NOT NULL, id TEXT NOT NULL, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (col, id));
    CREATE TABLE IF NOT EXISTS bitacora (
      n BIGSERIAL PRIMARY KEY, f TIMESTAMPTZ NOT NULL DEFAULT now(), entry JSONB NOT NULL);`);
  const upsert = (col, id, data) => pool.query(
    `INSERT INTO docs (col, id, data, updated_at) VALUES ($1,$2,$3,now())
     ON CONFLICT (col, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`, [col, id, data]);
  return {
    kind: 'postgres',
    async all(){
      const out = {objetivos:{}, evaluaciones:{}, cierres:{}, config:{}, bitacora:[]};
      const {rows} = await pool.query("SELECT col, id, data FROM docs WHERE col <> 'kv'");
      rows.forEach(r => { if(out[r.col]) out[r.col][r.id] = r.data; });
      const log = await pool.query('SELECT entry FROM (SELECT n, entry FROM bitacora ORDER BY n DESC LIMIT 500) t ORDER BY n');
      out.bitacora = log.rows.map(r => r.entry);
      return out;
    },
    put: upsert,
    async get(col, id){ const {rows} = await pool.query('SELECT data FROM docs WHERE col=$1 AND id=$2', [col, id]); return rows.length ? rows[0].data : null; },
    async del(col, id){ await pool.query('DELETE FROM docs WHERE col=$1 AND id=$2', [col, id]); },
    async setConfig(id, data){ await upsert('config', id, data); },
    async log(entry){ await pool.query('INSERT INTO bitacora (entry) VALUES ($1)', [entry]); },
  };
}

// ---------------- HTTP ----------------
function send(res, status, body, type = 'application/json; charset=utf-8'){
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'});
  res.end(payload);
}
function authorized(req){
  if(!APP_PASSWORD) return true;
  const h = req.headers.authorization || '';
  if(!h.startsWith('Basic ')) return false;
  const pass = Buffer.from(h.slice(6), 'base64').toString('utf8').split(':').slice(1).join(':');
  const a = Buffer.from(pass), b = Buffer.from(APP_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function readJson(req){
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if(size > MAX_BODY){ reject(Object.assign(new Error('too large'), {status:413})); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try{ resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }catch(e){ reject(Object.assign(e, {status:400})); } });
    req.on('error', reject);
  });
}
const validId = id => /^[A-Za-z0-9_.:@+~-]{1,200}$/.test(id);
const isObject = v => v && typeof v === 'object' && !Array.isArray(v);

function pageHtml(){
  // la página se escribe sin <head> propio (formato Artifact); aquí se envuelve
  const body = fs.readFileSync(PAGE_FILE, 'utf8');
  return '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' +
    body + '</body></html>';
}

// Constructor SMART 2026 original, sin cambios, con el almacenamiento compartido inyectado antes de su script
function legacyHtml(){
  const body = fs.readFileSync(LEGACY_FILE, 'utf8');
  const shim = fs.readFileSync(LEGACY_SHIM, 'utf8');
  return '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Constructor de Objetivos SMART 2026</title><script>' + shim + '</script></head><body>' +
    body + '</body></html>';
}
const LEGACY_KEYS = new Set(['objectives-v3', 'registros-v2', 'gerencias-v1', 'audit-log-v1', 'periodos-v1']);

async function main(){
  const store = process.env.DATABASE_URL ? await pgStore(process.env.DATABASE_URL) : fileStore();
  console.log(`Almacenamiento: ${store.kind}${APP_PASSWORD ? ' · acceso con contraseña' : ' · SIN contraseña (define APP_PASSWORD)'}`);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    try{
      if(p === '/api/health') return send(res, 200, {ok: true, store: store.kind});
      if(!authorized(req)){
        res.writeHead(401, {'WWW-Authenticate': 'Basic realm="Objetivos FRIGOR", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8'});
        return res.end('Acceso restringido');
      }
      if(req.method === 'GET' && (p === '/' || p === '/index.html')) return send(res, 200, pageHtml(), 'text/html; charset=utf-8');
      if(req.method === 'GET' && (p === '/constructor' || p === '/constructor/')) return send(res, 200, legacyHtml(), 'text/html; charset=utf-8');
      let k = /^\/(?:constructor\/)?api\/kv\/([a-z0-9-]+)$/.exec(p);
      if(k){
        if(!LEGACY_KEYS.has(k[1])) return send(res, 404, {error: 'clave desconocida'});
        if(req.method === 'GET'){ const d = await store.get('kv', k[1]); return send(res, 200, {value: d ? d.value : null}); }
        if(req.method === 'PUT'){
          const d = await readJson(req);
          if(!isObject(d) || typeof d.value !== 'string') return send(res, 400, {error: 'se espera {value: texto}'});
          try{ JSON.parse(d.value); }catch(e){ return send(res, 400, {error: 'value debe ser JSON'}); }
          await store.put('kv', k[1], {value: d.value}); return send(res, 200, {ok: true});
        }
      }
      if(req.method === 'GET' && p === '/api/state') return send(res, 200, await store.all());

      let m = /^\/api\/(objetivos|evaluaciones|cierres)\/([^/]+)$/.exec(p);
      if(m && COLLECTIONS.has(m[1])){
        const id = decodeURIComponent(m[2]);
        if(!validId(id)) return send(res, 400, {error: 'id inválido'});
        if(req.method === 'PUT'){
          const data = await readJson(req);
          if(!isObject(data)) return send(res, 400, {error: 'se espera un objeto JSON'});
          await store.put(m[1], id, data); return send(res, 200, {ok: true});
        }
        if(req.method === 'DELETE'){ await store.del(m[1], id); return send(res, 200, {ok: true}); }
      }
      m = /^\/api\/config\/([a-z0-9-]+)$/.exec(p);
      if(m && req.method === 'PUT'){
        const data = await readJson(req);
        if(!isObject(data)) return send(res, 400, {error: 'se espera un objeto JSON'});
        await store.setConfig(m[1], data); return send(res, 200, {ok: true});
      }
      if(p === '/api/bitacora' && req.method === 'POST'){
        const e = await readJson(req);
        const entry = {f: new Date().toISOString(), quien: String(e.quien || 'Sin nombre').slice(0, 120),
          accion: String(e.accion || '').slice(0, 120), detalle: String(e.detalle || '').slice(0, 1000)};
        await store.log(entry); return send(res, 200, {ok: true});
      }
      return send(res, 404, {error: 'no encontrado'});
    }catch(err){
      console.error(err);
      return send(res, err.status || 500, {error: err.status ? err.message : 'error interno'});
    }
  });
  server.listen(PORT, () => console.log(`Objetivos FRIGOR escuchando en el puerto ${PORT}`));
}

main().catch(err => { console.error(err); process.exit(1); });
