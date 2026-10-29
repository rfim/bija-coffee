#!/usr/bin/env node
// Internal link and asset check: renders each page in Chromium, records every same-origin
// request that fails, collects links and asset references from the rendered DOM, follows
// internal HTML links (whole site, same origin only) and checks each URL returns < 400.
// Also checks the icons in manifest.webmanifest and the offline shell list in sw.js.
const fs = require('fs');
const path = require('path');
const { ROOT, BASE_URL, loadPages, ensureServer, requirePlaywright, outPath, slug } = require('./lib/common');

const origin = new URL(BASE_URL).origin;
const isInternal = (u) => { try { return new URL(u).origin === origin; } catch { return false; } };
const strip = (u) => { const x = new URL(u); x.hash = ''; return x.href; };
const isPage = (u) => /(\.html?|\/)$/.test(new URL(u).pathname);

async function status(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return res.status;
  } catch (e) { return `error: ${e.message}`; }
}

(async () => {
  const { chromium } = requirePlaywright();
  const stopServer = await ensureServer();
  const browser = await chromium.launch();
  const refs = new Map();        // url -> Set of pages that reference it
  const broken = new Map();      // url -> reason (requests that failed during render)
  const queue = loadPages().map((p) => strip(new URL(p, BASE_URL).href));
  const visited = new Set();
  const rootAbsolute = [];
  const addRef = (url, from) => { if (!refs.has(url)) refs.set(url, new Set()); refs.get(url).add(from); };

  try {
    while (queue.length) {
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);
      const from = url.slice(origin.length + 1) || '/';
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
      const tab = await context.newPage();
      tab.on('response', (r) => {
        if (!isInternal(r.url()) || r.status() < 400) return;
        broken.set(strip(r.url()), `HTTP ${r.status()}`);
        if (strip(r.url()) !== url) addRef(strip(r.url()), from);
      });
      tab.on('requestfailed', (r) => { if (isInternal(r.url()) && !/ERR_ABORTED/.test(r.failure()?.errorText || '')) { broken.set(strip(r.url()), r.failure()?.errorText); addRef(strip(r.url()), from); } });
      try {
        await tab.goto(url, { waitUntil: 'load', timeout: 30000 });
        await tab.waitForTimeout(300);
        // Index pages redirect phones to the app; record where we really landed too.
        if (strip(tab.url()) !== url) addRef(strip(tab.url()), from);
        const found = await tab.evaluate(() => {
          const out = [];
          const add = (v) => { if (v) out.push(v); };
          document.querySelectorAll('a[href], area[href], link[href]').forEach((e) => add(e.href));
          document.querySelectorAll('img[src], script[src], source[src], video[src], audio[src], iframe[src], track[src], input[src], embed[src]').forEach((e) => add(e.src));
          document.querySelectorAll('video[poster]').forEach((e) => add(e.poster));
          document.querySelectorAll('[srcset]').forEach((e) => e.getAttribute('srcset').split(',').forEach((c) => {
            const u = c.trim().split(/\s+/)[0]; if (u) add(new URL(u, document.baseURI).href);
          }));
          // The live site is served from /bija-coffee/, so "/shop.html" works locally but 404s on Pages.
          const rooted = [];
          document.querySelectorAll('[href], [src]').forEach((e) => {
            const v = e.getAttribute('href') ?? e.getAttribute('src');
            if (/^\/(?!\/)/.test(v)) rooted.push(`${e.tagName.toLowerCase()} ${v}`);
          });
          return { out, rooted };
        });
        for (const r of found.rooted) rootAbsolute.push({ url: r, reason: 'root-absolute path breaks on GitHub Pages (use a relative path)', from: [from] });
        for (const f of found.out) {
          if (!/^https?:/.test(f) || !isInternal(f)) continue;
          const u = strip(f);
          addRef(u, from);
          if (isPage(u) && !visited.has(u)) queue.push(u);
        }
      } catch (e) {
        broken.set(url, e.message.split('\n')[0]);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  // PWA files: a missing icon breaks install, a missing shell entry breaks the service worker.
  const manifestPath = path.join(ROOT, 'manifest.webmanifest');
  if (fs.existsSync(manifestPath)) {
    const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const i of [...(m.icons || []), ...(m.screenshots || [])]) addRef(strip(new URL(i.src, BASE_URL).href), 'manifest.webmanifest');
    if (m.start_url) addRef(strip(new URL(m.start_url, BASE_URL).href), 'manifest.webmanifest');
  }
  const swPath = path.join(ROOT, 'sw.js');
  if (fs.existsSync(swPath)) {
    const shell = fs.readFileSync(swPath, 'utf8').match(/SHELL\s*=\s*\[([\s\S]*?)\]/);
    if (shell) for (const s of shell[1].match(/(['"])(.*?)\1/g) || []) addRef(strip(new URL(s.slice(1, -1), BASE_URL).href), 'sw.js SHELL');
  }

  const problems = [...rootAbsolute];
  for (const [url, from] of refs) {
    const reason = broken.get(url);
    const code = reason ? null : await status(url);
    if (reason || typeof code !== 'number' || code >= 400) problems.push({ url, reason: reason || (typeof code === 'number' ? `HTTP ${code}` : code), from: [...from] });
  }
  for (const [url, reason] of broken) if (!refs.has(url)) problems.push({ url, reason, from: [] });
  stopServer();

  fs.writeFileSync(outPath('links-report.json'), JSON.stringify({ checked: refs.size, pages: [...visited], problems }, null, 2));
  for (const p of problems) console.log(`BROKEN ${p.url.startsWith(origin) ? p.url.slice(origin.length) : p.url}  ${p.reason}\n       referenced by: ${p.from.join(', ') || '(page itself)'}`);
  console.log(`\n${visited.size} pages crawled, ${refs.size} internal URLs checked, ${problems.length} broken`);
  if (problems.length) fs.writeFileSync(outPath('logs', `links-${slug('broken')}.log`), problems.map((p) => `${p.url} ${p.reason} <- ${p.from.join(', ')}`).join('\n'));
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
