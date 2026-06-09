-- 0005_fix_public_view.sql
-- The SECURITY INVOKER view runs with the caller's (anon) column privileges, so
-- every column it references — including those in WHERE — must be granted to anon.
-- `archived_at` is intentionally NOT granted, so move that filter out of the view
-- and let the RLS policy (which already enforces `is_local AND archived_at IS NULL`)
-- handle archival exclusion. RLS policy expressions are evaluated by the system and
-- do not require the caller to hold column privileges.
create or replace view devices_public with (security_invoker = true) as
select id, brand, model, storage, color, carrier, grade, battery_health,
       price, stock, is_local, condition_notes, status, created_at, updated_at
from devices
where is_local = true;
