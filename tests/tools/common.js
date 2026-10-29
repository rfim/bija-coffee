// Shared helpers for the quality tools: page list, base URL, failure screenshots.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = (process.env.BASE_URL || 'http://localhost:8099').replace(/\/$/, '');
const OUT = path.join(ROOT, 'test-results');

function pages() {
  const file = path.join(ROOT, 'tests', 'pages.txt');
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

// Fresh, deterministic state for every page: no remembered view, no service worker
async function openPage(browser, page, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block', reducedMotion: 'reduce', bypassCSP: true }); // the app's CSP blocks injected scripts, including axe; audits bypass it (tests/security.js keeps CSP on)
  const tab = await context.newPage();
  const errors = [];
  tab.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  const res = await tab.goto(`${BASE}/${page}`, { waitUntil: 'load', timeout: 30000 });
  await tab.waitForTimeout(500); // let the app render its first view
  return { context, tab, status: res ? res.status() : 0, errors };
}

async function screenshot(tab, name) {
  const dir = path.join(OUT, 'screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name.replace(/[^a-z0-9._-]+/gi, '_') + '.png');
  try { await tab.screenshot({ path: file, fullPage: true }); return path.relative(ROOT, file); } catch { return ''; }
}

module.exports = { ROOT, BASE, OUT, pages, openPage, screenshot };
