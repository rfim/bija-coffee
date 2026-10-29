# Security status: app.html attacker suite

Automated exploit attempts for findings S1–S12 in [docs/fullstack/security-review.md](../fullstack/security-review.md), run by `tests/security.js` against app.html in demo mode. A finding **passes** when the attack changes nothing that matters: points, lifetime points, gift balance and passport stamps stay the same, the barista sees the menu price, no injected script runs and the Insights page still renders.

**Last run:** 2026-10-29 20:30 UTC · commit `2439136` · **0 of 12 pass**

| # | Finding | Result | What the attack achieved |
|---|---|---|---|
| S1 | Stored XSS in the Barista view (qty, reward.pts, chart values, huge stars) | ❌ Fail | script ran in the staff view (window.__pwned = "S1-qty")<br>Insights page does not render (page error: Invalid string length) |
| S2 | Gift balance created (negative giftPay) or refunded (cancel a paid order) | ❌ Fail | gift 5.5 → 110<br>points 473 → 278<br>lifetime 873 → 678 |
| S3 | Points and passport stamps from a customer-edited total and lines | ❌ Fail | points 473 → 1000985<br>lifetime 873 → 1001385<br>cardPoints 473 → 1000985<br>stamps 1 → 5 |
| S4 | Reward points refunded (cancel a collected reward order) or negative reward.pts | ❌ Fail | points 473 → 5723<br>cardPoints 473 → 5723 |
| S5 | Gift card amount and code changed after the bar took payment | ❌ Fail | gift balance rose by £400 from one paid £5 card |
| S6 | Customer-set prices shown to the barista as the amount to take | ❌ Fail | queue does not show the menu total £7.80 (shows: £0.02) |
| S7 | Bonus rules gamed with customer-written birth month, dates and lines | ❌ Fail | points 473 → 523<br>lifetime 873 → 923<br>cardPoints 473 → 523 |
| S8 | No limits on what a customer writes (order flood, 1 MB note, claim flood) | ❌ Fail | 300 active orders from one customer shown in the queue (cap expected, e.g. 5)<br>an order card renders 1,000,085 characters (note not truncated)<br>60 codes to confirm from one customer (cap expected, e.g. 5) |
| S9 | Gift codes from Math.random(); codes chosen by the customer | ❌ Fail | two activated cards share the code BIJA-AAAA-AAAA<br>the code is the one the customer chose, not one the bar generated |
| S10 | Member code derived from the user ID (collisions, leaks part of the ID) | ❌ Fail | two members share the code BIJA-ABCDE<br>code BIJA-ABCDE is the last 5 characters of the account ID |
| S11 | Buyer's user ID stored in the recipient's own bar record | ❌ Fail | bar/you (readable by the recipient) contains the buyer's user ID "buyer9q7x"<br>bar/you contains the gift ID g11 |
| S12 | No Content Security Policy (inline event handlers run) | ❌ Fail | no Content-Security-Policy header or meta tag<br>an injected inline onerror handler ran |

### Measurements
- **S1**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1
- **S2**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 278, lifetime 678, gift 110, cardPoints 278, stamps 0
- **S3**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 1000985, lifetime 1001385, gift 5.5, cardPoints 1000985, stamps 5
- **S4**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 5723, lifetime 723, gift 5.5, cardPoints 5723, stamps 1
- **S5**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 473, lifetime 873, gift 405.5, cardPoints 473, stamps 1 · activated code BIJA-AAAA-0005
- **S6**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1
- **S7**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 523, lifetime 923, gift 5.5, cardPoints 523, stamps 1
- **S8**: before: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · after attack: points 473, lifetime 873, gift 5.5, cardPoints 473, stamps 1 · 300 queue cards, 60 claims, longest card 1000085 chars, 8.1 s
- **S9**: codes: Quinn BIJA-AAAA-AAAA, Robin BIJA-AAAA-AAAA
- **S10**: codes: Alex BIJA-ABCDE, Billie BIJA-ABCDE
- **S11**: bar/you: {"orders":{},"credits":{"BIJA-CCCC-0011":{"amount":10,"gid":"g11","buyer":"buyer9q7x","at":"2026-10-29T20:30:55.512Z"}}}
- **S12**: no CSP

How to run: `node tests/security.js --md docs/audit/security-status.md` with the site served on port 8099 (usage in the header of `tests/security.js`). Findings in `KNOWN_OPEN` at the top of `tests/security.js` are reported but don't fail CI; remove each one as soon as it passes.

## Run history

| Run | Commit | Pass | Still failing |
|---|---|---|---|
| 2026-10-29 20:30 UTC | 2439136 | – | S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 |
