#!/usr/bin/env node
// Attacker suite for app.html (demo mode), one test per finding in docs/fullstack/security-review.md (S1–S12).
//
// Every test works the same way:
//   1. Build an honest history: the customer's orders are written to the demo store ('bija.app.demo' in
//      localStorage, docs by path such as 'customers/you' and 'bar/you'), then the barista collects them
//      through the real Queue buttons, so whatever ledger the app keeps is written by the app itself.
//   2. Measure what matters: points, lifetime points, gift balance and Origins Passport stamps
//      (staff Members table and the customer's Bija Card).
//   3. Act as the customer: write malicious values straight into customers/you, as anyone can from the console.
//   4. Reload, enter the staff view, and check nothing that matters changed, no script ran (window.__pwned)
//      and the Insights page still renders.
//
// Usage:  node tests/security.js [--only S1,S3] [--md docs/audit/security-status.md] [--strict]
// Needs the site served on BASE_URL (default http://localhost:8099), as for the other suites (tests/README.md).
// Exit code: 1 if a finding NOT in KNOWN_OPEN below fails (a regression), or with --strict / SECURITY_STRICT=1
// if anything fails. Known-open findings are reported but don't turn CI red while their fixes are on the way.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const { ROOT, BASE, OUT } = require('./tools/common');

// Findings still expected to fail until their fix lands on main. Remove an ID as soon as it passes
// (the run prints a reminder); from then on a failure of that finding fails CI.
const KNOWN_OPEN = new Set([]); // all 12 fixed in Sprint 1 (main 8d7cd7d)
const DB_KEY = 'bija.app.demo';
const ME = 'you';
const NAME = 'Mallory';
const PIN = process.env.STAFF_PIN || '16091992';
const ADMIN_EMAIL = process.env.STAFF_EMAIL || 'admin-oversee@bijacoffee.co.uk';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ONLY = (arg('--only') || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
const MD = arg('--md');
const STRICT = args.includes('--strict') || process.env.SECURITY_STRICT === '1';

let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('playwright is not installed. See tests/README.md.');
  process.exit(2);
}

// ---------- server ----------
const ping = (url) => new Promise((resolve) => {
  const req = http.get(url, (res) => { res.resume(); resolve(res.statusCode < 500); });
  req.on('error', () => resolve(false));
  req.setTimeout(2000, () => { req.destroy(); resolve(false); });
});
async function ensureServer() {
  if (!(await ping(`${BASE}/app.html`))) throw new Error(`${BASE}/app.html is not answering. Serve the repo root first: python3 -m http.server 8099`);
}

// ---------- demo store ----------
const now = Date.now();
const iso = (minsAgo = 0) => new Date(now - minsAgo * 60000).toISOString();
const MENU = { fw: ['Flat White', 3.9, 'Coffee'], lat: ['Latte', 4.0, 'Coffee'], filt: ['Single-origin filter', 4.5, 'Coffee'], esp: ['Espresso', 3.0, 'Coffee'], ks: ['Kopi Susu Aren', 4.5, 'Coffee'], tea: ['Teh Tarik', 4.0, 'Not coffee'], choc: ['Hot chocolate', 4.0, 'Not coffee'], cold: ['Cold Brew', 4.5, 'Coffee'], lapis: ['Lapis Legit', 3.0, 'Cakes'] };
const line = (id, qty = 1, extra = {}) => ({ key: id, id, name: MENU[id][0], price: MENU[id][1], qty, cat: MENU[id][2], ...(id === 'filt' ? { origin: 'lintong' } : {}), ...extra });
function order(code, lines, minsAgo, extra = {}) {
  const subtotal = Math.round(lines.reduce((a, l) => a + l.qty * l.price, 0) * 100) / 100;
  const discount = extra.discount || 0, total = Math.round((subtotal - discount) * 100) / 100, giftPay = extra.giftPay || 0;
  return { code, lines, subtotal, discount, total, giftPay, due: Math.round((total - giftPay) * 100) / 100, slot: 'ASAP', note: '', name: NAME, createdAt: iso(minsAgo), ...extra };
}
const customerDoc = (extra = {}) => ({ name: NAME, joinedAt: iso(60 * 24 * 30), orders: {}, ratings: {}, secret: { visited: {} }, gifts: {}, claims: {}, ...extra });
const r2 = (n) => Math.round(n * 100) / 100;

// Read and write the store from a same-origin page that isn't the app, so the app can't overwrite our edit.
async function editDb(page, fn) {
  await page.goto(`${BASE}/manifest.webmanifest`, { waitUntil: 'load' });
  const data = await page.evaluate((k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } }, DB_KEY);
  const out = (await fn(data)) || data;
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [DB_KEY, JSON.stringify(out)]);
  return out;
}
const readDb = (page) => editDb(page, () => undefined);

