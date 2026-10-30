-- Migration name: bija_maheera_access (optional)
-- Lets owners (owners table + MFA) open the Maheera tab as well as staff with a live PIN session.
-- The "maheera" Edge Function calls this with the caller's own token. Until it is applied, the function falls back to
-- public.staff_touch(), so staff with an unlocked staff session get in and owners need the PIN like everyone else.
-- Only CREATE FUNCTION for a new name: nothing existing is replaced or dropped.
create function public.maheera_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_staff() or private.is_owner()
$$;
revoke execute on function public.maheera_access() from public, anon;
grant execute on function public.maheera_access() to authenticated;
