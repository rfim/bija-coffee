// Shared helpers for the Node + Playwright checks in tests/. Lives in tests/lib/ so the
// CI loop over tests/*.js doesn't run it as a test of its own.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.PORT || 8099);
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}/`).replace(/\/?$/, '/');
const OUT_DIR = path.resolve(process.env.TEST_OUTPUT_DIR || path.join(ROOT, 'tests', 'results'));

const DEFAULT_PAGES = [
  'index.html?view=site',
  'shop.html',
  'product.html?id=lintong',
  'subscribe.html',
  'rewards.html',
  'checkout.html',
  'delivery.html',
  'privacy.html',
  'accessibility.html',
  'app.html?view=app',
];

// tests/pages.txt overrides the default list: one page per line, # starts a comment.
function loadPages() {
  const file = path.join(ROOT, 'tests', 'pages.txt');
  if (!fs.existsSync(file)) return DEFAULT_PAGES;
  const pages = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
    .map((p) => p.replace(/^\//, ''));
  return pages.length ? pages : DEFAULT_PAGES;
}

function ping(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

// Use the server CI already started; locally, start `python3 -m http.server` if nothing answers.
async function ensureServer() {
  if (await ping(BASE_URL)) return () => {};
  if (process.env.BASE_URL) throw new Error(`BASE_URL ${BASE_URL} is not answering`);
  const proc = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    if (await ping(BASE_URL)) return () => proc.kill();
    await new Promise((r) => setTimeout(r, 200));
  }
  proc.kill();
  throw new Error(`Could not start python3 -m http.server on port ${PORT}`);
}

function requirePlaywright() {
  try { return require('playwright'); } catch (e) {
    console.error('playwright is not installed. See tests/README.md (npm install playwright, or set NODE_PATH).');
    process.exit(2);
  }
}

function outPath(...parts) {
  const p = path.join(OUT_DIR, ...parts);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  return p;
}

const slug = (page) => page.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root';

module.exports = { ROOT, BASE_URL, DEFAULT_PAGES, loadPages, ensureServer, requirePlaywright, outPath, slug };
