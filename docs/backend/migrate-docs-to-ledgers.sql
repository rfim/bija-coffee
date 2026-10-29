-- Bija: replay phase 1 data (docs table: bar/{uid} records written by staff) into the phase 2 ledgers.
-- Owner-run, in the Supabase SQL editor, once, before go-live. Nothing is created permanently: the helper is a
-- pg_temp function that disappears when the session ends, so it adds nothing to the public API.
--
--   1. Run this whole file, then:   select * from pg_temp.bija_migration(false);   -- DRY RUN: report only, writes nothing
--   2. Check the report with the owner (a "note" explains anything left out).
--   3. Apply:                       select * from pg_temp.bija_migration(true);    -- writes 'correction' rows
--
-- Only bar/{uid} is used: it is written by staff, so it is the trusted record (customers/{uid} is customer-written and is
-- never trusted for money, points or stamps). Each member gets at most one 'correction' row per ledger, with
-- ref 'migration:<uid>', so running the apply step twice changes nothing (unique (kind, ref)).
-- Bonuses (welcome, passport, regular, explorer, birthday, Secret St James's) are NOT replayed as rules; the welcome
-- bonus is added when the member has at least one collected order, everything else is listed in the note for review.

create or replace function pg_temp.bija_migration(p_apply boolean default false)
returns table (uid uuid, member_code text, points int, stamps int, gift numeric, collected int, instore int, note text)
language plpgsql as $$
#variable_conflict use_column
declare r record; v_pts int; v_st int; v_gift numeric(10,2); v_col int; v_ins int; v_code text; v_note text;
begin
  for r in
    select d.path, substring(d.path from 5)::uuid as u, d.data
    from public.docs d
    where d.path ~ '^bar/[0-9a-f-]{36}$'
      and exists (select 1 from auth.users au where au.id = substring(d.path from 5)::uuid)
  loop
    -- points: collected app orders (the bar's snapshot), in-store spend, beans orders and Club deliveries the bar sent,
    -- confirmed referrals; minus rewards the bar recorded as redeemed
    select coalesce(sum(case when o.value ->> 'status' = 'collected' then coalesce((o.value ->> 'pts')::int, round(coalesce((o.value ->> 'total')::numeric, 0) * 10)::int) else 0 end), 0)
         - coalesce(sum(case when o.value ->> 'status' = 'collected' then coalesce((o.value -> 'redeemed' ->> 'pts')::int, 0) else 0 end), 0),
           count(*) filter (where o.value ->> 'status' = 'collected')
      into v_pts, v_col from jsonb_each(coalesce(r.data -> 'orders', '{}'::jsonb)) o;
    select v_pts + coalesce(sum(round(coalesce((i.value ->> 'amount')::numeric, 0) * 10) * case when (i.value ->> 'double')::boolean then 2 else 1 end), 0)::int, count(*)
      into v_pts, v_ins from jsonb_each(coalesce(r.data -> 'instore', '{}'::jsonb)) i;
    select v_pts + coalesce(sum(round(coalesce((s.value ->> 'amount')::numeric, 0) * 10)), 0)::int into v_pts from jsonb_each(coalesce(r.data -> 'subs', '{}'::jsonb)) s;
    select v_pts + coalesce(sum(case when s.value ->> 'status' in ('dispatched', 'collected') then round(coalesce((s.value ->> 'subtotal')::numeric, 0) * 10) else 0 end), 0)::int
      into v_pts from jsonb_each(coalesce(r.data -> 'shop', '{}'::jsonb)) s;
    v_pts := v_pts + case when r.data -> 'referral' ->> 'at' is not null and coalesce((r.data -> 'referral' ->> 'rejected')::boolean, false) = false then 300 else 0 end
                   + 300 * (select count(*) from jsonb_each(coalesce(r.data -> 'refCredits', '{}'::jsonb)))::int
                   + case when v_col > 0 then 100 else 0 end; -- welcome bonus
    -- stamps: drinks on collected orders (a free drink doesn't stamp itself) and in-store drinks; 9 per free drink used
    select coalesce(sum(case when o.value ->> 'status' = 'collected' then greatest(0, coalesce((o.value ->> 'drinks')::int, 0) - case when (o.value ->> 'stampFree')::boolean then 1 else 0 end) else 0 end), 0)
         - 9 * count(*) filter (where o.value ->> 'status' = 'collected' and (o.value ->> 'stampFree')::boolean)
      into v_st from jsonb_each(coalesce(r.data -> 'orders', '{}'::jsonb)) o;
    select v_st + coalesce(sum(least(20, greatest(0, coalesce((i.value ->> 'drinks')::int, 0)))), 0)::int into v_st from jsonb_each(coalesce(r.data -> 'instore', '{}'::jsonb)) i;
    -- gift balance: cards the bar credited minus what the bar took on collected orders
    select coalesce(sum(greatest(0, coalesce((c.value ->> 'amount')::numeric, 0))), 0) into v_gift from jsonb_each(coalesce(r.data -> 'credits', '{}'::jsonb)) c;
    select v_gift - coalesce(sum(case when o.value ->> 'status' = 'collected' then greatest(0, coalesce((o.value ->> 'giftPaid')::numeric, 0)) else 0 end), 0)
      into v_gift from jsonb_each(coalesce(r.data -> 'orders', '{}'::jsonb)) o;
    v_note := concat_ws('; ',
      case when v_pts < 0 then 'points below zero: set to 0, check rewards' end,
      case when v_st < 0 then 'stamps below zero: set to 0' end,
      case when v_gift < 0 then 'gift balance below zero: set to 0, check gift spends' end,
      case when exists (select 1 from jsonb_each(coalesce(r.data -> 'orders', '{}'::jsonb)) o where o.value ->> 'status' = 'collected' and o.value ->> 'total' is null)
           then 'some collected orders have no bar snapshot: points estimated as 0 for those' end,
      'challenge, passport, birthday and Secret bonuses are not replayed: add by hand if owed');
    v_pts := greatest(0, v_pts); v_st := greatest(0, v_st); v_gift := greatest(0, round(v_gift, 2));
    v_code := null;
    if p_apply then
      v_code := private.ensure_member(r.u);
      if v_pts > 0 then insert into public.points_ledger (uid, delta, kind, ref) values (r.u, v_pts, 'correction', 'migration:' || r.u) on conflict (kind, ref) do nothing; end if;
      if v_st > 0 then insert into public.stamps_ledger (uid, delta, kind, ref) values (r.u, v_st, 'correction', 'migration:' || r.u) on conflict (kind, ref) do nothing; end if;
      if v_gift > 0 then insert into public.gift_ledger (uid, delta, kind, ref) values (r.u, v_gift, 'correction', 'migration:' || r.u) on conflict (kind, ref) do nothing; end if;
      insert into public.audit_log (actor, action, ref, detail) values (null, 'migration', 'migration:' || r.u,
        jsonb_build_object('points', v_pts, 'stamps', v_st, 'gift', v_gift, 'source', r.path));
    else
      select m.member_code into v_code from public.members m where m.uid = r.u;
    end if;
    uid := r.u; member_code := v_code; points := v_pts; stamps := v_st; gift := v_gift; collected := v_col; instore := v_ins; note := v_note;
    return next;
  end loop;
end $$;
