// Prints the handbook HTML to A4 PDFs: node build-pdf.js (after python3 build.py)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  for (const [h, o] of [['owner.html', 'Bija-Owner-Handbook.pdf'], ['barista.html', 'Bija-Barista-Quick-Guide.pdf']]) { await p.goto('file://' + path.join(__dirname, h)); await p.waitForTimeout(600); await p.pdf({ path: path.join(__dirname, o), format: 'A4', printBackground: true }); }
  await b.close(); console.log('pdfs done'); })();
