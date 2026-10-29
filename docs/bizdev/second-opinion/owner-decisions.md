# Owner decisions: everything waiting on Bija

*Sprint 3 · Business analysis · 29 Oct 2026 · merged from the BizDev, Marketing, Mobile and Full stack docs on their team branches*

**⛔ = blocks launch** (app public launch Mon 16 Nov, or the Beans Club and shop going live). Each row has a **recommended default**. If Bija says nothing by the date shown, the team goes ahead with the default. **Bold dates are hard deadlines.**

## A. Launch blockers: decide this week

| # | Decision | Recommended default | Needed by | Source |
|---|---|---|---|---|
| A1 ⛔ | Fix the app's critical security issues (S1–S6: barista-view XSS, customer-written gift balance, points, rewards, gift amounts and prices) before the public launch? | **Yes.** No public launch until S1–S6 are fixed and retested. Soft launch to staff only until then | **9 Nov** | fullstack/security-review |
| A2 ⛔ | Which till does Bija use, and is it under contract? Stripe or Square? | **Square** if switching is free (one system for app, till, gift cards, automatic points); otherwise **Stripe** for the app and keep the till | 6 Nov | mobile/payments-plan, fullstack/pos-integration |
| A3 ⛔ | The live app domain (not the GitHub Pages demo) | Pick it now: QR codes, sleeves, analytics and the privacy notice all print it | **2 Nov** (before printing) | marketing/launch-campaign, fullstack/analytics |
| A4 ⛔ | Real cost of a 200 g bag and a 1 kg bag, and which beans come through Kindred Forest | Send the figures. All bean, club and wholesale prices assume £5.40 a bag, which is probably too high | 5 Nov | bizdev/bean-subscription, marketing/pr-pack |
| A5 ⛔ | Book an **accountant** (VAT on beans, postage, catering, gift cards and top-up balance; e-money exclusion) and a **solicitor** (subscription terms under the DMCC Act 2024 and Consumer Contracts Regs; gift card expiry) | Book both this week. Name the accountant's software (Xero, QuickBooks) | 10 Nov | bizdev/priorities, mobile/payments-plan, fullstack/pos-integration |
| A6 ⛔ | Opening hours, including Christmas and New Year | Confirm the app's hours (Mon–Fri 8–5.30, Sat 11–6, Sun 12–6) and the holiday hours | 2 Nov | marketing/pr-pack, 90-day-calendar |
| A7 ⛔ | Food label for bags sold online and to offices | Check the wording with Westminster Food Safety or a food-law adviser | Before posting beans | bizdev/bean-subscription, wholesale |
| A8 ⛔ | Approve the privacy notice wording (analytics, delivery addresses, photo consent retention) | Approve, with retention set by the accountant | Before 16 Nov | fullstack/analytics, marketing/launch-campaign |

## B. Loyalty and offers (costs in [loyalty-economics.md](loyalty-economics.md))

| # | Decision | Recommended default | Blocks? |
|---|---|---|---|
| B1 | Points: 10 per £1; cake 350, drink 400, bag 1,200 | **Keep.** Costs about 4% of member sales; add a 12-month inactivity expiry | ⛔ launch copy |
| B2 | Stamp card (10th drink free, up to £5.50) | **Drop** as a second reward. Keep the stamp grid only as progress to the 400-point drink | ⛔ launch copy |
| B3 | Tiers: Seed, Sprout 1,500, Kopi Tree 5,000 | **Keep** as built | – |
| B4 | Referral: app pays 300 each; marketing proposed 100 + 150 | **300 each**, paid after the friend's first paid order of £3+, max 5 a month, outside the challenge cap. The share message starts "Ad:" | ⛔ referral materials |
| B5 | Own cup 25p off | **Keep** | – |
| B6 | Student 10% off | **Drop at launch**; revisit as an after-2pm offer | – |
| B7 | Early-bird double points before 9am | **Move to Mon–Fri 2–4pm** | – |
| B8 | Community code worth +100 points for Indonesian groups | **Yes, later**: after A1, as a one-off code per group | – |

## C. Beans, subscription, delivery and gifts

