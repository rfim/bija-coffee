# Bija ledger API (Supabase phase 2)

Project `bija` (ref `nvsampchuozqbtavuugx`, London). Design follows `docs/fullstack/supabase-review.md` and fixes findings S2–S7 and S10 from `docs/fullstack/security-review.md` on the server.

**The rule:** money, points and stamps live in append-only ledgers. They change only through the functions below, which work out every amount on the server. No client role can insert, update or delete any of these tables, and a balance is always the sum of its ledger.

## Status

| Part | State |
|---|---|
| Tables, RLS, grants, realtime (migration `bija_ledgers_tables`) | **Applied** |
| Helpers, menu sync trigger, server bonuses (migration `bija_ledgers_helpers`) | **Applied**; `menu_items` seeded with 22 items from `config/current` |
| Public RPCs (migration `bija_ledgers_rpcs`) | **Applied** 29 Oct 2026 (16 functions, signed-in users only) |
| Test script (`scratchpad/backend2/04_tests.sql`) | **44 of 44 pass** (29 Oct 2026). The RPCs were created inside a rolled-back transaction, tested and rolled back, so nothing was applied. Re-run after applying. |
| Client wrappers (`site/bija-supabase.js`: `BijaSupabase.rpc.*`, `balances`, `myOrders`, `ledger`) | Done and unit-tested. Not wired into `app.html` yet. |

## Tables

| Table | What it holds | Who can read |
|---|---|---|
| `menu_items` | Server price list. Kept in step with `config/current` by a trigger; only staff can write config. | signed-in users |
| `rewards` | `cake` 350, `beans` 1,200 | signed-in users |
| `members` | uid, random `member_code` (`BIJA-XXXXX`, not derived from the uid), `birth_month` (set once) | own row; staff all |
| `orders` | Server-priced lines, subtotal, discounts, total, status, `collect_seq`, `gift_paid` | own; staff all |
| `points_ledger` | `order`, `instore`, `bonus`, `referral`, `reward`, `correction`, `reversal`; `unique (kind, ref)` | own; staff all |
| `stamps_ledger` | `order`, `instore`, `free` (−9), `correction`, `reversal`; `unique (kind, ref)` | own; staff all |
| `gift_cards` | Amount, recipient name and message, `code_hash` (sha256), last 4 characters, paid and redeemed | nobody directly (RPCs only) |
| `gift_ledger` | `redeem`, `spend`, `refund`, `correction`, `reversal`; `unique (kind, ref)` | own; staff all |
| `instore_sales` | Till spend by member code; `till_ref` is unique (idempotent) | own; staff all |
| `checkins` | Secret St James's spots found | own; staff all |
| `audit_log` | Every staff and owner action, with actor uid and staff session id | nobody directly |
| `owners` | Owner accounts (email login plus MFA) | nobody directly |

## Functions

Every function is `SECURITY DEFINER` with `search_path = ''`. Execute is revoked from `public` and `anon` and granted to `authenticated`; each function then checks who is calling.

### Customer

| RPC | Parameters | Returns | Notes |
|---|---|---|---|
| `my_member()` | – | `{uid, member_code}` | Creates the member row on first call. |
| `balances(p_uid?)` | optional uid (staff only for others) | `{points, lifetime_points, tier, stamps, free_drink_ready, gift_balance, member_code}` | Tier comes from lifetime points: Seed, Sprout 1,500, Kopi Tree 5,000. |
| `place_order(p_lines, p_slot, p_note, p_reward, p_use_stamp, p_use_gift)` | `p_lines`: `[{id, qty, milk?, temp?, sweet?}]` | `{id, code, subtotal, reward_discount, stamp_discount, total, lines}` | **Prices come from `menu_items`**, and any client price is ignored. Rules: qty 1–20; max 20 lines and 5 active orders; refused while ordering is paused. The reward applies to the dearest matching item. The free drink is the dearest drink, up to £5.50, and needs 9 stamps. |
| `cancel_order(p_order)` | uuid | `{ok}` | Own order, only while it is `received`. |
| `request_gift(p_amount, p_to, p_message)` | £5–£200 | `{id, amount}` | Unpaid until staff activate it. Max 5 unpaid per buyer. |
| `redeem_gift(p_code)` | `BIJA-XXXX-XXXX` | `{amount, balance}` | One conditional UPDATE, so a card can never be redeemed twice. The same error is returned for unknown, unpaid and used codes. Limit 10 failed attempts an hour. |
| `my_gifts()` | – | rows without the code hash | |
| `set_birth_month(p_month)` | 1–12 | `{ok}` | Once only. |
| `check_in_spot(p_spot)` | spot id | `{found}` | Only spots already dealt (1 + collected orders). +400 once when all 10 are found. |

