-- 0010_rl_hit_lockdown.sql
-- Supabase default privileges grant EXECUTE on new functions to anon/authenticated.
-- rl_hit must be callable ONLY by the service-role (server), never by the public
-- PostgREST roles — otherwise an attacker could call it to inflate a victim's
-- rate-limit bucket and lock them out. Revoking from PUBLIC isn't enough; the
-- anon/authenticated grants are explicit, so revoke them by name.
revoke all on function rl_hit(text, int, int) from anon, authenticated, public;
grant execute on function rl_hit(text, int, int) to service_role;
