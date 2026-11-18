#!/usr/bin/env node
// The Maheera tab in the back office (app-staff.js), on the live-backend code path (?backend=supabase) with Bija's
// Supabase and the "maheera" Edge Function mocked by Playwright. Nothing leaves the machine.
// Checks: staff-only (PIN first), the four sections with real-shaped rows, empty states, "Maheera isn't answering"
// with retry while the other tabs keep working, the setup message, and that figures are dropped on Exit.
// Usage: node tests/maheera-tab.js   (serve the repo root first, see tests/README.md). SHOTS=dir saves phone screenshots.
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { BASE, screenshot } = require('./tools/common');

// Maheera opens from the floating mark (the Maheera tab became the mark in Nov 2026): Insights first, then the switch
async function openMaheera(page) {
  const tab = page.locator('#tabs [data-act="tab"][data-v="maheera"]');
  if (await tab.count()) return tab.click();
  await page.locator('[data-act="mh-open"]:visible').first().click();
  await page.locator('[data-act="mh-view"][data-v="maheera"]').first().click();
}

let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('playwright is not installed. See tests/README.md.'); process.exit(2); }

const SB = 'https://nvsampchuozqbtavuugx.supabase.co';
const EMAIL = 'admin-oversee@bijacoffee.co.uk', PIN = '16091992';
const RID = '5b0c1b3e-2a7e-4c1d-9a51-6f1f6a0e0b11';
const UID = '00000000-0000-4000-8000-00000000b11a';
const londonDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const TODAY = londonDay(new Date()), YDAY = addDays(TODAY, -1);

// Rows shaped exactly like Maheera's views (README "Maheera")
const FULL = {
  today: TODAY, missing: [],
  stock: [
    { restaurant_id: RID, name: 'Oat milk', base_unit: 'ml', category: 'Milk', par_level: 12000, on_hand: 3000, below_par: true },
    { restaurant_id: RID, name: 'Gayo espresso beans', base_unit: 'g', category: 'Coffee', par_level: 5000, on_hand: 1800, below_par: true },
    { restaurant_id: RID, name: 'Whole milk', base_unit: 'ml', category: 'Milk', par_level: 20000, on_hand: 26000, below_par: false },
    { restaurant_id: RID, name: 'Lapis legit', base_unit: 'each', category: 'Cakes', par_level: null, on_hand: 6, below_par: false },
  ],
  reorder: [
    { restaurant_id: RID, ingredient_id: 'i1', name: 'Oat milk', base_unit: 'ml', on_hand: 3000, par_level: 12000, suggested_qty: 9000, supplier_item_id: 's1', pack_desc: '6 × 1 L', pack_price: 13.2, suggested_packs: 2 },
    { restaurant_id: RID, ingredient_id: 'i2', name: 'Gayo espresso beans', base_unit: 'g', on_hand: 1800, par_level: 5000, suggested_qty: 3200, supplier_item_id: null, pack_desc: null, pack_price: null, suggested_packs: null },
  ],
  dishes: [
    { restaurant_id: RID, item_id: 'fw', name: 'Flat White', category: 'Coffee', price: 3.9, qty: 210, gross: 819, net: 682.5, cogs: 136.5, margin_pct: 80, avg_stars: 4.8, ratings: 12 },
    { restaurant_id: RID, item_id: 'ks', name: 'Kopi Susu Aren', category: 'Coffee', price: 4.5, qty: 96, gross: 432, net: 360, cogs: 163.2, margin_pct: 54.7, avg_stars: null, ratings: 0 },
    { restaurant_id: RID, item_id: 'lapis', name: 'Lapis Legit', category: 'Cakes', price: 3, qty: 40, gross: 120, net: 100, cogs: null, margin_pct: null, avg_stars: null, ratings: 0 },
  ],
  pnl: [
    { restaurant_id: RID, day: YDAY, gross_sales: 412.5, net_sales: 343.75, cogs: 71.2, gross_profit: 272.55, waste_cost: 3.1, expenses: 0, operating_profit: 269.45, lines_without_recipe: 2, sales_without_detail: 1 },
    { restaurant_id: RID, day: addDays(TODAY, -2), gross_sales: 380, net_sales: 316.67, cogs: 66, gross_profit: 250.67, waste_cost: 0, expenses: 0, operating_profit: 250.67, lines_without_recipe: 0, sales_without_detail: 0 },
  ],
  brief: { day: YDAY, sales: { gross_sales: 412.5, net_sales: 343.75 }, same_weekday_avg_gross: 380, top_items: [{ name: 'Flat White', qty: 31 }, { name: 'Kopi Susu Aren', qty: 14 }],
    below_par: [{ name: 'Oat milk' }, { name: 'Gayo espresso beans' }], purchase_orders_due: [{ supplier: 'Oatly' }], dishes_without_recipe: [{ name: 'Lapis Legit' }], open_batch: null },
};
const EMPTY = { today: TODAY, missing: [], stock: [], reorder: [], dishes: [], pnl: [], brief: null };