### Staff (live PIN session, logged in `audit_log`)

| RPC | Parameters | Returns | Notes |
|---|---|---|---|
| `set_order_status(p_order, p_status)` | `received`, `brewing`, `ready` | `{ok}` | |
| `collect_order(p_order)` | uuid | `{points, stamps, gift_paid, take}` | Locks the order and member rows, re-checks the reward, stamps and gift balance, and posts each once (`ref = order:seq`). `take` is what to charge at the till. Server bonuses are awarded afterwards. |
| `undo_collect(p_order, p_reason)` | reason required | `{ok}` | Posts `reversal` rows (history kept) and puts the order back to `ready`. Bonuses already earned stay. |
| `add_instore(p_member_code, p_amount, p_drinks, p_till_ref, p_double)` | £0.01–£500, 0–20 drinks | `{points, stamps}` or `{duplicate:true}` | 10 points per £1. `p_double` is the early-bird offer, applied by staff. Stamps = drinks. |
| `activate_gift(p_gift, p_amount_taken)` | money actually taken, £5–£200 | `{code, amount}` | Generates the code on the server (`gen_random_bytes`) and stores only its sha256. **The code is returned once**: show it to the buyer, or write it into the buyer's own `customers/{uid}` doc for display. |
| `staff_gift_cards()` | – | list without hashes | |

### Owner only

| RPC | Notes |
|---|---|
| `adjust(p_uid, p_ledger, p_delta, p_reason)` | `points`, `stamps` or `gift` correction row with a reason, written to `audit_log`. Needs the caller listed in `owners` **and** signed in with MFA (`aal2`), so it can't be used until the owner sets that up. |

### Server bonuses (`private.award_bonuses`, run inside `collect_order`)

Every bonus uses server timestamps (London time) and a fixed ref, so it posts only once:

| Bonus | Points | Condition | Ref |
|---|---|---|---|
| Welcome | 100 | First collected order | `welcome:<uid>` |
| Origins Passport | 600 | Every origin on the menu collected | `passport:<uid>` |
| Regular | 150 | 3 collected orders in a week | `regular:<uid>:<ISO week>` |
| Explorer | 150 | 5 different drinks in a month | `explorer:<uid>:<YYYY-MM>` |
| Birthday | 200 | An order in your birth month | `birthday:<uid>:<YYYY>` |

Regular, Explorer and Birthday share a 200-points-a-month cap. Secret St James's (400) is awarded by `check_in_spot`.

## Client wrappers (`site/bija-supabase.js`)

`BijaSupabase.rpc.{member, balances, placeOrder, cancelOrder, requestGift, redeemGift, myGifts, setBirthMonth, checkInSpot, setOrderStatus, collectOrder, undoCollect, addInstore, activateGift, staffGiftCards, adjust}`, plus `BijaSupabase.myOrders(limit)` and `BijaSupabase.ledger('points_ledger' | 'stamps_ledger' | 'gift_ledger', limit)`.

Each wrapper returns `{ ok: true, data }` or `{ ok: false, reason: 'not_allowed' | 'error', message }`. `placeOrder` never sends a price.

## Wiring plan for `app.html` (later sprint, Supabase mode only; demo mode keeps the local logic)

