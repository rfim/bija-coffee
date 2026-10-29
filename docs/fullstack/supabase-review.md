# Supabase plan review: making points and gift balances tamper-proof

For: backend and security teams · Written: 29 Oct 2026 · Owner: Full stack & Finance team
Builds on: `security-review.md` (findings S1–S12). The plan reviewed is the one described to us. We have not seen its SQL yet; no Supabase files were on any branch when this was written. Please check this review against the real schema before relying on it.
The SQL below was loaded into plain PostgreSQL 16 with stand-ins for Supabase's `auth.uid()` and the staff-token helper. It creates without errors, and a smoke test of `collect_order` posted the reward, gift and points rows once, then rejected a second collect. It is a design sketch, not a finished migration.

## The plan as we understand it

- One generic `docs` table holds every document (`customers/{uid}`, `bar/{uid}`, `config/current`, `finance/*`). Columns are something like `path text primary key, data jsonb, owner uuid`.
- Row Level Security (RLS) policies copy today's access rules:
  - config: anyone can read, editors write;
  - customers: each customer writes their own, editors read;
  - bar: readable by its own customer, written by editors;
  - finance: editors only.
- A server-side staff PIN function unlocks the Barista view.

## The short answer

RLS on its own will **not** make points and gift balances tamper-proof, for two reasons.

1. **RLS decides which rows you can touch. It can't decide which fields inside a row you can change.**
   - Today's attacks (S2–S7) are all a customer editing their own `customers/{uid}` row, which RLS correctly allows. For example: a negative `giftPay`, a raised `total`, `cancelled: true` after collection, or a changed gift `amount`.
   - RLS `WITH CHECK` sees only the new row, never the old one. So a policy can't say "you may add an order but not change one that has been collected".
2. **Moving money logic into the bar row doesn't help unless the bar row is written by trusted code.**
   - The security team's fix (bar snapshots at *Collected*, `stats()` reading money only from `bar/{uid}`) is right.
   - But the snapshot is still written by the Barista *browser*. It is only as trustworthy as that browser and its PIN session.
   - It also does nothing to stop two tablets confirming the same gift code at the same moment.

**Recommendation:** keep `docs` for low-risk, display data: menu, ratings, check-ins and the customer's order *requests*. Put **money and points in their own tables**, change them **only through `SECURITY DEFINER` functions (RPCs)**, and make those tables **append-only**.

The browser then asks the database to "collect order X" or "redeem gift code Y". The database works out the amounts, checks who is asking, applies the change in one transaction and records who did it. No client can set an amount or a balance directly.

## 1. Data model: ledgers, not documents

