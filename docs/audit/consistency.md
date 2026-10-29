# Consistency audit: prices, rules and facts

*Business analysis · run 1: 29 Oct 2026, 20:25 UTC (main at `8e455db` plus team branches) · **run 2: 20:54 UTC, main at `8328a29`**, which now includes the offices, gifts, emails, press and launch-kit branches and a new `events.html`*

**What this checks.** Every price and rule a customer can read should say the same thing in every file. For each rule the table gives the value in each source (`file:line`), whether they agree, and the **canonical value** to use. Where BizDev has a recommended default in [`docs/bizdev/owner-decisions.md`](../bizdev/owner-decisions.md) on `team/bizdev`, the canonical value is that default, marked **🟡 owner decision** (code A1–G3 from that doc). Section 3 lists claims with no source behind them. Section 4 is the change list, file by file.

All paths are now on `main` (as of run 2), so file names have no branch prefix. Line numbers were rechecked in run 2 and haven't changed. `help.html` doesn't exist yet.

---

## 1. The ten things to fix first

| # | Problem | Why it matters |
|---|---|---|
| 1 | **Who roasts the beans: four different stories.** The site says "roasted with Kindred Forest". `index.html:294` says "an established UK partner". The press page says "roasted by our baristas". A public case study by the UK roaster Redber says Redber roasts and fills Bija's own-brand bags | A false origin claim breaks the CAP Code and consumer law. **No roasting claim should go live until the owner confirms in writing** (§3) |
| 2 | **Free delivery: "over £30" in 10 places, "£30 or more" in 1, and the code charges nothing at exactly £30** | A £30 basket gets free delivery but the page says it shouldn't. Say "£30 or more" everywhere |
| 3 | **The award is worded wrong in the app** (`app.html:2947`: "Best New Coffee Shop *of the Year* · London Coffee Festival 2025") | Use the organiser's exact name |
| 4 | **The Origins Passport can't be finished.** It needs 5 origins, but Gayo and Kintamani are "coming soon" | The +600 bonus is promised on `rewards.html` and in launch copy, but nobody can earn it |
| 5 | **The subscription FAQ says app management is "coming next"** (`subscribe.html:75`), but the app already has Skip, Pause and Cancel (`app.html:3536–3538`) | It contradicts the product |
| 6 | **Referral isn't on the rewards page**, and the in-app share text has no "Ad:" label (`app.html:4247`) | Members can't find the rule. ASA guidance on referral codes (B4/A5) |
| 7 | **Office page price is below BizDev's office price list.** `offices.html:62` says "from £10.80 a bag". BizDev's office tier for 4–9 bags is £11 | Offices get a lower price than the planned office tier. Hold the price until the owner decides (A8) |
| 8 | **Emails link to the GitHub Pages demo** (`rfim.github.io/bija-coffee/…`), and every contact email is `info@bijalondon.co.uk`, which marketing marks as a mock-up | Real customers would be sent to a demo |
| 9 | **The subscription notice period differs.** Most copy says "any time before your next dispatch"; the app says "whenever you like"; BizDev's default is 3 days | Customers could cancel after the bag is packed. Pick one (D6) |
| 10 | **Pending loyalty decisions would change many files** (drop the 400-point drink, add the stamp card, move early bird, Beans Club delivery, £42 posted gift). None is reflected yet | Expected: these are 🔴 owner decisions. The change list in §4 is ready for when they're approved |

---

## 2. Rule by rule

Legend: ✅ consistent · ❌ inconsistent · ⚠️ consistent but differs from the recommended default or unsourced · 🟡 owner decision (BizDev code)

### 2.1 Bija Card

