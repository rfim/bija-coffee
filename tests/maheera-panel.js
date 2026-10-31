#!/usr/bin/env node
// The Maheera tab with Kenduri's shared <maheera-panel> (vendor/maheera-panel.js), on the live-backend code path
// (?backend=supabase) with Bija's Supabase and the shared "maheera-panel" function mocked by Playwright. Nothing leaves
// the machine; the PIN and email are fake. The bundle (tests/maheera-bundle.json) is Maheera's demo café data with
// Bija's settings: ink colour, "bar", "drinks and cakes", Bar prep.
// Checks: staff-only, one GET with the session token, Bija's own name and words, a redraw keeps the same panel,
// the panel's "no access" state, the older view when the function isn't deployed (404), and Exit drops it. The back
// office is light only, so the panel is told to stay light.
// Usage: node tests/maheera-panel.js   (serve the repo root first, see tests/README.md). SHOTS=dir saves screenshots.
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { BASE } = require('./tools/common');

let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('playwright is not installed. See tests/README.md.'); process.exit(2); }

const SB = 'https://nvsampchuozqbtavuugx.supabase.co';
const EMAIL = 'barista@example.com', PIN = '24681357';
const UID = '00000000-0000-4000-8000-00000000b11a';
const BUNDLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'maheera-bundle.json'), 'utf8'));