```sql
-- Reference data, editor-maintained (menu prices and reward costs the server trusts)
create table menu_items (id text primary key, name text not null, price numeric(8,2) not null check (price >= 0), category text not null, available boolean not null default true);
create table rewards    (id text primary key, name text not null, points int not null check (points > 0), category_match text);

-- Members: random member code, not derived from the user id (S10)
create table members (
  uid uuid primary key references auth.users on delete restrict,
  member_code text unique not null default ('BIJA-' || upper(encode(extensions.gen_random_bytes(4), 'hex'))),
  birth_month smallint check (birth_month between 1 and 12),   -- set once, by RPC (S7)
  created_at timestamptz not null default now()
);

-- Orders: the customer requests, the server prices; status is staff-only
create table orders (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null references members,
  lines jsonb not null,                       -- [{item_id, qty, opts}] as requested
  total numeric(8,2) not null check (total >= 0),   -- computed by place_order() from menu_items
  reward_id text references rewards,
  gift_requested numeric(8,2) not null default 0 check (gift_requested >= 0),
  status text not null default 'received' check (status in ('received','brewing','ready','collected','cancelled')),
  created_at timestamptz not null default now(),
  collected_at timestamptz,
  collected_by uuid                            -- staff id, set by collect_order()
);

-- Points ledger: append-only, one row per earn / spend / bonus / correction
create table points_ledger (
  id bigint generated always as identity primary key,
  uid uuid not null references members,
  delta int not null check (delta <> 0),
  kind text not null check (kind in ('order','instore','bonus','reward','refund','correction')),
  ref text not null,                           -- order id, till payment id, bonus key...
  staff_id uuid,                               -- who did it (null for system bonuses)
  created_at timestamptz not null default now(),
  unique (kind, ref)                           -- idempotency: the same sale or bonus can't post twice
);

-- Gift cards: one row per card; the code is stored hashed (it is a bearer secret)
create table gift_cards (
  id uuid primary key default gen_random_uuid(),
  buyer_uid uuid references members,
  amount numeric(8,2) not null check (amount between 5 and 200),   -- set at activation from money taken
  code_hash bytea unique,                      -- sha256 of the code; code shown once to the buyer
  code_last4 text,
  to_name text, message text,                  -- display only
  paid_at timestamptz, paid_by uuid,
  redeemed_by uuid references members, redeemed_at timestamptz,
  check ((redeemed_at is null) = (redeemed_by is null))
);

-- Gift balance ledger: credits from redeemed cards, debits from orders paid with balance
create table gift_ledger (
  id bigint generated always as identity primary key,
  uid uuid not null references members,
  delta numeric(8,2) not null check (delta <> 0),
  kind text not null check (kind in ('redeem','spend','refund','correction')),
  ref text not null, staff_id uuid,
  created_at timestamptz not null default now(),
  unique (kind, ref)
);

create view balances with (security_invoker = true) as
  select m.uid,
         coalesce((select sum(delta) from points_ledger p where p.uid = m.uid), 0) as points,
         coalesce((select sum(delta) from points_ledger p where p.uid = m.uid and delta > 0), 0) as lifetime_points,
         coalesce((select sum(delta) from gift_ledger g where g.uid = m.uid), 0) as gift_balance
  from members m;
```

Why ledgers:
- **Append-only** means history can't be rewritten, which closes S2 and S4 (refund by cancelling or editing).
- **`unique (kind, ref)`** stops double posting, whether from a double tap, two tablets or a webhook retried by Square.
- **A balance is a sum**, so it is always explainable to a customer or an auditor.
- **Gift card money is a liability** your accountant will want listed, and HMRC record keeping (6 years) applies.

Lock the tables down:

```sql
alter table points_ledger enable row level security;
alter table gift_ledger   enable row level security;
alter table gift_cards    enable row level security;
alter table orders        enable row level security;
alter table members       enable row level security;

revoke insert, update, delete on points_ledger, gift_ledger, gift_cards, members from anon, authenticated;
revoke update, delete on orders from anon, authenticated;   -- all writes go through the RPCs below

-- customers read only their own rows
create policy own_points on points_ledger for select to authenticated using (uid = (select auth.uid()));
create policy own_gift   on gift_ledger   for select to authenticated using (uid = (select auth.uid()));
create policy own_orders on orders        for select to authenticated using (uid = (select auth.uid()));
create policy own_member on members       for select to authenticated using (uid = (select auth.uid()));
-- gift_cards: buyers see their own cards (without code_hash, via a view); staff read through RPCs
```

## 2. The RPCs: the only way money or points change

Every function follows the same template:

