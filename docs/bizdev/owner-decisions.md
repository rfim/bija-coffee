# Owner decisions: everything waiting on Bija (all teams)

*Compiled by Business Development · 29 Oct 2026 · from each team's branch as of tonight*

🔴 **Blocks launch** (the app, web shop and Beans Club going public) · 🟠 needed by a date in the 90-day plan · ⚪ can wait

Each line gives our **recommended default**. If the owner says nothing, teams go ahead with that default. Any default that touches licensing, VAT, food law or consumer terms still needs a **solicitor or accountant to confirm**.

| # | Decision | From | Recommended default | |
|---|---|---|---|---|
| **A. Prices and loyalty** |||||
| A1 | Approve the menu, bean, delivery and gift prices shown in the app and docs | BizDev, Web | Approve as built: beans £12, delivery £3.95, free over £30 | 🔴 |
| A2 | Beans Club: 10% off **and** free delivery? | BizDev | 10% off. **Free delivery for 2+ bags or collection; £2.50 for a 1-bag delivery** (a free 1-bag post makes £1.43) | 🔴 |
| A3 | Stamp card: 10th handcrafted drink free (up to £5.50) | Lead, BizDev | **Keep**. Paid drinks only | 🔴 |
| A4 | Points: 10 per £1, cake 350, bag 1,200; remove "Any drink 400" | Lead, BizDev | **Keep. Remove the 400-point drink.** Points expire after 12 months with no activity (solicitor to confirm) | 🔴 |
| A5 | Referral: +300 each (app) or 100 + 150 after the friend's first order (marketing) | Marketing, BizDev | **300 each, credited after the friend's first paid order of £3+**, max 5 a month, outside the 200-point challenge cap, "Ad:" label on the share text | 🔴 |
| A6 | Offers: own cup 25p off · students 10% · early-bird double points | Lead, BizDev | Own cup: **keep**. Students: **off-peak only** (weekdays after 2pm, weekends). Early bird: **drop, or move to the quietest 2 hours** once the till data is in | 🟠 |
| A7 | Gift subscription price | Lead, BizDev | **£36 collected, £42 posted** | 🟠 by 23 Nov |
| A8 | Office and stockist price list (`wholesale.md`, `office-catering.md`) | BizDev | Approve as drafted. Publish after the roaster's prices are confirmed | 🟠 by 9 Nov |
| A9 | Hero winter drink: name (*Kopi Rempah*), recipe, price, cost per cup | Marketing | Approve *Kopi Rempah*. Price it like kopi susu aren (£4.50) plus 30p *(assumption)* | 🟠 by 5 Nov |
| **B. Beans and suppliers** |||||
| B1 | Real Kindred Forest cost per 200 g and 1 kg bag; is resale through shops, offices and online allowed? | BizDev | Ask this week. Until then models use £5.40 per bag and £22 per kg | 🔴 for wholesale; 🟠 otherwise |
| B2 | Exact wording of the relationship: does Kindred Forest **roast** or **source**? Which beans? | Marketing | "Roasted with Kindred Forest" (as on the site) until they confirm | 🔴 for press and packaging |
| B3 | Gayo and Kintamani: on sale, guest filter only, or remove from the Origins Passport? | Marketing | Mark them "coming soon" (as in the app). Passport needs only the 3 on the shelf plus 1 filter | 🟠 |
| B4 | Tasting notes for each bag | Marketing | Use the app's notes. Head barista signs off | ⚪ |
| B5 | Bean subscriptions: collect only, or delivery too? | Mobile, BizDev | **Both**, once 5 test posts fit the letterbox size | 🟠 by 30 Nov |
| **C. Payments, till and tech** |||||
| C1 | Which till or card machine is used today, and is it under contract? | Mobile, Fullstack | Tell us this week. It decides C2 | 🔴 |
| C2 | Card payments: **Stripe or Square**? | Mobile, Fullstack | **Square** if the till can switch (automatic points from in-store sales); otherwise Stripe for the app | 🔴 |
| C3 | Send one month of real till figures (transactions a day, card vs cash, Amex/business card share) | Fullstack, Marketing | Export from the till this week | 🟠 |
| C4 | OK to run a small server function (about £0–£5 a month) for automatic points and push alerts? Which host? | Fullstack, Mobile | **Yes, on the same backend as the app data** (Supabase or Firebase, whichever hosts the app) | 🟠 |
| C5 | Keep "Pay at the bar" | Mobile | **Yes** | ⚪ |
| C6 | Launch a top-up wallet to cut card fees? | Mobile | **Not at launch**. Needs the accountant's view on e-money and VAT | ⚪ |
| C7 | Push alerts: order-ready only at launch, marketing pushes later with separate consent | Mobile | **Yes** | ⚪ |
| C8 | Who owns `sw.js` (push and click handlers)? | Mobile | **Mobile team** | ⚪ |
| C9 | Analytics: Plausible (paid) or Umami Cloud (free) | Fullstack | **Plausible** (cookie-free, UK GDPR-friendly) | 🟠 |
| C10 | Fix the security findings before real money goes through the app: critical S1–S3, high S4–S6 | Fullstack (for Mobile) | **Must ship before launch.** The product lead does this, no owner input needed | 🔴 |
| **D. Website, domain and listings** |||||
| D1 | Final web address (one answer for web, analytics and QR codes) | Web, Fullstack, Marketing | **bijacoffee.co.uk** | 🔴 |
| D2 | Stop sending phones straight to the app, so Google can index the homepage | Web | **Yes**: phones see the website with an "Order ahead" button | 🔴 for SEO |
| D3 | Switch on search indexing (remove `noindex`) | Web | Yes, on launch day, after D1 | 🔴 |
| D4 | Confirm the map pin, price range and menu prices in the site's structured data | Web | Pin on the shop door. Price range £ | 🟠 |
| D5 | Google Business Profile details: accessibility, toilet, Wi-Fi, cash or cashless, dogs, children, "women-led", "Cake shop" category | Web | Owner answers yes or no on each. Don't show anything not confirmed | 🟠 |
| D6 | Subscription terms on the website (collection from the 1st, grinding to order) | Web, BizDev | Pause, skip or cancel any time with 3 days' notice. Solicitor checks the distance-selling and subscription rules | 🔴 for Beans Club |
| **E. Legal, privacy and advisers** |||||
| E1 | Name the accountant and their software (Xero, QuickBooks, other) | Fullstack, BizDev | Tell us this week | 🔴 |
| E2 | Book the accountant: VAT on beans, postage, catering, gift cards and gift subscriptions; how unused points and stamps are accounted for | BizDev, Mobile | Book this week | 🔴 |
| E3 | Book a solicitor: subscription, gift card and loyalty terms (expiry, changes), late-payment wording | BizDev | Book this week | 🔴 |
| E4 | Approve the privacy notice, including analytics wording and retention periods (filming consent cards kept 2 years?) | Fullstack, Marketing, Web | Approve the drafts. Consent cards kept 2 years | 🔴 |
| E5 | Food labels on posted and wholesale bags | BizDev | Check with Westminster Food Safety or a food-law adviser | 🔴 for posting and wholesale |
| **F. Marketing and PR** |||||
| F1 | Christmas and New Year opening hours | Marketing | Tell us by 6 Nov | 🟠 |
| F2 | Stay open late for the Regent Street lights switch-on (5 Nov)? | Marketing | Only if 2 staff volunteer | 🟠 by 2 Nov |
| F3 | Founder bio, portrait and quotes: Devi approves or rewrites every quote | Marketing | No press release goes out without approval | 🟠 |
| F4 | Open a TikTok account? | Marketing | Yes, reposting Instagram Reels | ⚪ |
| F5 | Corporate gift cards in bulk: can the app issue them, and how do we invoice? | Marketing, BizDev | Printed codes and one invoice for Christmas. App bulk issue later | 🟠 by 9 Nov |
| F6 | Community code worth +100 points for partner groups | Marketing | **Not at launch** (needs an app feature). Use a printed offer card instead | ⚪ |
| F7 | Ask St James's Market whether the advent calendar runs in 2026 | Marketing | Founder asks this week | 🟠 |
| **G. Operations and new revenue** |||||
| G1 | Who covers office outreach (about 4 h a week in Nov) and the 07:30–08:30 delivery slot | BizDev | A named staff member, paid as an extra shift | 🟠 by 9 Nov |
| G2 | Evening pilot: OK to check the lease (The Crown Estate) and planning, and to ask staff about Thursday evenings from 14 Jan | BizDev | **Yes.** Alcohol-free first | ⚪ (decide by 4 Jan) |
| G3 | Owner or a manager takes a personal licence course in Q1 (keeps coffee cocktails possible) | BizDev | Yes, if Stage A of the pilot passes | ⚪ |

**Count:** 45 decisions. **19 block launch** (🔴), 17 have a date (🟠), 9 can wait (⚪).

**Where they came from:**
- BizDev: [`priorities.md` §4](priorities.md) and the docs added tonight
- Marketing: `docs/marketing/*` on `team/marketing`
- Web: `docs/web/seo-launch.md`, `google-business-profile.md` and `README.md` on `team/web`
- Mobile: `docs/mobile/payments-plan.md` and `push-plan.md` on `team/mobile`
- Fullstack: `docs/fullstack/analytics.md`, `pos-integration.md` and `security-review.md` on `team/fullstack`
- Lead: tonight's proposals

Where two teams asked the same thing (domain, till, accountant, delivery for subscriptions), we merged them into one line.

**The 5 to answer first:** D1 domain · C1/C2 till and payments · E1–E3 accountant and solicitor · B1 roaster costs · A1–A5 prices and loyalty.