| # | Decision | Recommended default | Blocks? |
|---|---|---|---|
| C1 | Beans Club terms: site has 10% off and free delivery; BizDev proposed no discount and £14.50 posted | **£10.80 kept; free to collect; free posting from 2 bags; £2.50 for a single posted bag.** Revisit when A4 lands | ⛔ club launch (16 Nov) |
| C2 | Club delivery: collect only, or post too? | **Collect from 16 Nov; post once 5 test packs pass the 2.5 cm large-letter test** (about 30 Nov) | ⛔ posted club |
| C3 | Gift subscription £36 delivered | **£42 posted, £36 collected.** Last Christmas order **20 Dec** | ⛔ gift page (23 Nov) |
| C4 | Discovery set £33; delivery £3.95, free over £30 | **Keep both** | – |
| C5 | Corporate gift box £24 and hamper £45; bulk cards +5% at 25+ | **Approve.** Order by **11 Dec**, posted by **9 Dec** | ⛔ Christmas gifting (this week) |
| C6 | Bulk gift cards in the app and invoicing | **Printed codes and one invoice for now**; in-app bulk issue after A1 | – |
| C7 | Top-up wallet to cut card fees on small tickets | **Not at launch.** Decide after the accountant's view on e-money and VAT | – |
| C8 | Keep "Pay at the bar" alongside paying in the app | **Yes** | – |

## D. Offices and wholesale

| # | Decision | Recommended default | Blocks? |
|---|---|---|---|
| D1 | Office bean price list: £34 / £31 / £29 / from £28 a kg, 2 kg minimum, card then 14-day invoice ([wholesale.md](wholesale.md)) | **Approve** once A4 confirms the cost | ⛔ offices page |
| D2 | Office catering prices (filter box £30, meeting set £58, £60 minimum for walk delivery) | **Approve**; flyers in Nov, pilot in Jan | – |
| D3 | Who does deliveries and outreach (about 4 h a week in Nov; 07:30–08:30 slot) | Name one person; add a 1.5 h shift on busy mornings | ⛔ catering and office beans |
| D4 | Deli stockists: £7.80 wholesale, 12-bag minimum, 30 days; Amazon and NOTHS | **Test 2–3 delis from Jan; no marketplaces** | – |

## E. Marketing and press

| # | Decision | Recommended default | Blocks? |
|---|---|---|---|
| E1 | Brand line | **"Indonesia, by the cup."** | ⛔ printing (2 Nov) |
| E2 | Winter drink name, recipe, price; stay open late for the 5 Nov lights switch-on | **Kopi Rempah**, launch **5 Nov**; stay open only if two staff volunteer | ⛔ **5 Nov** |
| E3 | Origins Passport lists Gayo and Kintamani, which are not on the shelf yet | Serve them as guest filter coffees, or take them out of the passport until they land | ⛔ app copy |
| E4 | Press: Devi approves her bio, quotes and photo; real press email; where roasting happens | Nothing goes out until Devi approves; no "in-house" wording until confirmed | ⛔ press release |
| E5 | Open a TikTok account | **Yes**, reusing Instagram Reels | – |
| E6 | Marketing spend (about £945–£1,215 to Jan) | **Approve**, against real quotes | – |

## F. App and systems

| # | Decision | Recommended default | Blocks? |
|---|---|---|---|
| F1 | Analytics: Plausible (paid) or Umami Cloud (free) | **Plausible**: no cookies and no consent banner | – |
| F2 | Run a small server function (about £0–£5 a month) for payments, automatic points and push | **Yes**, on Supabase, which serves payments, points and push from one place | ⛔ pay-in-app and subscriptions |
| F3 | Push alerts: order status only at launch? Who owns `sw.js`? | **Order status only**; marketing push later with separate consent. Mobile team owns `sw.js` | – |
| F4 | A month of real till figures (transactions a day, card/cash, card types) | Pull the last 4 weeks now. Every KPI and the Square vs SumUp choice depends on it | ⛔ KPI baselines |

## G. Evening pilot and licensing

| # | Decision | Recommended default | Blocks? |
|---|---|---|---|
| G1 | Check the lease (Crown Estate) and planning for Thursday evenings; ask staff about shifts from 14 Jan | **Yes, check in early Jan.** Alcohol-free *Malam Bija*, 6 Thursdays | – |
| G2 | Owner or manager takes a personal licence course in Q1 2027 | **Yes**: keeps coffee cocktails (TENs) open as an option | – |

**Unresolved conflicts between teams:** B4 (referral amounts), C1 (club discount and delivery), C3 (gift subscription price) and E3 (passport origins). Each default above picks a side, with reasons in the linked doc.