```sql
create or replace function public.collect_order(p_order uuid, p_staff_token text)
returns void
language plpgsql
security definer
set search_path = ''                     -- no search_path hijack
as $$
declare
  v_staff uuid := private.staff_from_token(p_staff_token);   -- raises if invalid or expired (section 3)
  v_o public.orders%rowtype;
  v_reward public.rewards%rowtype;
  v_points int;
  v_gift numeric(8,2);
begin
  select * into v_o from public.orders where id = p_order for update;    -- lock: two tablets can't both collect
  if not found or v_o.status not in ('received','brewing','ready') then raise exception 'order not collectable'; end if;

  -- reward: check the balance now, server-side, under a lock on the member
  perform 1 from public.members where uid = v_o.uid for update;
  if v_o.reward_id is not null then
    select * into v_reward from public.rewards where id = v_o.reward_id;
    if (select coalesce(sum(delta),0) from public.points_ledger where uid = v_o.uid) < v_reward.points then
      raise exception 'not enough points';
    end if;
    insert into public.points_ledger(uid, delta, kind, ref, staff_id) values (v_o.uid, -v_reward.points, 'reward', p_order::text, v_staff);
  end if;

  -- gift balance actually used: never more than the balance or the total
  v_gift := least(v_o.gift_requested, v_o.total,
                  (select coalesce(sum(delta),0) from public.gift_ledger where uid = v_o.uid));
  if v_gift > 0 then
    insert into public.gift_ledger(uid, delta, kind, ref, staff_id) values (v_o.uid, -v_gift, 'spend', p_order::text, v_staff);
  end if;

  v_points := round(v_o.total * 10);   -- 10 points per £1 paid (PTS in app.html)
  if v_points > 0 then
    insert into public.points_ledger(uid, delta, kind, ref, staff_id) values (v_o.uid, v_points, 'order', p_order::text, v_staff);
  end if;

  update public.orders set status = 'collected', collected_at = now(), collected_by = v_staff where id = p_order;
  perform private.award_bonuses(v_o.uid, p_order);   -- welcome, explorer, regular, birthday, passport: server-side, capped
end $$;

revoke all on function public.collect_order(uuid, text) from public, anon;
grant execute on function public.collect_order(uuid, text) to authenticated;   -- the staff token is the real check
```

### The full set

| RPC | Called by | Does | Closes |
|---|---|---|---|
| `place_order(lines jsonb, slot text, reward_id text, use_gift boolean)` | customer | Validates qty 1–20 and item ids against `menu_items`; **computes the total from server prices**; caps orders per customer (for example 5 active); rejects when ordering is paused | S6, S8 |
| `cancel_order(order_id)` | customer | Only the owner of the order, and only while `status = 'received'` | S2, S4 |
| `set_order_status(order_id, status, staff_token)` | staff | received → brewing → ready; *ready → collected* goes through `collect_order` | status integrity |
| `collect_order(order_id, staff_token)` | staff | As above: reward debit, gift debit, points credit, bonuses, all in one transaction | S2, S3, S4, S7 |
| `undo_collect(order_id, staff_token, reason)` | staff | Posts **reversing** ledger rows (never deletes), back to `ready`; reason required | audit |
| `add_instore(member_code, amount, staff_token, till_ref)` | staff / Square webhook | Points for till sales; `ref = till_ref` makes Square webhook retries harmless; amount 0.01–500 | S10, POS plan |
| `activate_gift(gift_id, amount_taken, staff_token)` | staff | Sets `amount` from **money taken**; generates the code with `gen_random_bytes`; stores `sha256(code)`; returns the code **once** to show the buyer | S5, S9 |
| `redeem_gift(code text)` | customer | One atomic statement (below); credits `gift_ledger`; limit attempts per user per hour | S5, S9 |
| `set_birth_month(m)` | customer | Only when `birth_month is null` | S7 |
| `check_in_spot(spot_id)` | customer | Only spots dealt to this member (count of collected orders); bonus once | S7 |
| `adjust(uid, ledger, delta, reason, owner_token)` | owner only | Manual corrections, reason required | audit |

**Gift redemption without a race.** The single conditional `UPDATE` is the lock, so two people (or two tablets) can't both redeem the same card:

```sql
update public.gift_cards
   set redeemed_by = auth.uid(), redeemed_at = now()
 where code_hash = extensions.digest(upper(p_code), 'sha256')
   and paid_at is not null
   and redeemed_at is null
returning id, amount into v_id, v_amount;
if not found then raise exception 'code not valid'; end if;     -- same message for unknown, unpaid and used: don't help guessing
insert into public.gift_ledger(uid, delta, kind, ref) values (auth.uid(), v_amount, 'redeem', v_id::text);
```

This also lets a customer redeem a code with **no barista step**: it is safe because the server checks paid and unused. If Bija still wants a human check, keep the confirm step as staff calling the same function on the customer's behalf.

