// Render every SVG in ../graphics to PNG at its native size (Playwright Chromium).
// Run: node marketing/launch/tools/render.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const dir = path.resolve(__dirname, '../graphics');
  const out = path.join(dir, 'png');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.svg'))) {
    const [, w, h] = fs.readFileSync(path.join(dir, f), 'utf8').match(/width="(\d+)" height="(\d+)"/);
    const page = await browser.newPage({ viewport: { width: +w, height: +h } });
    await page.goto('file://' + path.join(dir, f));
    await page.screenshot({ path: path.join(out, f.replace('.svg', '.png')) });
    await page.close();
  }
  await browser.close();
  console.log('rendered to', out);
})();
