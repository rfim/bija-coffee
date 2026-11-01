-- Migration name: kenduri_outbox (applied to Bija's live Supabase 2026-10-30, version 20261030204648)
-- Source: rfim/maheera adapters/00_outbox.sql. Recorded here from the live database; safe to re-run.
-- The Kenduri outbox: events from the Bija adapter (kenduri-bija-adapter.sql) are queued here, signed and posted to
-- kenduri-relay by kenduri.deliver() on a pg_cron schedule. Nobody but the database owner can reach the kenduri schema.
-- Needs Vault entries kenduri_signing_secret and kenduri_customer_salt, and one kenduri.settings row (values not recorded).
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create schema if not exists kenduri;
revoke all on schema kenduri from public, anon, authenticated;

create table if not exists kenduri.settings (
  id boolean primary key default true check (id),
  restaurant_id uuid not null,
  ingest_url text not null check (ingest_url ~ '^https://'),
  enabled boolean not null default true
);

create table if not exists kenduri.outbox (
  seq bigint generated always as identity primary key,
  event_id uuid not null unique default gen_random_uuid(),
  type text not null,
  occurred_at timestamptz not null default now(),
  payload jsonb not null,
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  request_id bigint,
  sent_at timestamptz,
  delivered_at timestamptz,
  last_status int,
  last_error text
);
create index if not exists outbox_pending_idx on kenduri.outbox (next_attempt_at) where delivered_at is null;

-- a member is sent to Maheera only as a keyed hash of their uid, never the uid itself
create or replace function kenduri.customer_ref(p_uid uuid)
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select case when p_uid is null then null else
    left(encode(extensions.hmac(p_uid::text,
      (select decrypted_secret from vault.decrypted_secrets where name = 'kenduri_customer_salt'), 'sha256'), 'hex'), 32)
  end
$$;

create or replace function kenduri.emit(p_type text, p_payload jsonb, p_at timestamptz default now())
returns void
language sql
security definer
set search_path to ''
as $$
  insert into kenduri.outbox (type, payload, occurred_at)
  select p_type, jsonb_strip_nulls(p_payload), coalesce(p_at, now())
  where exists (select 1 from kenduri.settings where enabled)
$$;

create or replace function kenduri.deliver(p_limit int default 50)
returns int
language plpgsql
security definer
set search_path to ''
as $$
declare
  cfg kenduri.settings; o kenduri.outbox; r record; v_secret text; v_env text; v_ts bigint; n int := 0;
begin
  select * into cfg from kenduri.settings where enabled;
  if not found then return 0; end if;

  for r in
    select ob.seq, ob.sent_at, resp.status_code, resp.error_msg, resp.id is not null as answered
    from kenduri.outbox ob
    left join net._http_response resp on resp.id = ob.request_id
    where ob.request_id is not null and ob.delivered_at is null
  loop
    if r.answered and r.status_code between 200 and 299 then
      update kenduri.outbox set delivered_at = now(), last_status = r.status_code, request_id = null where seq = r.seq;
    elsif r.answered or r.sent_at < now() - interval '2 minutes' then
      update kenduri.outbox
        set request_id = null, attempts = attempts + 1, last_status = r.status_code, last_error = left(r.error_msg, 300),
            next_attempt_at = now() + least(interval '1 hour', interval '30 seconds' * power(2, attempts))
        where seq = r.seq;
    end if;
  end loop;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'kenduri_signing_secret';
  for o in
    select * from kenduri.outbox
    where delivered_at is null and request_id is null and next_attempt_at <= now()
    order by seq limit p_limit
  loop
    v_env := jsonb_build_object('contract', 'maheera/v1', 'event_id', o.event_id, 'type', o.type,
                                'occurred_at', o.occurred_at, 'seq', o.seq, 'payload', o.payload)::text;
    v_ts := extract(epoch from now())::bigint;
    update kenduri.outbox set sent_at = now(), request_id = net.http_post(
      url := cfg.ingest_url,
      body := jsonb_build_object('envelope', v_env),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Kenduri-Restaurant', cfg.restaurant_id,
        'X-Kenduri-Timestamp', v_ts::text,
        'X-Kenduri-Signature', 'v1=' || encode(extensions.hmac(v_ts::text || '.' || v_env, v_secret, 'sha256'), 'hex')),
      timeout_milliseconds := 10000)
    where seq = o.seq;
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function kenduri.replay(p_from_seq bigint)
returns int
language sql
security definer
set search_path to ''
as $$
  with u as (
    update kenduri.outbox set delivered_at = null, request_id = null, next_attempt_at = now()
    where seq >= p_from_seq returning 1
  ) select count(*)::int from u
$$;

create or replace function kenduri.prune()
returns void
language sql
security definer
set search_path to ''
as $$
  delete from kenduri.outbox where delivered_at < now() - interval '30 days'
$$;

-- cron.schedule with an existing job name updates that job, so re-running is safe.
-- kenduri-deliver runs every 15 minutes on purpose: each delivery wakes Maheera's Neon compute (free tier).
select cron.schedule('kenduri-deliver', '*/15 * * * *', 'select kenduri.deliver()');
select cron.schedule('kenduri-prune', '17 3 * * *', 'select kenduri.prune()');
