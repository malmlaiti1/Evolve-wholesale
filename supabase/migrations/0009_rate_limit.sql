-- 0009_rate_limit.sql — DB-backed fixed-window rate limiter.
-- Used as the fallback when Upstash isn't configured (lib/rate-limit.ts), so
-- throttling works with no external service. Only service_role can call rl_hit
-- (mirrors create_order); the table is RLS-locked and never touched directly.

create table if not exists rate_limit_counters (
  bucket       text primary key,
  window_start timestamptz not null default now(),
  count        int         not null default 0
);

alter table rate_limit_counters enable row level security;
revoke all on table rate_limit_counters from anon, authenticated;

-- Atomically bump the counter for `bucket`; reset the window if it has expired.
-- Returns true while the request is within `p_limit` for the current window.
create or replace function rl_hit(p_bucket text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into rate_limit_counters as r (bucket, window_start, count)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update
    set window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
            then now() else r.window_start end,
        count = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
            then 1 else r.count + 1 end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function rl_hit(text, int, int) from public;
grant execute on function rl_hit(text, int, int) to service_role;
