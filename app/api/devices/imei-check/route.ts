import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/clerk/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isValidImei } from "@/lib/imei";
import { imeiOrgCheck } from "@/lib/imei/clients";

export const dynamic = "force-dynamic";

const schema = z.object({ imei: z.string(), deviceId: z.string().uuid().optional() });

export async function POST(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { ok } = await rateLimit("imei", clientIp(req)).catch(() => ({ ok: true }));
  if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !/^\d{15}$/.test(parsed.data.imei)) {
    return NextResponse.json({ error: "Enter a 15-digit IMEI." }, { status: 400 });
  }
  if (!isValidImei(parsed.data.imei)) {
    return NextResponse.json({ error: "IMEI checksum (Luhn) is invalid." }, { status: 400 });
  }

  const result = await imeiOrgCheck(parsed.data.imei);

  // Cache the blacklist result on the device (avoids repeat paid calls).
  if (parsed.data.deviceId && result.configured && result.status) {
    const supabase = createAdminSupabase();
    await supabase
      .from("devices")
      .update({ blacklist_status: result.status, imei_checked_at: new Date().toISOString() })
      .eq("id", parsed.data.deviceId);
  }

  return NextResponse.json(result);
}
