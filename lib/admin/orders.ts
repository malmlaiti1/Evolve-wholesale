import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { Tables, Enums } from "@/lib/supabase/types";

export type AdminOrder = Tables<"orders">;
export type AdminOrderItem = Tables<"order_items">;
export type OrderWithItems = AdminOrder & { items: AdminOrderItem[] };

const STATUSES = ["pending", "approved", "on_the_way", "delivered", "denied"] as const;

export async function getOrders(statusFilter?: string): Promise<OrderWithItems[]> {
  const supabase = createAdminSupabase();
  let q = supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });
  if (statusFilter && (STATUSES as readonly string[]).includes(statusFilter)) {
    q = q.eq("status", statusFilter as Enums<"order_status">);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as OrderWithItems[];
}

export async function getOrderCounts() {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase.from("orders").select("status");
  if (error) throw error;
  const counts: Record<string, number> = {
    all: 0,
    pending: 0,
    approved: 0,
    on_the_way: 0,
    delivered: 0,
    denied: 0,
  };
  for (const r of data ?? []) {
    counts.all++;
    counts[(r as { status: string }).status]++;
  }
  return counts;
}