// ---------- driving the app ----------
const settle = (page, ms = 450) => page.waitForTimeout(ms);
async function openApp(page, hash = '') {
  // a hash-only change wouldn't reload the page, and the app reads the hash only when it boots
  if (hash && page.url().startsWith(`${BASE}/app.html`)) await page.goto('about:blank');
  await page.goto(`${BASE}/app.html?view=app${hash}`, { waitUntil: 'load' });
  await page.waitForFunction(() => (document.getElementById('main')?.innerText || '').trim().length > 0, null, { timeout: 15000 }).catch(() => {});
  await settle(page, 700);
}
const isStaff = (page) => page.evaluate(() => document.body.classList.contains('barista-view')
  || [...document.querySelectorAll('[data-act="tab"][data-v="insights"], [data-act="tab"][data-v="members"]')].some((e) => e.offsetParent !== null));

// Staff entry: ?view=bar, typing opensesame on the website (web admin) or holding Order in the app (mobile admin) for 3 s opens the back office: admin email, then an 8-digit PIN.
async function enterPin(page) {
  const email = page.locator('#pin-email:visible, #pinsheet input[type="email"]:visible');
  if (await email.count()) {
    await email.first().fill(ADMIN_EMAIL);
    for (const d of PIN) await page.locator('#pinsheet [data-act="pin-key"]:visible').filter({ hasText: new RegExp(`^\\s*${d}\\s*$`) }).first().click();
    await settle(page, 900);
    return true;
  }
  const sel = 'input[inputmode="numeric"]:visible, input[type="password"]:visible, input[autocomplete="one-time-code"]:visible, input[name*="pin" i]:visible, input[id*="pin" i]:visible';
  const inputs = page.locator(sel);
  const n = await inputs.count();
  if (n >= 1) {
    if (n >= 6) { await inputs.first().click(); await page.keyboard.type(PIN, { delay: 40 }); }
    else { await inputs.first().fill(PIN); }
    await page.keyboard.press('Enter').catch(() => {});
  } else {
    const one = page.locator('button:visible, [role="button"]:visible').filter({ hasText: /^\s*1\s*$/ });
    if (!(await one.count())) return false;
    for (const d of PIN) await page.locator('button:visible, [role="button"]:visible').filter({ hasText: new RegExp(`^\\s*${d}\\s*$`) }).first().click();
  }
  await settle(page, 300);
  const go = page.locator('button:visible').filter({ hasText: /^\s*(unlock|enter|ok|continue|sign in|log in|open)\b/i });
  if (await go.count()) await go.first().click().catch(() => {});
  await settle(page, 600);
  return true;
}
async function enterStaff(page) {
  if (await isStaff(page)) return 'already';
  const sw = page.locator('#switch button:visible').filter({ hasText: /barista|staff/i });
  if (await sw.count()) { await sw.first().click(); await settle(page); if (!(await isStaff(page))) await enterPin(page); if (await isStaff(page)) return 'switch'; }
  await page.goto(`${BASE}/app.html?view=bar`, { waitUntil: 'load' }); await settle(page, 800);
  if (await isStaff(page)) return 'view=bar';
  await enterPin(page); if (await isStaff(page)) return 'view=bar+pin';
  await openApp(page);
  const btn = page.locator('button:visible, [role="tab"]:visible, a:visible').filter({ hasText: /^\s*order\b/i }).first();
  if (await btn.count()) {
    const b = await btn.boundingBox();
    if (b) {
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down(); await page.waitForTimeout(3300); await page.mouse.up();
      await settle(page, 600);
      await enterPin(page); if (await isStaff(page)) return 'hold+pin';
    }
  }
  throw new Error('Could not enter the staff view (tried the Barista switch, ?view=bar + PIN and holding Order + PIN)');
}
async function staffTab(page, v, label) {
  const t = page.locator(`[data-act="tab"][data-v="${v}"]:visible`);
  if (await t.count()) await t.first().click();
  else await page.locator('button:visible, [role="tab"]:visible').filter({ hasText: label }).first().click();
  await settle(page);
}
async function queueFilter(page, v) {
  const f = page.locator(`[data-act="qf"][data-v="${v}"]:visible`);
  if (await f.count()) { await f.first().click(); await settle(page, 300); }
}
const orderCard = (page, code) => page.locator('#main article').filter({ hasText: new RegExp(`\\b${code}\\b`) });

// Click the order through received → brewing → ready → collected, as the barista does.
async function collect(page, code) {
  await staffTab(page, 'queue', /queue|orders/i);
  for (let i = 0; i < 5; i++) {
    await queueFilter(page, 'active');
    const card = orderCard(page, code);
    if (!(await card.count())) break;
    const next = card.first().locator('button:visible').filter({ hasNotText: /undo|cancel|reject/i });
    if (!(await next.count())) break;
    await next.first().click();
    await settle(page);
  }
  await queueFilter(page, 'all');
  const txt = (await orderCard(page, code).first().innerText().catch(() => '')) || '';
  if (!/collected/i.test(txt)) throw new Error(`Could not collect order ${code} through the queue`);
}