| Rule | Value per source | Consistent? | Canonical value |
|---|---|---|---|
| **Points rate** | 10 per £1: `app.html:2852` (`PTS = 10`), `:2854`, `:3590`; `rewards.html:8`, `:55`, `:87`, `:89`; `index.html:282`, `:301`; `shop.html:67`; `subscribe.html:78`; `delivery.html:74` (products only, not delivery); `site-shop.js:27`, `:133`; `offices.html:75`; `marketing/launch/in-store.md:18`, `:30`, `newsletter-blocks.md:9` | ✅ | **10 points per £1 on products; delivery charges don't earn** (`rewards.html:71`). 🟡 A4: keep |
| **Rewards** | Cake 350, drink 400, 200 g bag 1,200: `app.html:2860–2862`; `rewards.html:8`, `:77–79`; `index.html:301`; `marketing/launch/instagram-grid.md:79`, `newsletter.txt:23–25`, `newsletter-blocks.md:9`, `in-store.md:18`, `stories.md:41` | ✅ with each other · ⚠️ against the default | 🟡 **A4: cake 350, bag 1,200; remove "Any drink 400"** (the stamp card becomes the drink reward). Until approved, keep 350/400/1,200 everywhere |
| **Stamp card** (10th handcrafted drink free, up to £5.50) | **Nowhere**: not in `app.html`, `rewards.html` or any copy. The only "stamps" are Origins Passport stamps | ⚠️ missing | 🟡 **A3: keep, paid drinks only.** If approved, it has to be built in the app and added to `rewards.html`. £5.50 covers every drink on the menu (dearest: affogato and smoothie £5.50, `app.html:2957`, `:2961`) |
| **Welcome bonus** | +100 on first order: `app.html:2864`, `:3593`; `rewards.html:55`, `:99`; `marketing/launch/in-store.md:16`, `:30`, `:48`, `instagram-grid.md:23`, `:48`, `newsletter.txt:26`, `stories.md:24` | ✅ | **+100 points with your first order** |
| **Challenges and cap** | Regular +150, Explorer +150, Birthday +200, capped at 200 a month: `app.html:2864–2865`, `:3572–3577`; `rewards.html:99–106` | ✅ | As built. `rewards.html:89` calls the birthday bonus a "birthday treat"; say "+200 birthday points" |
| **Secret St James's** | +400: `app.html:2864`; `rewards.html:103`; `marketing/launch/instagram-grid.md:109`, `stories.md:60`, `newsletter.txt:36` | ✅ | +400 |
| **Origins Passport** | +600 for 5 origins (`app.html:2936–2941` includes Gayo and Kintamani); `rewards.html:104`; `marketing/launch/in-store.md:35`, `newsletter-blocks.md:11`. Gayo and Kintamani are `soon: true` (`app.html:2911–2912`) | ❌ can't be completed | 🟡 **B3: passport needs the 3 shelf origins plus 1 guest filter**, or hide the bonus until Gayo and Kintamani are on sale |
| **Tiers** | Seed 0, Sprout 1,500, Kopi Tree 5,000; perks not multipliers: `app.html:2853–2858`; `rewards.html:87–91`; `marketing/launch/instagram-grid.md:80` | ✅ | As built |
| **Referral** | **300 each when the friend collects their first order**: `app.html:2925`, `:3551`, `:3592`, `:4247`. **Not on `rewards.html`.** Marketing's spec: friend 100 + member 150 after first paid order of £3+, max 5 a month (`team/marketing` `docs/marketing/launch-campaign.md` §3) | ❌ | 🟡 **A5: 300 each, credited after the friend's first paid order of £3+, max 5 a month, outside the 200-point cap; share text starts "Ad:"** |
| **Points expiry and terms** | No expiry anywhere. "No cash value": `delivery.html:74`; `marketing/launch/in-store.md:19`, `:31`, `:48`, `instagram-grid.md:49`, `newsletter.txt:45` | ⚠️ | 🟡 **A4: expire after 12 months with no activity** (solicitor to confirm). Add to `delivery.html:74` and `rewards.html` |

### 2.2 Offers

| Rule | Value per source | Consistent? | Canonical value |
|---|---|---|---|
| **Own cup** | 25p off any hot drink in a clean reusable cup: `app.html:2928`; `README.md:23` | ✅ | 🟡 A6: **keep** |
| **Students** | 10% off with TOTUM or university ID, not with other offers: `app.html:2930`; `README.md:23` | ⚠️ | 🟡 **A6: off-peak only (weekdays after 2pm, and weekends)** |
| **Early bird** | Double points Mon–Fri before 9am: `app.html:2929`, `:3095`, `:3851`; `README.md:23` | ⚠️ | 🟡 **A6: drop, or move to the quietest 2 hours once till data is in** |
| Offers on the website | None of the three offers appears on `rewards.html` or any public page | ⚠️ | List them on `rewards.html` once decided, with terms |

### 2.3 Beans, Beans Club, delivery and gifts

