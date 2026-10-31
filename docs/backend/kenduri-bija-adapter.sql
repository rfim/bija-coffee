-- Migration name: kenduri_bija_adapter (applied to Bija's live Supabase 2026-10-30, version 20261030204713)
-- Source: rfim/maheera adapters/bija.sql. Recorded here from the live database; safe to re-run.
-- Sends Bija's orders, in-store till sales and menu changes to the Kenduri outbox (kenduri-outbox.sql).
-- Triggers only, and fail-safe: a Kenduri error logs a warning and NEVER blocks an order, till sale or menu change.
-- Keep the "exception when others ... return" in every trigger function.
-- The one-off menu backfill that ran with the migration (select kenduri.bija_menu_snapshot()) is left out.
create or replace function kenduri.bija_lines(p_lines jsonb)
returns jsonb
language sql
immutable
set search_path to ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'item_id', l ->> 'id',
    'name', l ->> 'name',
    'category', l ->> 'cat',
    'qty', (l ->> 'qty')::int,
    'unit_price', (l ->> 'unit')::numeric,
    'modifiers', jsonb_strip_nulls(jsonb_build_object(
      'milk', l ->> 'milk', 'temp', l ->> 'temp', 'sweet', l ->> 'sweet', 'origin', l ->> 'origin'))
  ) order by n), '[]')
  from jsonb_array_elements(p_lines) with ordinality as t(l, n)
$$;

create or replace function kenduri.bija_orders_changed()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if tg_op = 'INSERT' then
    perform kenduri.emit('order.placed', jsonb_build_object(
      'source_ref', new.id, 'channel', 'online', 'slot', new.slot,
      'lines', kenduri.bija_lines(new.lines), 'total', new.total,
      'customer_ref', kenduri.customer_ref(new.uid)), new.created_at);
    return new;
  end if;

  if new.status = 'collected' and old.status <> 'collected' then
    perform kenduri.emit('sale.completed', jsonb_build_object(
      'source_ref', new.id || ':' || new.collect_seq,
      'order_ref', new.id,
      'channel', 'online',
      'lines', kenduri.bija_lines(new.lines),
      'subtotal', new.subtotal,
      'discount', new.reward_discount + new.stamp_discount,
      'total', new.total,
      'tenders', jsonb_build_object('gift_card', new.gift_paid, 'other', new.total - new.gift_paid),
      'customer_ref', kenduri.customer_ref(new.uid)), coalesce(new.collected_at, now()));
  elsif old.status = 'collected' and new.status <> 'collected' then
    perform kenduri.emit('sale.reversed', jsonb_build_object(
      'source_ref', old.id || ':' || old.collect_seq, 'reason', 'undo_collect'));
  elsif new.status = 'cancelled' and old.status <> 'cancelled' then
    perform kenduri.emit('order.cancelled', jsonb_build_object('source_ref', new.id, 'channel', 'online'));
  end if;
  return new;
exception when others then
  raise warning 'kenduri: % event not recorded for order %: %', tg_op, new.id, sqlerrm;
  return new;
end $$;

drop trigger if exists kenduri_orders_insert on public.orders;
create trigger kenduri_orders_insert after insert on public.orders
  for each row execute function kenduri.bija_orders_changed();
drop trigger if exists kenduri_orders_status on public.orders;
create trigger kenduri_orders_status after update of status on public.orders
  for each row when (old.status is distinct from new.status) execute function kenduri.bija_orders_changed();

create or replace function kenduri.bija_instore_added()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  perform kenduri.emit('sale.summary', jsonb_build_object(
    'source_ref', 'instore:' || new.till_ref,
    'channel', 'instore',
    'total', new.amount,
    'attributes', jsonb_build_object('drinks', new.drinks),
    'customer_ref', kenduri.customer_ref(new.uid)), new.created_at);
  return new;
exception when others then
  raise warning 'kenduri: in-store sale % not recorded: %', new.till_ref, sqlerrm;
  return new;
end $$;

drop trigger if exists kenduri_instore_insert on public.instore_sales;
create trigger kenduri_instore_insert after insert on public.instore_sales
  for each row execute function kenduri.bija_instore_added();

create or replace function kenduri.bija_menu_snapshot()
returns void
language sql
security definer
set search_path to ''
as $$
  select kenduri.emit('menu.snapshot', jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object(
      'item_id', id, 'name', name, 'category', category, 'price', price, 'available', available,
      'is_drink', coalesce(is_drink, false), 'attributes', jsonb_strip_nulls(jsonb_build_object('origin', origin)))
      order by id)
    from public.menu_items), '[]')))
$$;

create or replace function kenduri.bija_menu_changed()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  perform kenduri.bija_menu_snapshot();
  return null;
exception when others then
  raise warning 'kenduri: menu event not recorded: %', sqlerrm;
  return null;
end $$;

drop trigger if exists kenduri_menu_changed on public.menu_items;
create trigger kenduri_menu_changed after insert or update or delete on public.menu_items
  for each statement execute function kenduri.bija_menu_changed();

-- daily totals per channel for yesterday (London), so Maheera can check nothing was missed
create or replace function kenduri.reconcile(p_day date default (now() at time zone 'Europe/London')::date - 1)
returns void
language sql
security definer
set search_path to ''
as $$
  select kenduri.emit('reconcile.daily', jsonb_build_object(
    'day', p_day,
    'channels', jsonb_build_object(
      'online', (select jsonb_build_object('count', count(*), 'total', coalesce(sum(total), 0)) from public.orders
                 where status = 'collected' and (collected_at at time zone 'Europe/London')::date = p_day),
      'instore', (select jsonb_build_object('count', count(*), 'total', coalesce(sum(amount), 0)) from public.instore_sales
                  where (created_at at time zone 'Europe/London')::date = p_day))))
$$;

select cron.schedule('kenduri-reconcile', '41 2 * * *', 'select kenduri.reconcile()');
