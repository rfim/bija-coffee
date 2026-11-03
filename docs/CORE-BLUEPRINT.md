# Café core blueprint

How the Bija website, app, back office and their backends fit together, written so the same core can be rebuilt for another brand. Bija is the worked example throughout; anything marked **Brand** is what you swap.

Contents:
1. What the core is
2. Brand swap checklist
3. File map
4. How the app works
5. Customer features
6. Back office
7. Supabase
8. Maheera (Kenduri)
9. Phone apps (Capacitor)
10. Look, feel and UX rules
11. Tests and CI
12. Recreate for a new brand, step by step
13. Lessons already paid for

---

## 1. What the core is

One static site, no build step, no framework, served by GitHub Pages:

| Part | What it is | Entry point |
|---|---|---|
| Website | Marketing pages, shop, gift cards, subscribe, legal | `index.html` and the other `*.html` |
| Customer app | Order ahead, rewards card, stamps, balance, subscriptions, profile. A PWA in the browser, and the same files inside the iOS and Android apps | `app.html` |
| Back office | Queue, web orders and delivery, members, gift cards, finance, menu, Insights and Maheera. Lives inside `app.html` | `app.html?view=bar` |
| Phone apps | Capacitor 7 shells around `app.html` | `native/` |
| Backend | Supabase (Postgres, Auth, Realtime, Edge Functions, Vault) | `supabase/`, `docs/backend/*.sql` |
| Back-office data hub | Maheera, Kenduri's shared back office (Neon). Receives orders and menu changes, shows stock, costs and P&L | `supabase/functions/maheera`, `vendor/maheera-panel.js` |

The app runs in two modes from the same code:
- **Local mode**: everything is stored on the device. Used for development, screenshots and recordings. The UI must never call it "demo".
- **Live mode**: Supabase is the authority, and the browser only displays what the database decides.

---

## 2. Brand swap checklist

| Brand item | Where | Bija value |
|---|---|---|
| Name, tagline, address, hours | `app.html` config defaults, website pages, `manifest.webmanifest` | Bija · St James's Market |
| Logo mark (SVG) | `app.html` (`.logo`, favicon data URI), `icons/`, `native/assets` | Kawung four-circle mark |
| Colours | CSS tokens at the top of `app.html` (`--ink`, `--paper`, `--card`, `--line`, `--muted`, `--leaf`, `--warn`) and `site-shop.css` | Black and white, warm grey `#efedea` |
| Fonts | `fonts/` (self-hosted woff2) and `fonts/fonts.css` | Archivo (display), Inter (body) |
| Photos and illustrations | `photos/`, `illustrations/`, `PHOTO` map in `app.html` | |
| Menu, prices, allergens | `menu_items` table (live); `config/current` defaults in `app.html` (local mode) | |
| Rewards and tiers | `REWARDS`, `STAMP_FREE_AT`, `PTS`, `BONUS` in `app.html`; `rewards` table and `private.award_bonuses` (live) | 10 pts per £1; cake 350; tiers Seed, Sprout 1,500, Kopi Tree 5,000 |
| Member code prefix | `memberCode()` in `app.html`, `members.member_code` | `BIJA-XXXXX` |
| Gift card code format | `giftCode()`, `activate_gift` RPC | `BIJA-XXXX-XXXX` |
| Card designs | `THEMES` in `app.html` | Kawung Noir, Paper, Parang… |
| Shop beans, subscriptions | `SHOP`, `PLANS`, `GRINDS`, `SUB_OFF`, `POST`, `FREE_POST`; `CUPS` and `BREWS` for Create subscription | 200 g bags, 10% off, free post |
| Supabase project | `bija-supabase.js` (`url`, publishable `key`) | project `bija` |
| Maheera tenant | Vault entries and Maheera's own settings (words, ink colour) | Bija |
| App ids | `native/capacitor.config.ts` (`appId`, `appName`, `server.hostname`), Android package folder, iOS bundle id | `uk.co.bijalondon.app` |
| Admin email | Staff login in the PIN panel; `staff_unlock` checks it | set in Supabase, never in code |
| Site URL | GitHub Pages; `canonical` and links | `rfim.github.io/bija-coffee` |

Never put in the repo: real PINs, passwords, service keys, VAPID private keys, Apple or Google certificates. The owner pastes them into Supabase secrets or Vault.

---

## 3. File map

