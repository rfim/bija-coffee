-- Migration name: bija_staff_views
-- Staff-only read views for the live Members tab, Insights and Finance. Only CREATE FUNCTION for new names:
-- nothing existing is replaced or dropped. Each function needs a live staff session (private.require_staff()),
-- runs as definer with an empty search_path, and only reads the ledgers, orders and in-store sales.

-- Members tab: one row per member, every figure from the ledgers.
create function public.staff_members(p_limit int default 500)
returns table (uid uuid, member_code text, joined_at timestamptz, lifetime_points int, points int, stamps int,
               gift_balance numeric, visits int, last_visit timestamptz, birth_month smallint)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
begin
  perform private.require_staff();
  return query
  select m.uid, m.member_code, m.created_at,
    coalesce((select sum(p.delta) from public.points_ledger p
              where p.uid = m.uid and p.kind <> 'reward' and not (p.kind = 'reversal' and p.ref like 'undo:reward:%')), 0)::int,
    private.points_of(m.uid), private.stamps_of(m.uid), private.gift_of(m.uid),
    ((select count(*) from public.orders o where o.uid = m.uid and o.status = 'collected')
      + (select count(*) from public.instore_sales s where s.uid = m.uid))::int,
    greatest((select max(o.collected_at) from public.orders o where o.uid = m.uid and o.status = 'collected'),
             (select max(s.created_at) from public.instore_sales s where s.uid = m.uid)),
    m.birth_month
  from public.members m
  order by 9 desc nulls last, m.created_at desc
  limit least(greatest(coalesce(p_limit, 500), 1), 2000);
end $$;

-- Insights: collected orders over the last p_days (London time): orders per hour, best sellers, repeat rate.
create function public.staff_insights(p_days int default 28)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d int := least(greatest(coalesce(p_days, 28), 1), 366);
  since timestamptz := now() - make_interval(days => d);
  r jsonb;
begin
  perform private.require_staff();
  with col as (select * from public.orders where status = 'collected' and collected_at >= since),
       visits as (select uid, collected_at as at from col union all select uid, created_at from public.instore_sales where created_at >= since),
       per as (select uid, count(*) n from visits group by uid)
  select jsonb_build_object(
    'days', d,
    'orders', (select count(*) from col),
    'revenue', (select coalesce(sum(total), 0) from col),
    'avg_order', (select coalesce(round(avg(total), 2), 0) from col),
    'by_hour', (select coalesce(jsonb_object_agg(h, n), '{}'::jsonb) from
                 (select extract(hour from collected_at at time zone 'Europe/London')::int h, count(*) n from col group by 1) x),
    'best_sellers', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'qty', qty, 'sales', sales) order by qty desc, name), '[]'::jsonb) from
                 (select l ->> 'id' id, max(l ->> 'name') name, sum((l ->> 'qty')::int) qty, sum((l ->> 'qty')::int * (l ->> 'unit')::numeric) sales
                    from col, jsonb_array_elements(col.lines) l group by 1 order by 3 desc limit 10) b),
    'members_active', (select count(*) from per),
    'repeat_members', (select count(*) from per where n >= 2),
    'repeat_rate', (select case when count(*) = 0 then 0 else round(count(*) filter (where n >= 2)::numeric / count(*), 3) end from per),
    'instore', (select jsonb_build_object('count', count(*), 'amount', coalesce(sum(amount), 0)) from public.instore_sales where created_at >= since)
  ) into r;
  return r;
end $$;

-- Finance: sales per London day from the server (app orders collected, gift balance used, in-store spend recorded).
create function public.staff_sales_daily(p_from date, p_to date)
returns table (day date, app_orders int, app_sales numeric, gift_paid numeric, discounts numeric, instore_count int, instore_amount numeric)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
begin
  perform private.require_staff();
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 400 then raise exception 'date range must be 1 to 400 days'; end if;
  return query
  with days as (select g::date dd from generate_series(p_from, p_to, interval '1 day') g),
       o as (select (collected_at at time zone 'Europe/London')::date dd, count(*) n, sum(total) s, sum(gift_paid) g, sum(reward_discount + stamp_discount) disc
               from public.orders where status = 'collected' and (collected_at at time zone 'Europe/London')::date between p_from and p_to group by 1),
       i as (select (created_at at time zone 'Europe/London')::date dd, count(*) n, sum(amount) s
               from public.instore_sales where (created_at at time zone 'Europe/London')::date between p_from and p_to group by 1)
  select days.dd, coalesce(o.n, 0)::int, coalesce(o.s, 0), coalesce(o.g, 0), coalesce(o.disc, 0), coalesce(i.n, 0)::int, coalesce(i.s, 0)
  from days left join o using (dd) left join i using (dd) order by 1;
end $$;

revoke all on function public.staff_members(int), public.staff_insights(int), public.staff_sales_daily(date, date) from public, anon;
grant execute on function public.staff_members(int), public.staff_insights(int), public.staff_sales_daily(date, date) to authenticated;
