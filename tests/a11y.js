#!/usr/bin/env node
// WCAG 2.2 AA audit: loads each page in Chromium, runs axe-core, fails on any violation.
// Pages come from tests/pages.txt or the default list in tests/lib/common.js.
const fs = require('fs');
const { BASE_URL, loadPages, ensureServer, requirePlaywright, outPath, slug } = require('./lib/common');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function axeSource() {
  try { return fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) {
    console.error('axe-core is not installed. See tests/README.md (npm install axe-core@4.10.2).');
    process.exit(2);
  }
}

(async () => {
  const { chromium } = requirePlaywright();
  const axe = axeSource();
  const stopServer = await ensureServer();
  const browser = await chromium.launch();
  const report = [];
  let failed = 0;

  try {
    for (const page of loadPages()) {
      const url = new URL(page, BASE_URL).href;
      // Fresh context per page so remembered views and baskets don't leak between pages.
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
      const tab = await context.newPage();
      const consoleLog = [];
      tab.on('console', (m) => consoleLog.push(`[${m.type()}] ${m.text()}`));
      tab.on('pageerror', (e) => consoleLog.push(`[pageerror] ${e.message}`));
      try {
        const res = await tab.goto(url, { waitUntil: 'load', timeout: 30000 });
        if (!res || res.status() >= 400) throw new Error(`HTTP ${res ? res.status() : 'no response'}`);
        await tab.waitForTimeout(500);
        await tab.addScriptTag({ content: axe });
        const result = await tab.evaluate((tags) => window.axe.run(document, {
          runOnly: { type: 'tag', values: tags },
          resultTypes: ['violations'],
        }), TAGS);
        const violations = result.violations;
        report.push({ page, url, violations });
        if (violations.length) {
          failed++;
          console.log(`FAIL ${page}: ${violations.length} rule(s) violated`);
          for (const v of violations) {
            console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})`);
            for (const n of v.nodes.slice(0, 5)) console.log(`      ${n.target.join(' ')}\n        ${n.failureSummary.replace(/\n/g, '\n        ')}`);
            if (v.nodes.length > 5) console.log(`      ...and ${v.nodes.length - 5} more`);
          }
        } else {
          console.log(`ok   ${page}`);
        }
      } catch (e) {
        failed++;
        report.push({ page, url, error: e.message });
        console.log(`FAIL ${page}: ${e.message}`);
      }
      if (report[report.length - 1].error || report[report.length - 1].violations.length) {
        await tab.screenshot({ path: outPath('screenshots', `a11y-${slug(page)}.png`), fullPage: true }).catch(() => {});
        fs.writeFileSync(outPath('logs', `a11y-${slug(page)}-console.log`), consoleLog.join('\n'));
      }
      await context.close();
    }
  } finally {
    await browser.close();
    stopServer();
  }

  fs.writeFileSync(outPath('a11y-report.json'), JSON.stringify(report, null, 2));
  console.log(`\naxe-core ${TAGS.join(', ')}: ${report.length - failed}/${report.length} pages clean`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
