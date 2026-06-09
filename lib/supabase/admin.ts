import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * SERVICE-ROLE client — BYPASSES ROW LEVEL SECURITY. Server-only.
 *
 * ⚠️ NEVER import this from a Client Component or anything reachable from
 * `"use client"`. Only call it inside admin server actions / route handlers
 * AFTER verifying the caller is staff, and for the `create_order` RPC.
 * (An ESLint `no-restricted-imports` fence enforces this.)
 */
export function createAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