| File | What it is |
|---|---|
| `app.html` | The whole customer app and back-office shell: CSS tokens, all render functions, actions, local data layer. One script, plain JS |
| `app-staff.js` | Back-office screens, loaded only after the staff PIN. Runs `with (staffCore)`, so it shares state and helpers with `app.html`; anything it needs must be listed in `staffCore` |
| `app-motion.js`, `app-motion.css` | Motion layer: splash, add-to-order flight, nav lens, view transitions, card lift. Watches the DOM, never changes data |
| `app-icons.js` | Line icons (`BijaIcons`) |
| `bija-supabase.js` | Supabase client wrapper: anonymous sign-in, the `docs` table as a document store with realtime, RPC wrappers, staff unlock, lock and touch |
| `vendor/supabase.js` | supabase-js, pinned and copied in |
| `native-bridge.js` | Native extras inside Capacitor: splash hide, status bar, push, QR scanner, social login |
| `wallet.js` | Apple and Google Wallet pass offer; shows nothing until the server says it's configured |
| `push.js` | Web Push opt-in; off until the VAPID secrets exist |
| `sw.js` | Offline shell, network first; push display. Bump `CACHE` when the shell list changes |
| `site-*.js`, `site-*.css` | Website behaviour: shop, consent banner, discover tools, the hidden back-office way in (`site-backoffice.js`) |
| `vendor/maheera-panel.js`, `vendor/maheera-fonts/` | Kenduri's shared `<maheera-panel>` web component (v3, pinned with its SRI) and its host font kit |
| `supabase/functions/maheera` | Edge Function: reads Maheera for staff and owners |
| `supabase/functions/send-push` | Edge Function: Web Push when an order is ready |
| `supabase/functions/wallet-pass` | Edge Function: signed `.pkpass` and Google Wallet save links |
| `docs/backend/*.sql` | Every migration applied to live, recorded so a new project can be rebuilt |
| `native/` | Capacitor project, `scripts/build-www.mjs` (copies the site into `www/`), Android and iOS shells |
| `.github/workflows/` | `ci.yml`, `lighthouse.yml`, `android-apk.yml`, `ios-simulator.yml`, `pages.yml` |
| `tests/` | `security.js` (12 findings), Maheera tests, Lighthouse budgets |

---

## 4. How the app works

**State and drawing**
- One state object `S`. `render()` rebuilds `#main` from `S` and repaints the overlays.
- It keeps focus and caret, and keeps side-swiped strips (`.promos`, `.ptiles`) where they were when the same page redraws.
- Typing updates `S` in place and never calls `render()`, except for search.

**Events**
- Buttons carry `data-act="name"` and are handled by one delegated `click` listener.
- Inputs carry `data-f`, `data-g`, `data-sw`, `data-sub` and similar, and are handled by one `input` listener.
- Pick action names that aren't used anywhere else. `mh-sub` clashed once with the Maheera panel's own action.

**Two views**
- `S.view` is `customer` or `bar` (the back office), and `S.tab` / `S.btab` pick the page.

**Data layer**
- `S.db.doc(path).get/set/update`, with the same API in both modes.
  - Local mode: `localStorage` key `bija.app.demo`.
  - Live mode: the Supabase `docs` table, with realtime on changes.
- Money, points and stamps in live mode never come from docs. They come from ledgers through RPCs (see section 7).

**Offline:** `sw.js` caches the shell. Staff screens and the Maheera panel load only when used.

**One layout on every phone**
- An inline script in `app.html`'s `<head>` lays out phones from 320 to 440 points wide at **428**, the iPhone 13 Pro Max standard, and the browser scales it to fit.
- `--vpk` converts the Android system-bar sizes into page units.
- Change the standard there: one number in the script, plus the comment in `MainActivity.java`.

**Safe areas:** use `--sa-top`, `--sa-right`, `--sa-bottom`, `--sa-left` everywhere.
- On iOS they come from `env()`.
- On Android (edge to edge) they come from Capacitor's `--safe-area-inset-*`.

---

## 5. Customer features

