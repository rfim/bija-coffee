# Security review: `app.html` (Sprint 2)

Reviewer: Full stack & Finance team · Reviewed: 29 Oct 2026 · Code reviewed: `app.html` at commit `79aab15` (Sprint 1).
Scope: can a customer fake **points**, **gift card balance** or **order status**, or **read other people's data**? We also looked at anything that would let a customer act as staff.

This is a review only. The Mobile team owns `app.html`, so the fixes below are written for them to apply. Line numbers refer to `79aab15`.

## Summary

| # | Finding | Severity | What a customer gains |
|---|---|---|---|
| S1 | Stored XSS in the Barista view (`qty`, `reward.pts` and chart values are not escaped) | **Critical** | Runs code as the barista: can give themselves points and gift balance, read every customer and the finance data |
| S2 | Gift balance comes from customer-written `giftPay`: a negative value creates balance from nothing; cancelling or editing a paid order refunds it | **Critical** | Unlimited gift balance (real money) |
| S3 | Points come from customer-written `total` on collected orders, which the customer can still edit | **Critical** | Unlimited points |
| S4 | Spent points come from customer-written `reward.pts`; cancelling a collected order refunds the reward | **High** | Unlimited free drinks |
| S5 | Gift card `amount` and `code` live in the buyer's own document and can be changed after the bar takes payment | **High** | Pay £5, redeem £200; redeem the same paid card again and again |
| S6 | Order prices, totals and discounts are written by the customer and shown to the barista as the amount to take | **High** | Pays less than the menu price |
| S7 | Bonus rules use customer-written dates, lines, birth month and check-ins | Medium | Up to 200 bonus points a month, plus the 600 Passport and 400 Secret bonuses |
| S8 | No limits on what a customer writes (orders, claims, text size) | Medium | Floods the queue and the "Codes to confirm" list; can break the Insights page |
| S9 | Gift codes use `Math.random()` and there is no limit on claim attempts | Low | Easier guessing of unredeemed codes |
| S10 | Member code is the last 5 characters of the user ID | Low | Points can land on the wrong member if two codes match; the code reveals part of the account ID |
| S11 | A recipient's `bar/{uid}` record contains the buyer's user ID | Low (privacy) | Learns another customer's account ID |
| S12 | No Content Security Policy | Low (defence in depth) | Makes S1-type bugs easier to exploit |

**Reading other people's data:** with the hosted access rules as described (customers readable only by editors; `bar/{uid}` readable only by its own customer; `finance/*` editors only), we found **no direct way** for a customer to read another customer's orders, ratings or finance data. The app only subscribes to `customers`, `bar` and `finance` collections when `user.canEdit()` is true (line 3883), and the rule, not the app, is what enforces it. The two indirect routes are S1 (run code as staff) and S11 (one ID leaks).

**Faking order status:** a customer cannot set `received → brewing → ready → collected`; status is read from `bar/{uid}` (staff-written). But a customer *can* set `cancelled: true` on any of their orders at any time, including after collection, and `ordersOf()` lets that win over the bar's status (line 2835). That is the root of S2 and S4.

## The root cause

Points and gift balance are **recalculated in the browser** by `stats()` (lines 2839–2876). Some of its inputs come from `bar/{uid}` (staff-written, trusted) but many come from `customers/{uid}` (customer-written, **untrusted**): `total`, `lines`, `createdAt`, `reward.pts`, `giftPay`, `cancelled`, `birthMonth`, `secret.visited`. Anyone can open the browser console and call the same `db.doc('customers/<their uid>').update(...)` the app uses, with any values. The UI checks (the Cancel button only shows on received orders, "you can set it once", the £5–£200 range) are not security.

**One rule fixes most of this: anything that affects money or points must be written by staff (in `bar/{uid}`) and `stats()` must read money and points only from there.** The customer document becomes a *request* ("I'd like this"), and the bar's record is the *ledger* ("this is what happened").

## Findings and fixes

