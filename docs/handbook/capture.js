// Captures the handbook screenshots from the demo app and site (local server on :8099).
const { chromium, devices } = require('playwright');
const B = 'http://127.0.0.1:8099/', OUT = __dirname + '/shots/';
const safe = async (label, fn) => { try { await fn(); } catch (e) { console.log('skip', label, e.message.split('\n')[0]); } };
(async () => {
  const b = await chromium.launch();
  // customer phone: place an order so the staff side has something to show
  const pc = await b.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  const p = await pc.newPage(); const w = (ms) => p.waitForTimeout(ms);
  await p.addInitScript(() => { try { localStorage.setItem('bija.onboarded', '1'); } catch (e) {} });
  await p.goto(B + 'app.html?view=app'); await w(1500);
  await p.screenshot({ path: OUT + 'c-home.png' });
  await safe('order', async () => { await p.click('.fab'); await w(900); await p.screenshot({ path: OUT + 'c-menu.png' });
    await p.click('[data-act=sheet][data-id=ks]'); await w(500); await p.screenshot({ path: OUT + 'c-sheet.png' });
    await p.click('[data-act=sopt][data-k=milk][data-v=Oat]'); await p.click('[data-act=sopt][data-k=temp][data-v=Iced]'); await p.click('[data-act=sadd]'); await w(600);
    await p.click('[data-act=sheet][data-id=fw]'); await w(400); await p.click('[data-act=sadd]'); await w(600);
    const hidden = await p.$eval('#basket', (x) => x.hidden).catch(() => true);
    if (hidden) await p.evaluate(() => document.getElementById('checkout')?.scrollIntoView()); else await p.click('[data-act=goto-checkout]');
    await w(500); await p.fill('#f-name', 'Sekar'); await p.screenshot({ path: OUT + 'c-checkout.png' }); await p.click('[data-act=place]'); await w(1400); await p.screenshot({ path: OUT + 'c-placed.png' }); });
  await safe('profile', async () => { await p.click('#bnav [data-act=tab][data-v=card]'); await w(1200); await p.screenshot({ path: OUT + 'c-profile.png' }); });
  await safe('drawer', async () => { await p.click('[data-act=stamps] >> nth=0'); await w(900); await p.screenshot({ path: OUT + 'c-stamps.png' }); await p.keyboard.press('Escape'); await w(400); });
  const state = await pc.storageState();
  // staff side on a tablet-sized desktop view with the same browser data
  const sc = await b.newContext({ viewport: { width: 1180, height: 820 }, storageState: state, reducedMotion: 'reduce' });
  const s = await sc.newPage(); const sw = (ms) => s.waitForTimeout(ms);
  await s.goto(B + 'app.html?view=app'); await sw(1500);
  await safe('pin', async () => { await s.goto(B + 'app.html?view=bar'); await sw(1200); await s.screenshot({ path: OUT + 's-pin.png' }); });
  await s.evaluate(() => window.__bijaPin && window.__bijaPin('111111')); await sw(1200);
  const tab = async (v, name) => safe(v, async () => { await s.click(`#tabs [data-v=${v}]`); await sw(1200); await s.screenshot({ path: OUT + name }); });
  await tab('queue', 's-queue.png');
  await safe('brew', async () => { await s.click('#tabs [data-v=queue]'); await sw(800); await s.screenshot({ path: OUT + 's-queue.png' }); await s.click('[data-act=status] >> nth=0'); await sw(700); await s.screenshot({ path: OUT + 's-queue-brewing.png' }); await s.click('[data-act=status] >> nth=0'); await sw(700); await s.click('[data-act=status] >> nth=0'); await sw(900); await s.screenshot({ path: OUT + 's-collected.png' }); });
  await tab('shop', 's-web.png');
  await tab('members', 's-members.png');
  await tab('gifts', 's-gifts.png');
  await tab('insights', 's-insights.png');
  await tab('menu', 's-menu.png');
  await tab('finance', 's-fin-today.png');
  const sub = async (v, name) => safe(v, async () => { await s.click(`[data-act=fsub][data-v=${v}], [data-v=${v}][data-act=fsec], [data-v=${v}]`); await sw(1000); await s.screenshot({ path: OUT + name, fullPage: false }); });
  for (const [v, n] of [['close', 's-fin-close.png'], ['out', 's-fin-out.png'], ['bills', 's-fin-bills.png'], ['flow', 's-fin-flow.png'], ['pl', 's-fin-pl.png'], ['vat', 's-fin-vat.png'], ['staff', 's-fin-staff.png'], ['dates', 's-fin-dates.png'], ['reports', 's-fin-reports.png'], ['settings', 's-fin-settings.png']]) await sub(v, n);
  // website pages
  const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
  for (const [u, n] of [['labels.html', 'w-labels.png'], ['install.html', 'w-install.png'], ['trace.html?b=lintong&r=2026-10-20&l=L1&c=bag', 'w-trace.png']]) await safe(u, async () => { await d.goto(B + u); await d.waitForTimeout(1200); await d.screenshot({ path: OUT + n }); });
  await b.close(); console.log('done');
})();
