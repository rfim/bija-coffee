#!/usr/bin/env node
// The "maheera" Edge Function (supabase/functions/maheera/index.ts), run in Node with a mocked fetch: Bija's Supabase
// (staff check with the caller's token), Neon Auth (sign-in, get-session) and Maheera's Data API. No network.
// Needs Node 22.18 or later (TypeScript type stripping is on by default). Usage: node tests/maheera-function.js
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

const SB = 'https://bija.supabase.test', AUTH = 'https://auth.neon.test/neondb/auth', DATA = 'https://data.neon.test/neondb/rest/v1';
const RID = '5b0c1b3e-2a7e-4c1d-9a51-6f1f6a0e0b11';
const SECRETS = { SUPABASE_URL: SB, SUPABASE_ANON_KEY: 'anon', MAHEERA_AUTH_URL: AUTH + '/', MAHEERA_DATA_API_URL: DATA, MAHEERA_BIJA_EMAIL: 'bija@kenduri.test', MAHEERA_BIJA_PASSWORD: 'pw' };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const makeJwt = (expMs) => `${b64({ alg: 'EdDSA' })}.${b64({ sub: 'bija', exp: Math.floor(expMs / 1000) })}.sig`;

// A small fake of the three services. `opts` changes how each one answers.
function world(opts = {}) {
  const log = [];
  let clock = Date.parse('2026-10-30T10:00:00Z'), jwtN = 0, stale = new Set();
  const res = (status, body, headers = {}) => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
  async function fetch(url, init = {}) {
    const u = String(url), h = new Headers(init.headers || {}), method = init.method || 'GET';
    log.push({ url: u, method, headers: Object.fromEntries(h), body: init.body });
    if (u.startsWith(SB + '/rest/v1/rpc/')) {
      if (h.get('authorization') !== 'Bearer caller-token') return res(401, { message: 'JWT invalid' });
      const fn = u.slice((SB + '/rest/v1/rpc/').length);
      if (fn === 'maheera_access') return opts.access === undefined ? res(404, { code: 'PGRST202' }) : res(200, opts.access);
      if (fn === 'staff_touch') return res(200, opts.staff === false ? { ok: false, expires_at: null } : { ok: true, expires_at: new Date(clock + 18e5).toISOString() });
      return res(404, {});
    }
    if (u === AUTH + '/sign-in/email') {
      if (opts.authDown) return res(500, { message: 'down' });
      const b = JSON.parse(init.body);
      if (b.email !== SECRETS.MAHEERA_BIJA_EMAIL || b.password !== SECRETS.MAHEERA_BIJA_PASSWORD) return res(401, {});
      const r = res(200, { ok: true });
      r.headers.append('Set-Cookie', '__Secure-neon-auth.session_token=sess123; Path=/; HttpOnly; Secure');
      r.headers.append('Set-Cookie', 'other=1; Path=/');
      return r;
    }
    if (u === AUTH + '/get-session') {
      if (!/neon-auth\.session_token=sess123/.test(h.get('cookie') || '')) return res(401, {});
      const t = makeJwt(clock + 15 * 60e3) + '.' + (++jwtN);
      return res(200, { session: {} }, { 'set-auth-jwt': t });
    }
    if (u.startsWith(DATA + '/')) {
      const tok = (h.get('authorization') || '').replace(/^Bearer /, '');
      if (!tok || stale.has(tok)) return res(401, { message: 'JWT expired' });
      if (opts.dataDown) return res(503, {});
      const p = u.slice(DATA.length + 1);
      if (p.startsWith('stock_on_hand?')) return res(200, [{ restaurant_id: RID, name: 'Oat milk', base_unit: 'ml', category: 'Milk', par_level: 12000, on_hand: 3000, below_par: true }]);
      if (p.startsWith('reorder_suggestions?')) return res(200, []);
      if (p.startsWith('dish_performance?')) return opts.dishesDown ? res(500, {}) : res(200, []);
      if (p.startsWith('daily_pnl?')) return res(200, []);
      if (p === 'rpc/daily_brief') return res(200, { day: JSON.parse(init.body).p_day, sales: { gross_sales: 412.5 }, same_weekday_avg_gross: 380, top_items: [], below_par: [{ name: 'Oat milk' }], purchase_orders_due: [], dishes_without_recipe: [], open_batch: null });
      return res(404, {});
    }
    throw new Error('unexpected fetch ' + u);
  }
  return { fetch, log, stale, tick: (ms) => { clock += ms; }, now: () => clock };
}
const env = (over = {}) => (k) => (k in over ? over[k] : SECRETS[k]) || '';
const post = (body = '{}', auth = 'Bearer caller-token') => new Request('https://fn.test/maheera', { method: 'POST', headers: { ...(auth ? { Authorization: auth } : {}), 'Content-Type': 'application/json' }, body });

