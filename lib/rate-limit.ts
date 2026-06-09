import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env, features } from "@/lib/env";

// Rate limiting is OPTIONAL. With no Upstash config, limiters are null and calls
// are allowed (the feature simply isn't enabled yet). Once configured, limits enforce.
const redis = features.upstash
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

type Window = `${number} ${"s" | "m" | "h"}`;

function make(tokens: number, window: Window) {
  return redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        prefix: "evolve-rl",
      })
    : null;
}

const limiters = {
  orders: make(5, "10 m"),
  lookup: make(10, "1 m"),
  imei: make(30, "1 m"),
};

export async function rateLimit(
  kind: keyof typeof limiters,
  identifier: string,
): Promise<{ ok: boolean; configured: boolean }> {
  const limiter = limiters[kind];
  if (!limiter) return { ok: true, configured: false };
  const { success } = await limiter.limit(identifier);
  return { ok: success, configured: true };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
