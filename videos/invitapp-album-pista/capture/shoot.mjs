// Captura las pantallas reales de la app (Álbum + La Pista) con datos de demostración.
// El back se simula interceptando las llamadas: no se toca ninguna base de datos.
// Uso: node capture/shoot.mjs   (con `ng serve --port 4300` corriendo en el proyecto Angular)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_CORE);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.join(HERE, 'media');
const COVERS = path.join(HERE, 'covers');
const OUT = path.join(HERE, 'screens');
const SITE = 'http://localhost:4300';
const API = 'https://casa-de-moda.herokuapp.com/api/';
const CDN = 'https://media.demo/';
const INV = 'demo-boda-ana-pedro';
const CODE = 'boda-ana-pedro-k7f3x2';
const ONLY = process.argv[2] || '';

// ---------- Datos de demostración ----------
const dims = Object.fromEntries(
  fs.readFileSync(path.join(MEDIA, 'dims.txt'), 'utf8').trim().split('\n').map((l) => {
    const [f, w, h] = l.trim().split(/\s+/);
    return [f, { w: +w, h: +h }];
  }),
);
const img = (f) => ({ type: 'image', url: CDN + f, thumbUrl: CDN + f, width: dims[f].w, height: dims[f].h });
const vid = (f, poster) => ({ type: 'video', url: CDN + f, thumbUrl: CDN + poster, width: 720, height: 1280, duration: 5 });
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const seedPosts = [
  ['Tía Carmen', '¡Qué bonita celebración! 💕', [img('foto-050.jpg')], 18],
  ['Andrés', '', [vid('video-130.mp4', 'foto-130.jpg')], 24],
  ['Laura M.', 'Las damas más lindas', [img('foto-298.jpg'), img('foto-292.jpg'), img('foto-047.jpg')], 15],
  ['Primo Juan', '', [img('foto-008.jpg')], 9],
  ['Sofi', '¡Felicidades! 🎉', [img('foto-019.jpg')], 21],
  ['Don Héctor', '', [img('foto-022.jpg')], 4],
  ['Valentina', 'Me encantó la decoración', [img('foto-021.jpg')], 7],
  ['Camilo', '', [img('foto-007.jpg')], 12],
  ['Tía Carmen', '', [img('foto-132.jpg')], 11],
  ['Andrés', '', [img('foto-004.jpg')], 16],
  ['Sofi', 'Los mejores momentos', [img('foto-029.jpg')], 13],
  ['Valentina', '', [img('foto-277.jpg')], 6],
  ['Primo Juan', '', [img('foto-017.jpg')], 10],
  ['Laura M.', '', [img('foto-291.jpg')], 8],
  ['Camilo', '', [img('foto-101.jpg')], 14],
  ['Don Héctor', '', [img('foto-080.jpg')], 5],
  ['Sofi', '', [img('foto-295.jpg')], 3],
  ['Andrés', '', [img('foto-084.jpg')], 2],
].map(([name, caption, media, likes], i) => ({
  _id: `p${i}`, author: { name, isMine: false }, caption, media, likes, liked: false,
  status: 'visible', createdAt: minsAgo((i + 1) * 9),
}));
// dos por aprobar y una oculta, para mostrar la moderación
seedPosts.push(
  { _id: 'pp1', author: { name: 'Mateo', isMine: false }, caption: '¡Salud por los novios! 🥂', media: [img('foto-276.jpg')], likes: 0, liked: false, status: 'pending', createdAt: minsAgo(2) },
  { _id: 'pp2', author: { name: 'Isabella', isMine: false }, caption: '', media: [img('foto-197.jpg')], likes: 0, liked: false, status: 'pending', createdAt: minsAgo(3) },
);

let posts = seedPosts.map((p) => ({ ...p }));
let requireApproval = false;
const uploads = []; // archivos que sube el invitado, en orden (archivo, miniatura, archivo, …)
const uploadQueue = ['foto-064.jpg', 'video-064.mp4', 'foto-290.jpg'];

