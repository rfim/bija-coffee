# Tests and quality checks

Everything here runs in CI on every push and pull request to `main` (`.github/workflows/ci.yml`), and Lighthouse runs on `main` (`.github/workflows/lighthouse.yml`). You can run the same checks on your own machine.

| What | File | Blocks a merge? |
|---|---|---|
| Node test suites | `tests/*.js` (each file is run with `node`; a non-zero exit fails) | Yes |
| Accessibility audit: axe-core 4.10.2, WCAG 2.0/2.1/2.2 A and AA rules, desktop (1280×900) and phone (390×844) | `tests/tools/a11y.js` | Yes |
| Internal link check: every `href`/`src` in the HTML files, `sw.js`'s offline list, manifest icons, then every same-origin link, image, script and `#fragment` on the rendered pages | `tests/tools/links.js` | Yes |
| Lighthouse: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms, accessibility 100, phone and desktop | `tests/lighthouse/lighthouserc.*.json` | No (advisory) |

Pages audited and link-checked are listed in `tests/pages.txt` (one per line, query strings allowed). Add every new page there. Known, intentional gaps for the link checker go in `tests/links-ignore.txt` with a reason.

## Run locally

You need Node 22 and Python 3.

```bash
# 1. Install the pinned tools into tests/node_modules (ignored by git)
npm install --no-save --prefix tests playwright@1.63.0 axe-core@4.10.2
tests/node_modules/.bin/playwright install chromium     # add --with-deps on a fresh Linux machine

# 2. Serve the repo root (leave this running in another terminal)
python3 -m http.server 8099

# 3. Run the checks
for f in tests/*.js; do [ -e "$f" ] && node "$f"; done   # Node suites
node tests/tools/a11y.js                                  # WCAG 2.2 AA audit
node tests/tools/links.js                                 # internal links
```

Set `BASE_URL` to test somewhere else, for example `BASE_URL=https://rfim.github.io/bija-coffee node tests/tools/links.js`.

Results: each tool prints a pass/fail list. Failing pages get a full-page screenshot in `test-results/screenshots/`, and the accessibility audit writes `test-results/a11y-report.json`. In CI these are uploaded as the `test-results-<run id>` artifact on the run's Summary page.

### Lighthouse

```bash
npm install -g @lhci/cli@0.14.0
lhci autorun --config=tests/lighthouse/lighthouserc.mobile.json    # starts its own server on 8099; stop yours first
lhci autorun --config=tests/lighthouse/lighthouserc.desktop.json
```

Reports are written to `.lighthouseci/` (ignored by git); in CI they are uploaded as `lighthouse-<preset>-<run id>`. Each page is run 3 times and the median run is checked. Scores on a laptop differ from CI; compare like with like.

## Writing a Node test suite

- One file per area, named `tests/<area>.js` (for example `tests/loyalty.js`). Files in `tests/tools/` are the shared checks above and are not run as suites.
- Use `node:assert` and exit non-zero on failure (an uncaught error does this for you). `node:test` also works: `node tests/<area>.js` runs the `test()` blocks in the file and exits non-zero if any fail.
- Browser tests: `const { chromium } = require('playwright')`, open `process.env.BASE_URL || 'http://localhost:8099'`, and use a fresh context per test (`browser.newContext({ serviceWorkers: 'block' })`) so `localStorage` from one test does not leak into the next. `tests/tools/common.js` has `openPage()` and `screenshot()` helpers.
- Save failure screenshots under `test-results/screenshots/` so CI uploads them.
- Keep each suite under a minute; the CI job has a 20-minute limit.
