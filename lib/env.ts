import "server-only";
import { z } from "zod";

/**
 * Server-side environment validation. Imported by server code only.
 * Supabase is REQUIRED. All third-party integrations are OPTIONAL so the
 * public storefront builds and runs before those keys are provisioned —
 * features degrade gracefully (see `features`).
 */
const schema = z.object({
  // Required — Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Optional — Clerk (admin auth)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),

  // Optional — built-in password login (used when Clerk isn't configured).
  // ADMIN_PASSWORD_HASH is a scrypt hash ("saltHex:derivedHex"), never plaintext.
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().min(16).optional(),

  // Optional — Resend (email)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // Optional — IMEI checking (imei.org client API; DHRU-style REST gateway)
  IMEI_API_KEY: z.string().optional(),
  IMEI_API_URL: z.string().url().optional(),

  // Optional — Upstash (rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Optional — misc
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  throw new Error("Invalid environment variables — see logs above.");
}

export const env = parsed.data;

/** Which optional integrations are configured (drives graceful degradation). */
export const features = {
  clerk: Boolean(env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
  password: Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET),
  resend: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
  imei: Boolean(env.IMEI_API_KEY),
  upstash: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  sentry: Boolean(env.SENTRY_DSN),
} as const;

export const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