| Rule | Value per source | Consistent? | Canonical value |
|---|---|---|---|
| **Bag price** | £12 per 200 g: `app.html:2907–2912`, `:2968–2973`; `site-shop.js:7–14`; `index.html:272`, `:536`; `shop.html:38`; `press.html:77`; `marketing/launch/in-store.md:55` | ✅ | £12. 🟡 A1 |
| **Beans Club price** | £10.80 a bag, 10% off: `app.html:2917` (`SUB_OFF`), `:2931`; `site-shop.js:27`; `subscribe.html:33`, `:52`; `shop.html:38`; `index.html:272`, `:282`; `offices.html:62`; marketing launch copy | ✅ | £10.80 (10% off). 🟡 A2 |
| **Beans Club delivery** | Free on every delivery: `subscribe.html:8`, `:33`, `:43`, `:79`; `shop.html:38`, `:66`; `product.html:8`, `:96`, `:106`; `index.html:265`, `:282`; `app.html:2931`, `:3458`, `:3469`, `:3529`; `site-shop.js:65`, `:69`, `:117`; `delivery.html:45`; `offices.html:62`; `emails/beans-club-reminder.*:41/7` ("free as always"); marketing launch copy | ✅ with each other · ⚠️ against the default | 🟡 **A2: free for 2+ bags per delivery or collection; £2.50 for a 1-bag posted delivery** (a free 1-bag post makes about £1.40) |
| **Frequency** | Every 2, 3 or 4 weeks: `app.html:2916`; `site-shop.js:17`; `subscribe.html:33`, `:43`; `product.html:97`, `:107`; `index.html:282`; `offices.html:62`; marketing | ✅ | Every 2, 3 or 4 weeks |
| **Subscription: skip, pause, cancel** | "Any time before your next dispatch": `subscribe.html:44`, `:75`; `delivery.html:65`; `product.html:107`; `marketing/launch/instagram-grid.md:63`, `newsletter.txt:29`. "Any time": `subscribe.html:8`, `:33`; `index.html:266`, `:282`; `app.html:2931`, `:3469`. "Whenever you like": `app.html:3529`. Reminder email 3 days before: `emails/beans-club-reminder.txt:5`, `:12` | ❌ | 🟡 **D6: skip, pause or cancel up to 3 days before your next dispatch. No minimum term** (solicitor checks the DMCC Act 2024 subscription rules) |
| **Managing subscriptions** | "Email us or ask at the bar… Managing subscriptions in the Bija app is coming next": `subscribe.html:75`. But the app already has Skip next, Pause and Cancel: `app.html:3536–3538` | ❌ | "Skip, pause or cancel in the Bija app, by email, or at the bar" |
| **When subscribers are charged** | On dispatch, never in advance: `subscribe.html:76`; `delivery.html:73`; `emails/beans-club-reminder.txt:10`; `emails/order-confirmation.txt:19` | ✅ | On dispatch |
| **Delivery fee** | £3.95 Royal Mail Tracked 48: `app.html:2917`; `site-shop.js:27`; `delivery.html:44`; `shop.html:66`; `product.html:95`, `:106`; `subscribe.html:50` | ✅ | £3.95 Royal Mail Tracked 48. 🟡 A1 |
| **Free delivery threshold** | **"£30 or more"**: `delivery.html:44`, and the code (`site-shop.js:69` `subtotal >= FREE_AT`; `app.html:3458` `subtotal >= FREE_POST`). **"Over £30"**: `delivery.html:8` (meta description, found in run 2); `shop.html:66`; `product.html:95`, `:106`; `index.html:265`; `site-shop.js:131`; `app.html:3486`; `gifts.html:72`; `marketing/launch/instagram-grid.md:33`, `stories.md:14` | ❌ | **"Free on orders of £30 or more"** (matches the code) |
| **Dispatch and delivery time** | Dispatch usually within 2 working days: `delivery.html:49`; `product.html:106`; `emails/order-confirmation.*:7/41`. Delivery 2–3 working days after dispatch: `delivery.html:44–45`; `emails/dispatched.txt:7`. `checkout.html:81` says "Usually 2 to 3 working days", which can be read as order to door | ⚠️ minor | "We usually dispatch within 2 working days; Royal Mail aims to deliver 2–3 working days after that." Fix `checkout.html:81` |
| **Click and collect** | Free at 2a St James's Market: `shop.html:66`; `product.html:101`; `checkout.html:82`; `delivery.html:52`; `subscribe.html:79`; `gifts.html:72`; `app.html:3463` | ✅ | Free |
| **Gift subscription** | £36, 3 × 200 g over 3 months, delivery included, no renewal: `site-shop.js:12`; `subscribe.html:68`; `delivery.html:46`, `:66`; `index.html:315`; `gifts.html:8`, `:42`, `:71`; `offices.html:63`; `marketing/launch/newsletter-blocks.md:13` | ✅ with each other · ⚠️ against the default | 🟡 **A7: £36 collected, £42 posted** (by 23 Nov) |
| **Discovery set** | £33, Mandheling, Lintong and Old Brown Java, 3 × 200 g, "save £3": `app.html:2913`; `site-shop.js:11`, `:114`; `shop.html:58`; `gifts.html:8`, `:42`, `:72`; `offices.html:63` | ✅ | £33. 🟡 A1 |
| **Gift cards** | £5 to £200: `app.html:2904` (presets £10, £25, £50), `:3635`, `:4278`; `index.html:314`; `gifts.html:70`, `:82`; `offices.html:64`; BizDev `office-catering.md` | ✅ | £5 to £200 |
| **Returns** | Cancel within 14 days of receiving; unopened, sealed bags; customer pays return postage: `delivery.html:55–58`; `product.html:106`; `delivery.html:8` | ✅ | As written (solicitor to confirm the sealed-goods wording) |
| **Office prices** | `offices.html:62`: "From £10.80 a bag", subscription price, "ask us about larger orders". BizDev `wholesale.md` §1 (`team/bizdev`): 200 g at £11 (4–9 bags), £10.50 (10–24), £10 (25+); 1 kg at £40, £37, £34 | ❌ | 🟡 **A8: BizDev's price list, published after the roaster's prices are confirmed (B1).** Until then, `offices.html` shouldn't quote a price under £11 for office volumes. "Price on request" is safest |

### 2.4 Business facts