const num = (s) => { const m = String(s || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; };
async function staffMembers(page) {
  await staffTab(page, 'members', /members/i);
  return page.evaluate((name) => {
    const out = {};
    for (const table of document.querySelectorAll('#main table')) {
      const heads = [...table.querySelectorAll('thead th')].map((th) => th.innerText.trim().toLowerCase());
      for (const tr of table.querySelectorAll('tbody tr')) {
        const cells = [...tr.querySelectorAll('td')].map((td) => td.innerText.trim());
        const who = cells[heads.findIndex((h) => h === 'name')] || cells[0];
        const row = {}; heads.forEach((h, i) => { row[h] = cells[i]; });
        out[who] = row;
      }
    }
    return out;
  }, NAME);
}
async function measure(page) {
  const rows = await staffMembers(page);
  const r = rows[NAME];
  if (!r) throw new Error(`No row for ${NAME} in the staff Members table`);
  const pick = (re) => r[Object.keys(r).find((k) => re.test(k))];
  return { points: num(pick(/^points$/)), lifetime: num(pick(/all time|lifetime/)), gift: num(pick(/gift/)), code: pick(/^code$/) };
}
// The customer's own view: Bija Card points, Origins Passport stamps and gift balance.
async function toCustomer(page, hash) {
  await openApp(page, hash);
  if (await isStaff(page)) {
    const c = page.locator('#switch button:visible').filter({ hasText: /customer/i });
    if (await c.count()) { await c.first().click(); await settle(page); }
  }
  const t = page.locator(`[data-act="tab"][data-v="${hash.slice(1)}"]:visible`);
  if (await t.count()) { await t.first().click(); await settle(page); }
}
async function measureCustomer(page) {
  await toCustomer(page, '#card');
  const card = await page.evaluate(() => {
    const b = document.querySelector('#main .bcard .pts b');
    return { cardPoints: b ? +(b.dataset.to ?? b.innerText.replace(/\D/g, '')) : null, stamps: document.querySelector('#main .passport') ? document.querySelectorAll('#main .passport .visa.got').length : null };
  });
  // the Gifts page shows "Your gift card balance" over the amount
  await toCustomer(page, '#gifts');
  const w = await page.evaluate(() => { const h = [...document.querySelectorAll('#main *')].find((e) => e.children.length === 0 && /your gift card balance/i.test(e.textContent)); return h?.parentElement?.innerText.replace(/your gift card balance/i, '') || ''; });
  return { ...card, wallet: w ? num(w) : null };
}
async function insightsRenders(page, errors) {
  const before = errors.length;
  await staffTab(page, 'insights', /insights/i);
  await settle(page, 600);
  const text = await page.evaluate(() => (document.getElementById('main')?.innerText || '').trim());
  const errs = errors.slice(before);
  return { ok: text.length > 40 && !errs.length, detail: errs.length ? `page error: ${errs[0]}` : text.length > 40 ? 'renders' : 'empty' };
}
const pwned = (page) => page.evaluate(() => window.__pwned);

// ---------- shared scenario ----------
// Honest history: A (2 × Flat White, £7.80), B (filter, paid with £4.50 of a £10 gift card), D (a Latte paid with the 400-point drink reward).
// Plus £50 spent at the till (500 points), so there are points to redeem. All money facts the bar wrote come from staff actions or staff records.
async function history(page, { birthMonth } = {}) {
  await editDb(page, (d) => {
    d[`customers/${ME}`] = customerDoc({
      ...(birthMonth ? { birthMonth } : {}),
      orders: {
        oA: order('BA01', [line('fw', 2)], 180),
        oB: order('BB02', [line('filt', 1)], 150, { giftPay: 4.5 }),
      },
    });
    d[`bar/${ME}`] = { orders: {}, instore: { s1: { amount: 50, at: iso(240) } }, credits: { 'BIJA-SEED-0001': { amount: 10, at: iso(300) } } };
  });
  await openApp(page);
  await enterStaff(page);
  await collect(page, 'BA01');
  await collect(page, 'BB02');
  // D redeems a reward with points earned above; written like placeOrder() writes it
  await editDb(page, (d) => { d[`customers/${ME}`].orders.oD = order('BD03', [line('lat', 1)], 120, { discount: 4.0, reward: { id: 'drink', name: 'Any drink', pts: 400 } }); });
  await openApp(page); await enterStaff(page);
  await collect(page, 'BD03');
}
async function baseline(page) { const s = await measure(page); const c = await measureCustomer(page); return { ...s, ...c }; }
// Ends in the staff view, so tests can go on to inspect the queue or gift cards.
async function after(page, errors) {
  const c = await measureCustomer(page);
  await openApp(page);
  const via = await enterStaff(page);
  const s = await measure(page);
  const ins = await insightsRenders(page, errors);
  return { ...s, ...c, insights: ins, via };
}
function sameNumbers(b, a, keys = ['points', 'lifetime', 'gift', 'cardPoints', 'stamps', 'wallet']) {
  const diffs = [];
  for (const k of keys) if (b[k] !== null && b[k] !== undefined && a[k] !== b[k]) diffs.push(`${k} ${b[k]} → ${a[k]}`);
  return diffs;
}

// ---------- the tests ----------
const XSS = (tag) => `<img src=x onerror="window.__pwned='${tag}'">`;
const TESTS = [
  { id: 'S1', title: 'Stored XSS in the Barista view (qty, reward.pts, chart values, huge stars)', async run(page, errors) {
    await history(page);
    const b = await baseline(page);
    await editDb(page, (d) => {
      const c = d[`customers/${ME}`];
      c.orders.oX = order('BX11', [line('fw', 1, { qty: XSS('S1-qty') })], 5, { reward: { id: 'drink', name: 'Any drink', pts: XSS('S1-pts') } });
      c.orders.oA.lines[0].qty = XSS('S1-insights');
      c.ratings = { oA: { drink: 'fw', stars: 1e9, comment: 'Lovely', at: iso(100) } };
    });
    const a = await after(page, errors);
    const fails = [];
    for (const [v, l] of [['queue', /queue/i], ['members', /members/i], ['gifts', /gift/i], ['insights', /insights/i]]) {
      await staffTab(page, v, l); if (v === 'queue') { await queueFilter(page, 'all'); }
      await settle(page, 500);
    }
    const p = await pwned(page);
    if (p !== undefined) fails.push(`script ran in the staff view (window.__pwned = ${JSON.stringify(p)})`);
    if (!a.insights.ok) fails.push(`Insights page does not render (${a.insights.detail})`);
    fails.push(...sameNumbers(b, a));
    return { fails, b, a };
  } },
  { id: 'S2', title: 'Gift balance created (negative giftPay) or refunded (cancel a paid order)', async run(page, errors) {
    await history(page);
    const b = await baseline(page);
    await editDb(page, (d) => {
      const c = d[`customers/${ME}`];
      c.orders.oX = order('BX21', [line('fw', 1)], 5, { giftPay: -100 });
      c.orders.oB.cancelled = true; c.orders.oB.giftPay = 0;
    });
    const a = await after(page, errors);
    return { fails: [...sameNumbers(b, a, ['gift', 'wallet', 'points', 'lifetime']), ...(a.insights.ok ? [] : [`Insights: ${a.insights.detail}`])], b, a };
  } },
  { id: 'S3', title: 'Points and passport stamps from a customer-edited total and lines', async run(page, errors) {
    await history(page);
    const b = await baseline(page);
    await editDb(page, (d) => {
      const o = d[`customers/${ME}`].orders.oA;
      o.total = 99999; o.subtotal = 99999; o.due = 99999;
      o.lines = [...o.lines, ...['lintong', 'mandheling', 'gayo', 'kintamani', 'java'].map((og) => line('filt', 1, { origin: og }))];
    });
    const a = await after(page, errors);
    return { fails: [...sameNumbers(b, a, ['points', 'lifetime', 'cardPoints', 'stamps']), ...(a.insights.ok ? [] : [`Insights: ${a.insights.detail}`])], b, a };
  } },
  { id: 'S4', title: 'Reward points refunded (cancel a collected reward order) or negative reward.pts', async run(page, errors) {
    await history(page);
    const b = await baseline(page);
    await editDb(page, (d) => {
      const c = d[`customers/${ME}`];
      c.orders.oD.cancelled = true; c.orders.oD.reward.pts = 0;
      c.orders.oX = order('BX41', [line('esp', 1)], 5, { discount: 3.0, reward: { id: 'drink', name: 'Any drink', pts: -5000 } });
    });
    const a = await after(page, errors);
    return { fails: [...sameNumbers(b, a, ['points', 'cardPoints']), ...(a.insights.ok ? [] : [`Insights: ${a.insights.detail}`])], b, a };
  } },
  { id: 'S5', title: 'Gift card amount and code changed after the bar took payment', async run(page, errors) {
    await history(page);
    await editDb(page, (d) => { d[`customers/${ME}`].gifts = { g5: { code: 'BIJA-AAAA-0005', amount: 5, to: 'Pat', from: NAME, message: '', design: 'noir', createdAt: iso(30) } }; });
    await openApp(page); await enterStaff(page);
    await staffTab(page, 'gifts', /gift/i);
    const pay = page.locator('#main article').filter({ hasText: /Pat/ }).locator('button').filter({ hasText: /paid|activate/i });
    if (!(await pay.count())) throw new Error('No "Paid · activate card" button for the £5 card');
    await pay.first().click(); await settle(page);
    const code = await giftCodeFor(page, 'Pat');
    const b = await baseline(page);
    // 1. raise the paid £5 card to £200, then redeem it
    await editDb(page, (d) => { const c = d[`customers/${ME}`]; c.gifts.g5.amount = 200; c.claims = { [code]: { at: iso(1) } }; });
    await openApp(page); await enterStaff(page); await confirmClaims(page);
    // 2. after it is redeemed, rename the code and redeem it again
    await editDb(page, (d) => { const c = d[`customers/${ME}`]; c.gifts.g5.code = 'BIJA-BBBB-0005'; c.claims['BIJA-BBBB-0005'] = { at: iso(0) }; });
    await openApp(page); await enterStaff(page); await confirmClaims(page);
    const a = await after(page, errors);
    const fails = [];
    if (a.gift !== null && b.gift !== null && r2(a.gift - b.gift) > 5) fails.push(`gift balance rose by £${r2(a.gift - b.gift)} from one paid £5 card`);
    if (a.wallet !== null && b.wallet !== null && r2(a.wallet - b.wallet) > 5) fails.push(`customer wallet rose by £${r2(a.wallet - b.wallet)}`);
    if (!a.insights.ok) fails.push(`Insights: ${a.insights.detail}`);
    return { fails, b, a, notes: [`activated code ${code}`] };
  } },
  { id: 'S6', title: 'Customer-set prices shown to the barista as the amount to take', async run(page, errors) {
    await history(page);
    const b = await baseline(page);
    await editDb(page, (d) => {
      d[`customers/${ME}`].orders.oX = order('BX61', [line('fw', 2, { price: 0.01 })], 5);
    });
    const a = await after(page, errors);
    await staffTab(page, 'queue', /queue/i); await queueFilter(page, 'all');
    const txt = (await orderCard(page, 'BX61').first().innerText().catch(() => '')) || '';
    const fails = [];
    if (!txt) fails.push('order BX61 not shown in the queue');
    else {
      if (!/£7\.80/.test(txt)) fails.push(`queue does not show the menu total £7.80 (shows: ${(txt.match(/£\d+\.\d\d/g) || []).join(', ') || 'no amount'})`);
      const take = txt.match(/take\s+£(\d+\.\d\d)/i);
      if (take && take[1] !== '7.80') fails.push(`"take £${take[1]}" instead of £7.80`);
    }
    fails.push(...sameNumbers(b, a, ['points', 'gift']));
    if (!a.insights.ok) fails.push(`Insights: ${a.insights.detail}`);
    return { fails, b, a };
  } },
  { id: 'S7', title: 'Bonus rules gamed with customer-written birth month, dates and lines', async run(page, errors) {
    const thisMonth = new Date().getMonth() + 1, other = ((thisMonth + 5) % 12) + 1;
    await history(page, { birthMonth: other });
    const b = await baseline(page);
    await editDb(page, (d) => {
      const c = d[`customers/${ME}`];
      c.birthMonth = thisMonth;
      c.orders.oA.lines = ['fw', 'lat', 'esp', 'ks', 'tea', 'choc', 'cold'].map((id) => line(id, 1));
      c.orders.oB.createdAt = c.orders.oA.createdAt; // three visits in one week
      c.orders.oD.createdAt = c.orders.oA.createdAt;
    });
    const a = await after(page, errors);
    return { fails: [...sameNumbers(b, a, ['points', 'lifetime', 'cardPoints']), ...(a.insights.ok ? [] : [`Insights: ${a.insights.detail}`])], b, a };
  } },
  { id: 'S8', title: 'No limits on what a customer writes (order flood, 1 MB note, claim flood)', async run(page, errors) {
    await history(page);
    const b = await baseline(page);
    await editDb(page, (d) => {
      const c = d[`customers/${ME}`];
      for (let i = 0; i < 300; i++) c.orders[`f${i}`] = order(`F${String(i).padStart(3, '0')}`, [line('esp', 1)], 1, { note: i === 0 ? 'A'.repeat(1_000_000) : '' });
      c.claims = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`BIJA-FLOD-${String(i).padStart(4, '0')}`, { at: iso(1) }]));
    });
    const t0 = Date.now();
    const a = await after(page, errors);
    await staffTab(page, 'queue', /queue/i); await queueFilter(page, 'active');
    const shown = await page.locator('#main article').filter({ hasText: NAME }).count();
    const longest = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('#main article')].map((e) => e.innerText.length)));
    await staffTab(page, 'gifts', /gift/i);
    const claimsShown = await page.locator('#main article').filter({ hasText: /BIJA-FLOD-/ }).count();
    const secs = (Date.now() - t0) / 1000;
    const fails = [];
    if (shown > 10) fails.push(`${shown} active orders from one customer shown in the queue (cap expected, e.g. 5)`);
    if (longest > 2000) fails.push(`an order card renders ${longest.toLocaleString('en-GB')} characters (note not truncated)`);
    if (claimsShown > 10) fails.push(`${claimsShown} codes to confirm from one customer (cap expected, e.g. 5)`);
    if (secs > 45) fails.push(`staff view took ${secs.toFixed(0)} s to load and render`);
    if (!a.insights.ok) fails.push(`Insights: ${a.insights.detail}`);
    fails.push(...sameNumbers(b, a, ['points', 'lifetime', 'gift']));
    return { fails, b, a, notes: [`${shown} queue cards, ${claimsShown} claims, longest card ${longest} chars, ${secs.toFixed(1)} s`] };
  } },
  { id: 'S9', title: 'Gift codes from Math.random(); codes chosen by the customer', init: () => { Math.random = () => 0.5; }, async run(page, errors) {
    // Math.random is pinned for the whole page, and both cards arrive with the same customer-chosen code.
    // A code made by the barista's app with crypto.getRandomValues stays unique and unguessable anyway.
    await editDb(page, (d) => {
      d[`customers/${ME}`] = customerDoc({ gifts: {
        g9a: { code: 'BIJA-AAAA-AAAA', amount: 10, to: 'Quinn', from: NAME, message: '', design: 'noir', createdAt: iso(20) },
        g9b: { code: 'BIJA-AAAA-AAAA', amount: 10, to: 'Robin', from: NAME, message: '', design: 'noir', createdAt: iso(19) },
      } });
    });
    await openApp(page); await enterStaff(page); await staffTab(page, 'gifts', /gift/i);
    for (const who of ['Quinn', 'Robin']) {
      const pay = page.locator('#main article').filter({ hasText: who }).locator('button').filter({ hasText: /paid|activate/i });
      if (await pay.count()) { await pay.first().click(); await settle(page); }
    }
    const q = await giftCodeFor(page, 'Quinn'), r = await giftCodeFor(page, 'Robin');
    const fails = [];
    if (!q || !r) fails.push(`activated cards have no code shown to staff (Quinn: ${q || '–'}, Robin: ${r || '–'})`);
    else {
      if (q === r) fails.push(`two activated cards share the code ${q}`);
      if (q === 'BIJA-AAAA-AAAA' || r === 'BIJA-AAAA-AAAA') fails.push('the code is the one the customer chose, not one the bar generated');
    }
    if (!(await insightsRenders(page, errors)).ok) fails.push('Insights does not render');
    return { fails, notes: [`codes: Quinn ${q || '–'}, Robin ${r || '–'}`] };
  } },
  { id: 'S10', title: 'Member code derived from the user ID (collisions, leaks part of the ID)', async run(page, errors) {
    await editDb(page, (d) => {
      for (const [uid, nm] of [['zz1abcde', 'Alex'], ['yy2abcde', 'Billie']]) d[`customers/${uid}`] = { ...customerDoc({ orders: { o1: { ...order(`C${uid.slice(0, 3).toUpperCase()}`, [line('esp', 1)], 30), name: nm } } }), name: nm };
    });
    await openApp(page); await enterStaff(page);
    const rows = await staffMembers(page);
    const codes = ['Alex', 'Billie'].map((n) => (rows[n] && (rows[n].code ?? '')).trim());
    const fails = [];
    if (codes.every(Boolean) && codes[0] === codes[1]) fails.push(`two members share the code ${codes[0]}`);
    for (const c of codes) if (c === 'BIJA-ABCDE') fails.push(`code ${c} is the last 5 characters of the account ID`);
    if (!rows.Alex || !rows.Billie) fails.push('members not listed in the staff Members table');
    if (!(await insightsRenders(page, errors)).ok) fails.push('Insights does not render');
    return { fails, notes: [`codes: Alex ${codes[0] || '–'}, Billie ${codes[1] || '–'}`] };
  } },
  { id: 'S11', title: "Buyer's user ID stored in the recipient's own bar record", async run(page, errors) {
    const BUYER = 'buyer9q7x';
    await editDb(page, (d) => {
      d[`customers/${ME}`] = customerDoc();
      d[`customers/${BUYER}`] = { ...customerDoc({ gifts: { g11: { code: 'BIJA-CCCC-0011', amount: 10, to: NAME, from: 'Bea', message: '', design: 'noir', createdAt: iso(20) } } }), name: 'Bea' };
    });
    await openApp(page); await enterStaff(page); await staffTab(page, 'gifts', /gift/i);
    const pay = page.locator('#main article').filter({ hasText: /Bea/ }).locator('button').filter({ hasText: /paid|activate/i });
    if (!(await pay.count())) throw new Error('No "Paid · activate card" button for Bea\'s card');
    await pay.first().click(); await settle(page);
    const code = await giftCodeFor(page, NAME, 'to');
    if (!code) throw new Error('Could not read the activated gift code');
    await editDb(page, (d) => { d[`customers/${ME}`].claims = { [code]: { at: iso(1) } }; });
    await openApp(page); await enterStaff(page);
    const confirmed = await confirmClaims(page);
    const db = await readDb(page);
    const mine = JSON.stringify(db[`bar/${ME}`] || {});
    const fails = [];
    if (!confirmed) return { inconclusive: 'the legitimate claim could not be confirmed, so nothing was credited', fails };
    if (mine.includes(BUYER)) fails.push(`bar/${ME} (readable by the recipient) contains the buyer's user ID "${BUYER}"`);
    if (mine.includes('"g11"')) fails.push(`bar/${ME} contains the gift ID g11`);
    if (!/"amount":\s*10\b/.test(mine) && !mine.includes('10')) fails.push('credit not found in the recipient record');
    await openApp(page); await enterStaff(page);
    if (!(await insightsRenders(page, errors)).ok) fails.push('Insights does not render');
    return { fails, notes: [`bar/${ME}: ${mine.slice(0, 300)}`] };
  } },
  { id: 'S12', title: 'No Content Security Policy (inline event handlers run)', async run(page) {
    const res = await page.goto(`${BASE}/app.html?view=app`, { waitUntil: 'load' });
    await settle(page, 700);
    const header = res?.headers()['content-security-policy'] || '';
    // every policy the page ends up with, including any the app adds at runtime
    const meta = await page.evaluate(() => [...document.querySelectorAll('meta[http-equiv="Content-Security-Policy" i]')].map((m) => m.content).join(' + '));
    await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<img src="x" alt="" onerror="window.__pwned=\'S12\'">'));
    await settle(page, 700);
    const p = await pwned(page);
    const fails = [];
    if (!header && !meta) fails.push('no Content-Security-Policy header or meta tag');
    if (p !== undefined) fails.push('an injected inline onerror handler ran');
    return { fails, notes: [meta ? `meta CSP: ${meta.slice(0, 300)}` : header ? `header CSP: ${header.slice(0, 200)}` : 'no CSP'] };
  } },
];

