import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Browser ANON client — RLS-enforced, safe columns only. For Client
 * Components that need to read the catalog directly.
 */
export function createBrowserSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