(async () => {
  const mod = await import(pathToFileURL(path.join(__dirname, '..', 'supabase', 'functions', 'maheera', 'index.ts')).href);
  const { createHandler, queries } = mod;
  const tests = [];
  const test = (name, fn) => tests.push([name, fn]);

  test('OPTIONS answers CORS for any origin, POST only', async () => {
    const w = world(), h = createHandler(env(), w.fetch, w.now);
    const r = await h(new Request('https://fn.test/maheera', { method: 'OPTIONS' }));
    assert.equal(r.headers.get('access-control-allow-origin'), '*');
    assert.equal(r.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
    assert.equal((await h(new Request('https://fn.test/maheera'))).status, 405);
    assert.equal(w.log.length, 0);
  });

  test('no token: 401; bad token: 401; signed in without a staff session: 403', async () => {
    const w = world({ staff: false }), h = createHandler(env(), w.fetch, w.now);
    assert.equal((await h(post('{}', ''))).status, 401);
    assert.equal((await h(post('{}', 'Bearer nope'))).status, 401);
    const r = await h(post());
    assert.equal(r.status, 403);
    assert.deepEqual(await r.json(), { error: 'staff_only' });
    assert.ok(!w.log.some((x) => x.url.startsWith(AUTH) || x.url.startsWith(DATA)), 'Maheera is never called for a refused caller');
  });

  test('staff check runs as the caller: maheera_access first, staff_touch when it is not applied', async () => {
    const w = world(), h = createHandler(env(), w.fetch, w.now);
    assert.equal((await h(post())).status, 200);
    const sb = w.log.filter((x) => x.url.startsWith(SB));
    assert.deepEqual(sb.map((x) => x.url.split('/').pop()), ['maheera_access', 'staff_touch']);
    sb.forEach((x) => { assert.equal(x.headers.authorization, 'Bearer caller-token'); assert.equal(x.headers.apikey, 'anon'); });
    const owner = world({ access: true, staff: false });
    assert.equal((await createHandler(env(), owner.fetch, owner.now)(post())).status, 200, 'owner via maheera_access');
    const no = world({ access: false });
    assert.equal((await createHandler(env(), no.fetch, no.now)(post())).status, 403);
  });

  test('missing secrets: 503 setup (after the staff check), optional origin may be missing', async () => {
    for (const k of ['MAHEERA_AUTH_URL', 'MAHEERA_DATA_API_URL', 'MAHEERA_BIJA_EMAIL', 'MAHEERA_BIJA_PASSWORD']) {
      const w = world(), r = await createHandler(env({ [k]: '' }), w.fetch, w.now)(post());
      assert.equal(r.status, 503, k);
      assert.deepEqual(await r.json(), { error: 'setup' });
    }
  });

  test('signs in to Neon Auth, reads only the allow-list, ignores the request body', async () => {
    const w = world(), h = createHandler(env(), w.fetch, w.now);
    const r = await h(post(JSON.stringify({ path: 'staff?select=*', query: 'drop table x' })));
    assert.equal(r.status, 200);
    const j = await r.json();
    assert.equal(j.today, '2026-10-30');
    assert.equal(j.stock[0].name, 'Oat milk');
    assert.equal(j.brief.day, '2026-10-29');
    assert.deepEqual(j.missing, []);
    const signIn = w.log.find((x) => x.url === AUTH + '/sign-in/email');
    assert.equal(signIn.headers.origin, 'https://rfim.github.io');
    assert.deepEqual(JSON.parse(signIn.body), { email: 'bija@kenduri.test', password: 'pw' });
    const gs = w.log.find((x) => x.url === AUTH + '/get-session');
    assert.equal(gs.headers.cookie, '__Secure-neon-auth.session_token=sess123; other=1');
    assert.equal(gs.headers.origin, 'https://rfim.github.io');
    const q = queries('2026-10-30');
    const data = w.log.filter((x) => x.url.startsWith(DATA)).map((x) => x.url.slice(DATA.length + 1));
    assert.deepEqual(data.sort(), [...Object.values(q), 'rpc/daily_brief'].sort());
    assert.ok(q.stock.startsWith('stock_on_hand?select=restaurant_id,name,base_unit,category,par_level,on_hand,below_par&order=below_par.desc,name.asc'));
    assert.ok(q.pnl.includes('day=gte.2026-10-23&day=lte.2026-10-29'), 'last 7 days, up to yesterday');
    const brief = w.log.find((x) => x.url === DATA + '/rpc/daily_brief');
    assert.deepEqual(JSON.parse(brief.body), { p_restaurant: RID, p_day: '2026-10-29' });
    w.log.filter((x) => x.url.startsWith(DATA)).forEach((x) => assert.match(x.headers.authorization, /^Bearer [\w-]+\.[\w-]+\.sig\.1$/));
  });

  test('custom MAHEERA_AUTH_ORIGIN is sent', async () => {
    const w = world();
    await createHandler(env({ MAHEERA_AUTH_ORIGIN: 'https://bija.example' }), w.fetch, w.now)(post());
    assert.equal(w.log.find((x) => x.url === AUTH + '/sign-in/email').headers.origin, 'https://bija.example');
  });

  test('JWT is cached until 60 s before exp, and concurrent calls share one sign-in', async () => {
    const w = world(), h = createHandler(env(), w.fetch, w.now);
    const signIns = () => w.log.filter((x) => x.url === AUTH + '/sign-in/email').length;
    await Promise.all([h(post()), h(post()), h(post())]);
    assert.equal(signIns(), 1);
    w.tick(13 * 60e3); await h(post());
    assert.equal(signIns(), 1, 'still valid at 13 minutes');
    w.tick(60e3 + 1); await h(post());
    assert.equal(signIns(), 2, 'refreshed inside the last minute');
  });

  test('a 401 from the Data API clears the cache and retries once', async () => {
    const w = world(), h = createHandler(env(), w.fetch, w.now);
    await h(post());
    w.log.filter((x) => x.url.startsWith(DATA)).forEach((x) => w.stale.add(x.headers.authorization.replace('Bearer ', '')));
    const r = await h(post());
    assert.equal(r.status, 200);
    assert.deepEqual((await r.json()).missing, []);
    assert.equal(w.log.filter((x) => x.url === AUTH + '/sign-in/email').length, 2);
  });

  test('Maheera down: 502; one view down: 200 with it listed as missing; errors log codes only', async () => {
    const errs = []; const orig = console.error; console.error = (...a) => errs.push(a);
    try {
      let w = world({ authDown: true });
      let r = await createHandler(env(), w.fetch, w.now)(post());
      assert.equal(r.status, 502); assert.deepEqual(await r.json(), { error: 'maheera' });
      w = world({ dataDown: true });
      assert.equal((await createHandler(env(), w.fetch, w.now)(post())).status, 502);
      w = world({ dishesDown: true });
      r = await createHandler(env(), w.fetch, w.now)(post());
      assert.equal(r.status, 200);
      const j = await r.json();
      assert.deepEqual(j.missing, ['dishes']); assert.equal(j.dishes, null);
    } finally { console.error = orig; }
    const text = JSON.stringify(errs);
    assert.ok(errs.length > 0);
    assert.ok(!/pw|sess123|caller-token|bija@kenduri/.test(text), 'no secrets in logs: ' + text);
    errs.forEach((a) => { assert.equal(a[0], 'maheera'); assert.match(String(a[1]), /^[a-z_0-9]+$/); });
  });

  let failed = 0;
  for (const [name, fn] of tests) {
    try { await fn(); console.log('ok   ' + name); } catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + (e && e.stack || e)); }
  }
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
