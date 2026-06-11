import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/clerk/auth";
import { imeiServices } from "@/lib/imei/clients";

export const dynamic = "force-dynamic";

// Lists available IMEI services + the account credit balance, used to populate
// the checker's service picker. Admin-only (the key is paid + server-side).
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const result = await imeiServices();
  return NextResponse.json(result);
}
