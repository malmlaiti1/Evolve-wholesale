import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validators/checkout";

export const dynamic = "force-dynamic";

type GradeRef = { model_id: string; grade: string };
type RpcResult =
  | { status: "ok"; order: { order_number: string; total: number }; duplicate?: boolean }
  | { status: "price_changed"; items: (GradeRef & { current_price: number; expected_price: number })[] }
  | { status: "unavailable"; items: (GradeRef & { reason: string; available: number })[] }
  | { status: "empty" };

// Customer checkout. All order writes go through here (service-role) → create_order RPC,
// which recomputes totals from the DB, locks rows, and prevents double-buy / price tampering.
export async function POST(req: Request) {
  const { ok } = await rateLimit("orders", clientIp(req)).catch(() => ({ ok: false }));
  if (!ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a few minutes." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details and try again.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { customer, items, idempotencyKey } = parsed.data;
  const supabase = createAdminSupabase();
  const { data, error } = await supabase.rpc("create_order", {
    p_items: items.map((i) => ({
      model_id: i.modelId,
      grade: i.grade,
      quantity: i.quantity,
      expected_price: i.price,
    })),
    p_customer: customer,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    console.error("create_order failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't place your order. Please try again." },
      { status: 500 },
    );
  }

  const result = data as unknown as RpcResult;

  switch (result.status) {
    case "ok":
      return NextResponse.json({
        status: "ok",
        order: { order_number: result.order.order_number, total: result.order.total },
      });
    case "price_changed":
      return NextResponse.json({ status: "price_changed", items: result.items }, { status: 409 });
    case "unavailable":
      return NextResponse.json({ status: "unavailable", items: result.items }, { status: 409 });
    default:
      return NextResponse.json({ error: "Your order is empty." }, { status: 400 });
  }
}
