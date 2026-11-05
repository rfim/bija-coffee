---
name: core-architecture
description: How the café core shared by Bija Coffee and Ngopi UK is built (static site, single-file app, back office, Supabase or Neon, Maheera, Capacitor shells, service worker, CI). Use before adding a file, a screen, a data path, a backend call, a native feature or a deploy step, or when porting something between Bija and Ngopi.
---

# Café core: architecture

The full reference is `docs/CORE-BLUEPRINT.md` (Bija) and Ngopi's `README.md`. This skill is the short version: the rules that keep both brands working, and where they differ.

## 1. Shape

One static site on GitHub Pages. **No build step, no framework, no CDN scripts.** Every push to `main` deploys.

| Part | Entry | Notes |
|---|---|---|
| Website | `index.html` and the other `*.html`, `site-*.js/css` | Marketing, shop, gifts, subscribe, legal |
| Customer app | `app.html` | Order ahead, rewards, balance, subscription, profile. A PWA, and the same files inside the iOS and Android apps |
| Back office | `app.html?view=bar`, screens in `app-staff.js` | Loaded only after the staff PIN; runs `with (staffCore)`, so anything it needs must be listed in `staffCore` |
| Motion | `app-motion.js`, `app-motion.css` | Watches the DOM, adds motion, never changes data |
| Icons | `app-icons.js` | One line-icon family |
| Native | `native/` (Capacitor 7) | `scripts/build-www.mjs` copies the site into `www/` |
| Backend | **Bija: Supabase** (`bija-supabase.js`, `supabase/`). **Ngopi: Neon** (`ngopi-neon.js`, `neon/`) | Same role: the database is the authority |
| Back-office hub | Maheera (Kenduri / Krama), `vendor/maheera-panel.js` pinned with SRI | Orders and menu go out; Insights come in |

## 2. How the app works

- One state object `S`. `render()` rebuilds `#main` from `S` and repaints the overlays.
- Redraws must keep what the person sees: focus and caret, side-swiped strips (`scrollLeft`), and **already-loaded photos** (the same `<img>`/`<picture>` node is moved into the new page, or iPhone paints it blank for a frame).
- Clicks: buttons carry `data-act="name"`, handled by one delegated listener on `document`. Inputs carry `data-*` handled by one `input` listener. Typing never calls `render()`, except search.
- Pick action names nobody else uses (the Maheera panel has its own; `mh-sub` clashed once).
- Overlays that need app internals (onboarding, sheets) live in `app.html`; pure motion lives in `app-motion.*`.

## 3. Data and trust

- **Two modes, one code path.** Local mode keeps everything on the device (development, screenshots, recordings). Live mode uses the backend. The UI never says "demo".
- **Never trust the browser.** Prices, totals, points, stamps, balances, gift codes and who may see a row are decided in the database: row level security, ledgers, `security definer` functions that check the caller. A UI-only check is a bug.
- Money, points and stamps come from ledgers through RPCs, never from documents the browser wrote.
- No secrets in the repo; the repos are public. Publishable keys only. Staff PINs exist only as hashes on the server. A starter PIN written in a README must be changed before launch.
- Database changes are recorded in the repo (`docs/backend/*.sql` for Bija, `neon/` for Ngopi) so a new project can be rebuilt, and are written to run twice safely.

## 4. Phones, views and layout

- **One layout on every phone.** An inline script in `app.html`'s `<head>` lays out phones from 320 to 440 points wide at **428** (iPhone 13 Pro Max) and lets the browser scale it. `--vpk` converts Android system-bar sizes. Android's `MainActivity` sets the wide viewport.
- Safe areas only through `--sa-top/right/bottom/left`. Sheets use `dvh` with a `vh` fallback.
- **App on phones, web on computers** (Ngopi's `ngopi-view.js`): on a phone, Home, Menu, Shop and Account open the app; information pages stay web. `?view=app`, `?view=site` and `?view=bar` override. Reuse this when a brand wants it.
- Deep links (`?stamp`, `?ref`, `?order`, `#wallet=`) must skip openings and onboarding and land on the thing linked.

## 5. Openings and first-run

- A first-frame cover (`html.mo-boot`, set by an inline head script) keeps Home from flashing before the opening; `app-motion.js` lifts it, and a safety timer lifts it anyway.
- Opening state lives in `sessionStorage`/`localStorage` keys (`mo.splash` lets capture scripts skip it; `bija.onb` marks onboarding seen). Respect `prefers-reduced-motion`, `navigator.webdriver` and `?onb=1` (force a look).

## 6. Offline and updates

- `sw.js` is network first: every request revalidates (`fetch(req, { cache: 'no-cache' })`, a cheap 304), so a release reaches phones at once instead of after the host's 10-minute cache; the cache is the offline fallback.
- Bump `CACHE` when the shell list changes. A new top-level file the page loads goes into the service worker's `SHELL` and into `native/scripts/build-www.mjs`, or it won't be offline or in the native app.

## 7. Native apps

- Capacitor shells around `app.html`: app id `uk.co.bijalondon.app` for Bija.
- `android-apk.yml` builds a test APK on every push. `ios-simulator.yml` proves iOS compiles (run it by hand after app changes). Installing on iPhones needs TestFlight: the brand's Apple Developer account and a signing certificate.
- Native sign-in (Apple, Google) goes through `native-bridge.js`; Google blocks sign-in inside web views.

## 8. Performance rules (already paid for)

- No `body:has()`; toggle a body class instead.
- No forced layout in `render()`; start animations with the Web Animations API.
- Save and restore `scrollLeft` of strips; update carousel dots from the strip's scroll position.
- Backdrop blur only after movement settles.
- QR codes stay dark on a light tile; some till scanners can't read light on dark.

## 9. Ship it

```bash
python3 -m http.server 8099        # from the repo root; tests expect it
node tests/security.js             # 12 findings must pass
```

- Commit with a message that says what changed for the people using it. Push `main`; check the Pages run (and CI, Lighthouse, APK) succeed.
- Copy changed files to the site mirror if the brand keeps one.
- Vendor files are pinned and copied in with their integrity hash. No new packages or CDN scripts without asking the owner.

## 10. Porting between Bija and Ngopi

- Port patterns and mechanisms (state, data rules, openings, onboarding, service worker, motion tokens), not brand assets.
- Swap the backend calls (Supabase RPC ⇄ Neon function), tokens, wordmark, photos, copy and codes (`BIJA-…` member and gift prefixes).
- Run the brand's own tests and the phone-shape sweep before pushing.
