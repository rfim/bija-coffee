# Loyalty economics: what each proposed scheme costs Bija

*Sprint 2 (overnight) · Business Development · draft for the owner to decide · 29 Oct 2026*

**Summary.** All six member schemes running together cost about **£727 a month per 1,000 members at cost price**. That is **£8,700 a year**, or **5.8% of members' net sales**. To pay for that, members need to visit about **9.4% more often** (6.6 visits a month instead of 6).

The stamp card, points, referral and own-cup discount are good value. **Early-bird double points** pays people who already come at the busiest time, so drop or move it. Make **student** pricing off-peak only.

**Beans Club** as proposed (10% off and free delivery) makes only **£1.43 on a single posted bag**. Keep the 10% but charge **£2.50 delivery on 1-bag deliveries**. The **£36 gift subscription** should be **£36 collected or £42 posted**.

> **How to read this.** Every number marked *(assumption)* is our estimate with no Bija data behind it. The model is [`loyalty-model.xlsx`](loyalty-model.xlsx), with *Inputs*, *Schemes* and *Beans Club* tabs. Yellow cells are assumptions, and the formulas recalculate when you change them. Costs are at **cost price** (what Bija pays for the coffee, cake or bag), not menu price. We use cautious assumptions throughout: low breakage, high redemption. Real costs should come in at or below these figures.
>
> Points, stamps and gift subscriptions not yet used are a liability in the accounts. Discount and loyalty terms need to be fair under consumer law and the CAP Code rules on promotions. **Confirm the accounting treatment with an accountant and the terms with a solicitor.**

---

## 1. The schemes as proposed

| Scheme | Rule | In the app today? |
|---|---|---|
| Stamp card | 1 stamp per handcrafted drink; the 10th drink is free (up to £5.50) | Not yet (proposed) |
| Points | 10 points per £1. Redeem for cake (350 points) or a 200 g bag (1,200 points) | Yes. The app also still has **"Any drink" for 400 points** (`app.html` `REWARDS`), which the proposal removes |
| Referral | +300 points each for the new member and the friend who invited them, confirmed by staff | Yes (`REFER = 300`) |
| Own cup | 25p off any hot drink | Proposed offer card |
| Students | 10% off with a valid student card, not with other offers | Proposed offer card |
| Early bird | Double points before 9am, Monday to Friday | Proposed offer card; barista ticks a box |
| Beans Club | 10% off every bag (£10.80), free delivery, every 2, 3 or 4 weeks | Yes (`SUB_OFF = 0.10`) |
| Delivery | Royal Mail Tracked 48, £3.95, free over £30 | Yes (`POST = 3.95`, `FREE_POST = 30`) |
| Gift subscription | £36 for 3 months | Proposed (corporate) |

---

## 2. Assumptions (per 1,000 members)

