# Moving existing balances into the ledgers

Before go-live, anyone who already has points, stamps or gift balance in the shared backend's old document records
(`bar/{uid}` in the `docs` table, written by staff) needs those balances carried into the new ledgers. This is a one-off,
owner-run job. It never touches data that only lives in one browser (the `?demo=1` mode keeps data on that device and can't be moved).

## What it does

For each member with a `bar/{uid}` record, it works out from the **staff-written** record only:

| Ledger | Counted |
|---|---|
| Points | Collected app orders (the bar's snapshot `pts`, else 10 × total), minus rewards the bar recorded; in-store spend (10 per £1, doubled for early bird); Beans Club deliveries and beans orders the bar sent; confirmed referrals (+300); the welcome bonus (+100) if at least one order was collected |
| Stamps | Drinks on collected orders (a free drink doesn't stamp itself), in-store drinks, minus 9 for each free drink used |
| Gift balance | Gift cards the bar credited, minus gift balance the bar took on collected orders |

It writes **one `correction` row per ledger per member**, with `ref = 'migration:<uid>'`. The ledgers are unique on
`(kind, ref)`, so running it twice changes nothing. Every apply is written to `audit_log`.

The customer's own record (`customers/{uid}`) is never used: customers can edit it, so it can't be trusted for money,
points or stamps. Negative results are set to 0 and flagged.

**Not replayed:** challenge, Origins Passport, birthday and Secret St James's bonuses. The report says so for each
member; add any that are owed by hand with `adjust()` (needs the owner's login with two-factor sign-in).

## How to run it (Supabase dashboard, about 5 minutes)

1. Supabase → project **bija** → SQL Editor → New query.
2. Paste the whole of `docs/backend/migrate-docs-to-ledgers.sql` and run it. This only creates a temporary helper for
   this editor session; nothing is added to the app's API.
3. **Dry run** (writes nothing):
   ```sql
   select * from pg_temp.bija_migration(false);
   ```
   You get one row per member: points, stamps, gift balance, orders collected, in-store visits, and a note.
   Download it as CSV and check it with your records. Anything surprising: stop and ask.
4. **Apply**, in the same editor session:
   ```sql
   select * from pg_temp.bija_migration(true);
   ```
5. Check: the Members tab in the staff view now shows the same figures (it reads the ledgers).

## Tested

On 29 October 2026, inside a rolled-back transaction on the live project, a member with 2 collected orders, 2 in-store
visits (one early bird), a £25 gift card with £5 spent and a confirmed referral came out as 652 points, 5 stamps and
£20.00. The dry run wrote 0 rows, and a second apply added nothing (3 rows in total). Nothing was left behind.
