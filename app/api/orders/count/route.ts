import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/clerk/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Enums } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return NextResponse.json({ count: 0 }, { status: 403 });

  const raw = new URL(req.url).searchParams.get("status") ?? "pending";
  const status = (ORDER_STATUSES as readonly string[]).includes(raw)
    ? (raw as Enums<"order_status">)
    : "pending";

  const supabase = createAdminSupabase();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  return NextResponse.json({ count: count ?? 0 });
}