### S1. Stored XSS in the Barista view — Critical
**Where:** line 3379 `<b>${l.qty}×</b>` (queue), line 3382 `(−${o.reward.pts} pts)` (queue), line 3407 `fmtv ? fmtv(v) : v` with values from line 3413 (Insights best sellers, where `l.qty` is added to a number and becomes a string). Same pattern at lines 3133 and 3330 on the customer side (self only).
**How:** a customer saves an order whose line has `qty: '<img src=x onerror=…>'`. When any barista opens the queue, the code runs in the barista's session, which has editor rights. It can call the db to write `bar/{attacker}` credits and in-store spend, read every `customers/*` document (names, orders, ratings) and read `finance/*`. That is a UK GDPR personal data breach as well as a fraud.
Also, a very large `stars` value in a rating makes `'★'.repeat()` throw (line 3429), which breaks the Insights page for staff.
**Fix:**
1. Escape or coerce every customer value before it goes into HTML: `${num(l.qty)}`, `${num(o.reward.pts)}`, `bars()` → `esc(fmtv ? fmtv(v) : v)`, with `const num = (v) => { const n = Math.trunc(+v); return Number.isFinite(n) ? n : 0; };`.
2. In the Barista view, rebuild order lines from the menu and validate on read: `qty` an integer 1–20, `stars` an integer 1–5 (`'★'.repeat(clamp(r.stars,0,5))`), ignore anything else.
3. Add a CSP (S12).
4. Rule of thumb for code review: no `${…}` of customer data without `esc()` or `num()`. A quick check: `grep -n '\${[a-z]\.\(qty\|pts\|stars\)' app.html`.

### S2. Gift balance can be created or refunded by the customer — Critical
**Where:** `wallet = credits − giftUsed` (lines 2870–2875), where `giftUsed` sums `+o.giftPay` over the customer's non-cancelled orders.
**How:**
- Write an order with `giftPay: -100`. `giftUsed` becomes −100 and the wallet shows **£100** with no gift card at all. The customer then ticks "Pay with gift card balance" on real orders and the barista sees "£x paid in the app · take £0".
- Pay for a collected order with gift balance, then set `cancelled: true` (or `giftPay: 0`) on it. The spend disappears and the balance comes back.
**Fix:** gift balance is a liability in Bija's books, so treat it as a ledger written only by staff:
- When the barista marks an order *Collected*, write the gift amount actually taken into `bar/{uid}.orders[oid].giftPaid` (computed by the barista's app: `min(wallet, recomputed total)`, never from the customer's `giftPay`).
- `stats()`: `giftUsed = Σ bar.orders[*].giftPaid` and `wallet = credits − giftUsed`, both from `bar/{uid}` only.
- Once the bar has a record for an order, ignore the customer's `cancelled` flag (a customer may only cancel while the bar status is still `received`; the barista confirms the cancel).

### S3. Points from a customer-written total — Critical
**Where:** `earns` uses `+o.total` from the customer's order (line 2843); only the *status* comes from the bar.
**How:** after an order is collected, update it to `total: 99999`. The next render shows ~1,000,000 points and every reward is unlocked. The same trick with `lines` fills the Origins Passport (+600) and Explorer.
**Fix:** at *Collected*, the barista's app writes a snapshot into `bar/{uid}.orders[oid]`: `{ status, at, total, pts, lines: [{id, qty, origin}] }`, where `total` is **recomputed from the menu** (`config/current`) and `pts = round(total × 10)`. `stats()` takes earning orders, totals, lines and dates only from that snapshot. Edits the customer makes later change nothing.