async function newPage(browser, fn, opts = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', ...opts });
  const state = { staff: false, calls: [], legacy: 0, fn };
  if (context.routeWebSocket) await context.routeWebSocket(/supabase\.co/, (ws) => ws.close());
  const exp = () => new Date(Date.now() + 30 * 60e3).toISOString();
  const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  await context.route(`${SB}/**`, async (route) => {
    const req = route.request(), p = new URL(req.url()).pathname;
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    const user = { id: UID, aud: 'authenticated', role: 'authenticated', is_anonymous: true, app_metadata: {}, user_metadata: {}, identities: [], created_at: new Date().toISOString() };
    if (p === '/auth/v1/signup' || p === '/auth/v1/token') return json(route, 200, { access_token: 'test-access-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r', user });
    if (p === '/auth/v1/user') return json(route, 200, user);
    if (p === '/rest/v1/rpc/staff_unlock') { const b = req.postDataJSON(); state.staff = b.email === EMAIL && b.pin === PIN; return json(route, 200, state.staff ? { ok: true, expires_at: exp() } : { ok: false, reason: 'wrong' }); }
    if (p === '/rest/v1/rpc/staff_touch') return json(route, 200, state.staff ? { ok: true, expires_at: exp() } : { ok: false, expires_at: null });
    if (p === '/rest/v1/rpc/staff_lock') { state.staff = false; return json(route, 200, null); }
    if (p.startsWith('/rest/v1/rpc/')) return json(route, 200, null);
    if (p.startsWith('/rest/v1/')) return req.headers()['accept'] === 'application/vnd.pgrst.object+json' ? json(route, 406, { code: 'PGRST116' }) : json(route, 200, []);
    if (p === '/functions/v1/maheera-panel') {
      state.calls.push({ auth: req.headers()['authorization'], method: req.method() });
      if (!state.staff) return json(route, 403, { error: 'not_allowed' });
      const [status, body] = state.fn(state.calls.length);
      return json(route, status, body);
    }
    if (p === '/functions/v1/maheera') { state.legacy++; return json(route, 200, { today: '2026-10-31', missing: [], stock: [], reorder: [], dishes: [], pnl: [], brief: null }); }
    return json(route, 404, {});
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  return { context, page, state, errors };
}
const settle = (page, ms = 400) => page.waitForTimeout(ms);
async function unlock(page) {
  await page.goto(`${BASE}/app.html?view=bar&backend=supabase`, { waitUntil: 'load' });
  await page.locator('#pin-email').waitFor({ timeout: 15000 });
  await page.locator('#pin-email').fill(EMAIL);
  for (const d of PIN) await page.locator('#pinsheet [data-act="pin-key"]').filter({ hasText: new RegExp(`^\\s*${d}\\s*$`) }).first().click();
  await page.waitForFunction(() => document.body.classList.contains('barista-view'), null, { timeout: 10000 });
}
async function openPanel(page) {
  await page.locator('#tabs [data-act="tab"][data-v="maheera"]').click();
  await page.waitForFunction(() => ['ready', 'error'].includes(document.querySelector('#mh-slot maheera-panel')?.state), null, { timeout: 10000 });
  await settle(page, 300);
}
const shadow = (page, sel) => page.evaluate((s) => [...(document.querySelector('maheera-panel')?.shadowRoot?.querySelectorAll(s) || [])].map((e) => e.textContent.trim()), sel);
const SHOTS = process.env.SHOTS ? path.resolve(process.env.SHOTS) : '';
async function shot(page, name) { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); }
const ok = () => [200, BUNDLE];

(async () => {
  const browser = await chromium.launch();
  const tests = [];
  const test = (name, fn, mock = ok, opts) => tests.push([name, fn, mock, opts]);

  test("the panel shows Bija's own look, from one GET with the staff session's token", async ({ page, state }) => {
    await unlock(page);
    assert.equal(state.calls.length, 0, 'nothing is fetched until the tab is opened');
    await openPanel(page);
    assert.equal(await page.evaluate(() => document.querySelector('maheera-panel').state), 'ready');
    assert.deepEqual(state.calls, [{ auth: 'Bearer test-access-token', method: 'GET' }]);
    assert.equal(state.legacy, 0, 'the older function is not called');
    const tabs = (await shadow(page, '[role=tab]')).join(' | ');
    assert.match(tabs, /Bar prep/); assert.match(tabs, /Menu/);
    const theme = await page.evaluate(() => document.querySelector('maheera-panel').theme);
    assert.equal(theme.light.charts, 'maheera', 'ink is too grey for charts: they keep Maheera indigo');
    assert.equal(await page.evaluate(() => document.querySelector('maheera-panel').resolvedConfig.theme.mode), 'light', 'light only, like the back office');
    const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(w <= 1, `page scrolls sideways by ${w}px`);
    await shot(page, 'panel-390-light');
  });

  test('a redraw keeps the same panel; leaving the tab and coming back does not fetch again', async ({ page, state }) => {
    await unlock(page); await openPanel(page);
    await page.locator('#tabs [data-act="tab"][data-v="queue"]').click(); await settle(page);
    await page.locator('#tabs [data-act="tab"][data-v="maheera"]').click(); await settle(page);
    assert.equal(await page.evaluate(() => document.querySelector('#mh-slot maheera-panel')?.state), 'ready');
    assert.equal(state.calls.length, 1);
  });

  test("the function says no: the panel's own no-access state", async ({ page }) => {
    await unlock(page); await openPanel(page);
    assert.equal(await page.evaluate(() => document.querySelector('maheera-panel').state), 'error');
    assert.match((await shadow(page, '[role=alert]')).join(' '), /access/i);
  }, () => [403, { error: 'not_allowed' }]);

  test("function not deployed yet (404): the older Maheera view, read through 'maheera'", async ({ page, state }) => {
    await unlock(page);
    await page.locator('#tabs [data-act="tab"][data-v="maheera"]').click();
    await page.waitForFunction(() => /Kenduri's shared back office/.test(document.getElementById('main').innerText), null, { timeout: 10000 });
    assert.equal(await page.locator('maheera-panel').count(), 0);
    assert.equal(state.legacy, 1);
  }, () => [404, {}]);

  test('Exit drops the panel and its figures', async ({ page }) => {
    await unlock(page); await openPanel(page);
    await page.locator('[data-act="view"][data-v="customer"]').first().click(); await settle(page);
    assert.equal(await page.locator('maheera-panel').count(), 0);
  });

  test('phone dark, desktop light and dark', async ({ browser }) => {
    for (const [name, opts] of [['panel-390-dark', { colorScheme: 'dark' }], ['panel-1440-light', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }], ['panel-1440-dark', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' }]]) {
      const t = await newPage(browser, ok, opts);
      await unlock(t.page); await openPanel(t.page);
      assert.equal(await t.page.evaluate(() => document.querySelector('maheera-panel').state), 'ready', name);
      await shot(t.page, name);
      assert.deepEqual(t.errors, [], name);
      await t.context.close();
    }
  });

  let failed = 0;
  for (const [name, fn, mock, opts] of tests) {
    const t = await newPage(browser, mock, opts);
    try { await fn({ ...t, browser }); assert.deepEqual(t.errors, [], 'page errors'); console.log(`ok   ${name}`); }
    catch (e) { failed++; console.log(`FAIL ${name}\n     ${String(e.message).split('\n').slice(0, 4).join(' | ')}`); }
    await t.context.close();
  }
  await browser.close();
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed ? 1 : 0);
})();
