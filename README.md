# Bija Coffee: website + app

Concept rebuild of bijacoffee.co.uk with an order-ahead app for Bija, St James's Market, London. **Not an official Bija page.**

Live (GitHub Pages): https://rfim.github.io/bija-coffee/

## What's here
| File | What it is |
|---|---|
| `index.html` | Website. Phones and tablets are sent to the app; `?view=site` / `?view=app` overrides (remembered per device). |
| `app.html` | Installable web app (PWA): order ahead with per-drink options, beans, Bija Card points, rewards and challenges, gift cards, Secret St James's, and a Barista view (queue, members, gift cards, finance, insights, Maheera, menu). On GitHub Pages it runs in demo mode: data stays in each browser. |
| `shop.html`, `product.html?id=`, `subscribe.html`, `rewards.html`, `checkout.html`, `delivery.html` | Web shop, Grind-style: beans by grind, one-off or Beans Club subscription (10% off, every 2, 3 or 4 weeks, change, skip, pause or cancel up to 3 days before each dispatch), basket drawer, demo checkout (no payment taken), Royal Mail Tracked 48 £3.95 or free on orders of £30 or more, click & collect. Shared code in `site-shop.js` / `site-shop.css`. The basket (`bija.shop.cart`) and orders (`bija.shop.orders`) are shared with the app, where staff dispatch them and the points land on the Bija Card. |
| `privacy.html`, `accessibility.html` | UK GDPR privacy notice and WCAG 2.2 AA accessibility statement (drafts for Bija to approve). |
| `photos/` | Bija's photos, cropped and compressed for the web. Slots without a file show a labelled placeholder (`founder.jpg` is still needed). |
| `manifest.webmanifest`, `sw.js`, `icons/` | Home-screen install, offline cache and app icons. |

## Standards we follow
- Accessibility: WCAG 2.2 AA (keyboard, focus, contrast, 44px tap targets, reduced motion, alt text).
- UK law and good practice: prices include VAT; allergen information signposted (14 major allergens); company name and number in the footer (Companies Act); privacy notice under UK GDPR; no tracking cookies.
- Security: all user text escaped; points, gift balances and finance can only be changed by staff (enforced by data access rules on the hosted version).

## To confirm with Bija
Wording, prices, bean details, loyalty numbers, the Beans Club discount, the app offers (own cup 25p, students 10%, early-bird double points), the referral bonus, delivery terms, Secret St James's facts, retention periods in the privacy notice, and the founder photo.

## Overnight build (29–30 October 2026)

- **Website** (Grind-style, light, minimal): shop-first home, plus `find.html` (coffee quiz), `origins.html` (Natural Earth map), `brew.html`, `visit.html`, `menu.html`, `events.html`, `help.html`, `contact.html`, `sustainability.html`, `gifts.html`, `offices.html`, `press.html`, `install.html`, `allergens.html`, `404.html`.
- **Bean passport:** `trace.html?b=<bean>&r=<roast date>&l=<lot>&c=bag|cup` is what the QR on a bag or cup opens; `labels.html` prints A4 sheets of 21 QR labels (codes point at the address the page is served from).
- **App** (`app.html`, staff code in `app-staff.js` loaded after the PIN): Grind-style UI, Profile with live order tracking, Bija Card, motion (`app-motion.*`), finance for the owner, security fixes S1–S12 (`docs/audit/security-status.md`).
- **Loyalty (proposals for Bija to confirm):** 10 points per £1; cake at 350 points, a 200 g bag at 1,200. Stamp card: one stamp per handcrafted drink, the 10th drink free up to £5.50. Invite a friend: 300 points each once their first paid order of £3 or more is collected. Beans Club: 10% off, change, skip, pause or cancel up to 3 days before each dispatch. Delivery £3.95, free on orders of £30 or more.
- **Staff mode:** two modes, one back office. **Web admin:** type **opensesame** on any page of the website (outside a text field); the back office opens on its own and Exit returns to the website. **Mobile admin:** in the app, hold the round Order button for 3 seconds. Typing opensesame does nothing inside the app. The back office asks for the admin email **admin-oversee@bijacoffee.co.uk** and the 8-digit PIN **16091992** (hypothetical, change it before launch). Change it in the staff Menu tab; forgotten PIN: `docs/backend/reset-staff-pin.md`. On the live backend the PIN is checked on the server.
- **Backend:** Supabase project `bija` (London), with tamper-proof ledgers (`docs/backend/ledger-api.md`). The `kenduri` triggers on orders, in-store sales and the menu come from rfim/maheera and must never block an order (README "Maheera"). Loaded only on the live https site (or `?backend=supabase`); `?demo=1` keeps everything in this browser. **The owner must turn on Authentication → Anonymous sign-ins** in the Supabase dashboard, or the live site stays in demo mode.
- **Wallet and push:** Apple and Google Wallet passes and "order ready" notifications are built but switched off until Bija adds its own keys (Apple Developer Pass Type ID, Google Wallet issuer, VAPID keys) as Supabase secrets. See `docs/wallet/README.md` and `docs/app-store/push.md`. The demo shows a labelled wallet preview.
- **Native apps:** `native/` (Capacitor). The Android test APK is built on every push and published at <https://github.com/rfim/bija-coffee/releases/download/android-latest/bija-android.apk>. Before a store release, replace the demo host `rfim.github.io` in the Android and TWA manifests (see `native/README.md`).
- **Handbooks:** `docs/handbook/Bija-Owner-Handbook.pdf` and `docs/handbook/Bija-Barista-Quick-Guide.pdf`.
- **Sprint reports:** `docs/sprints/` (video and PDF each hour). Intro videos and guides: `docs/videos/`, `docs/*.pdf`.

## Maheera

