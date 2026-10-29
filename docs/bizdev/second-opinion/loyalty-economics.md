# Loyalty and offers: what each scheme costs Bija

*Sprint 3 · Business analysis · draft for Bija to approve · 29 Oct 2026*

**In one line:** keep **points, tiers, referral, own cup and delivery** as proposed. **Drop stamps** (they duplicate the free drink at 400 points) and the **student discount**. **Move early-bird double points** to the quiet afternoon. **Change the Beans Club**: free posting on a single £10.80 bag loses money against the counter bags it replaces. **Price the posted gift subscription at £42**, not £36.

> **How to read this.** Every number comes from [`loyalty-model.xlsx`](loyalty-model.xlsx). Change a yellow cell on the *Assumptions* tab and the rest updates. The workbook is rebuilt by [`build_loyalty_model.py`](build_loyalty_model.py). Costs are **at cost price** (ingredients, cups, packaging, postage, card fees), not the retail value the customer sees. Anything marked *(assumption)* is our estimate with no Bija data behind it. **Replace the assumptions with eight weeks of till and app data** before treating any figure as final. VAT points need the accountant.

---

## 1. The yardstick

Every scheme is costed **per 1,000 Bija Card members per year**, against what a member visit is worth.

| Input | Value | Source |
|---|---|---|
| Visits per member | **2 a month (24 a year)** | *(assumption, cautious)*. 1,000 members then make about a third of a 200-a-day café's transactions, close to marketing's 30% target ([90-day calendar](../marketing/90-day-calendar.md) on `team/marketing`) |
| Average transaction | **£6.23** incl. VAT, **£5.35** net | UK café benchmark used in the brief and the finance model (`docs/finance/bija-unit-economics.xlsx` on `team/fullstack`) |
| Gross margin | **68%** | Finance model base *(assumption)* |
| Card fee | 1.75% | Square in person ([pos-integration.md](../fullstack/pos-integration.md) on `team/fullstack`) |
| **Contribution per member visit** | **£3.53** | net × margin − card fee |
| Member net sales | **£128,338** per 1,000 members a year | |

**Break-even uplift** = scheme cost ÷ £3.53 = extra visits needed. It is shown as a share of the 24,000 baseline visits, or of the visits the scheme targets.

