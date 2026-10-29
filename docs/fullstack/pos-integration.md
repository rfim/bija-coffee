# Till (POS) integration plan

For: Bija, 2a St James's Market, London (one café) · Written: 29 Oct 2026 · Owner: Full stack & Finance team

## The decision in one paragraph

We recommend **Square**. It is the only one of the four where we can, without a partner approval process, (1) get a message the moment an in-store sale finishes, (2) read what was bought and who bought it, and (3) link that sale to a Bija app member by scanning their Bija Card QR at the till. That turns "the barista types the code and amount" into "points land automatically". It also has a free POS plan and a native Xero daily summary. **SumUp** is the cheapest on card fees if almost all cards are UK consumer cards, but its API cannot tell us about sales rung up on its till or link them to a customer, so points would stay manual. If Bija already uses one of these tills and is happy, the [phased plan](#recommended-path) still works: phase 1 (daily takings) works with all four.

> **Prices need checking before you sign anything.** Our research tools could not open the vendors' sites directly on 29 Oct 2026, so the figures below come from the vendors' own UK pages as shown in search results. Anything marked *(verify)* was unclear or contradictory. Card fees here are quoted ex-VAT where the vendor says so; card processing is VAT-exempt. Ask your accountant how each fee is treated.

## What Bija needs from a till

1. **Daily takings** (card and cash) in a form the owner can enter or import into the app's Finance tab (`finance/close-YYYY-MM-DD`) and send to the accountant. HMRC needs these records kept for 6 years.
2. **Item sales** to see what sells (by item, by hour).
3. **Bija Card points for in-store sales without retyping.** Today a barista types the member code and amount into *Members → Add in-store spend*, which writes `bar/{uid}.instore`.
4. Low card fees on a £6.23 average sale, mostly contactless.

Sizing used below (an assumption to replace with Bija's real numbers): £6.23 × 150–300 transactions a day × 30 days = **about £28,000–£56,000 of card takings a month**.

## Comparison

### Card fees and software (UK)

| | In person (chip / contactless) | Online / keyed | Plans that lower the rate | Till software (1 café) | Card reader / hardware |
|---|---|---|---|---|---|
| **Square** | 1.75% | 1.4% + 25p online (UK cards); 2.5% keyed | None found for UK | Free plan; Plus "from £29/mo" *(verify: another page says £49)* | Reader from about £19 + VAT *(verify)* |
| **SumUp** | 1.69% pay as you go | 2.50% | **Payments Plus £19/mo (or £189/yr): 0.99%** on UK consumer cards; Amex, business, premium and non-UK cards stay at 1.69% | POS Lite free *(verify)*; POS Plus £29/mo; POS Pro £49/mo + £49 setup | Solo Lite £25, Solo £79, Terminal £135–£139 |
| **Lightspeed (Restaurant K-Series)** | Not published; quoted per venue | Not published | n/a | From £79/mo for the first terminal *(verify: tier table shows 89 / 159 / 249)* | Quoted per venue |
| **Epos Now** | Its own pages say 1.70%, 1.5% (Payments Lite, Amex 2.5%) and "from 0.8%" *(verify)* | Not found | Payments Lite terminal £15/mo | Hardware bundle from £299 + required 12-month support and payments plan from £54/mo | In the bundle |

Sources (checked 29 Oct 2026):
Square [pricing](https://squareup.com/gb/en/pricing), [POS pricing](https://squareup.com/gb/en/point-of-sale/pricing), [restaurant pricing](https://squareup.com/gb/en/point-of-sale/restaurants/pricing) ·
SumUp [pricing](https://www.sumup.com/en-gb/pricing/), [POS Pro pricing](https://www.sumup.com/en-gb/point-of-sale-overview/pos-pro/pricing/), [card readers](https://www.sumup.com/en-gb/card-readers/) ·
Lightspeed [restaurant pricing](https://www.lightspeedhq.com/uk/pos/restaurant/pricing/), [payments](https://www.lightspeedhq.com/uk/pos/restaurant/payments/) ·
Epos Now [merchant services](https://www.eposnow.com/uk/payment-processing/merchant-services/), [Payments Lite](https://www.eposnow.com/uk/payment-processing/epos-now-payments-lite/), [payment processing](https://www.eposnow.com/uk/payment-processing/).

**What card fees would cost Bija a month** (on £28k–£56k card takings):

| | Low (150 tx/day) | High (300 tx/day) |
|---|---|---|
| Square 1.75% | ~£490 | ~£980 |
| SumUp 1.69% | ~£473 | ~£947 |
| SumUp Payments Plus (0.99% + £19) | ~£296 | ~£573 |

The SumUp Plus figure is a best case: every business, premium or overseas card is charged at 1.69%, and St James's has a lot of corporate and tourist cards. Look at a month of Bija's real card mix before choosing on fees alone. Card fees are about 1–2% of sales either way; the spreadsheet `docs/finance/bija-unit-economics.xlsx` has a card fee input so you can see the effect.

### Daily takings export

| | What you can export | Accounting link |
|---|---|---|
| **Square** | Sales Summary, Item sales, Category and Modifier reports to CSV/Excel; Transactions CSV and Item Detail CSV ([help](https://squareup.com/help/gb/en/article/8362-print-export-or-email-your-reports)) | Native Xero sync posts a daily summary incl. VAT and tips ([Square](https://squareup.com/gb/en/the-bottom-line/inside-square/enhanced-xero-integration)); QuickBooks via Commerce Sync |
| **SumUp** | Product sales CSV, payment report, "Accounting Report Detailed" CSV ([help](https://help.sumup.com/en-GB/pos/articles/75000086605-report-how-and-why-use-the-accounting-report-detailed-csv-export-)) | Xero integration (sales, fees) |
| **Lightspeed K** | Payments, time-of-day and day reports ([help](https://k-series-support.lightspeedhq.com/hc/en-us/articles/4403189404699-Payments-report)) | Lightspeed Accounting syncs daily to Xero (about 100 invoices a day cap) |
| **Epos Now** | End-of-day reports *(verify the Z-report export)* | Xero app posts when you close the till |

All four are good enough for phase 1. QuickBooks support outside Square was not confirmed *(verify)*.

### API: can in-store sales award Bija Card points automatically?

| | Public API | Told when an in-store sale completes? | Line items + customer on the sale | Link the sale to a Bija member at the till | Access |
|---|---|---|---|---|---|
| **Square** | Yes, REST | **Yes**: `payment.created` / `payment.updated`, `order.created` / `order.updated` webhooks fire for sales on Square POS ([docs](https://developer.squareup.com/docs/webhooks/v2webhook-events-tech-ref)) | Yes: `Order.line_items`, `Order.customer_id`, `reference_id` ([docs](https://developer.squareup.com/reference/square/objects/Order)) | **Yes**: the POS can scan a customer QR at checkout; the code matches the customer's `reference_id` ([help](https://squareup.com/help/us/en/article/7387-identify-customers-at-your-counter-with-qr-codes), US page) | Self-serve; personal access token for a single seller, OAuth for apps. No API fee we know of *(verify)* |
| **SumUp** | Yes, REST, OAuth 2.0 | Only for payments *our* app starts on a Solo reader (`solo.transaction.updated`), not sales on SumUp's till *(verify)*; otherwise poll the transactions API | Line items not confirmed *(verify)* | Not found | Some scopes need SumUp's manual approval ([docs](https://developer.sumup.com/tools/authorization/oauth/)) |
| **Lightspeed K** | Yes, OAuth | **Partners only.** A single-business "custom integration" gets no webhooks and no orders API; it must poll ([docs](https://api-portal.lsk.lightspeed.app/quick-start/custom-integrations)) | Partners: yes | Not found | Lightspeed must approve the developer account, then again for production |
| **Epos Now** | Yes, API key (Basic auth) | Yes: `CompleteTransaction` webhook per API device ([docs](https://developer.eposnowhq.com/Docs/Webhooks)) | Transaction and TransactionItem endpoints; customer points exist | Not found (would need staff to pick the customer on the till) | API app bought through Epos Now *(verify price)* |

### Built-in loyalty (for comparison with the Bija Card)

| | Product | Cost |
|---|---|---|
| Square | Square Loyalty (phone number at the till) | From £9/mo on the pricing page; an older page says £25–£65/mo by visits *(verify)* |
| SumUp | SumUp Local / Advanced Loyalty | Free in guides; £19/mo add-on on POS Pro *(verify)* |
| Lightspeed | Lightspeed Loyalty add-on | Old figure £49/mo *(verify)* |
| Epos Now | Customer points in the till | Not found *(verify)* |

We do **not** recommend switching to a till's own loyalty scheme: the Bija Card (levels, challenges, Secret St James's, gift cards in the app) is the point of the app. Use the till only as the source of truth for "this member paid £x".

## How automatic points would work (Square)

```
Customer shows Bija Card QR ──► Barista scans it on Square POS (attach customer)
                                       │
                         sale paid on the till
                                       │
Square ──webhook: payment.updated (COMPLETED) / order.updated──► Bija integration (small server function)
                                       │  1. verify Square's webhook signature (x-square-hmacsha256-signature)
                                       │  2. fetch the order: total, line items, customer_id
                                       │  3. customer.reference_id = Bija member code → Bija uid
                                       │  4. write bar/{uid}.instore[square_payment_id] = { amount, at, items }
                                       ▼
            Bija app: stats() already turns bar/{uid}.instore into points
```

Key points:

- **It needs a tiny server.** The app is a static PWA with no backend. Webhooks need an always-on HTTPS endpoint (for example a Cloudflare Worker or a Supabase/Firebase function, typically free at Bija's volume) that holds the Square token and a staff-level key to the Bija db. The token must never be in `app.html`.
- **Points stay staff-side.** The function writes to `bar/{uid}` (staff-written), never to `customers/{uid}`. This matches the fixes in `security-review.md`: points must never come from data the customer can edit.
- **Idempotent.** Use the Square payment ID as the key in `instore`, so a webhook delivered twice cannot give points twice.
- **Refunds.** Listen for `refund.created` / `refund.updated` and write a negative `instore` entry, so points come off when money goes back.
- **Gift cards and app orders.** Don't award till points for an app order that was also paid on the till (the app already awards it at *Collected*). Simplest rule: app orders are rung up on the till without attaching the customer, or the integration skips sales whose note contains the app order code (for example `B4KX`).
- **Member code.** Square matches the scanned code to `reference_id`. Use a random member code stored staff-side (see S10 in the security review), not part of the user ID.
- **UK GDPR.** Square becomes a processor of "member X spent £y" data. Add Square to the processor list in `privacy.html`, keep only what you need (amount, time, items), and say in the privacy notice that till purchases are linked when the customer chooses to show their card.

With **Epos Now** the same design works using the `CompleteTransaction` webhook, but there is no scan-to-attach, so staff must pick the member on the till. With **SumUp** or **Lightspeed** (custom integration) it would have to poll every few minutes, and SumUp still has no way to say which member paid, so points stay manual.

## Recommended path

| Phase | What | Effort | Works with |
|---|---|---|---|
| **1. Now** | Owner enters the till's end-of-day (Z) report into *Finance → Daily close* each night: card and cash. Monthly, export the item sales CSV for the accountant. Keep the till's reports for 6 years. | None (app already supports it) | All four |
| **2. Next month** | Decide the till: compare a month of Bija's real card mix and volume against the fee tables above. If switching to Square, start on the free plan. Connect the till to Xero (or the accountant's software) so daily takings post automatically. | 1–2 days set-up | Square, SumUp (Xero) |
| **3. After the security fixes** | Build the webhook function (Square): scan Bija Card QR at the till → points land automatically. Retire manual "Add in-store spend" except as a fallback. | ~3–5 dev days + testing | Square (Epos Now with manual member pick) |
| **4. Later** | Pull daily totals from the Square API into `finance/close-YYYY-MM-DD` automatically, so the owner only checks cash. Item sales feed the Insights tab for in-store as well as app sales. | ~2–3 dev days | Square |

Phase 3 should wait until the **Critical** findings in `security-review.md` are fixed: automatic points are only worth having if points cannot also be faked from the customer side.

## Needs a decision from Bija

1. Which till does Bija use today, and is it on a contract? (Switching cost may outweigh fee savings.)
2. A month of real figures: transactions per day, card vs cash split, share of Amex / business / overseas cards. This decides Square vs SumUp Payments Plus on fees.
3. Are you happy to run a small server function (about £0 to £5 a month) for automatic points? It is the only way to get them.
4. Who is the accountant and which software do they use (Xero, QuickBooks, other)?