| App code today | Calls |
|---|---|
| `placeOrder()` (customer checkout) | `rpc.placeOrder({lines, slot, note, reward, useStamp, useGift})`, then show the returned `code` and `total` |
| Cancel button on a received order | `rpc.cancelOrder(id)` |
| `stats()`: points, stamps, gift wallet, tier, history | `rpc.balances()` + `ledger('points_ledger')`, `ledger('stamps_ledger')`, `ledger('gift_ledger')`. Keep the challenge progress text, but numbers come from here. |
| `ordersOf()` / My orders / live tracker | `myOrders()` + a realtime subscription on `orders` |
| Barista queue: status buttons | `rpc.setOrderStatus(id, 'brewing' / 'ready')` |
| Barista: *Collected* | `rpc.collectOrder(id)`, then show `take` as the amount to charge |
| Barista: Undo | `rpc.undoCollect(id, reason)` |
| Members tab: add in-store spend | `rpc.addInstore({memberCode, amount, drinks, tillRef, double})` |
| Gift cards: buy | `rpc.requestGift(...)` |
| Gift cards: *Paid · activate* (staff) | `rpc.activateGift(id, amountTaken)`, then show the code once |
| Gift cards: claim a code | `rpc.redeemGift(code)` (no barista step needed; keep a staff confirm only if the owner wants it) |
| Birthday month | `rpc.setBirthMonth(m)` |
| Secret St James's check-in | `rpc.checkInSpot(spot)` |
| Finance: gift and points liabilities | sums of `gift_ledger` and `points_ledger` (staff can read all) |
| Member code shown on the Bija Card | `rpc.member()` → `member_code` |

Menu prices are still edited in the barista Menu tab (`config/current`); the trigger copies them into `menu_items`.

## Next steps for the owner to decide

- **Device tokens:** today a staff action records the device's anonymous user id and its staff session id. The review recommends a `shop_device` sign-in per tablet, a token per PIN unlock tied to that device, and named staff PINs, so every action shows *which person* did it.
- **Owner MFA:** set up an email login with MFA for the owner, then add that uid to `owners`. Until then `adjust()` is unusable by design.
- **Migration:** existing demo or live balances can be replayed into the ledgers as `correction` rows (`ref = 'migration:<id>'`) for the owner to review before go-live.
- **Gift code confirm step:** automatic redemption, or keep a barista confirm?

## Staff read views (migration `bija_staff_views`, applied 29 Oct 2026)

Source: `docs/backend/staff-views.sql`. All three need a live staff session, run as definer with an empty search_path,
only read, and are refused to customers and signed-out users (tested in a rolled-back transaction).

| RPC | Returns | Used by |
|---|---|---|
| `staff_members(p_limit default 500)` | per member: `member_code, joined_at, lifetime_points, points, stamps, gift_balance, visits, last_visit, birth_month` | Members tab (live) |
| `staff_insights(p_days default 28)` | `{orders, revenue, avg_order, by_hour (London), best_sellers [{id,name,qty,sales}], members_active, repeat_members, repeat_rate, instore {count, amount}}` | Insights tab (live) |
| `staff_sales_daily(p_from, p_to)` | per London day: `app_orders, app_sales, gift_paid, discounts, instore_count, instore_amount` (max 400 days) | Finance: the close wizard's "app orders collected" check |

Client: `BijaSupabase.rpc.staffMembers(limit)`, `staffInsights(days)`, `staffSalesDaily(from, to)`.

**Finance in live mode.** App orders are paid at the bar, and in-store spend recorded on a Bija Card is part of the till's
card and cash totals, so neither is added to sales again: the till's end-of-day report stays the source of truth for
takings. Live mode uses `staff_sales_daily` only for the close wizard's cross-check ("N app orders collected (£X), already in
the card and cash totals"). Online beans orders are still added to the close as before.

**Moving existing balances:** see `docs/backend/migrate-demo-to-ledgers.md`.