// A fake of Bija's Supabase: anonymous sign-in, the staff PIN session, an empty docs table, and the maheera function.
async function newPage(browser, fn) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'reduce', bypassCSP: true }); // CSP would block the injected axe-core
  const state = { staff: false, calls: [], fn };
  if (context.routeWebSocket) await context.routeWebSocket(/supabase\.co/, (ws) => ws.close());
  const exp = () => new Date(Date.now() + 30 * 60e3).toISOString();
  const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  await context.route(`${SB}/**`, async (route) => {
    const req = route.request(), url = new URL(req.url()), p = url.pathname;
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    const user = { id: UID, aud: 'authenticated', role: 'authenticated', is_anonymous: true, app_metadata: {}, user_metadata: {}, identities: [], created_at: new Date().toISOString() };
    if (p === '/auth/v1/signup' || p === '/auth/v1/token') return json(route, 200, { access_token: 'test-access-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r', user });
    if (p === '/auth/v1/user') return json(route, 200, user);
    if (p === '/rest/v1/rpc/staff_unlock') { const b = req.postDataJSON(); state.staff = b.email === EMAIL && b.pin === PIN; return json(route, 200, state.staff ? { ok: true, expires_at: exp() } : { ok: false, reason: 'wrong' }); }
    if (p === '/rest/v1/rpc/staff_touch') return json(route, 200, state.staff ? { ok: true, expires_at: exp() } : { ok: false, expires_at: null });
    if (p === '/rest/v1/rpc/staff_lock') { state.staff = false; return json(route, 200, null); }
    if (p.startsWith('/rest/v1/rpc/')) return json(route, 200, null);
    if (p.startsWith('/rest/v1/')) return req.headers()['accept'] === 'application/vnd.pgrst.object+json' ? json(route, 406, { code: 'PGRST116' }) : json(route, 200, []);
    if (p === '/functions/v1/maheera') {
      state.calls.push({ auth: req.headers()['authorization'], apikey: req.headers()['apikey'], method: req.method() });
      if (!state.staff) return json(route, 403, { error: 'staff_only' });
      const [status, body] = state.fn(state.calls.length);
      return json(route, status, body);
    }
    return json(route, 404, {});
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  return { context, page, state, errors };
}
const settle = (page, ms = 400) => page.waitForTimeout(ms);
const main = (page) => page.locator('#main').innerText();
async function unlock(page) {
  await page.goto(`${BASE}/app.html?view=bar&backend=supabase`, { waitUntil: 'load' });
  await page.locator('#pin-email').waitFor({ timeout: 15000 });
  await page.locator('#pin-email').fill(EMAIL);
  for (const d of PIN) await page.locator('#pinsheet [data-act="pin-key"]').filter({ hasText: new RegExp(`^\\s*${d}\\s*$`) }).first().click();
  await page.waitForFunction(() => document.body.classList.contains('barista-view'), null, { timeout: 10000 });
}
async function openTab(page) {
  await openMaheera(page);
  await page.waitForFunction(() => !document.querySelector('#main [aria-busy="true"]') && /Maheera/.test(document.getElementById('main').innerText), null, { timeout: 10000 });
  await settle(page, 300);
}
async function sub(page, v) { await page.locator(`#main nav [data-act="mh-sub"][data-v="${v}"]`).click(); await settle(page, 250); }
async function noHorizontalScroll(page, what) {
  const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(w <= 1, `${what}: page scrolls sideways by ${w}px at phone width`);
}
// WCAG 2.2 AA on the screen as shown (axe-core, installed as in tests/README.md; skipped if it isn't there)
let AXE = ''; try { AXE = require.resolve('axe-core/axe.min.js', { paths: [__dirname, path.join(__dirname, 'node_modules')] }); } catch {}
async function axe(page, what) {
  if (!AXE) return;
  await page.addScriptTag({ path: AXE });
  const r = await page.evaluate(() => window.axe.run(document.getElementById('main'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }));
  assert.deepEqual(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), [], `${what}: accessibility violations`);
}
const SHOTS = process.env.SHOTS ? path.resolve(process.env.SHOTS) : '';
async function shot(page, name) { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); }

