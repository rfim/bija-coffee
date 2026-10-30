# Bija overnight build: morning report

29 October 2026, 19:48 UTC to 30 October 2026, about 03:00 UTC. Five sprints, each with a video and a PDF in `docs/sprints/`; Sprint 5 is the final one (a usage limit paused work from about 01:00 to 02:10 UTC).

## Try it

| What | Where |
|---|---|
| Website (computer) | https://rfim.github.io/bija-coffee/ |
| App (phone) | https://rfim.github.io/bija-coffee/app.html?view=app |
| Android test app (APK, 32 MB) | https://github.com/rfim/bija-coffee/releases/download/android-latest/bija-android.apk |
| Staff mode | Hold the round Order button for 3 seconds, then PIN **111111** |
| Code and docs | https://github.com/rfim/bija-coffee |
| claude.ai version (private) | https://claude.ai/artifact/M5E1wV6h7W2bC1Aw7R3nDz |

## What was built overnight

**Website, Grind-style with Bija's art:** shop-first home with the founder, a coffee quiz, a real Natural Earth map of the origins, brew guides with timers, menu, visit, what's on, help centre, contact, sustainability, gifts, offices, press, install, allergens and a 404 page. Lighthouse mobile 95 to 99 on every page, no layout jumps, accessibility 100.

**App:** the question greeting, "Your usual?", photo promo cards, a floating three-item bar, every add jumping into the centre Order button with an automatic count, Profile with live order tracking, the Bija Card with loyalty stamps (10th drink free) and a side stamp drawer, a card lift to a full-screen QR, menu search and filters, favourites, undo, an offline banner, a first-run intro, Scan coffee, the Bean passport, Secret St James's, gift cards and the Beans Club.

**Owner and staff:** hold Order for 3 seconds plus a PIN; queue, collect (shows "take £x"), web and delivery dispatch, members, Insights, and finance rebuilt: today, a 3-step daily close, quick UK-VAT expenses with receipts, bills, cash flow forecast, profit and loss, HMRC 9-box VAT, staff costs, UK deadlines and an accountant CSV.

**Backend (Supabase, London):** tamper-proof ledgers for orders, points, stamps and gift cards, 19 server functions, an audit log and a server-checked staff PIN. An independent security review found 12 ways to cheat; all 12 are fixed and an automated attacker suite now guards them on every push.

**Native and extras:** Capacitor Android and iOS projects with a native QR scanner, haptics and deep links; Apple and Google Wallet pass service (with an honest preview in the demo); order-ready push notifications; QR bag labels; 22 bespoke drink and cake illustrations; no default images anywhere.

**Docs:** Owner Handbook, Barista Quick Guide, feature map against Grind, walkthrough guide, 4 intro videos, loyalty economics (two opinions), 45 owner decisions, wholesale price list, launch marketing kit, a 12-month events calendar, ops runbooks, a journey review and a security status report.

## Only you (or Bija) can do these

1. **Supabase:** Authentication, Sign In / Providers, turn on **Allow anonymous sign-ins**. Without it the live site stays in demo mode. CAPTCHA under Attack Protection is recommended.
2. **Wallet passes:** an Apple Developer account ($99 a year) with a Pass Type ID certificate, and a Google Wallet issuer account. Steps: `docs/wallet/README.md`.
3. **Notifications:** generate VAPID keys and add 3 secrets in Supabase. Steps: `docs/backend/push.md`.
4. **Stores:** Google Play account ($25) and a signing key; Apple Developer account for TestFlight. Steps: `native/README.md`.
5. **Domain:** decide the live address and replace the demo address before printing QR labels.
6. **Photos from Wikimedia:** allow `commons.wikimedia.org` and `upload.wikimedia.org` in this environment's network settings if you still want encyclopaedia photos of each product.
7. **Old project:** Cup of Hope is paused in Supabase; delete it in the dashboard if you no longer need it.

## Facts to confirm with Bija

- **Who roasts.** You said Bija's baristas roast; a public Redber case study says Redber roasts and fills Bija's own-brand bags. The site says "roasted by Bija's baristas" with a to-confirm note.
- **Postcode.** The site uses SW1Y 4AH; the Food Standards Agency register lists SW1Y 4SB.
- **Email.** info@bijalondon.co.uk is a mock-up.
- **Loyalty mix and prices.** Points plus stamps are both built; one analyst recommends points only. Beans Club single-bag delivery, the gift subscription price, the offers and the referral bonus are proposals. See `docs/bizdev/owner-decisions.md`.

## Known gaps

- The Lighthouse simulated LCP for the app home is about 2.7 seconds (real throttled phones measure about 1.8 seconds).
- Real Wallet passes, push notifications and live Supabase mode are untested on real devices until the accounts above exist.
- Three items from the journey review remain (toast placement over forms, the basket frequency select width, 44px announcement-bar links).
