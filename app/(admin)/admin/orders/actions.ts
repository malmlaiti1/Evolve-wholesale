"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/clerk/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { ORDER_TRANSITIONS } from "@/lib/constants";
import { sendOrderStatusEmail } from "@/lib/email/resend";
import type { Enums } from "@/lib/supabase/types";

type Result = { ok: true; emailSent: boolean } | { ok: false; error: string };

export async function setOrderStatus(
  id: string,
  next: Enums<"order_status">,
  denialReason?: string,
): Promise<Result> {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) throw new Error("Not authorized");

  const supabase = createAdminSupabase();
  const { data: current } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!current) return { ok: false, error: "Order not found." };

  const allowed = ORDER_TRANSITIONS[current.status as Enums<"order_status">] ?? [];
  if (!allowed.includes(next)) {
    return { ok: false, error: `Can't move an order from ${current.status} to ${next}.` };
  }
  if (next === "denied" && !denialReason?.trim()) {
    return { ok: false, error: "A reason is required to deny an order." };
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      status: next,
      ...(next === "denied" ? { denial_reason: denialReason!.trim() } : {}),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !updated) return { ok: false, error: "Could not update the order." };

  // Email is best-effort: the status change has already committed.
  const { sent } = await sendOrderStatusEmail({
    order_number: updated.order_number,
    customer_name: updated.customer_name,
    customer_email: updated.customer_email,
    status: next,
    total: Number(updated.total),
    denial_reason: updated.denial_reason,
  });
  await supabase
    .from("orders")
    .update({ email_sent_at: sent ? new Date().toISOString() : null })
    .eq("id", id);

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, emailSent: sent };
}