(async () => {
  const browser = await chromium.launch();
  const tests = [];
  const test = (name, fn, mock) => tests.push([name, fn, mock]);

  test('the tab is staff-only and calls the function with the session token', async ({ page, state }) => {
    await unlock(page);
    assert.equal(state.calls.length, 0, 'nothing is fetched until the tab is opened');
    await openTab(page);
    assert.equal(state.calls.length, 1);
    assert.equal(state.calls[0].method, 'POST');
    assert.equal(state.calls[0].auth, 'Bearer test-access-token');
    assert.ok(state.calls[0].apikey.startsWith('sb_publishable_'));
  });

  test('Today: yesterday vs the same weekday, top items, what needs attention', async ({ page }) => {
    await unlock(page); await openTab(page);
    const t = await main(page);
    assert.match(t, /Yesterday's sales/i); assert.match(t, /£412\.50/); assert.match(t, /\+£32\.50 on an average/);
    assert.match(t, /Flat White/); assert.match(t, /2 items below par/); assert.match(t, /Oat milk, Gayo espresso beans/);
    assert.match(t, /1 supplier order due/); assert.match(t, /1 item sold without a recipe/);
    await noHorizontalScroll(page, 'Today'); await axe(page, 'Today'); await shot(page, '1-today');
  });

  test('Stock: low first, units in kg and L, reorder suggestions with packs', async ({ page }) => {
    await unlock(page); await openTab(page); await sub(page, 'stock');
    const rows = await page.locator('#main table').first().locator('tbody tr').allInnerTexts();
    assert.match(rows[0], /Oat milk/); assert.match(rows[0], /3 L/); assert.match(rows[0], /12 L/); assert.match(rows[0], /Low/);
    assert.match(rows[1], /Gayo espresso beans/); assert.match(rows[1], /1\.8 kg/);
    assert.match(rows[3], /No par/);
    const t = await main(page);
    assert.match(t, /2 × 6 × 1 L/); assert.match(t, /£26\.40/); assert.match(t, /No supplier pack yet/);
    await noHorizontalScroll(page, 'Stock'); await axe(page, 'Stock'); await shot(page, '2-stock');
  });

  test('Drink & dish costs: cost each, margin, oat milk explained, uncosted items', async ({ page }) => {
    await unlock(page); await openTab(page); await sub(page, 'costs');
    const t = await main(page);
    assert.match(t, /oat flat white carries the cost of oat milk/i);
    assert.match(t, /Flat White[\s\S]*£0\.65[\s\S]*80\.0%/);
    assert.match(t, /54\.7%/); assert.match(t, /Not costed yet/); assert.match(t, /2\/3/);
    await noHorizontalScroll(page, 'Costs'); await axe(page, 'Costs'); await shot(page, '3-costs');
  });

  test('Last 7 days: sales, cost of goods, gross profit, till sales flagged', async ({ page }) => {
    await unlock(page); await openTab(page); await sub(page, 'week');
    const t = await main(page);
    assert.match(t, /£792\.50/); assert.match(t, /£137\.20/); assert.match(t, /£523\.22/);
    assert.match(t, /in-store till sales without item detail/i); assert.match(t, /counted as totals only/i);
    assert.match(t, /2 item lines sold without a recipe/);
    await noHorizontalScroll(page, 'Last 7 days'); await axe(page, 'Last 7 days'); await shot(page, '4-week');
  });

  test('empty Maheera: clear empty states in every section', async ({ page }) => {
    await unlock(page); await openTab(page);
    assert.match(await main(page), /Maheera has little Bija data yet/);
    await shot(page, '5-empty');
    await sub(page, 'stock'); assert.match(await main(page), /No stock in Maheera yet/);
    await sub(page, 'costs'); assert.match(await main(page), /No costs yet/);
    await sub(page, 'week'); assert.match(await main(page), /No sales in Maheera yet/);
  }, () => [200, EMPTY]);

  test("Maheera down: \"isn't answering\" with retry, other tabs keep working", async ({ page, state }) => {
    await unlock(page); await openTab(page);
    assert.match(await main(page), /Maheera isn't answering/); await axe(page, 'Down');
    await shot(page, '6-down');
    await page.locator('#tabs [data-act="tab"][data-v="queue"]').click(); await settle(page);
    assert.match(await main(page), /Queue is clear|In the queue/);
    await openMaheera(page); await settle(page);
    assert.equal(state.calls.length, 1, 'no automatic hammering after a failure');
    await page.locator('#main [data-act="mh-retry"]').first().click();
    await page.waitForFunction(() => /Yesterday's sales/i.test(document.getElementById('main').innerText), null, { timeout: 10000 });
    assert.equal(state.calls.length, 2);
  }, (n) => (n === 1 ? [502, { error: 'maheera' }] : [200, FULL]));

  test('one part missing: the rest shows, with a retry for that part', async ({ page }) => {
    await unlock(page); await openTab(page); await sub(page, 'costs');
    assert.match(await main(page), /Maheera didn't send this part/);
    await sub(page, 'stock'); assert.doesNotMatch(await main(page), /didn't send this part/);
  }, () => [200, { ...FULL, dishes: null, missing: ['dishes'] }]);

  test('secrets not added yet: the setup message', async ({ page }) => {
    await unlock(page); await openTab(page);
    assert.match(await main(page), /Maheera isn't set up yet/);
  }, () => [503, { error: 'setup' }]);

  test('Exit locks the session and drops the figures; coming back needs the PIN and fetches again', async ({ page, state }) => {
    // the app (mobile admin): hold Order for 3 seconds, PIN, then Exit returns to the customer view
    const enter = async () => {
      await page.evaluate(() => document.querySelector('.fab').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true })));
      await page.locator('#pin-email').waitFor({ timeout: 6000 });
      await page.locator('#pin-email').fill(EMAIL);
      for (const d of PIN) await page.locator('#pinsheet [data-act="pin-key"]').filter({ hasText: new RegExp(`^\\s*${d}\\s*$`) }).first().click();
      await page.waitForFunction(() => document.body.classList.contains('barista-view'), null, { timeout: 10000 });
    };
    await page.goto(`${BASE}/app.html?view=app&backend=supabase`, { waitUntil: 'load' }); await settle(page, 1200);
    await enter(); await openTab(page);
    assert.match(await main(page), /£412\.50/);
    await page.locator('#switch [data-act="view"][data-v="customer"]').click(); await settle(page, 600);
    assert.equal(state.staff, false, 'Exit locks the staff session on the server');
    assert.equal(await page.evaluate(() => document.body.innerText.includes('£412.50')), false);
    assert.equal(await page.locator('#tabs [data-v="maheera"]').count(), 0);
    await enter(); await openTab(page);
    assert.equal(state.calls.length, 2, 'figures are fetched again, not kept from before');
  });

  test('demo mode (this device only): explains Maheera is on the live back office', async ({ page }) => {
    await page.goto(`${BASE}/app.html?view=bar&demo=1`, { waitUntil: 'load' });
    await page.locator('#pin-email').waitFor({ timeout: 15000 });
    await page.locator('#pin-email').fill(EMAIL);
    for (const d of PIN) await page.locator('#pinsheet [data-act="pin-key"]').filter({ hasText: new RegExp(`^\\s*${d}\\s*$`) }).first().click();
    await page.waitForFunction(() => document.body.classList.contains('barista-view'), null, { timeout: 10000 });
    await openMaheera(page); await settle(page);
    assert.match(await main(page), /Maheera opens on the live back office/);
  });

  let failed = 0;
  for (const [name, fn, mock] of tests) {
    const env = await newPage(browser, mock || (() => [200, FULL]));
    try {
      await fn(env);
      assert.deepEqual(env.errors, [], 'no page errors');
      console.log('ok   ' + name);
    } catch (e) {
      failed++; console.log('FAIL ' + name + '\n     ' + (e && e.stack || e));
      const f = await screenshot(env.page, 'maheera-' + name); if (f) console.log('     screenshot: ' + f);
    } finally { await env.context.close(); }
  }
  await browser.close();
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
