# Tests

Checks that run in CI (`.github/workflows/ci.yml`) on every push and pull request to `main`.

| File | What it checks |
|---|---|
| `a11y.js` | axe-core 4.10.2 audit, WCAG 2.2 AA (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). Fails on any violation. |
| `links.js` | Renders each page, follows internal HTML links across the site and checks every internal link and asset (pages, CSS, JS, fonts, images, srcset, video, manifest icons, `sw.js` offline list) answers below HTTP 400. Also flags root-absolute paths (`/shop.html`), which work locally but break under `/bija-coffee/` on GitHub Pages. Fails on any 404, failed request or root-absolute path. External links are not checked. |
| `pages.txt` (optional) | Pages to audit, one per line, relative to the site root; `#` starts a comment. Without it the default list in `lib/common.js` is used. |
| `lib/` | Shared helpers. Not a test: CI only runs `tests/*.js`. |
| any other `*.js` | Run by CI with `node tests/<file>.js`. Exit code 0 means pass. Every file is run even if an earlier one fails. |

Default pages: `index.html?view=site`, `shop.html`, `product.html?id=lintong`, `subscribe.html`, `rewards.html`, `checkout.html`, `delivery.html`, `privacy.html`, `accessibility.html`, `app.html?view=app`.

## Running locally

You need Node 18 or later and Python 3. The site has no `package.json`, so install the tools outside the repo:

```sh
npm install --prefix ~/.bija-test-deps playwright@1.63.0 axe-core@4.10.2
~/.bija-test-deps/node_modules/.bin/playwright install chromium
export NODE_PATH=~/.bija-test-deps/node_modules

node tests/a11y.js
node tests/links.js
```

The tests use the server at `http://localhost:8099/`. If nothing is answering there, they start `python3 -m http.server 8099` from the repo root and stop it at the end. To test another server, set `BASE_URL`, for example `BASE_URL=https://rfim.github.io/bija-coffee/ node tests/links.js`.

Output goes to `tests/results/` (git-ignored), or to `TEST_OUTPUT_DIR` if that is set:

- `a11y-report.json` and `links-report.json` hold the full results.
- `screenshots/a11y-<page>.png` is a full-page screenshot of each page that failed.
- `logs/` holds the browser console of failing pages and the list of broken links.

In CI the same files are uploaded as the `test-results-<run>` artifact when a job fails.

## Fixing an axe failure

Each failure prints the rule, a link to Deque's explanation, the CSS selector of the element and what to change. Fix the page; do not disable rules. If a rule is a confirmed false positive, raise it with the lead before excluding it, and record why.

## Lighthouse

`.github/workflows/lighthouse.yml` runs Lighthouse CI on `main` for four pages, mobile and desktop (configs in `.github/lighthouse/`). Budgets: LCP under 2.5 s, CLS under 0.1, TBT under 200 ms, accessibility score 100. It is advisory: failures show in the run and the HTML reports are uploaded as artifacts, but they do not block merges. To run it locally:

```sh
python3 -m http.server 8099 &
npx @lhci/cli@0.15.1 autorun --config=.github/lighthouse/lighthouserc.mobile.json
```
