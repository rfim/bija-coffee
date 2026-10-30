-- Migration name: kenduri_config (applied to Bija's live Supabase 2026-10-30, version 20261030204842)
-- Source: rfim/maheera adapters/01_config.sql. Recorded here from the live database; safe to re-run.
-- Maheera settings for this project's Edge Functions (kenduri-relay, maheera), read from Vault so they don't need
-- dashboard secrets. Only the service role can call it; anon and signed-in users cannot. Vault values are not recorded.
create or replace function public.kenduri_config(p_name text)
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = p_name
    and p_name in ('maheera_relay_database_url', 'maheera_auth_url', 'maheera_data_api_url',
                   'maheera_service_email', 'maheera_service_password')
$$;
revoke all on function public.kenduri_config(text) from public, anon, authenticated;
grant execute on function public.kenduri_config(text) to service_role;
