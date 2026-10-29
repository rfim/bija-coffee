// Internal link checker.
// 1. Static: every href/src in every *.html in the repo root, plus sw.js's offline list and the manifest icons, must point at a file that exists.
// 2. Rendered: every same-origin link, image, script and stylesheet on each page in tests/pages.txt (after its JavaScript runs) must return HTTP 200,
//    and every same-page #fragment must match an id.
// External links (http(s) to other sites, mailto:, tel:) are not fetched.
// Usage: python3 -m http.server 8099 &  node tests/tools/links.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ROOT, BASE, pages, openPage, screenshot } = require('./common');

const problems = [];
const bad = (where, what) => problems.push(`${where}: ${what}`);
const skip = (u) => !u || /^(https?:|mailto:|tel:|data:|javascript:|blob:|\/\/)/i.test(u) || u.includes('${') || u.startsWith('#');
// Known gaps that are handled on purpose (one path per line in tests/links-ignore.txt, # for comments)
const IGNORE = (() => { try { return fs.readFileSync(path.join(ROOT, 'tests', 'links-ignore.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')); } catch { return []; } })();
const ignored = (u) => IGNORE.some((p) => (u || '').split('#')[0].split('?')[0].replace(/^\.?\//, '').endsWith(p));
const fileOf = (u) => decodeURIComponent(u.split('#')[0].split('?')[0]);

function staticPass() {
  const htmls = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  for (const f of htmls) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/\b(href|src|srcset|poster)\s*=\s*"([^"]*)"/gi)) {
      const list = m[1].toLowerCase() === 'srcset' ? m[2].split(',').map((x) => x.trim().split(/\s+/)[0]) : [m[2].trim()];
      for (const raw of list) {
        if (skip(raw) || ignored(raw)) continue;
        const p = fileOf(raw);
        if (!p || p === './') continue;
        if (!fs.existsSync(path.join(ROOT, p))) bad(f, `missing file ${raw}`);
      }
    }
  }
  // offline cache list in the service worker
  const sw = path.join(ROOT, 'sw.js');
  if (fs.existsSync(sw)) {
    const list = fs.readFileSync(sw, 'utf8').match(/SHELL\s*=\s*\[([^\]]*)\]/);
    if (list) for (const m of list[1].matchAll(/'([^']+)'/g)) if (m[1] !== './' && !fs.existsSync(path.join(ROOT, fileOf(m[1])))) bad('sw.js', `offline list has missing file ${m[1]}`);
  }
  const man = path.join(ROOT, 'manifest.webmanifest');
  if (fs.existsSync(man)) {
    try { for (const i of JSON.parse(fs.readFileSync(man, 'utf8')).icons || []) if (!fs.existsSync(path.join(ROOT, fileOf(i.src)))) bad('manifest.webmanifest', `missing icon ${i.src}`); }
    catch (e) { bad('manifest.webmanifest', `invalid JSON (${e.message})`); }
  }
  console.log(`Static pass: ${htmls.length} HTML files checked.`);
}

async function renderedPass() {
  const browser = await chromium.launch();
  const checked = new Map(); // url -> status
  for (const page of pages()) {
    const { context, tab, status, errors } = await openPage(browser, page);
    if (status >= 400) { bad(page, `page returns HTTP ${status}`); await context.close(); continue; }
    for (const e of errors) bad(page, `JavaScript error on load: ${e}`);
    const found = await tab.evaluate(() => {
      const urls = [];
      for (const el of document.querySelectorAll('a[href], area[href], link[href], img[src], script[src], source[src], video[src], iframe[src]')) {
        const raw = el.getAttribute('href') ?? el.getAttribute('src');
        urls.push({ raw, abs: el.href || el.src, tag: el.tagName.toLowerCase() });
      }
      const ids = new Set([...document.querySelectorAll('[id]')].map((e) => e.id));
      const names = new Set([...document.querySelectorAll('a[name]')].map((e) => e.name));
      const frags = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)).filter((f) => f && !ids.has(decodeURIComponent(f)) && !names.has(f));
      return { urls, frags: [...new Set(frags)] };
    });
    for (const f of found.frags) bad(page, `link to #${f} but no element has that id`);
    const origin = new URL(BASE).origin;
    let pageBad = false;
    for (const { raw, abs } of found.urls) {
      if (!abs || !abs.startsWith(origin) || /^(mailto:|tel:|javascript:|data:)/i.test(raw || '')) continue;
      const url = abs.split('#')[0];
      if (!checked.has(url)) {
        let s = 0;
        try { s = (await context.request.get(url, { timeout: 15000 })).status(); } catch { s = 0; }
        checked.set(url, s);
      }
      const s = checked.get(url);
      if (s !== 200 && !ignored(raw)) { bad(page, `${raw} → ${s || 'no response'}`); pageBad = true; }
    }
    if (pageBad || errors.length) await screenshot(tab, `links-${page}`);
    await context.close();
  }
  await browser.close();
  console.log(`Rendered pass: ${pages().length} pages, ${checked.size} internal URLs fetched.`);
}

(async () => {
  staticPass();
  await renderedPass();
  if (problems.length) {
    console.log(`\n✗ ${problems.length} broken internal link(s):`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log('\n✓ No broken internal links.');
})().catch((e) => { console.error(e); process.exit(1); });