| Input | Value | Source |
|---|---|---|
| Members active in a month | 40% (400 people) | *(assumption)* |
| Visits per active member per month | 6 → **2,400 visits** | *(assumption)* |
| Spend per visit incl. VAT | £6.23 | *(assumption)*: the UK café benchmark in the Sprint 2 brief, also used in the fullstack team's `docs/finance` model. Replace with Bija's till average |
| Gross margin on café sales | 68% → **£3.53 contribution per visit** | *(assumption)*: same as the fullstack model and the app's Finance default |
| Handcrafted drinks per visit | 0.85 → 2,040 paid drinks a month | *(assumption)* |
| Free drink at cost price (avg) | £1.10 (menu value about £4.40) | *(assumption)* |
| Cake at cost price | £0.90 (30% of £3.00) | *(assumption)* |
| 200 g bag at cost price | £5.40 (45% of £12) | *(assumption, from the brief)* |
| Points redeemed: cake vs beans | 70% / 30% → **£0.00315 cost per point** | *(assumption)* |
| Bonus points (welcome, challenges) | 30 per active member per month | *(assumption)*. The app caps challenges at 200 a month |
| **Points breakage** (earned, never used) | **25%** | *(assumption)* at the cautious end of the **20–30%** usually quoted for retail programmes ([Brandmovers](https://blog.brandmovers.com/what-is-point-breakage-and-why-should-you-care), [Leat](https://www.leat.com/resources/blog/loyalty-program-breakage)). These are vendor sources, not peer-reviewed |
| **Stamp breakage** (cards never finished) | **30%** | *(assumption)*. Paper cards are often abandoned: in a classic car-wash study only 19–34% of customers finished a card in 9 months (Nunes & Drèze 2006, summarised by [Coglode](https://coglode.com/nuggets/endowed-progress-effect)). App stamps can't be lost, so we assume far fewer are left unfinished. That is cautious |
| Referral points breakage | 40% | *(assumption)* |
| Confirmed referrals | 15 a month | *(assumption)* |
| Own-cup uptake | 8% of hot drinks; saves a £0.12 cup and lid | *(assumption)* |
| Student share of visits | 3% | *(assumption)*: St James's is mostly offices and visitors |
| Member spend before 9am on weekdays | 30% | *(assumption)*. **Check with the till**: an office district is likely busiest before 9 |

---

## 3. Cost of each scheme per 1,000 members (at cost price)

"Break-even uplift" is how many more visits members must make to cover the cost. Each extra visit brings £3.53 contribution, less the reward cost that visit also earns.

| Scheme | Monthly cost | Annual cost | % of member net sales | Break-even extra visits a month | **Break-even uplift in visit frequency** |
|---|---|---|---|---|---|
| Stamp card | £175 | £2,094 | 1.4% | 54 | **+2.3%** |
| Points (cake 350, bag 1,200) | £382 | £4,579 | 3.1% | 118 | **+4.9%** |
| Referral (+300 each) | £17 | £204 | 0.1% | 5 | **+0.2%** |
| Own cup 25p off | £11 | £130 | 0.1% | 3 | **+0.1%** |
| Students 10% off | £37 | £449 | 0.3% | 12 | **+0.5%** of all member visits. Students themselves must visit **+17%** more |
| Early bird double points | £106 | £1,272 | 0.9% | 33 | **+1.4%** (about +4.6% on pre-9am visits) |
| **All six together** | **£727** | **£8,728** | **5.8%** | **225** | **+9.4%** |

**What members see.** At menu prices the stamp card gives back about £700 a month and points about £1,090 a month, per 1,000 members. That is roughly **3× the cost to Bija**, which is why rewards paid in coffee and cake work well for a café.

**Stacking on drinks.** Someone who only buys drinks earns a stamp (about 49p of menu value per drink) **and** points (about 36p on a £4 drink). That is roughly 20% back at menu value, which is generous. It is affordable at cost price, but it is the main reason the total is close to 6%.

**Evidence that the stamp card can earn its keep.** Café customers buy **more often as they get close to a free drink** (the "goal-gradient" effect, Kivetz, Urminsky & Zheng 2006, *Journal of Marketing Research* 43(1)). Customers given a head start on their card finish it more often (Nunes & Drèze 2006, *Journal of Consumer Research* 32(4); [summary](https://coglode.com/nuggets/endowed-progress-effect)). These are academic findings, not UK café data, so treat them as direction, not a forecast.

---

## 4. Beans Club, delivery and gift subscriptions (per delivery)

Contribution after beans (£5.40 a bag), mailer *(assumption)*, Royal Mail online postage from 5 Oct 2026 (Tracked 48 Large Letter **£2.90**, Small Parcel **£3.75**; [Royal Mail online price guide](https://www.royalmail.com/sites/royalmail.com/files/2026-10/online-price-guide-october-2026-v1.pdf)), card fees (2%, *assumption*) and the cost of the points earned.

| Option | Price paid | Contribution | Per bag | Margin |
|---|---|---|---|---|
| **Beans Club, 1 bag, posted free (as proposed)** | £10.80 | **£1.43** | £1.43 | 13% |
| Beans Club, 2 bags in one parcel, posted free | £21.60 | £5.31 | £2.65 | 25% |
| Beans Club, collected in store | £10.80 | £4.93 | £4.93 | 46% |
| **Beans Club, 1 bag, posted, £2.50 delivery (recommended)** | £13.30 | **£3.88** | £3.88 | 29% |
| One-off 1 bag + £3.95 delivery | £15.95 | £6.45 | £6.45 | 40% |
| One-off 3 bags (£36), free delivery over £30 | £36.00 | £13.58 | £4.53 | 38% |
| **Gift subscription, 3 × 1 bag, £36, posted free (as proposed)** | £36.00 | **£7.73** | £2.58 | 21% |
| Gift subscription, 3 × 1 bag, £36, collected | £36.00 | £18.23 | £6.08 | 51% |
| **Gift subscription, 3 × 1 bag, £42 posted (recommended)** | £42.00 | **£13.61** | £4.54 | 32% |

A single posted Beans Club bag every 2 weeks makes about £3.10 a month. With the £2.50 delivery charge it makes about £8.40 a month. A **200 g bag posted for free at 10% off barely pays**. The 2-bag parcel and collection both work.

This replaces the "£14.50 posted, no discount" idea in [bean-subscription.md](bean-subscription.md) if the owner prefers the Beans Club model.

**VAT.** We assume beans are zero-rated food (HMRC VAT Notice 701/14) and that postage charged with them follows the beans. **Confirm with an accountant.**

---

## 5. Recommendation per scheme

| Scheme | Verdict | Why (numbers per 1,000 members) | Change |
|---|---|---|---|
| **Stamp card** | **Keep** | £175 a month. Pays for itself with **+2.3%** more visits, and it's the simplest offer to explain at the till | Count paid handcrafted drinks only (not free ones). The £5.50 cap covers the whole menu, so the reward is "any drink". Optional: start new members with 1 stamp (the head-start effect above) for about £15 a month extra *(assumption)* |
| **Points** | **Keep, adjust** | £382 a month; needs **+4.9%** visits. The cake reward (£35 spend) returns 2.6% of spend at cost; the bag (£120 spend) 4.5%. Both are fine | **Remove "Any drink" for 400 points** from the app, as proposed, so drinks aren't rewarded twice. Add **expiry after 12 months with no activity**, stated in the terms (**confirm with a solicitor**). Keep the 200-point monthly cap on challenges |
| **Referral** | **Keep, adjust** | About £1.13 per confirmed referral at cost. Pays back on the new member's **first** visit (£3.53) | Credit the 300 points only **after the friend's first paid order of £3 or more is collected**, with a limit of 5 a month (marketing's proposed rules). Keep staff confirmation. Prefill the share message with "Ad:" (marketing's ASA note) |
| **Own cup 25p off** | **Keep** | About 9p net per use (25p less VAT, minus the 12p cup saved). £11 a month. Good for the brand | None |
| **Students 10% off** | **Adjust** | £37 a month, but students must visit **17% more** to cover it at a 68% margin, and there are few students in St James's | **Off-peak only**: weekdays after 2pm and weekends. Not with other offers. Review after 3 months with till data |
| **Early bird double points** | **Drop or move** | £106 a month (£1,272 a year) going mostly to people who already come before 9 at the busiest time. Needs pre-9 visits to rise **4.6%** when there may be no queue capacity | Move double points to a **quiet slot** (for example weekdays 2–4pm or Saturday mornings) once the till shows the slow hours. Dropping it brings the total from 5.8% to **5.0%** of member net sales |
| **Beans Club** | **Adjust** | One posted bag free at 10% off: **£1.43**. With £2.50 delivery: **£3.88**. Collected: **£4.93** | Keep 10% off and pause, skip or cancel. **Free delivery on 2+ bags per delivery or for collection; £2.50 for a 1-bag delivery.** Points stay on the bag price |
| **Delivery £3.95, free over £30** | **Keep** | One bag + £3.95: £6.45. 3 bags with free delivery: £13.58 | None. £30 is 3 bags, or the £33 Discovery set |
| **Gift subscription £36 / 3 months** | **Adjust** | Posted free at £36: **£7.73** (21%) | **£36 collected, £42 posted** (£13.61). Same for corporate orders. VAT on prepaid gift subscriptions: **confirm with an accountant** |

**Suggested loyalty budget:** keep member schemes at or below **5% of member net sales** at cost. Check it monthly from the app's points and stamps data and the till. If it goes over, move or drop early-bird first and review bonus points second.

---

## 6. What to measure in the first 90 days

1. Visits per active member per month (from the till, with Bija Card scans), compared with the 4 weeks before launch. **This is the uplift we need: +9.4% with all six schemes, +7.9% without early bird.**
2. Stamps issued, free drinks redeemed, cards left unfinished after 60 days (the real stamp breakage).
3. Points issued, redeemed, and the cake/bag mix (the real cost per point).
4. Share of transactions before 9am, and the slowest two hours (where early bird should move).
5. Beans Club: share of 1-bag vs 2-bag deliveries, collected vs posted, and churn.

---

### Sources
- Bija app constants (points, rewards, referral, Beans Club, delivery): `app.html` in this repo (merged from `main`, 29 Oct 2026)
- Royal Mail online prices from 5 Oct 2026: <https://www.royalmail.com/sites/royalmail.com/files/2026-10/online-price-guide-october-2026-v1.pdf>
- Loyalty breakage ranges (vendor sources): <https://blog.brandmovers.com/what-is-point-breakage-and-why-should-you-care>, <https://www.leat.com/resources/blog/loyalty-program-breakage>
- Endowed progress (Nunes & Drèze 2006, *Journal of Consumer Research* 32(4), 504–512), summary: <https://coglode.com/nuggets/endowed-progress-effect>
- Goal-gradient in a café reward programme: Kivetz, R., Urminsky, O. & Zheng, Y. (2006), *Journal of Marketing Research* 43(1), 39–58
- Spend per visit (£6.23) and 68% margin: fullstack team's unit-economics workbook (`docs/finance/build_unit_economics.py` on `team/fullstack`), both assumptions
- Referral rules and ASA note: marketing team's `docs/marketing/launch-campaign.md` on `team/marketing`
- HMRC VAT Notice 701/14 (food): <https://www.gov.uk/guidance/food-products-and-vat-notice-70114> (confirm with an accountant)
