import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Liveness + Supabase connectivity probe.
export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase
      .from("devices_public")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ status: "ok", db: "ok" });
  } catch {
    return NextResponse.json({ status: "error", db: "error" }, { status: 503 });
  }
}