const songs = JSON.parse(fs.readFileSync(path.join(HERE, 'songs.json'), 'utf8'));
const song = (key) => ({
  spotifyId: key, name: songs[key].name, artists: songs[key].artists, albumName: songs[key].album,
  albumImage: `${CDN}covers/${key}.jpg`, duration_ms: songs[key].ms,
  spotifyUri: `spotify:track:${key}`, spotifyUrl: `https://open.spotify.com/track/${key}`,
});
const party = {
  _id: 'party1', name: 'Boda Ana & Pedro', code: CODE, status: 'active', id_invitacion: INV,
  config: { maxRequestsPerUser: 5, cooldownMinutes: 2, allowDuplicates: false }, createdAt: minsAgo(500), updatedAt: minsAgo(5),
};
const sections = [
  { _id: 's-gen', party_id: 'party1', genre: 'General', top_count: 3, status: 'open', is_general: true, winners: [] },
  { _id: 's-salsa', party_id: 'party1', genre: 'Salsa', horario: '10:00 PM', top_count: 3, status: 'scheduled', is_general: false, winners: [] },
];
const me = { session_id: 'guest-laura', name: 'Laura', email: 'laura@correo.com' };
const guest = (name) => ({ session_id: `g-${name}`, name, email: '' });
const likers = (n) => Array.from({ length: n }, (_, i) => `g-${i}`);
let requests = [
  ['vivir-mi-vida', 'Camilo', 'playing', 14],
  ['la-bicicleta', 'Sofi', 'queued', 11],
  ['provenza', 'Valentina', 'queued', 9],
  ['tusa', 'Andrés', 'pending', 7],
  ['la-gota-fria', 'Don Héctor', 'pending', 5],
  ['cali-pachanguero', 'Primo Juan', 'pending', 3],
  ['robarte-un-beso', 'Tía Carmen', 'played', 12],
  ['despacito', 'Mateo', 'rejected', 1],
].filter(([k]) => songs[k]).map(([key, name, status, n], i) => ({
  _id: `r${i}`, party_id: 'party1', section_id: 's-gen', song: song(key), suggested_by: guest(name),
  likes: n, liked_by: likers(n), status, createdAt: minsAgo(60 - i * 5), updatedAt: minsAgo(3),
}));

