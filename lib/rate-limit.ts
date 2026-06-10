import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env, features } from "@/lib/env";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Rate limiting with two backends:
//  1. Upstash (preferred, distributed) when UPSTASH_* is configured.
//  2. DB-backed fixed-window fallback (rl_hit RPC) otherwise — so throttling
//     works with no external service. Both fail CLOSED on error.
const redis = features.upstash
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

type Window = `${number} ${"s" | "m" | "h"}`;

// Single source of truth per limiter kind: the Upstash window string plus the
// equivalent (limit, seconds) used by the DB fallback.
const LIMITS = {
  orders: { tokens: 5, window: "10 m" as Window, seconds: 600 },
  lookup: { tokens: 10, window: "1 m" as Window, seconds: 60 },
  imei: { tokens: 30, window: "1 m" as Window, seconds: 60 },
  login: { tokens: 5, window: "5 m" as Window, seconds: 300 },
} as const;

type Kind = keyof typeof LIMITS;

function make(kind: Kind) {
  return redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS[kind].tokens, LIMITS[kind].window),
        prefix: "evolve-rl",
      })
    : null;
}

const limiters: Record<Kind, Ratelimit | null> = {
  orders: make("orders"),
  lookup: make("lookup"),
  imei: make("imei"),
  login: make("login"),
};

// DB-backed fallback. Fails CLOSED (ok:false) on any error so an attacker can't
// disable throttling by knocking over the limiter.
async function dbRateLimit(kind: Kind, identifier: string): Promise<boolean> {
  const cfg = LIMITS[kind];
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.rpc("rl_hit", {
      p_bucket: `${kind}:${identifier}`,
      p_limit: cfg.tokens,
      p_window_seconds: cfg.seconds,
    });
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

export async function rateLimit(
  kind: Kind,
  identifier: string,
): Promise<{ ok: boolean; configured: boolean }> {
  const limiter = limiters[kind];
  if (limiter) {
    const { success } = await limiter.limit(identifier);
    return { ok: success, configured: true };
  }
  // No Upstash → DB-backed fallback (now always enforced).
  const ok = await dbRateLimit(kind, identifier);
  return { ok, configured: true };
}

export function clientIp(req: Request): string {
  return ipFromHeaders(req.headers);
}

/** Extract the client IP from a Headers object (Request or next/headers). */
export function ipFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