### S4. Rewards can be refunded — High
**Where:** `spent = Σ +o.reward.pts` over non-cancelled orders (line 2869), customer-written.
**How:** redeem "Any drink" (400 points), collect it, then cancel the order or set `reward.pts` to 0. The 400 points come back. Repeat for unlimited free drinks. Writing `reward.pts: -5000` at order time adds 5,000 points.
**Fix:** at *Collected*, the bar writes `bar/{uid}.orders[oid].redeemed = { id, pts }` using the points from `REWARDS` (never the customer's number). `spent = Σ bar.orders[*].redeemed.pts`. The barista checks the balance is enough before marking collected, and the queue shows the reward name from `REWARDS` by `id`.

### S5. Gift card amount and code can be changed after payment — High
**Where:** gifts are stored in the buyer's `customers/{uid}.gifts` (line 3714 onward); the bar only stores `giftsPaid[gid]` (a timestamp). The *Confirm* handler (line 3733) credits `g.amount` and checks "used" only by looking up the **code** in `credits`. It does not check `giftsRedeemed[gid]`.
**How:**
- Buy a £5 card, pay £5 at the bar, then change `amount` to 200. When the code is confirmed, £200 is credited.
- After a card is redeemed, change its `code` to a new string and claim the new code. The gift is still "paid" (by `gid`) and the new code has never been credited, so it is credited again. Repeat.
**Fix:**
- When the barista taps *Paid · activate card*, copy the facts into the bar: `bar/{buyer}.giftsPaid[gid] = { at, amount, code }`, where `amount` is what was actually taken at the till and `code` is generated **by the barista's app** at that moment (S9). Only then show the code to the buyer.
- *Confirm* looks the card up in the bar's `giftsPaid` records (amount and code from there), and refuses if `giftsRedeemed[gid]` is set **or** the code is already in any `credits`.
- Better still: keep a staff-only `bar/_giftcards` index (or a `giftcards` collection, editors only) keyed by code, with `{ amount, paidAt, redeemedBy, redeemedAt }`. That is also the record HMRC and your accountant will want for gift card liabilities.

### S6. Customer-set prices — High
**Where:** `placeOrder()` (line 3599) stores `lines[].price`, `subtotal`, `discount`, `total`, `due` from the customer; the queue shows `money(o.total)` and "take £due".
**How:** set `price: 0.01` on every line; the barista sees "£0.04" and charges that.
**Fix:** the Barista view recomputes prices from `config/current` by `line.id` and shows that total. If it differs from the customer's figure by more than 1p, show a warning ("Price changed: £x on menu, £y in order") instead of the customer's number. Money taken is then recorded by the bar (S3).

### S7. Gaming bonus rules — Medium
**Where:** `stats()` uses customer-written `createdAt` (Regular, Birthday, monthly cap), `lines` (Explorer, Passport), `birthMonth` ("set once" is only a UI rule, line 3709) and `secret.visited` (honour system, line 3673).
**How:** change `birthMonth` to the current month every month; back-date `createdAt` so each month gets its 200 cap; add origins to old orders; check in to all 10 spots once 9 orders are collected.
**Fix:**
- Use the bar's collection time and line snapshot (S3) for every rule, not the customer's.
- Store birth month in the bar record the first time it is set (`bar/{uid}.birthMonth`, written by the barista's app when it sees a customer value and none in the bar). After that, ignore the customer field. Or accept it as is and note in the T&Cs that bonuses can be withdrawn; the monthly cap already limits the damage to 200 points (about £2.20 at the 0.011 value per point).
- Secret St James's: accept it as an honour system (worth 400 points once) or require the barista to stamp it. Location checks in a PWA are easy to fake, so we do not recommend relying on them.

### S8. No limits on what customers write — Medium
**How:** a script writes thousands of orders or claims, or a 1 MB note. The queue and "Codes to confirm" fill with noise; the Barista view slows down; storage fills.
**Fix:** in the Barista view, ignore orders whose `createdAt` is more than 1 day in the past or in the future, cap orders shown per customer (for example 5 active), cap claims per customer (for example 5 pending), and truncate text fields on read (`name` 40, `note` 140, `comment` 200). If the hosted db supports document size limits or rate limits, use them. "Pause orders" already gives staff a kill switch.

### S9. Weak gift codes, unlimited guesses — Low
**Where:** `giftCode()` (line 3209) and `newCode()` use `Math.random()`.
**Risk:** codes have 25⁸ ≈ 1.5 × 10¹¹ values, and a barista confirms each claim, so guessing is slow. But `Math.random()` is not designed for secrets and the bar is shown "adds £x from Name" for any valid code.
**Fix:** generate codes with `crypto.getRandomValues` in the barista's app at activation (S5). Show the barista the intended recipient's name from the gift and ask them to check it. Cap pending claims per customer (S8).

### S10. Member code is derived from the user ID — Low
**Where:** `memberCode = 'BIJA-' + last 5 characters of uid` (line 2709). In-store spend uses the first customer whose code matches (line 3745).
**Risk:** two members can share a code (points go to the wrong person); and the code shown on screen reveals part of the account ID.
**Fix:** have the barista's app assign a random member code on first in-store use and store it in a staff-only index `bar/_members` (`code → uid`). Refuse to add points if a code matches more than one member.

### S11. Buyer's user ID in the recipient's record — Low (privacy)
**Where:** `credits[code] = { amount, gid, buyer, at }` is written to the **recipient's** `bar/{uid}` (line 3736), which the recipient can read.
**Fix:** store only `{ amount, at }` in the recipient's record. Keep `gid` and `buyer` in the staff-only gift card index (S5). (Data minimisation, UK GDPR Article 5(1)(c).)

### S12. No Content Security Policy — Low
**Fix:** add a CSP meta tag that blocks inline event handlers and other origins, for example:
`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'sha256-…'; connect-src 'self'; base-uri 'none'; form-action 'none'">`
The app's scripts are inline, so they need hashes (or moving into a file). Test on the hosted version first, because the host may inject its own scripts. Even a CSP that only sets `script-src` without `'unsafe-inline'` would have stopped S1's `onerror=` payload.

## Not issues (checked)

- **Escaping:** names, notes, comments, gift messages, codes and menu fields all go through `esc()`. The gaps are the numeric fields in S1.
- **Admin switch:** `S.admin` only hides the Barista tab; the hosted access rules are what stop a customer reading or writing `bar`, `customers/*` and `finance`. Keep it that way: never add a staff check that only lives in the app.
- **Demo mode:** with no hosted db the app uses localStorage and makes everyone an admin. That is fine because the data never leaves the browser, but make sure the hosted version can never fall back to demo mode silently (it currently does so only when `window.claude` is missing).
- **CSV export:** cells starting with `= + - @` are prefixed with `'` (line 3644), which stops spreadsheet formula injection. Good.
- **Finance:** written only from the owner's Barista view to `finance/*`; customers have no route to it other than S1.

## UK GDPR notes found during the review

- There is no in-app way to **delete** an account or **download** your data. You must respond to such requests within one month (UK GDPR Articles 15, 17, 20). A manual process is fine for now: add "email us to delete your data" to the privacy notice and a staff checklist (delete `customers/{uid}`; keep `bar/{uid}` money records only as long as needed for accounts, then anonymise).
- **Retention:** HMRC expects business records to be kept for 6 years from the end of the financial year (VAT records at least 6 years). Keep finance and gift card ledgers for 6 years; personal details (names, ratings, birth month) do not need to be kept that long. Confirm retention periods with your accountant and reflect them in `privacy.html`.

## Suggested order of work for the Mobile team

1. S1 (one-line escapes plus number coercion) — ship straight away.
2. S2, S3, S4 together: add the bar snapshot at *Collected* and make `stats()` read money and points only from `bar/{uid}`. A migration step: for orders already collected, the barista's app writes a snapshot the first time it renders them (using the menu price at that time).
3. S5 and S9: gift card ledger on the staff side.
4. S6, S7, S8, S10, S11, S12.

After the fixes, retest by opening the browser console as a customer and trying each "How" above against the hosted version. Each should change nothing that the bar or owner sees.
