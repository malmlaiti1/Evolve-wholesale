import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({ ids: z.array(z.string().uuid()).max(50) });

// Returns current availability + price for each cart item so the cart page can
// flag sold-out or re-priced items. Uses the anon client (safe columns only).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (parsed.data.ids.length === 0) return NextResponse.json({ items: [] });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("devices_public")
    .select("id, brand, model, price, status")
    .in("id", parsed.data.ids);

  if (error) {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  const map = new Map((data ?? []).map((d) => [d.id, d]));
  const items = parsed.data.ids.map((id) => {
    const d = map.get(id);
    return {
      id,
      available: !!d && d.status === "available",
      price: d?.price ?? null,
      brand: d?.brand ?? null,
      model: d?.model ?? null,
    };
  });
  return NextResponse.json({ items });
}