Maheera is Kenduri's shared back office (stock, recipes and costs, sales), on Neon. The **Maheera** tab in the back office shows Bija's part of it, read only, so staff don't need a second app. It sits between Finance and Menu and needs the staff PIN like every other tab.

| Section | What it shows |
|---|---|
| Today | Yesterday's sales against the same weekday's average, top items, and what needs attention: stock below par, supplier orders due, items sold without a recipe, an open batch |
| Stock | Every ingredient, items below par first, and Maheera's reorder suggestions (packs and cost) |
| Drink & dish costs | Last 28 days: price, number sold, cost each and margin. Milk choices such as oat are costed by their own recipe variant. Items show "Not costed yet" until every sale has a recipe |
| Last 7 days | Sales, cost of goods and gross profit, day by day. Days with in-store till sales without item detail are flagged: those are counted as totals only |

Each section has its own empty state (Maheera has little Bija data until recipes and stock counts are entered). If Maheera doesn't answer, the tab says so with **Try again**, and the rest of the back office carries on. Figures are fetched when the tab opens or on Refresh, kept in memory only, and dropped on Exit or the 30-minute idle lock. In demo mode (this device only) the tab explains that Maheera is on the live back office.

**The shared panel.** The tab shows Kenduri's shared `<maheera-panel>` (`vendor/maheera-panel.js`, v3.0.0, copied unchanged from rfim/maheera `site/embed/v3/`; each released version is frozen, so update it only by copying a new release). It loads when the tab first opens, with v3's SRI hash (`sha384-fjhjanpRAgsFSi1QgdRYqUKNkaKTt6RqZbO7OINBJEqJ5mzSLyTbNvkjTDXFdZKw`, in `app-staff.js` as `MH_PANEL_SRI`; a new release changes it there and in `tests/maheera-panel.js`). v3 adds calm motion and graphs (charts that draw on, numbers that roll on Refresh, an Insights feed) and **Busy hours**: Bija's usual week by weekday and hour, as 3D terraces or a flat heatmap, with the busiest hour in words. Everything stands still under reduced motion. Its fonts come from Maheera's host kit in `vendor/maheera-fonts/` (Inter and Fraunces, SIL OFL, made with `node test/embed/build-panel.mjs --host-kit` in rfim/maheera): `fonts.css` is linked in the page when the tab opens, because fonts can't be loaded inside the panel's shadow root. Neither is in `sw.js`'s install list, so customers don't download them; staff devices cache them on first use. Its name, ink colour and words ("bar", "drinks and cakes", the Bar prep section) are Bija's settings in Maheera (Panel settings in the Maheera app), not code here; the back office keeps it in light mode. Its data comes from the shared Edge Function `maheera-panel`, deployed unchanged from rfim/maheera `relay/maheera-panel/` with `maheera_access_rpc` set to `maheera_access` in Vault (`select vault.create_secret('maheera_access', 'maheera_access_rpc');`, steps in rfim/maheera `docs/embed.md`). Until that function is deployed (404), the tab shows the older view described here. Exit and the idle lock destroy the panel with its figures. Test: `node tests/maheera-panel.js`.

**How it works (older view):** the app calls the Edge Function `supabase/functions/maheera` with the signed-in user's token. The function checks the caller with Bija's own rules (`maheera_access()`: a live staff PIN session, or an owner with MFA; `staff_touch` if that function is missing), signs in to Neon Auth as Bija's Maheera service user, and reads a fixed list of Maheera views (`stock_on_hand`, `reorder_suggestions`, `dish_performance`, `daily_pnl`, `daily_brief`). Nothing from the request is forwarded, and Maheera's row-level security limits every row to Bija. The Neon JWT is cached until a minute before it expires.

**Settings.** Bija's Maheera settings live in Bija's own Vault, read through `public.kenduri_config(p_name)` (already live; only the service role can call it). The function reads each one from its environment variable if that is set, otherwise from Vault with its built-in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, once per cold start. The service key is used for that call only; the caller is always checked with their own token. Until all four are found the tab says "Maheera isn't set up yet".

| Vault name | Env override | What |
|---|---|---|
| `maheera_auth_url` | `MAHEERA_AUTH_URL` | Neon Auth base URL (the function calls `/sign-in/email` and `/get-session`) |
| `maheera_data_api_url` | `MAHEERA_DATA_API_URL` | Neon Data API base URL (ends in `/rest/v1`) |
| `maheera_service_email` | `MAHEERA_BIJA_EMAIL` | Bija's Maheera service user |
| `maheera_service_password` | `MAHEERA_BIJA_PASSWORD` | Its password |
| – | `MAHEERA_AUTH_ORIGIN` | Optional. `Origin` sent to Neon Auth; default `https://rfim.github.io` |

**Deploy** (JWT verification stays on; no dashboard secrets needed when the Vault entries are there):

```bash
supabase functions deploy maheera --project-ref nvsampchuozqbtavuugx
```

`docs/backend/maheera-access.sql` (applied 30 Oct 2026) lets owners with MFA open the tab without the PIN.

**Kenduri triggers:** Bija's database also sends orders, in-store till sales and menu changes to Maheera through the `kenduri` schema (an outbox delivered by pg_cron). It comes from rfim/maheera (`adapters/`), is recorded in `docs/backend/kenduri-outbox.sql`, `kenduri-bija-adapter.sql` and `kenduri-config.sql`, and its triggers must never block an order: every trigger function catches its own errors and only logs a warning.

**Tests:** `node tests/maheera-function.js` (the function, with Supabase, Vault, Neon Auth and the Data API mocked) and `node tests/maheera-tab.js` (the tab in the browser, with Supabase and the function mocked; `SHOTS=dir` saves phone screenshots).
