# Launch KPIs: the 10 numbers to watch in the first 90 days

*Sprint 2 (overnight) · Business Development · draft for the owner and product lead · 29 Oct 2026*

Each KPI says what it measures, where the number comes from, how often to check it, and a first target. **Every target is an *(assumption)*.** Week 0 is the 4 weeks before launch, pulled from the till. Reset the targets once that baseline is known.

**Data sources**
- **Till:** Bija's current point-of-sale system (see the fullstack team's `pos-integration.md`).
- **App, Barista view:** tiles that exist in `app.html` today: *Revenue, Today, App ordering, App customers, Points issued, Gift cards sold, Beans sales, Subscribers, Beans Club due, Rating*. Points outstanding and their value are under *Finance → Insights*.
- **Analytics:** cookie-free events proposed in the fullstack team's `analytics.md` (`App Open`, `Place Order`, `Order Collected`, `Reward Redeemed`, `Gift Card Paid`, `Referral Joined`). These go live only after the owner chooses an analytics tool (decision C9 in [owner-decisions.md](owner-decisions.md)).
- **Finance:** the app's daily close (`finance/close-YYYY-MM-DD`) and the accountant's monthly figures.

---

| # | KPI | Definition | Source | Check | First target *(assumption)* |
|---|---|---|---|---|---|
| 1 | **Transactions per day** | All sales, till and app, ÷ trading days | Till (daily close in Finance) | Daily, reviewed weekly | ≥ week-0 baseline + 5% by week 12, and above the break-even in the fullstack model |
| 2 | **Average transaction value** | Takings incl. VAT ÷ transactions | Till | Weekly | ≥ week 0. The £6.23 benchmark is only a placeholder |
| 3 | **Member share of transactions** | Transactions with a Bija Card scan or an app order ÷ all transactions | Till scans plus the app's *Members → Add in-store spend* and app orders | Weekly | 20% by week 6, 35% by week 12 |
| 4 | **Visit frequency of active members** | Visits per member who visited in the last 30 days | App: collected orders plus in-store spend entries per member | Monthly | **+9.4%** on the first-month level (the break-even uplift for all six loyalty schemes, from [loyalty-economics.md](loyalty-economics.md)); **+7.9%** if early bird is dropped |
| 5 | **App order conversion** | `Place Order` ÷ `App Open`, and app orders as a share of transactions | Analytics; *App ordering* tile | Weekly | 15% conversion; app orders 10% of transactions by week 12 |
| 6 | **Loyalty cost as % of member net sales** | (Rewards redeemed at cost price + stamp drinks + discounts) ÷ member net sales ex VAT | `Reward Redeemed` events, the *Points issued* tile, member spend from KPI 3 | Monthly | **≤ 5%** (the model shows 5.8% with all schemes) |
| 7 | **Beans Club active subscribers and monthly churn** | Active subscriptions at month end; cancellations ÷ subscriptions active at the start of the month | *Subscribers* tile and the app's subscription records | Monthly | 40 by end of Dec, 90 by end of Mar ([bean-subscription.md](bean-subscription.md)); churn ≤ 10% a month |
| 8 | **Bean bags sold per week and contribution** | Shop + online + Beans Club + wholesale bags; contribution per channel at £5.40 bag cost | *Beans sales* tile, the till, the wholesale tracker | Weekly | +30% on week 0 by Christmas. Contribution per posted bag ≥ £3 |
| 9 | **Gift cards sold and outstanding balance** | £ of cards activated; £ still unspent (a liability) | *Gift cards sold* tile, `Gift Card Paid` events, gift card ledger | Weekly in Nov–Dec, then monthly | £3,000 corporate + retail in Dec ([office-catering.md](office-catering.md)). Balance reconciled monthly with the accountant |
| 10 | **Office and wholesale revenue** | Catering, office beans, corporate gifts and stockist invoices | Order and invoice tracker (not in the app yet) plus the Finance close | Monthly | 10 corporate gift orders in Dec. 4 repeat office clients and 2 stockists by end of Jan |

---

## Guardrails (watch, but don't target)

- **Order wait time:** placed to collected (`Order Collected` `wait` bands). If the share over 10 minutes rises after launch, the morning bar is overloaded. That is the cue to move or stop early-bird offers.
- **Gross margin and staff % of net sales:** from the Finance close and the fullstack model. The schemes must not push margin below the model's 68%.
- **Points and stamps outstanding (£ at cost):** *Finance → Insights*. A rising balance is a liability. Agree how to account for it with the accountant.
- **Rating:** the *Rating* tile. It should stay at or above the pre-launch average.

## How to report

One weekly line in the owner's Finance view, or a shared sheet, with KPIs 1–3, 5, 8 and 9. A monthly page adds 4, 6, 7 and 10. Compare each with week 0 and the target. Re-rank the [priorities](priorities.md) at the 90-day review on 27 Jan 2027.

**Gaps to close before launch:**
1. A week-0 baseline from the till (marketing's "Before week 1" task).
2. A decision on the analytics tool, so events 5, 6 and 9 can be counted.
3. A simple tracker for KPI 10 orders and invoices.
4. Bija Card scans at the till. The till integration would make this automatic; until then baristas enter spend by hand.
