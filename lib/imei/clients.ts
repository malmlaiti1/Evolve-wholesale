import "server-only";
import { env, features } from "@/lib/env";

export type ImeiMetadata = {
  configured: boolean;
  brand?: string;
  model?: string;
  raw?: unknown;
  error?: string;
};

export type ImeiBlacklist = {
  configured: boolean;
  status?: "clean" | "blacklisted" | "unknown";
  raw?: unknown;
  error?: string;
};

/**
 * ImeiDB.xyz metadata lookup (brand/model autofill). Graceful: returns
 * { configured: false } until IMEIDB_API_KEY is set. Endpoint/field mapping is
 * a best-effort default — adjust to the live API response when you wire the key.
 */
export async function imeidbLookup(imei: string): Promise<ImeiMetadata> {
  if (!features.imeidb) return { configured: false };
  try {
    const res = await fetch(`https://imeidb.xyz/api/imei/${encodeURIComponent(imei)}`, {
      headers: { Authorization: `Bearer ${env.IMEIDB_API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return { configured: true, error: `Lookup failed (${res.status})` };
    const data = (await res.json()) as Record<string, unknown>;
    return {
      configured: true,
      brand: (data.brand ?? data.manufacturer) as string | undefined,
      model: (data.model ?? data.modelName ?? data.name) as string | undefined,
      raw: data,
    };
  } catch {
    return { configured: true, error: "Lookup error — check the API or try again." };
  }
}

/**
 * IMEI.org GSMA blacklist check. Graceful until IMEI_ORG_API_KEY is set.
 */
export async function imeiOrgCheck(imei: string): Promise<ImeiBlacklist> {
  if (!features.imeiOrg) return { configured: false };
  try {
    const res = await fetch(`https://api.imei.org/v1/check?imei=${encodeURIComponent(imei)}`, {
      headers: { Authorization: `Bearer ${env.IMEI_ORG_API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return { configured: true, error: `Check failed (${res.status})` };
    const data = (await res.json()) as Record<string, unknown>;
    const blacklisted = data.blacklisted === true || data.status === "blacklisted";
    return { configured: true, status: blacklisted ? "blacklisted" : "clean", raw: data };
  } catch {
    return { configured: true, error: "Check error — try again." };
  }
}
