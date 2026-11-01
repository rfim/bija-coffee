// Copies the Bija site into native/www for Capacitor, then (optionally) runs `cap sync`.
// Works in both layouts: the local workspace (../site) and the GitHub repo (site files at the repo root).
// Usage: node scripts/build-www.mjs [--no-sync]
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const here = dirname(dirname(fileURLToPath(import.meta.url))); // native/
const local = join(here, '..', 'site');
const src = existsSync(join(local, 'app.html')) ? local : join(here, '..');
if (!existsSync(join(src, 'app.html'))) throw new Error(`app.html not found in ${src}`);
const out = join(here, 'www');

// Not shipped inside the app: build tooling, docs, tests, marketing source files and this folder itself.
const SKIP = new Set(['native', 'docs', 'tests', 'marketing', 'node_modules', '.git', '.github', 'README.md', 'CNAME', '.nojekyll', '.well-known', 'labels.html', 'labels.js', 'supabase', 'emails', 'press', 'illustrations/preview.html', 'wallet/preview.html']);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of readdirSync(src)) {
  if (SKIP.has(name) || name.startsWith('.')) continue;
  cpSync(join(src, name), join(out, name), { recursive: true });
}
// The website's home page redirects phones to the app anyway; inside the app it opens the app straight away.
if (existsSync(join(out, 'index.html'))) cpSync(join(out, 'index.html'), join(out, 'site.html'));
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#ffffff"><title>Bija</title>
<script>location.replace('app.html?view=app&backend=supabase&source=native' + location.hash);</script>
</head><body style="background:#fff"></body></html>
`);
console.log(`www built from ${src}: ${readdirSync(out).length} entries`);
if (!process.argv.includes('--no-sync')) execSync('npx cap sync', { cwd: here, stdio: 'inherit' });
