# Card payments: Stripe or Square for Bija

Owner: Mobile App team · Sprint 2 · Status: **plan only.** This sprint adds no keys and no live payment code.

Scope: one café (2a St James's Market, SW1Y) that wants to
1. take payment in the app when someone orders ahead,
2. sell digital gift cards,
3. sell monthly bean subscriptions (200 g bags, £12 each),
4. ideally use the same provider at the till, like Black Sheep's scan-to-pay.

> ⚠️ **Prices need a check before anyone signs anything.** Our build environment can't reach stripe.com or squareup.com (both blocked by the network policy), so we couldn't open the pricing pages directly. Every figure below comes from search-engine copies of the official UK pages listed beside it (searched 29 Oct 2026), and some of those copies were old. Someone at Bija should open each linked page and confirm the number before deciding. Anything marked *(unconfirmed)* conflicted between sources or couldn't be found.

## 1. Fees side by side (UK)

| | **Stripe** | **Square** |
|---|---|---|
| Online card, UK consumer card | 1.5% + 20p (premium UK cards 2.8% + 20p) · [stripe.com/gb/pricing](https://stripe.com/gb/pricing) | 1.4% + 25p · [squareup.com/gb/en/pricing](https://squareup.com/gb/en/pricing), [developer.squareup.com/docs/payments-pricing](https://developer.squareup.com/docs/payments-pricing) |
| Online, non-UK card | EEA 2.5% + 20p, international 3.15% + 20p, plus 2% if currency is converted · stripe.com/gb/pricing | 2.5% + 25p · squareup.com/gb/en/pricing |
| Apple Pay / Google Pay | Charged as cards *(unconfirmed: not on the page copies we saw)* | Charged as cards |
| In person (till) | Terminal: 1.4% + 10p EEA cards, 2.9% + 10p others. Tap to Pay adds 10p per authorisation *(unconfirmed)* · stripe.com/gb/pricing | 1.75% (non-UK cards +1.5%) · squareup.com/gb/en/pricing |
| Card reader hardware | Reader S700 about £229 ex VAT *(unconfirmed, old page)*. Tap to Pay on iPhone or Android needs no hardware · [stripe.com/gb/terminal](https://stripe.com/gb/terminal) | Square Reader from £19 + VAT, Square Terminal £149 + VAT. Tap to Pay on iPhone and Android is available · [squareup.com/gb/en/hardware](https://squareup.com/gb/en/hardware) |
| Gift cards | **No product for selling your own.** Stripe's gift-card docs cover *accepting* third-party cards. We'd keep our own codes, which the app already has · [docs.stripe.com/payments/gift-cards](https://docs.stripe.com/payments/gift-cards) | **Built in.** eGift cards £0 per card, no setup or monthly fee, normal processing fee on the sale. Physical cards from about 52p each · [squareup.com/gb/en/gift-cards/pricing](https://squareup.com/gb/en/gift-cards/pricing) |
| Subscriptions | Stripe Billing: 0.7% of billing volume on top of card fees (or a monthly plan) · [stripe.com/gb/billing/pricing](https://stripe.com/gb/billing/pricing) | Square Subscriptions: processing fee only *(unconfirmed for the UK, source is an old community post)* |
| Disputes / chargebacks | £20 per dispute, plus another £20 if you contest it, refunded if you win · stripe.com/gb/pricing | No chargeback fee · [Square fees FAQ](https://squareup.com/help/gb/en/article/6109-fees-and-payments-faqs) |
| Payouts | Standard schedule free (first payout takes 7–14 days). Instant payouts 1% (min 40p) · [docs.stripe.com/payouts](https://docs.stripe.com/payouts) | Next working day, free. Instant transfer 1.5% *(limits unconfirmed)* |
| Monthly fee | None on the standard plan | Free plan £0. Square for Restaurants Plus £69 a month per location. Loyalty is an add-on *(price unconfirmed: "from £25 a month" in one source)* · [restaurants pricing](https://squareup.com/gb/en/point-of-sale/restaurants/pricing) |

## 2. What it costs Bija on real tickets

Based on the figures above (UK consumer cards), rounded to the nearest penny:

| Payment | Stripe | Square |
|---|---|---|
| £4.50 Kopi Susu Aren, paid in app | 27p (5.9%) | 31p (7.0%) |
| £4.50 at the till, card in person | 16p | 8p |
| £25 gift card, sold in app | 58p | 60p |
| £24 a month bean subscription (2 bags) | 56p + 17p Billing = 73p | 59p *(if subscriptions carry no extra fee)* |
| 100 app orders a day at £4.50 | about £27 a day, £800 a month | about £31 a day, £940 a month |

**The fixed fee hurts on coffee-sized tickets.** At £4.50, the 20–25p fixed part is most of the cost. The fix big UK chains use is a **top-up wallet**: the customer loads £10–£20 once and each coffee draws from the balance with no card fee. Bija's app already has a gift-card balance (`wallet` in `stats()`), so "Top up your Bija balance" reuses it. A £20 top-up costs 50p on Stripe or 53p on Square, against about £1.19 or £1.39 for paying for 4.4 coffees one by one. **Before launch, check with Bija's accountant** that a closed-loop balance spendable only at Bija is outside e-money rules (limited network exclusion), and how VAT applies. A Bija balance can buy standard-rated hot drinks and zero-rated beans, so it is likely a multi-purpose voucher, with VAT due when it's spent rather than when it's sold.

## 3. Recommendation

- **If Bija already uses Square at the till (or would switch): choose Square.** One dashboard and one payout for app, till and gift cards. Gift cards are native. In-person rates are lowest. There's no chargeback fee, which matters for small disputed coffees.
- **If Bija uses another till that it's keeping: choose Stripe for the app.** Online fees are about 4p lower per ticket, Billing is better for subscriptions (proration, dunning emails, customer portal), and the developer tooling and test mode are excellent. Gift cards stay in our own system, which already works.

Either way, the integration points below are the same.

## 4. How it fits the current order flow

Today: `placeOrder()` writes the order to `customers/{uid}.orders`. The bar moves it through `bar/{uid}.orders[oid].status`. The customer pays at the bar. Points are earned only on orders the bar marks collected.

Planned (keeps the same rule: **customers can't mark anything as paid**):

1. **Checkout** gets a choice: *Pay now* or *Pay at the bar*. Pay now loads the provider's hosted card fields (Stripe Payment Element or Square Web Payments SDK) with Apple Pay and Google Pay. Card numbers never touch Bija's code, so PCI scope stays at the lightest level (SAQ A).
2. **Server endpoint** `POST /pay/order` (Supabase Edge Function or similar, with the secret key in server env vars only):
   - re-prices the order from `config/current.menu`, rewards and gift-card balance. It never trusts the client's total.
   - creates the payment (a Stripe PaymentIntent, or a Square payment from the SDK token) with idempotency key = order id.
3. **Webhook** (`payment_intent.succeeded` / Square `payment.updated`) writes `bar/{uid}.paid[oid] = { amount, ref, at }`. It's server-written, like the rest of `bar/*`. The order is created as `awaiting_payment` and only joins the queue once paid, so unpaid orders never reach the barista.
4. **Barista queue** shows **Paid in app** instead of "take £x". Points still land when the order is collected, as now.
5. **Cancel and refunds:** cancelling a paid order (only while "Received") calls `POST /pay/refund`. The webhook records the refund. Points come back automatically because `stats()` ignores cancelled orders.
6. **Gift cards:** the `gbuy` flow becomes "pay now". The webhook sets `bar/{buyer}.giftsPaid[gid]`, so the code appears without the "Pay at the bar" step. With Square we could also mirror the card into Square Gift Cards so it can be spent at the till. One system must stay the source of truth for balances.
7. **Bean subscriptions:** a new "Beans monthly" option on the Beans page (1 or 2 bags, collect at the bar). Stripe Billing or Square Subscriptions charges monthly. On each paid invoice the webhook adds a pre-paid beans order to the queue for collection. Customers manage or cancel through the provider's hosted portal. Under UK consumer law, show the price, renewal date and how to cancel before checkout, and send a reminder before renewal.
8. **Till:** the member QR on the Bija Card stays as it is. With Square at the till, the in-store spend could later come in through a webhook instead of the barista typing it into Members.

Estimate: about 6–8 days for order payments and gift cards, plus 3–4 days for subscriptions, once a provider and backend are chosen.

## 5. Decisions needed from Bija
1. What till or card machine does Bija use today, and is it under contract?
2. Stripe or Square (see the recommendation)?
3. Should we launch the top-up wallet to cut fees on coffee-sized tickets? (Needs the accountant's view on e-money and VAT.)
4. Should "Pay at the bar" stay available? (Recommended: yes.)
5. Bean subscriptions: collect only, or delivery too? Delivery adds postage, packaging and a shipping address to the privacy notice.
