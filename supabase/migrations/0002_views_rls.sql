-- 0002_views_rls.sql — public-safe view + row level security
-- Customer storefront is PUBLIC (anon role). Admin writes via the service-role API.
-- There is no Supabase-authenticated end user in this app.

-- Column-safe public projection: NO imei, cost, blacklist_status, imei_checked_at, archived_at.
-- Pre-filtered to local, non-archived stock. Runs as owner (security definer) so it can read
-- devices even though anon's direct access to the table is revoked below.
create view devices_public as
select
  id, brand, model, storage, color, carrier, grade, battery_health,
  price, stock, is_local, condition_notes, status, created_at, updated_at
from devices
where is_local = true and archived_at is null;

-- Lock down direct table access for client roles; expose ONLY the safe view.
revoke all on devices     from anon, authenticated;
revoke all on orders      from anon, authenticated;
revoke all on order_items from anon, authenticated;
grant select on devices_public to anon, authenticated;

-- Enable RLS (default-deny). service_role bypasses RLS; anon/authenticated get NO policies,
-- so all direct table access is denied. Catalog reads go through devices_public;
-- orders/order_items are reachable only via the service-role API + create_order RPC.
alter table devices     enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Sequence usage for server-side order creation.
grant usage, select on sequence order_number_seq to service_role;