**Bonuses** (welcome, Explorer, Regular, Birthday, Passport, Secret St James's) move into `private.award_bonuses()`:
- It runs inside `collect_order` and uses **server timestamps** (`collected_at`) and the server-priced lines. Back-dating and editing old orders then do nothing.
- Each bonus has a deterministic `ref`, for example `birthday:2026` or `regular:2026-W44`. The unique index makes each one post once.
- The 200-a-month cap is a `sum(delta)` check for the month before inserting.
- The app can keep its `stats()` code for *showing* progress, but the numbers it shows must come from `balances` and the ledgers.

## 3. Staff PIN: from "unlocks a screen" to "signs every action"

A PIN that only reveals the Barista view protects nothing once the RPCs exist. Every staff RPC must prove *which* staff member is acting.

Recommended design. It needs no custom JWT minting, so the project's JWT keys never leave Supabase:

1. **The shop tablet** signs in as an ordinary Supabase Auth user with a `shop_device` role (an `app_metadata.role` set by the owner in the dashboard; customers can't set `app_metadata`).
2. **`staff_unlock(pin)`** (`SECURITY DEFINER`) does the following:
   - Checks that the caller is a `shop_device` user.
   - Compares the PIN with `crypt(pin, pin_hash)` (pgcrypto, `gen_salt('bf', 10)`) over active staff only.
   - On a match, creates a random session token (`encode(gen_random_bytes(32),'base64')`).
   - Stores only `sha256(token)`, with `staff_id`, `device_uid`, and `expires_at = now() + interval '12 hours'`.
   - Returns the token once.
3. **`private.staff_from_token(token)`** checks all of the following and raises if any fail:
   - the hash exists and hasn't expired or been revoked;
   - `device_uid = auth.uid()`, so a token copied to another device is useless;
   - the staff member is still active.
   It returns `staff_id`, which every ledger row records.
4. **Lockout:**
   - Count failed `staff_unlock` attempts per device in a table.
   - After 5 failures in 15 minutes, refuse for 15 minutes and write an alert row the owner sees.
   - A 6-digit PIN can then be guessed only at about 20 tries an hour.
5. **Owner-only actions** (finance, `adjust`, menu prices, staff management) need the **owner's own Supabase login with MFA** (`auth.jwt()->>'aal' = 'aal2'`), not a PIN.
6. **Rotation and leavers:**
   - `staff_disable(staff_id)` revokes all of that person's sessions at once.
   - Rotation is in `docs/ops/runbook.md` section 3.

The PIN alone must never grant anything **directly** from the browser. The browser never sees `pin_hash`, and no RLS policy lets a client read the `staff` table.

## 4. If the generic `docs` table stays (for the low-risk data)

Keep it for: `config/current` (menu text, opening state), ratings, the customer's profile display fields, and Secret St James's visit times *for display*. Harden it:

- **Path ownership in the policy, not in the data.** For example:
  - `with check (split_part(path,'/',1) = 'customers' and split_part(path,'/',2) = (select auth.uid())::text)` for customer writes;
  - a customer can't insert `bar/...`, `finance/...` or another user's path, and can't move a doc by updating its `path` (add a trigger that rejects `NEW.path <> OLD.path`).
- **A `BEFORE UPDATE` trigger for field rules that RLS can't express.** The trigger sees `OLD` and `NEW`:

```sql
create or replace function private.customers_doc_guard() returns trigger language plpgsql as $$
begin
  if split_part(new.path,'/',1) <> 'customers' or private.is_staff() then return new; end if;
  -- birth month: set once
  if old.data ? 'birthMonth' and (new.data->'birthMonth') is distinct from (old.data->'birthMonth') then
    raise exception 'birthMonth can only be set once';
  end if;
  -- size and count limits (S8)
  if pg_column_size(new.data) > 65536 then raise exception 'document too large'; end if;
  if jsonb_typeof(new.data->'claims') = 'object' and (select count(*) from jsonb_object_keys(new.data->'claims')) > 20 then
    raise exception 'too many gift code claims';
  end if;
  return new;
end $$;
create trigger customers_doc_guard before update on public.docs for each row execute function private.customers_doc_guard();
```

- **Nothing in `docs` should ever be summed into a balance.** That is the whole point of section 1. If anything still reads `orders`, `giftPay`, `total` or `reward.pts` from a customer doc to compute money, the triggers above are a speed bump, not a fix.
- **Realtime:** Supabase Realtime `postgres_changes` honours RLS. Check that customers subscribed to `docs` only receive their own rows and the menu (test it, S1-style). Ledgers can be streamed to their own member the same way.

## 5. Checklist for every `SECURITY DEFINER` function

- [ ] `set search_path = ''` and fully qualified names (`public.orders`, `extensions.digest`).
- [ ] `revoke all ... from public, anon`; grant only to `authenticated`, then check the role inside.
- [ ] Identity comes from `auth.uid()` or the staff token, **never from a parameter** (no `p_uid` for "who am I").
- [ ] Amounts come from server tables (`menu_items`, `rewards`, `gift_cards.amount`), never from parameters, except `amount_taken` and `amount` entered by authenticated staff, which are bounded (`0 < x <= 500`).
- [ ] Row locks (`for update`) before checking a balance, then insert in the same transaction.
- [ ] Idempotency: a natural `ref` plus `unique (kind, ref)`.
- [ ] Errors don't leak whether a gift code exists.
- [ ] Put the functions in a schema not exposed by the API (`private`), except the thin public wrappers you mean to expose. Check *Settings → API → Exposed schemas*.
- [ ] Run Supabase's **Security Advisor** (dashboard → Advisors) after every migration: it flags tables without RLS and functions with mutable search paths.

## 6. Tests (pgTAP) that map to the findings

Run with `supabase test db` in CI, next to the browser suite `tests/security.js`:

| Test | Expect |
|---|---|
| As a customer, `insert into points_ledger` / `update gift_ledger` / `delete from orders` | permission denied |
| `place_order` with a line priced 0.01 in the payload | stored total = menu price × qty |
| `place_order` with qty `'<img onerror>'` or 999 | rejected |
| `cancel_order` on a collected order | rejected; ledger unchanged |
| `collect_order` twice (or from two sessions in parallel) | one set of ledger rows (unique index) |
| `collect_order` with reward when balance < cost | rejected |
| `gift_requested = -100` | rejected by the check constraint |
| `redeem_gift` same code by two users in parallel | exactly one credit |
| `redeem_gift` on unpaid / used / wrong code | same error, no credit |
| `set_birth_month` twice | second rejected |
| staff RPC with no token / expired token / token from another device | rejected |
| 6th wrong PIN within 15 min | locked out |
| customer `select` on `finance/*`, other customers' ledgers, `staff` | zero rows |
| owner-only RPC with a staff token, or owner without MFA | rejected |

## 7. Order of work we'd suggest

1. Ledgers, `members`, `gift_cards`, plus RLS read policies and revoked writes.
2. `staff_unlock`, staff sessions and lockout. Then `collect_order`, `add_instore`, `activate_gift`, `redeem_gift`.
3. `place_order` and `cancel_order` with server pricing. The app switches to the RPCs and the `balances` view.
4. Server-side bonuses. Retire money fields from `docs`.
5. pgTAP suite in CI; Security Advisor clean.
6. **Migration of existing data:**
   - Replay today's collected orders, in-store spend and gift credits into the ledgers once, as `kind = 'correction'` rows with `ref = 'migration:<id>'`.
   - The owner reviews the opening balances before go-live.
   - Points or balances that look inflated (see `security-review.md`) get a decision, not an automatic carry-over.

## Needs a decision from Bija

1. Gift card redemption: fully automatic once the server checks it, or keep the barista "Confirm" step?
2. What happens to points and gift balances that look inflated at migration: carry over, cap or review one by one?
3. The owner sets up MFA on their Supabase login and is the only one who can make manual adjustments. Is that acceptable?