// Staff "All gift cards" table (or any staff article) → the code for the card to `who`
async function giftCodeFor(page, who, col = 'to') {
  await staffTab(page, 'gifts', /gift/i);
  return page.evaluate(([who, col]) => {
    for (const table of document.querySelectorAll('#main table')) {
      const heads = [...table.querySelectorAll('thead th')].map((th) => th.innerText.trim().toLowerCase());
      const ci = heads.indexOf('code'), wi = heads.indexOf(col);
      if (ci < 0) continue;
      for (const tr of table.querySelectorAll('tbody tr')) {
        const cells = [...tr.querySelectorAll('td')].map((td) => td.innerText.trim());
        if ((wi >= 0 ? cells[wi] : tr.innerText).includes(who)) { const m = cells[ci].match(/BIJA-[A-Z0-9]{4}-[A-Z0-9]{4}/); if (m) return m[0]; }
      }
    }
    return null;
  }, [who, col]);
}
// Confirm every gift code waiting at the bar, as a barista would if the app offers it
async function confirmClaims(page) {
  await staffTab(page, 'gifts', /gift/i);
  let n = 0;
  for (let i = 0; i < 5; i++) {
    const ok = page.locator('#main article button:visible').filter({ hasText: /confirm/i });
    if (!(await ok.count())) break;
    await ok.first().click(); await settle(page); n++;
  }
  return n;
}

