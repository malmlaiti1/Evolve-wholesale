import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { lookupSchema } from "@/lib/validators/checkout";

export const dynamic = "force-dynamic";

// Public order lookup: order number + matching email → status. Rate-limited.
// Returns `found: false` for both wrong-order and wrong-email (no enumeration).
export async function POST(req: Request) {
  const { ok } = await rateLimit("lookup", clientIp(req)).catch(() => ({ ok: false }));
  if (!ok) {
    return NextResponse.json({ error: "Too many lookups. Please wait a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter an order number and email." }, { status: 400 });
  }

  const supabase = createAdminSupabase();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at, total, customer_name, customer_email, denial_reason")
    .eq("order_number", parsed.data.orderNumber.toUpperCase())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
  if (!order || order.customer_email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return NextResponse.json({ found: false });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("device_brand, device_model, unit_price")
    .eq("order_id", order.id);

  return NextResponse.json({
    found: true,
    order: {
      order_number: order.order_number,
      status: order.status,
      created_at: order.created_at,
      total: order.total,
      customer_name: order.customer_name,
      denial_reason: order.denial_reason,
    },
    items: items ?? [],
  });
}