**What a point costs.** Rewards are cake 350, drink 400 and beans 1,200 points. A reward drink costs about £1.30 to make *(assumption: members pick dearer drinks when they're free)*, a cake £1.00 and a bag £5.40. With a 30/60/10 redemption mix *(assumption)*, **one redeemed point costs 0.33p and is worth 1.08p at menu prices.** So 10 points per £1 hands back about 10.8% in retail value, but only about **3.3p per £1 at cost** before breakage.

---

## 2. Scheme by scheme (per 1,000 members a year)

| Scheme | Cost at cost price | Breakage | Margin impact (% of member net sales) | Break-even extra visits | Break-even uplift | Call |
|---|---|---|---|---|---|---|
| **Points**, 10 per £1 | **£4,874** | 25% | 3.8% | 1,382 (1.4 per member) | **5.8%** | **Keep** |
| **Stamps**, 10th drink free | £2,253 *(on top of points)* | 35% | 1.8% | 639 | 2.7% | **Drop** |
| **Tiers**: Sprout, Kopi Tree | £1,672 | – | 1.3% | 474 | 2.2% of tier members' visits | **Keep** |
| **Referral**, +300 each | £176 (£1.76 a referral) | 25% | 0.1% | 0.5 visits per new friend | – | **Keep, tighten** |
| **Own cup**, 25p off | £42 | – | <0.1% | 12 | 0.1% | **Keep** |
| **Students**, 10% off | £385 | – | 0.3% | 109 | **17.9% more student visits** | **Drop at launch** |
| **Early bird**, double points before 9am | £913 | 25% | 0.7% | 259 | 4.3% of pre-9am visits | **Move to 2–4pm** |
| **Beans Club** as proposed | £6,768 perk cost (£4.70 a bag) | – | 5.3% | 1,919 | 8.0% | **Adjust** |
| Beans Club, recommended version | £2,448 (£1.70 a bag) | – | 1.9% | 694 | 2.9% | Recommended |
| **Delivery**, £3.95, free over £30 | £310 net | – | 0.2% | 88 | 0.4% | **Keep** |
| **Gifting**: postage inside a £36 gift subscription | £525 | – | 0.4% | 149 | 0.6% | **Adjust: £42 posted** |
| **All, as proposed** | **£17,919** | | **14.0%** | 5,080 | **21.2%** | |
| **All, as recommended** | **£10,435** | | **8.1%** | 2,959 | **12.3%** | |

The café-side core of the recommended package (points, tiers, referral, own cup, afternoon double points) costs **£7,677 (6.0% of member net sales)** and pays back with **about 2 extra visits per member a year (9%)**. The Beans Club and delivery lines are paid for by bean sales, not café visits (see §2.8).

### 2.1 Points: keep

- **Cost:** a member earns about 1,495 points a year from spend, plus about 500 in bonuses *(assumption: welcome 100, birthday 200, some challenges, Passport and trail)*. With **25% breakage** that costs **£4.87 per member, £4,874 per 1,000**: 3.8% of member net sales.
- **Breakage:** retail programmes are usually quoted at **20–30%** breakage ([Leat](https://www.leat.com/resources/insights/loyalty-program-breakage); [Loyalty360](https://loyalty360.org/content-gallery/daily-news/rewards-breakage-boon-or-bane-the-role-of-technology-in-optimizing-breakage)). Both are vendor and trade sources, not audited data. We use 25%. **Lower breakage costs more:** at 0% the cost is £6,499 (5.1%); at 40% it is £3,899 (3.0%) (*Sensitivity* tab).
- **Break-even:** **1.4 extra visits per member a year, a 5.8% uplift.** One UK SME guide suggests a 10–20% lift in repeat visits among participants as a pilot target ([bizzr.uk](https://bizzr.uk/blog/micro-loyalty-programmes-for-uk-smes/)). That is a target, not a measured result, but 5.8% leaves headroom.
- **Watch:** the 1,200-point bag is the dearest reward per point (0.45p against about 0.29p for cake and drinks). It is fine at a 10% share. If beans pass 25% of redemptions, raise it to 1,500.
- **Do:** let points expire after **12 months with no activity** (state it in the terms) so the liability doesn't build up forever, and show "points outstanding" in Finance as the app already does.

### 2.2 Stamps: drop as a second currency

- **Cost if run alongside points:** 24 drinks a year at "buy 9, the 10th free" with 35% breakage *(assumption: one vendor example has 22% of cards completed in 8 weeks, [BonusQR](https://bonusqr.com/article/loyalty-programs-that-actually-drive-repeat-visits); digital cards that never expire complete more often)* = 1.7 free drinks per member, **£2,253 per 1,000**. With no breakage: £3,467.
- **The problem is overlap.** At £4.20 a drink, 400 points already gives a free drink after about 10 drinks. Run both and a regular gets **two free drinks per ten**. Members would see **19% of their spend handed back at menu prices**. The "up to £5.50" cap also steers every free drink to the dearest item.
- **Break-even** on its own looks easy (2.7%), but the visits it would win are the same visits points already win.
- **Recommendation:** **drop the stamp card as a separate reward.** Keep the stamp grid that's already in `app.html` only as a picture of progress towards the 400-point drink (10 beans = 1 free drink). That keeps the familiar look at no extra cost.

### 2.3 Tiers: keep

- **Sprout** (1,500 lifetime points, about £150 of spend): a free extra shot or syrup. With 30% of members at Sprout or above, visiting 6 times a month, taking the perk on a quarter of drinks at about £0.18 *(assumptions)*: **£972**.
- **Kopi Tree** (5,000 points): four events a year at about £150, plus new-origin tastings: **£700**.
- **Total £1,672 (1.3%).** It breaks even if the 300 tiered regulars make **2.2% more visits**, about one visit each every 3 months. Perks, not multipliers, keep it cheap.
- **Do:** run Kopi Tree events before opening or after close, so they don't take seats from paying customers.

### 2.4 Referral (+300 each, staff-confirmed): keep, tighten

- **Cost:** 600 points per referral after breakage, plus a minute of staff time: **£1.76 a referral**. At 1 in 10 members referring each year, **£176 per 1,000**.
- **Break-even:** the new friend must make **half a visit**. Nearly any real new customer pays it back.
- **Risk is fraud, not cost.** Staff confirmation helps. Also pay out **only after the friend's first paid order of £3 or more** and **cap at 5 a month per member**, as marketing proposed ([launch-campaign.md §3](../marketing/launch-campaign.md) on `team/marketing`).
- **Conflict to settle:** the app pays **300 to each side**. Marketing's spec pays the friend 100 and the member 150. **Recommended: keep 300 each** (it costs only about 85p more per referral than marketing's version, and welcome 100 + 300 = a free drink on the friend's second visit), with marketing's guard rails. Referral points sit outside the 200-point challenge cap.

### 2.5 Own cup, 25p off: keep

- 25p off incl. VAT is 20.8p net, less about 11p saved on a cup and lid *(assumption)* = **about 10p per use**. At 3% of takeaway drinks *(Costa reported about 1% take-up of 25p off in 2017, [HuffPost UK](https://www.huffingtonpost.co.uk/entry/have-we-taken-to-using-reusable-coffee-cups_uk_5b278825e4b0f9178a9eefb7); a Starbucks London trial moved own-cup use from 2.2% to 5.9%, [Yahoo Finance UK](https://uk.finance.yahoo.com/news/starbucks-introduces-apos-latte-levy-103249981.html))*: **£42 per 1,000 members**, and it applies to non-members too. Pret's move to 50p in 2018 increased use about tenfold ([British Baker](https://bakeryinfo.co.uk/foodservice/paul-uk-on-par-with-pret-for-reusable-cup-discount/624819.article)). 25p is the cautious choice.

### 2.6 Students, 10% off: drop at launch

- The discount is 10% of net sales on every student visit: **£385 per 1,000 members** if 3% of visits are students *(assumption)*.
- **Break-even needs 17.9% more student visits**, because each discounted visit makes £2.99 instead of £3.53. St James's has offices and visitors, not campuses. BizDev already ranked this "not now" ([priorities.md](priorities.md) on `team/bizdev`).
- **If you want it later:** make it weekdays after 2pm only, where seats are empty, and not combined with other offers.

### 2.7 Early-bird double points before 9am: move to 2–4pm

- The shop opens at 8am on weekdays, so "before 9am" is the commuter hour, already the busiest. If 25% of member visits fall there *(assumption)*, the extra points cost **£913 per 1,000** and need **4.3% more pre-9am visits**. The people in that queue come anyway, and the queue limits how many more can be served.
- **Same cost, better odds:** run **"Afternoon double points, Mon–Fri 2–4pm"** instead. The till and app logic (`is-double` checkbox in the barista view) stays the same; only the hours change.

### 2.8 Beans Club (10% off, free delivery): adjust

Per bag, at £5.40 bean cost (the brief's 45% of £12) *(Unit economics tab)*:

| | Customer pays | Contribution | % |
|---|---|---|---|
| Shop counter | £12.00 | **£6.10** | 51% |
| One-off online + £3.95 delivery | £15.95 | £6.32 | 40% |
| **Club as proposed: 1 bag posted free** | £10.80 | **£1.20** | **11%** |
| Club, 2 bags in one Small Parcel | £21.60 | £2.52 a bag | 23% |
| Club recommended: 1 bag posted, £2.50 delivery | £13.30 | £3.64 | 27% |
| Club recommended: collected in store | £10.80 | £4.70 | 44% |

*(Contribution after beans, mailer £0.60, Royal Mail Tracked 48 Large Letter £2.90 online, Stripe card fee and 0.7% Billing, and points. Staff packing time left out. Royal Mail prices from [the October 2026 online price guide](https://www.royalmail.com/sites/royalmail.com/files/2026-10/online-price-guide-october-2026-v1.pdf), via [bean-subscription.md](bean-subscription.md) on `team/bizdev`.)*

- **Cost per 1,000 members:** 80 subscribers *(assumption, 8%)* taking 1.5 bags a month = 1,440 bags. As proposed the perks (discount plus free post) cost **£4.70 a bag, £6,768 a year**.
- **Cannibalisation:** if each subscriber would have bought half a bag a month at the counter anyway *(assumption)*, the club as proposed makes **£1,201 less** than doing nothing. A posted subscriber has to take **2.5 bags a month** to match half a counter bag.
- **Recommended version:** keep **£10.80 (10% off)** as the headline. Make delivery **free on deliveries of 2 or more bags** (Small Parcel), **free if collected in store**, and **£2.50 on a single posted bag**. At a 50/50 collect/post mix this makes **£4.17 a bag** and **£3,080 a year more** than the counter bags it replaces. Collection also brings subscribers in, where they buy a drink.
- **Bean cost is the swing factor.** Bija roasts its own green coffee, so £5.40 is probably too high. At £3.00 a bag, even the proposed club makes £3.60 posted (*Sensitivity* tab). **Get the real cost first.** Below about £4 a bag, the proposed club stops losing money against the counter bags it replaces, though the recommended version still makes more.
- **Packaging risk:** a single bag only costs £2.90 to post if it fits Royal Mail's 2.5 cm large-letter limit. Otherwise it's a £3.75 Small Parcel in a £0.80 box, and the proposed club makes about £0.15 a bag. Run BizDev's 5-pack test post first.
- **Conflict to settle:** BizDev's subscription plan proposed **no discount** (£12 collected, £14.50 posted) with a free filter on collection day. The site was built with 10% off and free delivery. The recommended version above is the middle ground.

### 2.9 Delivery (£3.95, free over £30): keep

- A 1-bag order at £3.95 covers the mailer and Tracked 48 Large Letter with **£0.45 to spare**.
- A free-delivery order (£30+) absorbs about **£4.55** (box plus Small Parcel £3.75). It pays for itself if the threshold adds **0.7 of a bag** to the basket. Going from 2 bags (£24) to 3 (£36) does that.
- Net cost **£310 per 1,000 members** at 200 one-off orders, 40% of them over £30 *(assumptions)*.
- **Small gap:** a 2-bag order (£24 + £3.95) goes as a Small Parcel and loses £0.60 on delivery. Not worth a rule change.

### 2.10 Gifting: gift subscription to £42 posted; Discovery set stays £33

| | Price | Contribution | % |
|---|---|---|---|
| **Gift subscription as proposed**: 3 bags posted monthly | £36 | **£8.26** | 23% |
| Gift subscription recommended | **£42** | **£14.17** | 34% |
| Discovery set, posted free (over £30) | £33 | £10.75 | 33% |
| Discovery set, collected | £33 | £15.42 | 47% |

- £36 was BizDev's **collect** price ([bean-subscription.md §1](bean-subscription.md)). With three posts included, Bija absorbs £10.50 of packaging and postage, **£525 per 1,000 members** at 50 gifts a year.
- **Recommendation:** **£42 posted** (still under BizDev's £43.50) and **£36 to collect in store**. If 20% of recipients become subscribers (BizDev's assumption) and stay 8 months, that adds about **£500** more per 1,000 members a year.
- **Discovery set at £33** (save £3 against three bags) **makes money even posted free. Keep it.**

---

## 3. What to measure from day one

| Metric | Why | Where |
|---|---|---|
| Visits per member per month, before and after joining | The 24-a-year baseline drives every break-even | App collected orders + Bija Card scans at the till |
| Points issued, redeemed, outstanding; redemption mix | Breakage and cost per point | App Finance "points outstanding" |
| Share of transactions on a Bija Card | Tells us if 1,000 members is a third of trade | Till |
| Club: collect vs post, bags per delivery, churn, skips | Club contribution swings from £1.20 to £4.70 a bag on these | Payment provider + app |
| Real cost of a 200 g bag and of a reward drink | The two biggest unknowns | Supplier invoices, recipe costing |

**Review at 8 weeks (mid-January 2027):** put the real numbers into the yellow cells. **Stop rule:** if points cost passes **6% of member net sales**, or members don't visit at least 5% more often than before joining, cut the bonuses (welcome, challenges) first and keep the 10-per-£1 core.

---

### Sources
- Loyalty breakage benchmarks (vendor and trade sources): <https://www.leat.com/resources/insights/loyalty-program-breakage>, <https://loyalty360.org/content-gallery/daily-news/rewards-breakage-boon-or-bane-the-role-of-technology-in-optimizing-breakage>
- Stamp card completion example (vendor blog): <https://bonusqr.com/article/loyalty-programs-that-actually-drive-repeat-visits>
- UK SME loyalty pilot targets: <https://bizzr.uk/blog/micro-loyalty-programmes-for-uk-smes/>
- Reusable cup discounts and take-up: <https://www.huffingtonpost.co.uk/entry/have-we-taken-to-using-reusable-coffee-cups_uk_5b278825e4b0f9178a9eefb7>, <https://uk.finance.yahoo.com/news/starbucks-introduces-apos-latte-levy-103249981.html>, <https://bakeryinfo.co.uk/foodservice/paul-uk-on-par-with-pret-for-reusable-cup-discount/624819.article>
- Coffee subscription churn (blog compilation, mostly US): <https://eightx.co/blog/coffee-subscription-churn-rate-benchmark>
- Royal Mail online prices, Oct 2026: <https://www.royalmail.com/sites/royalmail.com/files/2026-10/online-price-guide-october-2026-v1.pdf>
- Card fees: `docs/mobile/payments-plan.md` (`team/mobile`) and `docs/fullstack/pos-integration.md` (`team/fullstack`)
- Café base figures: `docs/finance/bija-unit-economics.xlsx` (`team/fullstack`)
