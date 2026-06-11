import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/clerk/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { imeiSubmit } from "@/lib/imei/clients";

export const dynamic = "force-dynamic";
// Some upstream services answer slowly (seen ~20s). Give the function headroom
// past Vercel's default so synchronous checks aren't killed mid-flight. (If a
// service ever exceeds this, switch to imei.org's &dontWait=1 + /track polling.)
export const maxDuration = 60;

// `input` is generic on purpose: most services take a 15-digit IMEI, but some
// take a serial number or ICCID, so we validate shape loosely (alphanumeric)
// rather than forcing the IMEI Luhn rule here. The UI still nudges toward IMEIs.
const schema = z.object({
  imei: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6,24}$/, "Enter a valid IMEI / serial."),
  serviceId: z.coerce.number().int().positive(),
});

export async function POST(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  // Paid upstream calls — keep the per-IP limiter in front.
  const { ok } = await rateLimit("imei", clientIp(req)).catch(() => ({ ok: true }));
  if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { configured: true, ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const result = await imeiSubmit(parsed.data.serviceId, parsed.data.imei);
  return NextResponse.json(result);
}