// ---------- runner ----------
const fmtVals = (v) => v ? ['points', 'lifetime', 'gift', 'cardPoints', 'stamps', 'wallet'].filter((k) => v[k] !== null && v[k] !== undefined).map((k) => `${k} ${v[k]}`).join(', ') : '';

(async () => {
  await ensureServer();
  const browser = await chromium.launch();
  const open = KNOWN_OPEN;
  const todo = TESTS.filter((t) => !ONLY.length || ONLY.includes(t.id));
  const results = new Array(todo.length);
  // Each finding gets its own browser context (its own localStorage), so they can run side by side.
  async function runOne(t) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    if (t.init) await context.addInitScript(t.init);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e && e.message || e).split('\n')[0]));
    page.on('dialog', (d) => d.accept().catch(() => {}));
    let res;
    try {
      const r = await t.run(page, errors);
      const status = r.inconclusive ? 'inconclusive' : r.fails.length ? 'fail' : 'pass';
      res = { id: t.id, title: t.title, status, fails: [...new Set(r.fails)], inconclusive: r.inconclusive, before: r.b, after: r.a, notes: r.notes || [] };
    } catch (e) {
      res = { id: t.id, title: t.title, status: 'error', fails: [String(e.message || e).split('\n')[0]], notes: [] };
    }
    res.pageErrors = [...new Set(errors)].slice(0, 5);
    res.knownOpen = open.has(t.id);
    if (res.status !== 'pass') {
      fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true });
      await page.screenshot({ path: path.join(OUT, 'screenshots', `security-${t.id}.png`), fullPage: false }).catch(() => {});
    }
    await context.close();
    return res;
  }
  try {
    let next = 0;
    const jobs = Math.max(1, +process.env.SECURITY_JOBS || 4);
    await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, async () => {
      while (next < todo.length) { const i = next++; results[i] = await runOne(todo[i]); }
    }));
  } finally {
    await browser.close();
  }
  for (const res of results) {
    const mark = { pass: 'PASS', fail: 'FAIL', error: 'ERROR', inconclusive: 'INCONCLUSIVE' }[res.status];
    console.log(`${mark.padEnd(12)} ${res.id.padEnd(4)} ${res.title}${res.status !== 'pass' && res.knownOpen ? '  (known open)' : ''}`);
    for (const f of res.fails) console.log(`             - ${f}`);
    if (res.inconclusive) console.log(`             - ${res.inconclusive}`);
    if (res.status !== 'pass' && res.pageErrors.length) console.log(`             page errors: ${res.pageErrors.join(' | ')}`);
  }

  let commit = '';
  try { commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'security-report.json'), JSON.stringify({ at: new Date().toISOString(), base: BASE, commit, results }, null, 2));
  if (MD) writeMarkdown(MD, results, commit);

  const passed = results.filter((r) => r.status === 'pass').length;
  const regressions = results.filter((r) => r.status !== 'pass' && !r.knownOpen);
  const nowFixed = results.filter((r) => r.status === 'pass' && r.knownOpen);
  console.log(`\n${passed}/${results.length} findings pass.`);
  if (nowFixed.length) console.log(`Now passing but still in KNOWN_OPEN in tests/security.js (remove them): ${nowFixed.map((r) => r.id).join(', ')}`);
  if (regressions.length) console.log(`Failing and not known open: ${regressions.map((r) => r.id).join(', ')}`);
  process.exit((STRICT ? results.some((r) => r.status !== 'pass') : regressions.length) ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

function writeMarkdown(file, results, commit) {
  const icon = { pass: '✅ Pass', fail: '❌ Fail', error: '⚠️ Error', inconclusive: '❔ Inconclusive' };
  const when = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const rows = results.map((r) => `| ${r.id} | ${r.title} | ${icon[r.status]} | ${[...r.fails, ...(r.inconclusive ? [r.inconclusive] : [])].map((s) => s.replace(/\|/g, '\\|')).join('<br>') || '–'} |`);
  const detail = results.filter((r) => r.before || r.after || r.notes.length).map((r) => `- **${r.id}**: ${[r.before ? `before: ${fmtVals(r.before)}` : '', r.after ? `after attack: ${fmtVals(r.after)}` : '', ...r.notes.map((n) => n.replace(/\n/g, ' ').slice(0, 300))].filter(Boolean).join(' · ')}`);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const histMark = '## Run history';
  const prevHist = existing.includes(histMark) ? existing.slice(existing.indexOf(histMark) + histMark.length).trim().split('\n').filter((l) => l.startsWith('|') && !/^\|\s*(Run|---)/.test(l)) : [];
  const line = `| ${when} | ${commit || '–'} | ${results.filter((r) => r.status === 'pass').map((r) => r.id).join(', ') || '–'} | ${results.filter((r) => r.status !== 'pass').map((r) => r.id).join(', ') || '–'} |`;
  const md = `# Security status: app.html attacker suite

Automated exploit attempts for findings S1–S12 in [docs/fullstack/security-review.md](../fullstack/security-review.md), run by \`tests/security.js\` against app.html in demo mode. A finding **passes** when the attack changes nothing that matters: points, lifetime points, gift balance and passport stamps stay the same, the barista sees the menu price, no injected script runs and the Insights page still renders.

**Last run:** ${when} · commit \`${commit || 'unknown'}\` · **${results.filter((r) => r.status === 'pass').length} of ${results.length} pass**

| # | Finding | Result | What the attack achieved |
|---|---|---|---|
${rows.join('\n')}

### Measurements
${detail.join('\n')}

How to run: \`node tests/security.js --md docs/audit/security-status.md\` with the site served on port 8099 (usage in the header of \`tests/security.js\`). Findings in \`KNOWN_OPEN\` at the top of \`tests/security.js\` are reported but don't fail CI; remove each one as soon as it passes.

${histMark}

| Run | Commit | Pass | Still failing |
|---|---|---|---|
${[line, ...prevHist].slice(0, 40).join('\n')}
`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, md);
}