// ---------- Back simulado ----------
const ok = (data, extra = {}) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data, ...extra }) });
const notFound = () => ({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Not found' }) });
const gallery = () => ({
  id_invitacion: INV, status: 'open', requireApproval, maxUploadsPerGuest: 30,
  limits: { maxImageMB: 15, maxVideoMB: 100, maxVideoSeconds: 60, maxFilesPerPost: 10, maxUploadsPerGuest: 30 },
});
const stats = () => {
  const media = posts.flatMap((p) => p.media);
  return {
    posts: posts.length, images: 212 + media.filter((m) => m.type === 'image').length,
    videos: 17 + media.filter((m) => m.type === 'video').length,
    pending: posts.filter((p) => p.status === 'pending').length, hidden: posts.filter((p) => p.status === 'hidden').length,
    guests: 64, totalBytes: 3.4 * 1024 ** 3,
  };
};

function handleApi(method, url, body) {
  const u = new URL(url);
  const p = u.pathname.replace(/^\/api\//, '');
  const q = u.searchParams;
  let m;

  if ((m = p.match(/^invitation-template\/get-one-invitation-template-by-invitation\/(.+)$/))) {
    return ok({ id_invitation: INV, slug: 'ana-pedro', active: true, template: 'xyz', data: { names1: 'Ana', names2: 'Pedro', title: 'Nuestra boda' } });
  }
  // ----- Álbum -----
  if (p === `galeria/by-invitation/${INV}`) return ok(gallery());
  if (p === `galeria/${INV}/posts` && method === 'GET') {
    const mine = q.get('mine') === '1';
    const items = posts.filter((x) => (mine ? x.author.isMine : x.status === 'visible' || (x.author.isMine && x.status === 'pending')));
    return ok({ items: q.get('after') ? [] : items, nextCursor: null });
  }
  if (p === `galeria/${INV}/upload-url`) {
    const start = uploads.length;
    body.files.forEach((f) => uploads.push(f.kind));
    return ok(body.files.map((_, i) => ({ key: `galeria/${INV}/up-${start + i}`, uploadUrl: `${CDN}upload/${start + i}` })));
  }
  if (p === `galeria/${INV}/posts` && method === 'POST') {
    const media = body.media.map((mm, i) => {
      const file = uploadQueue[i] ?? 'foto-064.jpg';
      return file.endsWith('.mp4') ? vid(file, 'foto-064.jpg') : img(file);
    });
    const post = { _id: `mine${posts.length}`, author: { name: body.author_name, isMine: true }, caption: body.caption || '', media, likes: 0, liked: false, status: requireApproval ? 'pending' : 'visible', createdAt: new Date().toISOString() };
    posts = [post, ...posts];
    return ok(post);
  }
  if ((m = p.match(/^galeria\/posts\/(.+)\/like$/))) {
    const post = posts.find((x) => x._id === m[1]);
    post.liked = !post.liked; post.likes += post.liked ? 1 : -1;
    return ok({ likes: post.likes, liked: post.liked });
  }
  if (p === `galeria/${INV}/admin`) { const { limits, ...g } = gallery(); return ok({ gallery: g, stats: stats() }); }
  if (p === `galeria/${INV}/admin/posts`) {
    const s = q.get('status');
    return ok({ items: s ? posts.filter((x) => x.status === s) : posts, nextCursor: null });
  }
  if ((m = p.match(/^galeria\/posts\/(.+)\/status$/))) {
    const post = posts.find((x) => x._id === m[1]); post.status = body.status; return ok(post);
  }
  if (p === `galeria/${INV}/config`) { if (body.requireApproval !== undefined) requireApproval = body.requireApproval; return ok(gallery()); }

  // ----- La Pista -----
  if (p === `party/by-invitation/${INV}`) return ok(party);
  if (p === `party/by-code/${CODE}` || p === `party/by-code/${CODE}/access`) return ok(party);
  if (p === 'section/by-party/party1') return ok(sections);
  if ((m = p.match(/^section\/(.+)\/ranking$/))) return ok([]);
  if (p === 'request/by-party/party1') return ok(requests);
  if (p === 'song/search') {
    const keys = ['quedate', 'quedate-5020', 'quedate-single'];
    return ok({ tracks: keys.filter((k) => songs[k]).map(song) });
  }
  if (p === 'request/create') {
    const r = { _id: `r${requests.length}`, party_id: 'party1', section_id: body.section_id, song: body.song, suggested_by: body.guest, likes: 0, liked_by: [], status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    requests = [...requests, r];
    return ok(r);
  }
  if ((m = p.match(/^request\/(.+)\/like$/))) {
    const r = requests.find((x) => x._id === m[1]);
    const has = r.liked_by.includes(body.session_id);
    r.liked_by = has ? r.liked_by.filter((s) => s !== body.session_id) : [...r.liked_by, body.session_id];
    r.likes = r.liked_by.length;
    return ok(r);
  }
  if ((m = p.match(/^request\/(.+)\/status$/))) {
    const r = requests.find((x) => x._id === m[1]);
    if (body.status === 'playing') requests.forEach((x) => { if (x.status === 'playing') x.status = 'played'; });
    r.status = body.status;
    return ok(r);
  }
  if (p === 'party/party1/status') { party.status = body.status; return ok(party); }
  console.warn('  [sin simular]', method, p);
  return notFound();
}

const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' };
function serveFile(file, req) {
  const buf = fs.readFileSync(file);
  const type = MIME[path.extname(file)] || 'application/octet-stream';
  const range = req.headers()['range'];
  if (range && type === 'video/mp4') {
    const [s, e] = range.replace('bytes=', '').split('-');
    const start = +s; const end = e ? +e : buf.length - 1;
    return { status: 206, contentType: type, headers: { 'Content-Range': `bytes ${start}-${end}/${buf.length}`, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' }, body: buf.subarray(start, end + 1) };
  }
  return { status: 200, contentType: type, headers: { 'Access-Control-Allow-Origin': '*', 'Accept-Ranges': 'bytes' }, body: buf };
}

// ---------- Navegador ----------
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
await page.setRequestInterception(true);
page.on('request', (req) => {
  const url = req.url();
  const method = req.method();
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
  if (url.startsWith(API) || url.startsWith(CDN)) {
    if (method === 'OPTIONS') return req.respond({ status: 204, headers: cors, body: '' });
  }
  if (url.startsWith(API)) {
    let body = {};
    try { body = JSON.parse(req.postData() || '{}'); } catch {}
    const r = handleApi(method, url, body);
    return req.respond({ ...r, headers: { ...cors, ...(r.headers || {}) } });
  }
  if (url.startsWith(CDN + 'upload/')) return req.respond({ status: 200, headers: cors, body: '' });
  if (url.startsWith(CDN + 'covers/')) return req.respond(serveFile(path.join(COVERS, url.slice((CDN + 'covers/').length)), req));
  if (url.startsWith(CDN)) return req.respond(serveFile(path.join(MEDIA, url.slice(CDN.length)), req));
  if (url.startsWith(SITE) || url.startsWith('data:') || url.startsWith('blob:') || url.includes('fonts.g')) return req.continue();
  return req.respond({ status: 204, body: '' }); // nada sale a internet (analítica, etc.)
});
page.on('pageerror', (e) => console.warn('  [error de página]', e.message));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(name) {
  if (ONLY && !name.startsWith(ONLY)) return;
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('  ✓', name);
}
async function clickText(selector, text) {
  const ok = await page.evaluate((sel, t) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().includes(t));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, selector, text);
  if (!ok) throw new Error(`No encontré "${text}" en ${selector}`);
  await sleep(700);
}
async function waitImages() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => i.getBoundingClientRect().top < innerHeight);
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await sleep(600);
}
async function go(url, setup) {
  await page.goto(SITE + '/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((s) => { localStorage.clear(); s && Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)); }, setup || null);
  await page.goto(SITE + url, { waitUntil: 'networkidle0' });
  await waitImages();
}

// ===== Álbum: invitado =====
console.log('Álbum · invitado');
await go(`/invitation/galeria/${INV}`);
await shot('a01-album-grid');

await page.evaluate(() => window.scrollTo(0, 420));
await waitImages();
await shot('a02-album-grid-scroll');
await page.evaluate(() => window.scrollTo(0, 0));

// subir: 1 foto del baile, el video del baile y el brindis
const input = await page.$('input[type=file]');
await input.uploadFile(...uploadQueue.map((f) => path.join(MEDIA, f)));
await page.waitForFunction(() => document.querySelectorAll('.picks__item:not(.picks__item--loading)').length >= 3, { timeout: 30000 });
await sleep(800);
await page.type('input[placeholder="Así te verán los demás"]', 'Laura', { delay: 40 });
await page.type('[placeholder="¡Qué bonita noche!"]', 'El primer baile 💃', { delay: 40 });
await shot('a03-composer');

await clickText('button', 'Publicar');
await page.waitForFunction(() => !document.querySelector('.sheet'), { timeout: 30000 });
await waitImages();
await shot('a04-published-grid');

await page.click('.scope__btn:nth-child(2)');
await sleep(900);
await waitImages();
await shot('a05-mis-fotos');
await page.click('.scope__btn:nth-child(1)');
await sleep(900);

// vista de una en una + like con doble toque
await page.click('.gal__tab:nth-child(2)');
await sleep(900);
await waitImages();
await shot('a06-feed');
const media = await page.$('.post__media');
await media.click({ count: 2, delay: 80 });
await sleep(250);
await shot('a07-feed-like');
await sleep(900);
// el video publicado (segunda foto del carrusel del post propio) y el de bengalas
await page.evaluate(() => {
  const v = [...document.querySelectorAll('video')].find((x) => x.getBoundingClientRect().top > 0);
  v?.scrollIntoView({ block: 'center' });
});
await sleep(1500);
await shot('a08-feed-video');

// ===== Álbum: panel de los novios =====
console.log('Álbum · panel de los novios');
await go(`/invitation/galeria/${INV}/admin?token=demo-host`);
await shot('b01-admin-top');
await page.evaluate(() => document.querySelector('.mod')?.scrollIntoView({ block: 'start' }));
await waitImages();
await shot('b02-admin-mod');
await clickText('.filter', 'Por aprobar');
await waitImages();
await shot('b03-admin-pending');
await clickText('button.act--ok', 'Aprobar');
await sleep(600);
await shot('b04-admin-approved');

// ===== Cambio de app =====
console.log('Cambio de app');
await go(`/invitation/galeria/${INV}`, { galeria_guest: JSON.stringify({ session_id: 'g-laura', name: 'Laura', email: 'laura@correo.com' }) });
await shot('c01-album-pill');
await page.click('.app-switch');
await page.waitForSelector('.brand', { timeout: 15000 });
await waitImages();
await shot('c02-pista-entrada');

// ===== La Pista: invitado =====
console.log('La Pista · invitado');
await clickText('button', 'Entrar');
await sleep(1200);
await waitImages();
await shot('m01-pista-home');
await page.type('.search__input', 'quedate beele', { delay: 60 });
await sleep(1500);
await waitImages();
await shot('m02-search');
const pedir = await page.$('.btn--suggest');
await pedir?.click();
await sleep(1200);
await page.evaluate(() => document.querySelector('.tabs, .requests, .list')?.scrollIntoView({ block: 'start' }));
await waitImages();
await shot('m03-requested');
// like a otra canción
await page.evaluate(() => document.querySelector('.like-btn:not(.like-btn--active)')?.click());
await sleep(800);
await shot('m04-liked');
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(500);
await shot('m05-now-playing');
const lauraSession = await page.evaluate(() => localStorage.getItem('party_guest'));
const asLaura = { party_guest: lauraSession, galeria_guest: JSON.stringify({ session_id: 'g-laura', name: 'Laura', email: 'laura@correo.com' }) };

// ===== La Pista: DJ =====
console.log('La Pista · DJ');
await go(`/dj/${CODE}?token=demo-dj`);
await sleep(800);
await shot('d01-dj-top');
await page.evaluate(() => window.scrollTo(0, 520));
await waitImages();
await shot('d02-dj-list');
// el DJ acepta la canción de Laura (en cola)
async function djAction(song, btn) {
  const done = await page.evaluate((t, b) => {
    const card = [...document.querySelectorAll('.req-card')].find((c) => c.textContent.includes(t));
    const button = card && [...card.querySelectorAll('button')].find((x) => x.textContent.trim() === b);
    if (!button) return false;
    card.scrollIntoView({ block: 'center' });
    button.click();
    return true;
  }, song, btn);
  if (!done) throw new Error(`DJ: no encontré "${btn}" en "${song}"`);
  await sleep(900);
}
await djAction('quédate', 'En cola');
await shot('d03-dj-queued');

// Laura ve que el DJ la aceptó
await go(`/fiesta/${CODE}`, asLaura);
await clickText('button', 'Mis pedidos');
await sleep(800);
await waitImages();
await shot('m06-mine-queued');

// el DJ la pone
await go(`/dj/${CODE}?token=demo-dj`);
await djAction('quédate', 'Poner ahora');
await sleep(5000); // el panel se refresca solo cada 4 s
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(600);
await waitImages();
await shot('d04-dj-playing');

// Laura la escucha: sonando ahora, con el fondo teñido por la carátula
await go(`/fiesta/${CODE}`, asLaura);
await sleep(1500);
await waitImages();
await shot('m07-guest-playing');
await clickText('button', 'Mis pedidos');
await sleep(800);
await shot('m08-mine-playing');

await browser.close();
console.log('Listo →', OUT);
