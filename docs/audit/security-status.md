# Security status: app.html attacker suite

Automated exploit attempts for findings S1–S12 in [docs/fullstack/security-review.md](../fullstack/security-review.md), run by `tests/security.js` against app.html in demo mode. A finding **passes** when the attack changes nothing that matters: points, lifetime points, gift balance and passport stamps stay the same, the barista sees the menu price, no injected script runs and the Insights page still renders.

**Last run:** 2026-10-29 23:01 UTC · commit `093d75b` · **12 of 12 pass**

| # | Finding | Result | What the attack achieved |
|---|---|---|---|
| S1 | Stored XSS in the Barista view (qty, reward.pts, chart values, huge stars) | ✅ Pass | – |
| S2 | Gift balance created (negative giftPay) or refunded (cancel a paid order) | ✅ Pass | – |
| S3 | Points and passport stamps from a customer-edited total and lines | ✅ Pass | – |
| S4 | Reward points refunded (cancel a collected reward order) or negative reward.pts | ✅ Pass | – |
| S5 | Gift card amount and code changed after the bar took payment | ✅ Pass | – |
| S6 | Customer-set prices shown to the barista as the amount to take | ✅ Pass | – |
| S7 | Bonus rules gamed with customer-written birth month, dates and lines | ✅ Pass | – |
| S8 | No limits on what a customer writes (order flood, 1 MB note, claim flood) | ✅ Pass | – |
| S9 | Gift codes from Math.random(); codes chosen by the customer | ✅ Pass | – |
| S10 | Member code derived from the user ID (collisions, leaks part of the ID) | ✅ Pass | – |
| S11 | Buyer's user ID stored in the recipient's own bar record | ✅ Pass | – |
| S12 | No Content Security Policy (inline event handlers run) | ✅ Pass | – |

### Measurements
- **S1**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5
- **S2**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5
- **S3**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5
- **S4**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5
- **S5**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 10.5, cardPoints 913, stamps 1, wallet 10.5 · activated code BIJA-FDYK-GWKY
- **S6**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5
- **S7**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5
- **S8**: before: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · after attack: points 913, lifetime 913, gift 5.5, cardPoints 913, stamps 1, wallet 5.5 · 5 queue cards, 5 claims, longest card 82 chars, 9.0 s
- **S9**: codes: Quinn BIJA-9DCE-G7DK, Robin BIJA-NFE6-D7DE
- **S10**: codes: Alex BIJA-FGVTF, Billie BIJA-GATJW
- **S11**: bar/you: {"orders":{},"memberCode":"BIJA-NQWPD","credits":{"BIJA-3HJ4-VNER":{"amount":10,"at":"2026-10-29T23:01:01.678Z"}}}
- **S12**: meta CSP: base-uri 'none'; object-src 'none' + script-src 'self'; object-src 'none'; base-uri 'none'

How to run: `node tests/security.js --md docs/audit/security-status.md` with the site served on port 8099 (usage in the header of `tests/security.js`). Findings in `KNOWN_OPEN` at the top of `tests/security.js` are reported but don't fail CI; remove each one as soon as it passes.

## Run history

| Run | Commit | Pass | Still failing |
|---|---|---|---|
| 2026-10-29 23:01 UTC | 093d75b | S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 | – |
| 2026-10-29 21:07 UTC | 8d7cd7d | S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 | – |
| 2026-10-29 20:30 UTC | 2439136 | – | S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 |
