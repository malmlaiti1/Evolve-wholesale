import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  lines: z
    .array(
      z.object({
        modelId: z.string().uuid(),
        grade: z.enum(["A+", "A", "B+", "B", "C"]),
      }),
    )
    .max(50),
});

// Returns current availability + grade price (highest available) for each
// (category, grade) line so the cart can flag sold-out / re-priced lines.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { lines } = parsed.data;
  if (lines.length === 0) return NextResponse.json({ items: [] });

  const modelIds = [...new Set(lines.map((l) => l.modelId))];
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("devices_public")
    .select("model_id, grade, price, status")
    .in("model_id", modelIds)
    .eq("status", "available");

  if (error) {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  // Aggregate available count + max price per (model_id, grade).
  const agg = new Map<string, { available: number; price: number }>();
  for (const r of data ?? []) {
    if (!r.model_id || !r.grade) continue;
    const key = `${r.model_id}:${r.grade}`;
    const price = Number(r.price);
    const cur = agg.get(key);
    if (!cur) agg.set(key, { available: 1, price });
    else {
      cur.available++;
      cur.price = Math.max(cur.price, price);
    }
  }

  const items = lines.map((l) => {
    const hit = agg.get(`${l.modelId}:${l.grade}`);
    return {
      modelId: l.modelId,
      grade: l.grade,
      available: hit?.available ?? 0,
      price: hit?.price ?? null,
    };
  });
  return NextResponse.json({ items });
}
