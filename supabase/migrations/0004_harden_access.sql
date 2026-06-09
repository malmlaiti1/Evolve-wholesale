-- 0004_harden_access.sql — resolve security advisor findings
-- (a) Replace the SECURITY DEFINER view with the linter-approved pattern:
--     column-level grants + an RLS policy + a SECURITY INVOKER view.
--     Customers still never see imei / cost / blacklist_status / internal timestamps.

drop view if exists devices_public;
create view devices_public with (security_invoker = true) as
select id, brand, model, storage, color, carrier, grade, battery_health,
       price, stock, is_local, condition_notes, status, created_at, updated_at
from devices
where is_local = true and archived_at is null;

-- Client roles may read ONLY the safe columns (never imei/cost/blacklist_status/imei_checked_at/archived_at).
revoke select on devices from anon, authenticated;
grant select (id, brand, model, storage, color, carrier, grade, battery_health,
              price, stock, is_local, condition_notes, status, created_at, updated_at)
  on devices to anon, authenticated;

-- RLS policy: anon/authenticated see only local, non-archived devices.
drop policy if exists devices_public_read on devices;
create policy devices_public_read on devices
  for select to anon, authenticated
  using (is_local = true and archived_at is null);

grant select on devices_public to anon, authenticated;

-- (b) Pin search_path on trigger functions (clears function_search_path_mutable).
create or replace function set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function check_order_status_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;
  end if;
  if not (
    (old.status = 'pending'    and new.status in ('approved','denied')) or
    (old.status = 'approved'   and new.status = 'on_the_way') or
    (old.status = 'on_the_way' and new.status = 'delivered')
  ) then
    raise exception 'Illegal order status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- (c) These functions are only ever fired by triggers / the service-role API — not via the
-- public REST RPC surface. Revoke direct EXECUTE from public/anon/authenticated.
-- rls_auto_enable() is a PRE-EXISTING project event trigger (auto-enables RLS on new tables);
-- kept as-is, only its direct EXECUTE grant is tightened.
revoke all on function set_updated_at() from public, anon, authenticated;
revoke all on function check_order_status_transition() from public, anon, authenticated;
revoke all on function rls_auto_enable() from public, anon, authenticated;