| Feature | Notes |
|---|---|
| Launch splash with greeting | Once per session: mark draws, time-of-day question, "Selamat pagi · Open now · until 5.30pm". Home keeps the hello line small |
| Home | For you card (usual or signature drink, alternating with the allergy question), What's new photo strip with dots, its height capped so it never runs under the bottom bar |
| Order | Search, filter coffee card, sticky section bar (ink fill switch, `?catfx=`), menu rows, drink sheet with options and allergens |
| Order bar | Black basket bar; tapping it grows the bar into the order list with steppers and bin (soft focus default, `?bagfx=`) |
| Checkout | Compact: items, total, points line, one-line allergy prompt, pick-up time chips, name, note folded, Place order pinned |
| Allergies | Asked once (UK's 14 allergens), saved, flagged on every item, put at the start of the order note, never optional to read |
| Rewards | Bija Card (flip to QR, never mirrored: only the visible side is drawn), stamps, rewards, passport, tiers |
| Profile sidebar | Membership card with QR, app balance, Add money (top-up = gift card to yourself, credited when the bar takes payment), wallet buttons, History, Stamp card, Account, Subscription, More, small links |
| Subscription | Grind-style: landing, then Create subscription (brew → cups a day → beans → delivery), saved as a normal shop subscription (soft focus motion, `?subfx=`) |
| Gift cards | Buy for someone (pay at the bar, code issued by the server), redeem a code into the balance |
| Push, wallet, sign-in | All off until the owner adds the secrets; the UI never offers what can't work |

---

## 6. Back office

**Ways in:**
- **Website:** type `opensesame` anywhere on the site (`site-backoffice.js`). It opens `app.html?view=bar&back=<page>`, and Exit returns to that page.
- **Phone app:** hold the Order button for 3 seconds.
- Then sign in with the admin email and staff PIN.
  - Live mode: `staff_unlock` checks a salted, hashed PIN on the server, rate-limited, and returns a short staff session. `staff_touch` keeps it alive; `staff_lock` ends it.
  - The idle lock is 30 minutes.
  - Test hook: `window.__bijaPin(pin, email)`.

**Tabs:** Queue, Web & delivery, Members, Gift cards, Finance, Menu. Number keys 1–6 jump between them on a computer.

**Insights and Maheera:**
- They sit behind a floating black button with Maheera's glowing amber mark (`#mhorb`, `S.mhui`, default `3`).
- It opens **Insights first**, with an Insights | Maheera switch on top, as in Stir's kitchen.
- `?mhui=1..5` tries the other placements.

**Same screens on the web and on the phone.** The web admin gets a sidebar layout from 900 px wide.

---

## 7. Supabase

### Project settings (owner, dashboard)
1. Authentication: turn on **Anonymous sign-ins** and **Manual linking**. Without anonymous sign-in the app can't reach Supabase and stays in local mode.
2. Set the Site URL and Redirect URLs (Pages URL, `app.html`, the native scheme).
3. Set up custom SMTP and paste the email templates (`docs/email-templates/`).
4. Providers: Google and Apple IDs. See `docs/backend/native-sign-in.md`.
5. Put the publishable key in `bija-supabase.js`. It's safe in the browser; row-level security guards everything.

### Tables (from `docs/backend/ledger-api.md`)
`menu_items`, `rewards`, `members`, `orders`, `points_ledger`, `stamps_ledger`, `gift_cards`, `gift_ledger`, `instore_sales`, `checkins`, `audit_log`, `owners`, plus `docs` (the document store).

### Rules that make it safe (keep all of them)
- Every RPC is `security definer`, uses `set search_path = ''`, has execute revoked from `public`/`anon` and granted to `authenticated`, and checks the caller inside.
- **The server prices everything.** `place_order` reads `menu_items`; nothing priced in the browser is trusted.
- **Balances are ledgers.** Points, stamps and gift money are rows with `unique (kind, ref)`, so a retry never posts twice. Corrections and undo post `reversal` rows; history is never deleted.
- **Bonuses are posted by the server** (`private.award_bonuses` inside `collect_order`) with London-time refs: welcome, passport, regular, explorer, birthday, with a monthly cap.
- **Gift codes:** made on the server (`gen_random_bytes`), only the sha256 is stored, the code is shown once, redeem is one conditional update, and failed tries are rate-limited.
- **Staff actions:** a live PIN session, and every action written to `audit_log`.
- **Owner-only adjustments:** need `owners` plus MFA (`aal2`).

### RPCs the app calls (`bija-supabase.js`)
- **Customer:** `my_member`, `balances`, `place_order`, `cancel_order`, `request_gift`, `redeem_gift`, `my_gifts`, `set_birth_month`, `check_in_spot`.
- **Staff:** `set_order_status`, `collect_order`, `undo_collect`, `add_instore`, `activate_gift`, `staff_gift_cards`, `staff_members`, `staff_insights`, `staff_sales_daily`, `staff_unlock`, `staff_touch`, `staff_lock`, `staff_change_pin`.
- **Owner:** `adjust`.

### Edge Functions and their secrets
| Function | Secrets | Off until |
|---|---|---|
| `maheera` | `MAHEERA_AUTH_URL`, `MAHEERA_DATA_API_URL`, `MAHEERA_BIJA_EMAIL`, `MAHEERA_BIJA_PASSWORD` (or the same names in Vault via `kenduri_config`) | answers 503 `setup` |
| `send-push` | VAPID public and private key, subject | the app never offers alerts |
| `wallet-pass` | Apple Pass Type ID certificate, Google Wallet issuer | wallet buttons hidden |

### Rebuild a project
Apply `docs/backend/*.sql` in this order:
1. Ledgers: tables, helpers, RPCs (the migrations named in `ledger-api.md`).
2. `staff-views.sql`
3. `kenduri-outbox.sql`
4. `kenduri-config.sql`
5. `kenduri-bija-adapter.sql`
6. `maheera-access.sql`

Each file is written to run twice safely. Then deploy the three functions.

---

## 8. Maheera (Kenduri)

Maheera is Kenduri's shared back office on Neon. A brand joins in two directions.

### Out: the brand's events into Maheera
- **`kenduri-outbox.sql`**
  - Creates the `kenduri` schema (closed to `anon` and `authenticated`), `kenduri.settings` and the outbox table.
  - `kenduri.deliver()` signs events and posts them to `kenduri-relay`, on a `pg_cron` schedule.
  - Needs `pg_net`, `pg_cron`, and the Vault entries `kenduri_signing_secret` and `kenduri_customer_salt`.
- **`kenduri-<brand>-adapter.sql`**
  - Triggers on orders, till sales and menu changes that queue events.
  - **They must be fail-safe**: every trigger function ends in `exception when others ... return`, so a Maheera problem never blocks an order.
  - The source of truth for adapters is the `rfim/maheera` repo (`adapters/`). Copy the brand's adapter from there and rename the functions.
  - Customer ids are salted before they leave.
- **`kenduri-config.sql`:** `public.kenduri_config(name)` reads Vault for the Edge Functions. Service role only.

### In: Maheera inside the back office
- **The panel**
  - `<maheera-panel>` is a web component, vendored at `vendor/maheera-panel.js` and pinned with its SRI hash (the hash is in `app-staff.js`, `MH_PANEL_SRI`).
  - It's fed by the shared `maheera-panel` function.
  - Load its fonts with `vendor/maheera-fonts/fonts.css` in the page head, because `@font-face` doesn't work inside its shadow root.
  - The brand's words and ink colour are **settings in Maheera**, not code in the app.
- **Fallback:** until `maheera-panel` is deployed, the tab falls back to the older read-only view from the `maheera` function.
  - That function signs in to Neon Auth as the brand's Maheera service user.
  - It reads a fixed allow-list of views. Nothing from the request is forwarded, and Maheera's row-level security limits every row to the brand.
  - Its logs carry error codes only.
- **Who may open it:** `public.maheera_access()`, meaning staff with a live PIN session or owners with MFA (falling back to `staff_touch`).
- **Panel lifecycle:** keep one panel element in `S.mh` and move it into the new slot on each render, so it doesn't reload. Exit and the idle lock destroy it.
- **Upgrading the panel:** copy `maheera-panel.js` and the font kit from `rfim/maheera` together, update the SRI, and re-run `tests/maheera-panel.js`.

### For a new brand
1. Ask Kenduri for a tenant, a service user, and the relay signing secret.
2. Set Maheera's settings for the brand's words and colours.
3. Put the four `MAHEERA_*` values and the two Kenduri Vault entries in the new Supabase project.
4. Apply the outbox, config, adapter and access migrations.

---

## 9. Phone apps (Capacitor)

**Config:** `native/capacitor.config.ts`
- `appId`, `appName`, `webDir: 'www'`.
- `server.hostname` set to a real-looking https host, so the app treats itself as live.
- Splash with `launchAutoHide: false`; `native-bridge.js` hides it once the app has drawn.
- `SystemBars: { insetsHandling: 'css' }`, so Android 15 edge to edge passes the bar sizes as CSS variables.

**Building:**
- `node native/scripts/build-www.mjs` copies the site into `native/www`, leaving out docs, tests and tooling, then `npx cap sync`.
- **Android:** `MainActivity.java` turns on `setUseWideViewPort` and `setLoadWithOverviewMode`, so the WebView honours the page's 428 layout width. Keep this, or Android phones won't match the standard.
- **CI:**
  - `android-apk.yml` builds an APK on every push.
  - `pages.yml` publishes the latest APK on the website at `download/bija-android.apk`; the repo is private, so release links 404.
  - `ios-simulator.yml` proves the iOS app compiles. TestFlight needs the brand's Apple Developer account and signing.
- **Icons and splash:** `native/scripts/make-assets.mjs` from `native/assets`.

---

## 10. Look, feel and UX rules

- **Style:** Grind-style minimal black and white, generous whitespace, one display face and one body face. Maheera's amber is the only warm accent, and only on Maheera's mark.
- **Copy:** British English and plain labels. Never the word "demo" in the UI. Write for the customer, not the system.
- **Motion:**
  - Calm and smooth, animating only transform and opacity, on iPhone-sheet easing `cubic-bezier(.32,.72,0,1)`.
  - Play once on open, never on a redraw. Nothing moves under `prefers-reduced-motion`.
  - Blur belongs only on a backdrop that fades, or on small content; never animate a large `clip-path` or `box-shadow`.
  - When choosing a style, record five options as slow-motion GIFs and let the owner pick. The chosen ones live behind `?bagfx`, `?catfx`, `?subfx` and `?mhui`, with a default.
- **Layout:**
  - 428 standard on phones.
  - Touch targets at least 44 px.
  - `dvh` (with a `vh` fallback) for anything sized by the screen height.
  - Pinned bottom controls clear the bottom bar and the system bar.
  - No sideways scroll.
- **Honesty:** never offer what can't work yet (push, wallet, card payment). Say "Nothing is charged in the app yet" rather than pretending.
- **Allergies:** never a joke and never hidden. They go on every item, at checkout and in the barista note.

---

## 11. Tests and CI

```bash
python3 -m http.server 8099          # from the repo root; the tests expect this
node tests/security.js               # 12 findings must pass (XSS, ledgers, gift codes, staff access…)
node tests/maheera-function.js && node tests/maheera-panel.js && node tests/maheera-tab.js
```

- **`ci.yml`** runs every `tests/*.js` on every push, plus an accessibility audit (axe-core, WCAG 2.2 AA, `tests/tools/a11y.js`) and an internal link check (`tests/tools/links.js`). **`lighthouse.yml`** checks performance budgets.
- **Phone shapes:** check the iPhone 13 Pro Max (428×926), iPhone 13 (390×844), Galaxy A15 (360×800, three-button bar), S24 Ultra (384×832) and iPhone SE (375×667). Add the system bars and look at Home, Order, the order bar, checkout, Rewards, Profile, Subscription and the back office.
- **Smoothness:** measure frame timing with the CPU slowed 4× (Chrome DevTools Protocol `Emulation.setCPUThrottlingRate`). No frames over 20 ms during a movement.

---

## 12. Recreate for a new brand, step by step

1. **Fork:** fork the repo, rename it and turn on GitHub Pages for the repo root.
2. **Brand pass:** work through every row of section 2.
   - Swap tokens, fonts, logo, photos, copy, menu, rewards, codes and card designs.
   - Search for the old brand name, its member-code prefix and its address.
3. **Supabase:** create the project, apply the section 7 settings and migrations, deploy the functions, and set the URL and publishable key.
4. **Staff:** set the admin email and staff PIN on the server, and owner accounts with MFA.
5. **Maheera:** do the section 8 setup with Kenduri.
6. **Native:** set the app id, name, hostname and Android package folder, make the assets, and push. Check the APK and iOS workflows pass.
7. **Optional services:** VAPID keys for push, wallet certificates, SMTP, Google and Apple sign-in.
8. **Check:** run the tests and the phone-shape sweep, and do one real order, one gift card, one top-up and one Maheera open on the live project.

---

## 13. Lessons already paid for

- **Card flips:** screen transitions snapshot the page flat, so `backface-visibility` fails and the back shows mirrored. Hide the unused side with `visibility`, and flip in two half-turns.
- **`:has()` on `body`:** a page-wide rule like `body:has(...)` makes every change re-check all styles. Toggle a body class from JS instead.
- **Forcing layout:** reading `offsetWidth` right after rebuilding the page forces a full layout. Start animations with the Web Animations API instead.
- **Android `vh`:** Chrome on Android measures `vh` with the address bar hidden. Use `dvh` for sheets.
- **Background redraws:** they reset horizontal scroll strips, so save and restore `scrollLeft`.
- **Carousel dots:** dots drawn once never move. Update them from the strip's scroll position.
- **Blur:** backdrop blur and blur filters during movement cost frames. Fade the blur in after the movement settles, or keep it small.
- **Live screens and scanners:** the QR code stays dark on a light tile, because some till scanners can't read light-on-dark codes.
- **Recordings:** a recording's first run starts on a cold browser. Re-record the first option so side-by-side comparisons line up.