| Rule | Value per source | Consistent? | Canonical value |
|---|---|---|---|
| **Opening hours** | Mon–Fri 8am–5.30pm, Sat 11am–6pm, Sun 12pm–6pm: `app.html:2868`, `:2945`; `index.html:11` (structured data), `:440`; `delivery.html:52`; `marketing/launch/newsletter-blocks.md:14`, `newsletter.txt:46` (both "[Confirm hours]") | ✅ | As written, **unconfirmed**. 🟡 F1 (Christmas and New Year hours by 6 Nov) |
| **Address** | 2a St James's Market, London SW1Y 4AH: `index.html:11`, `:264`, `:374`; `delivery.html:52`, `:70`; `privacy.html:16`; `site-shop.js:159`; `checkout.html:82`; `app.html:2883`; `press.html:75`; `offices.html:74`; all `emails/*` footers | ✅ | **2a St James's Market, London SW1Y 4AH.** Matches the Companies House registered office ([summary](https://corpsignals.uk/companies/uk/bija-coffee-ltd-15383542.html)). The FSA hygiene register lists **SW1Y 4SB** ([foodhygieneratings.org.uk](https://www.foodhygieneratings.org.uk/bija)): owner to check which is right for the shop door |
| **Phone** | +44 20 4603 3086: `index.html:11`, `:374`; `delivery.html:70`; `accessibility.html:28`; `site-shop.js:155`; `offices.html:84`; `press.html:128`; all `emails/*` | ✅ | As written. One outside source lists 020 4603 3086 ([St James's London](https://stjameslondon.co.uk/places/bija)). Owner to confirm it's answered |
| **Email** | `info@bijalondon.co.uk` on every page and email. `marketing/launch/README.md:19` and `newsletter.txt:49` call it **a mock-up**. Press uses "press team" (`press.html:63`) with the same address | ⚠️ unconfirmed | 🟡 **Owner confirms the real address.** It should match the live domain (D1: `bijacoffee.co.uk`) |
| **Website domain** | `README.md:3` "bijacoffee.co.uk"; BizDev D1 default **bijacoffee.co.uk**; emails link to `https://rfim.github.io/bija-coffee/…` (`emails/order-confirmation.html`, `newsletter-welcome.*`, `gift-card-received.*`, `dispatched.html`, `beans-club-reminder.html`); email addresses use `bijalondon.co.uk` | ❌ | 🟡 **D1: one domain** for links, email and QR codes |
| **Company** | Bija Coffee Limited, registered in England and Wales, company number 15383542: `delivery.html:70`; `privacy.html:16`; `site-shop.js:159`; all `emails/*` footers; `marketing/launch/newsletter.txt:47` | ✅ | As written. Matches the public register: incorporated 3 Jan 2024, registered office 2a St James's Market ([summary](https://corpsignals.uk/companies/uk/bija-coffee-ltd-15383542.html); check on [Companies House](https://find-and-update.company-information.service.gov.uk/company/15383542)) |
| **Award** | **"Best New Coffee Shop, London Coffee Festival Awards 2025"**: `index.html:267`; `offices.html:73`; `press.html:62`, `:74`, `:118`; `emails/newsletter-welcome.*:9/41`; `marketing/launch/newsletter.txt:38`, `newsletter-blocks.md:15`. **"Best New Coffee Shop of the Year · London Coffee Festival 2025"**: `app.html:2947` | ❌ | **"Best New Coffee Shop, London Coffee Festival Awards 2025"**, the organiser's wording ([LCF winners](https://www.londoncoffeefestival.com/london-coffee-festival-awards/winners-lcf-awards)), presented 16 May 2025 (`press.html:74`). Don't imply 2026: the 2026 Best New Coffee Shop went to another café (same LCF source) |
| **Roaster** | "Roasted with Kindred Forest": `shop.html:38`; `delivery.html:49`; `product.html:83`; `index.html:272`, `:535`; `app.html:3486`; `emails/newsletter-welcome.txt:9`, `.html:41`. "We roast with an established UK partner": `index.html:294`. "Kindred Forest sources and roasts Indonesian specialty coffee with us": `index.html:388`. "Roasted by our baristas, from green coffee sourced with Kindred Forest": `press.html:78`, `:117`; `team/marketing` `pr-pack.md:20`, `:84`, `partnerships.md:147`. BizDev B2 default: "Roasted with Kindred Forest" | ❌ | **No roasting claim until the owner confirms in writing** (see §3). Interim wording: *"Indonesian specialty coffee from Sumatra and Java."* Use *"green coffee sourced with our partner Kindred Forest"* only for the beans confirmed to come through Kindred Forest |
| **Origins on sale** | House Blend, Sumatra Mandheling, Sumatra Lintong, Old Brown Java; Aceh Gayo and Bali Kintamani "coming soon": `app.html:2907–2912`; `site-shop.js:7–14`; `index.html:274`, `:426–427`; `press.html:77`; `marketing/launch/newsletter.txt:33` | ✅ | As written. 🟡 B3 |

---

## 3. Claims without a source

| Claim | Where | Problem | What to do |
|---|---|---|---|
| **"Roasted with Kindred Forest"** | `shop.html:38`; `delivery.html:49`; `product.html:83`; `index.html:272`, `:535`; `app.html:3486`; `emails/newsletter-welcome.*` | Marketing records that Kindred Forest **sources green coffee and does not roast** (`team/marketing` `partnerships.md:147`, "never 'roasted by Kindred Forest'"). The lead brief says the roaster is unconfirmed | Remove. Use the interim wording above |
| **"Kindred Forest sources and roasts… with us"** | `index.html:388` | Same as above | Remove "and roasts" |
| **"Roasted by our baristas" / "roasted by its own baristas"** | `press.html:78`, `:117`; `team/marketing` `pr-pack.md:20`, `:84` | Marketing says Bija confirmed this on 29 Oct. But a public case study by the UK roaster **Redber** says Bija "supplied their own branded bags, and we filled them with our expertly roasted speciality coffee", and that Redber sourced Bija's Sumatran Mandheling and Java beans ([Redber case study](https://www.redber.co.uk/pages/bija-case-study); [Redber white label](https://www.redber.co.uk/pages/white-label-coffee-uk)). That is the roaster's own marketing and may be out of date, but it is public and contradicts both stories | **Owner to confirm in writing who roasts which beans, today**, before the press page or any packaging goes live. Until then, no roasting claim |
| **"We roast with an established UK partner"** | `index.html:294` | Matches the Redber account but contradicts the rest of the site. Unconfirmed | Hold until the owner confirms |
| **"Which beans come through Kindred Forest"** | `press.html:78` ("To confirm"); `team/marketing` `pr-pack.md:20` | Unconfirmed, and Redber claims it sourced Mandheling and Java | Name no specific bean as Kindred Forest's until confirmed |
| Kindred Forest's environmental claims ("rainforest regeneration") | `press.html:78` | Must be Kindred Forest's own claim, with evidence, per the CMA Green Claims Code (`team/marketing` `partnerships.md:158`) | Attribute to Kindred Forest with a link, or remove |
| **Contact email** `info@bijalondon.co.uk` | Every page and email | Marked a mock-up by marketing | Owner confirms |
| Opening hours | Everywhere | Marked "[Confirm hours]" in launch copy | Owner confirms (F1) |
| "Founded by Devi Trianna"; founder bio | `press.html:117`, `:76` ("To confirm") | Founder name is sourced ([St James's / Crown Estate article](https://prod-stjames.thecrownestate.co.uk/news/international-womens-day-devi-trianna-bija)); bio is still to confirm | Keep "To confirm" until Devi approves (F3) |
| Postcode SW1Y 4AH | Everywhere | FSA hygiene register says SW1Y 4SB | Owner checks |
| "London Marathon runners 10% off" (run 2) | `events.html:98` | Listed as an offer, with no date and no terms. `events.html:18` notes the date is unconfirmed. It isn't among the app's offers (`app.html:2927–2931`), so staff may not know to honour it | Owner confirms whether it was a one-off (add the year) or a standing offer (add it to `OFFERS` with terms) |

---

## 4. Change list, file by file

**Do now** = fixes that need no owner decision. **On approval** = apply once the 🟡 decision is made (code in brackets). Line numbers are from the commits named at the top.

### `app.html` (main)
- **Do now** `:2947`: award → `'Best New Coffee Shop · London Coffee Festival Awards 2025'`.
- **Do now** `:3486`: "200 g bags roasted with Kindred Forest" → "200 g bags of Indonesian specialty coffee". Also "(free over £30)" → "(free on £30 or more)".
- **Do now** `:4247`: share text → start with `Ad: ` (e.g. `Ad: I get Bija Card points if you join with my code. …`). (A5 compliance)
- **Do now** `:3529`: "pause or cancel whenever you like" → "pause or cancel before your next dispatch" (then the D6 wording once decided).
- **On approval (A4)** `:2861`: remove the `drink` reward. **Also fix `:3359`**, which reads `REWARDS[1]` as the drink. After removal it would say "free drink every £120". Change it to look up rewards by `id`.
- **On approval (A3)**: build the stamp card (1 stamp per paid handcrafted drink, 10th free up to £5.50), driven by collected orders like the rest of the card.
- **On approval (A5)** `:2925`, `:3551`, `:3592`: credit referral after the friend's first **paid order of £3+**, max 5 a month per member.
- **On approval (A2)** `:2931`, `:3458`, `:3469`, `:3529`: subscription delivery free only for 2+ bags per delivery or collection; £2.50 for a 1-bag post.
- **On approval (A6)** `:2929`, `:2930`, `:3851`: students off-peak only; early bird dropped or moved.
- **On approval (B3)** `:2936–2941`: passport = Lintong, Mandheling, Old Brown Java + 1 guest filter (or mark Gayo and Kintamani as not yet counting).

### `site-shop.js` (main)
- **Do now** `:131`: "Free UK delivery on orders over £30" → "Free UK delivery on orders of £30 or more".
- **On approval (A2)** `:65`, `:69`: free delivery only when the subscription delivery has 2+ bags, or on collection; add a £2.50 single-bag fee. `:117`: "free delivery" → "free delivery on 2+ bags".
- **On approval (A7)** `:12`: gift subscription £36 collected / £42 posted (needs a delivery choice on the product).

### `index.html` (main)
- **Do now** `:265`: "On orders over £30" → "On orders of £30 or more".
- **Do now** `:272`, `:535`: remove "Roasted with Kindred Forest".
- **Do now** `:294`: remove "We roast with an established UK partner" until confirmed.
- **Do now** `:388`: "Kindred Forest sources and roasts Indonesian specialty coffee with us" → "We source green coffee with Kindred Forest" (only once the owner confirms which beans).
- **On approval (A4)** `:301`: drop "any drink at 400". **(A2)** `:282`: "Free UK delivery on every subscription" → "Free delivery on 2+ bags, or collect free". **(A7)** `:315`: "£36 · delivery included" → "From £36".

### `rewards.html` (main)
- **Do now**: add a **Referral** row to the bonus table (`:99–106`): "+300 for you and your friend when they collect their first paid order".
- **Do now** `:89`: "a birthday treat" → "+200 birthday points".
- **On approval (A4)** `:8`, `:78`: remove the 400-point drink; **(A3)** add the stamp card; **(A4)** add the 12-month expiry; **(B3)** `:104`: passport rule.
- **On approval (A6)**: list own cup, students and early bird with terms.

### `shop.html`, `product.html`, `delivery.html`, `subscribe.html`, `checkout.html` (main)
- **Do now** `delivery.html:8`; `shop.html:66`; `product.html:95`, `:106`: "free over £30" → "free on orders of £30 or more".
- **Do now** `shop.html:38`; `product.html:83`; `delivery.html:49`: remove "roasted with (our partner) Kindred Forest".
- **Do now** `subscribe.html:75`: "Managing subscriptions in the Bija app is coming next" → "Or do it yourself in the Bija app (Beans Club tab)".
- **Do now** `checkout.html:81`: "Usually 2 to 3 working days" → "Dispatched within 2 working days, then usually 2 to 3 working days with Royal Mail".
- **On approval (D6)** `subscribe.html:8`, `:33`, `:44`, `:75`; `delivery.html:65`; `product.html:96`, `:107`: "up to 3 days before your next dispatch".
- **On approval (A2)** `subscribe.html:33`, `:43`, `:50`, `:79`; `shop.html:38`, `:66`; `product.html:8`, `:96`, `:106`; `delivery.html:45`: new subscription delivery rule.
- **On approval (A7)** `subscribe.html:68`; `delivery.html:46`: gift subscription prices.
- **On approval (A4)** `delivery.html:74`: add points expiry.

### `offices.html`, `gifts.html`, `emails/*` (`dev/offices-gifts-emails`)
- **Do now** `gifts.html:72`: "free over £30" → "free on orders of £30 or more".
- **Do now** `offices.html:62`: replace "Single bags are £10.80 on subscription with free UK delivery… From £10.80 a bag" with "Monthly plans for offices, priced by volume. Ask us for a quote" until A8 is approved. Then publish BizDev's list.
- **Do now** `emails/newsletter-welcome.txt:9`, `.html:41`: remove "roasted with Kindred Forest".
- **Do now** all `emails/*`: replace `https://rfim.github.io/bija-coffee/` with a `{{site_url}}` placeholder, so the domain (D1) is set in one place.
- **On approval (A2)** `emails/beans-club-reminder.html:41`, `.txt:7`: "free as always" → "{{delivery_line}}".
- **On approval (A7)** `gifts.html:8`, `:42`, `:71`; `offices.html:63`: gift subscription prices.
- **On approval (D6)** `emails/beans-club-reminder.*`: the reminder goes 3 days before dispatch; say "Skip, pause or change it by {{cutoff_date}}".

### `press.html`, `marketing/launch/*` (`dev/press-launch`)
- **Do now** `press.html:78`, `:117`: replace "Roasted by our baristas" / "roasted by its own baristas" with "To confirm" until the owner answers §3.
- **Do now** `marketing/launch/instagram-grid.md:33`, `stories.md:14`: "free UK delivery on orders over £30" → "£30 or more".
- **On approval (A4)** `instagram-grid.md:79`, `newsletter.txt:24`, `newsletter-blocks.md:9`, `in-store.md:18`, `stories.md:41`: remove "400 = any drink"; add the stamp card. **(A2)** `in-store.md:37`, `:53`, `newsletter-blocks.md:10`, `newsletter.txt:29`, `instagram-grid.md:63`, `stories.md:33`: new club delivery wording. **(B3)** `in-store.md:35`, `newsletter-blocks.md:11`, `newsletter.txt:33`, `instagram-grid.md:94`: passport rule.

### `team/bizdev` docs
- `owner-decisions.md` B2: its default ("Roasted with Kindred Forest", as on the site) conflicts with marketing's record and with the Redber case study. Change the default to "no roasting claim until confirmed".

### `dev/economics` (this branch)
- Main has merged into this branch, so its `docs/bizdev/*` match `main` exactly. The analyst's earlier model is on `main` as `docs/bizdev/second-opinion/`. The only file this branch adds is `docs/audit/consistency.md`.
- The second opinion recommends dropping stamps. The lead has kept them in the build at the user's request, so whether to run points and stamps together is an owner decision. That matches BizDev's A3 default.

---

## 5. Run log

| Run | Time (UTC) | main | Result |
|---|---|---|---|
| 1 | 29 Oct 20:25 | `8e455db` | 7 rules inconsistent (free-delivery wording, award, passport, referral, subscription notice, office price, roaster); 4 unsourced or unconfirmed (roaster, email, domain, postcode) |
| 2 | 29 Oct 20:54 | `8328a29` | **No fixes landed yet.** All 7 inconsistencies and every "do now" item are still open, at the same line numbers. New: `delivery.html:8` also says "over £30" (added to the free-delivery row and the change list). New page `events.html`: address, email and award match the canonical values; one unsourced claim, the London Marathon 10% offer (added to §3). Owner decisions unchanged |
| 3 | 29 Oct 23:35 | `e5e29b5` | 11 run-1 items fixed; A3/A4 built. 8 still open (launch kit's 400-point drink and wording, app and email cancel wording, referral details, rewards small print, unenforced expiry, demo URL in labels and wallet). 4 new: stamp liability ÷10 instead of ÷9; three roaster-wording slips. See the Run 3 section |

---

## Run 3: 29 Oct 2026, 23:35 UTC (main at `e5e29b5`)

This run follows Sprints 1–3. It covers every page on `main`, now including `help.html`, `contact.html`, `visit.html`, `menu.html`, `origins.html`, `sustainability.html`, `allergens.html`, `install.html`, `trace.html` and `labels.html`, plus the JS modules, `emails/*` and `marketing/launch/*`. Line numbers below are at `e5e29b5`. **Sections 1–4 above describe run 1 and are kept as the record.**

**Summary:** **11 of the run-1 problems are fixed**, and the A3/A4 loyalty defaults are now built. **8 items are still open**: 5 are leftovers in launch copy, emails or small app strings, and 3 are owner decisions. **4 new findings:** one calculation bug and three roaster-wording slips.

### 3a. Fixed since run 1 (checked)

| # | Item | Where it now reads correctly |
|---|---|---|
| 1 | Free delivery "£30 or more" | `delivery.html:8`, `:47`; `product.html:104`, `:115`; `index.html:316`; `checkout.html:86`; `gifts.html:74`; `help.html:90`. Code `app.html:2186` (`>=`) |
| 2 | Award wording | `app.html:1080`: "Best New Coffee Shop, London Coffee Festival Awards 2025". All pages agree |
| 3 | Origins Passport can be completed | `app.html:934–935`: only origins on sale count; coming-soon ones show as locked |
| 4 | Referral on the rewards page, £3 minimum | `rewards.html:91`; `app.html:1042` (`REFER_MIN = 3`) |
| 5 | Subscription notice: 3 days | `delivery.html:68`; `subscribe.html:35`, `:46`, `:77`; `product.html:105`, `:116`; `index.html:317`, `:331`; `help.html:86`; `app.html:2250`, `:2258` |
| 6 | Subscribe FAQ no longer says the app is "coming next" | `subscribe.html:77` points to the app's Beans Club |
| 7 | Office price no longer below BizDev's tier | `offices.html:64`: "Office bags from £11" |
| 8 | Roaster wording is the same across the site | "Sourced with our partner Kindred Forest and roasted by Bija's baristas": `shop.html:43`; `delivery.html:52`; `product.html:92`; `index.html:323`, `:424`, `:579`; `app.html:2214`; `sustainability.html:76–88`; `press.html:80`; `trace.js:114`; `emails/newsletter-welcome.*`. This is the user's statement and is consistent. The Redber evidence still makes it an owner decision (3c) |
| 9 | 🟡 A4: "Any drink 400" removed; 🟡 A3: stamp card built | `app.html:923–927` (cake 350, beans 1,200), `:932` (`STAMP_FREE_AT = 9`, `STAMP_CAP = 5.5`); `rewards.html:8`, `:64`, `:84`; `help.html:97`; `index.html:366`; `install.html:175` |
| 10 | The `REWARDS[1]` trap | Gone: rewards are looked up by id (`app.html:933` `rewardPts`) |
| 11 | London Marathon offer | `events.html:100`: now a "Past offer · a one-off for that weekend" |

Phone (`+44 20 4603 3086`, 36 uses), postcode (`SW1Y 4AH`, 33), company number (`15383542`, 13), email (`info@bijalondon.co.uk`, 58) and hours (`app.html:1078`; `index.html:11`; `contact.html:19`, `:68`; `delivery.html:55`; `help.html:82`; `menu.html:202`) are **identical everywhere**.

### 3b. Still open (no owner decision needed)

| # | Item | Where | Fix |
|---|---|---|---|
| 1 | **Launch kit still promises "400 points = any drink"**, which no longer exists | `marketing/launch/in-store.md:18`; `instagram-grid.md:79`; `newsletter-blocks.md:9`; `newsletter.txt:24`; `stories.md:41` (quiz sticker) | Replace with the stamp card ("every 10th handcrafted drink free, up to £5.50") and cake 350 / beans 1,200. **Printing blocker: these are the table talker and till-card texts** |
| 2 | Launch kit and README still say "over £30" and "cancel any time" | `marketing/launch/instagram-grid.md:33`, `:63`; `stories.md:14`, `:33`; `newsletter-blocks.md:10`; `newsletter.txt:29`; `in-store.md:53`; `README.md:12` | "£30 or more"; "up to 3 days before your next dispatch" |
| 3 | App strings still say "cancel any time" | `app.html:1049` (Beans Club offer card); `app.html:2197` (shop sheet) | "Skip, pause or cancel up to 3 days before dispatch" |
| 4 | Reminder email cut-off contradicts the 3-day rule | `emails/beans-club-reminder.html:34`, `:41`; `.txt:12` ("any time before dispatch"). The email goes out 3 days before dispatch, which is already the deadline | "Skip, pause or change it by the end of today ({{cutoff_date}})", or send the reminder 4–5 days before |
| 5 | Referral details differ | `help.html:99` and the app share text `app.html:3198` leave out the £3 minimum. The share text still has no **"Ad:"** label (BizDev A5; ASA guidance on referral codes) | Add "£3 or more" in both; start the share text with "Ad: " |
| 6 | Rewards page small print | `rewards.html:84` leaves out the £5.50 cap that `help.html:97` and the app state; `rewards.html:107` still says "a birthday treat" (it's +200 points) | Add "up to £5.50"; "+200 birthday points" |
| 7 | **Points expiry promised in one place, not enforced** | `app.html:2359` tells members "Points expire after 12 months without a visit", but `app.html:1043` says it's "not yet enforced", and neither `rewards.html` nor the terms (`delivery.html` Points paragraph) mention it | Either remove the line from the app until the solicitor approves (A4/E3), or add the rule to `rewards.html` and the terms *and* enforce it. Don't show a rule the terms don't contain |
| 8 | **Demo URL hard-coded in printed and installed assets** | `labels.js:5` (**QR on printed bag labels**: `rfim.github.io/bija-coffee/trace.html`); `wallet.js:17`; `supabase/functions/wallet-pass/pass.js`; `contact.html:19` (structured data `url`); `emails/*` (7 files); `native/android/app/src/main/AndroidManifest.xml`; `docs/app-store/twa-manifest.json`; `app.html:1661` | One `SITE_URL` constant, set when D1 is decided. **Don't print labels until then**: a printed QR can't be changed |

### 3c. New findings in run 3

| # | Finding | Where | Recommendation |
|---|---|---|---|
| N1 | **Stamp liability is understated by 10%.** The Finance tab values outstanding stamps at `stamps / 10 × average drink cost`, but a free drink uses **9** stamps (`STAMP_FREE_AT = 9`) | `app.html:2734` (`stamps / 10`); text in `app-staff.js:540` ("÷ 10") | Use `stamps / STAMP_FREE_AT` and update the hint. Matters for the accountant (E2: unused stamps are a liability) |
| N2 | "Packed by our roasting partner" implies a third-party roaster, against "roasted by Bija's baristas" elsewhere | `allergens.html:32` | Say "packed by Bija" or follow the owner's answer on the roaster |
| N3 | "Our baristas roast the coffee **in-house**" claims an on-site roastery. Marketing said no "in-house" wording until it's confirmed where the roasting happens (`team/marketing` `pr-pack.md:28`) | `index.html:356` | "Our baristas roast every batch" (or the owner's confirmed wording) |
| N4 | "Roasted **for** Bija in London" in the share text implies someone else roasts | `trace.js:172` | "roasted by Bija's baristas in London" (once confirmed) |

### 3d. Owner decisions still open (unchanged)

- **Roaster.** The site now says "roasted by Bija's baristas" (the user's statement). Redber's public case study says Redber roasts and white-labels Bija's bags. **The owner should confirm in writing who roasts which beans, today, before press or packaging goes out.**
- **Postcode.** SW1Y 4AH everywhere; the FSA register says SW1Y 4SB.
- **Contact email** `info@bijalondon.co.uk` (marked a mock-up) and **domain** (D1).
- **Not adopted yet, so the site still shows the original proposal (consistent across files):** A2 Beans Club free delivery on every bag (`app.html:1033`, `:1049`; `site-shop.js:27`; `subscribe.html:35`); A7 gift subscription £36 delivered (`delivery.html:49`; `gifts.html:73`; `help.html:103`; `offices.html:65`); A6 students 10% and early-bird before 9am (`app.html:1045–1048`; `app-staff.js:139`).
