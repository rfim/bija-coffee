// WCAG 2.2 AA audit with axe-core over every page in tests/pages.txt, at desktop and phone sizes.
// Usage: python3 -m http.server 8099 &  node tests/tools/a11y.js
// Exits 1 if any page has a violation; a screenshot of each failing page goes to test-results/screenshots/.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { OUT, pages, openPage, screenshot } = require('./common');

const AXE = require.resolve('axe-core/axe.min.js');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SIZES = { desktop: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } };

(async () => {
  const browser = await chromium.launch();
  const report = [];
  let failed = 0;
  for (const page of pages()) {
    for (const [size, viewport] of Object.entries(SIZES)) {
      const { context, tab, status } = await openPage(browser, page, viewport);
      const label = `${page} [${size}]`;
      if (status >= 400) { failed++; console.log(`✗ ${label}: HTTP ${status}`); await context.close(); continue; }
      await tab.addScriptTag({ path: AXE });
      const result = await tab.evaluate((tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] }), TAGS);
      const v = result.violations;
      report.push({ page, size, violations: v.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.map((n) => n.target.join(' ')) })) });
      if (v.length) {
        failed++;
        const shot = await screenshot(tab, `a11y-${size}-${page}`);
        console.log(`✗ ${label}: ${v.length} violation${v.length > 1 ? 's' : ''}${shot ? ` (screenshot ${shot})` : ''}`);
        for (const x of v) {
          console.log(`   - [${x.impact}] ${x.id}: ${x.help} (${x.helpUrl})`);
          for (const n of x.nodes.slice(0, 5)) console.log(`       ${n.target.join(' ')}`);
          if (x.nodes.length > 5) console.log(`       … and ${x.nodes.length - 5} more`);
        }
      } else console.log(`✓ ${label}`);
      await context.close();
    }
  }
  await browser.close();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'a11y-report.json'), JSON.stringify(report, null, 2));
  console.log(failed ? `\n${failed} page view(s) failed the WCAG 2.2 AA audit.` : '\nAll pages pass the WCAG 2.2 AA audit.');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
