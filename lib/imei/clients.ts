import "server-only";
import { env, features } from "@/lib/env";

/**
 * imei.org client API (a DHRU-style REST gateway).
 *
 * Endpoints (all GET, apikey in the query string — server-side only, the key
 * never reaches the browser):
 *   /balance?apikey=…                              → { status, response:{ credits } }
 *   /services?apikey=…                             → { status, response:{ services:[{id,name,price}] } }
 *   /submit?apikey=…&service_id=…&input=IMEI       → { status:1, response:{ services:[ {<report fields>} ] } }
 *                                                     or { status:-1, error }
 *
 * The report (response.services[0]) is a flat key→value object whose fields vary
 * by service (e.g. Model, IMEI, "Serial Number", FMI, iCloud, Simlock, …), so we
 * surface the whole thing rather than mapping a fixed shape.
 */

const API_URL = env.IMEI_API_URL ?? "https://api-client.imei.org/api";

export type ImeiService = { id: number; name: string; price: number };

export type ImeiServicesResult =
  | { configured: false }
  | { configured: true; error: string }
  | { configured: true; credits: number; services: ImeiService[] };

export type ImeiReportField = { label: string; value: string };

export type ImeiReportResult =
  | { configured: false }
  | { configured: true; ok: false; error: string }
  | { configured: true; ok: true; fields: ImeiReportField[]; raw: Record<string, unknown> };

function endpoint(path: string, params: Record<string, string>) {
  const url = new URL(`${API_URL.replace(/\/$/, "")}/${path}`);
  url.searchParams.set("apikey", env.IMEI_API_KEY!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url;
}

async function call(url: URL, signalMs = 12_000): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), signalMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Account balance + the list of available IMEI services (to populate the picker). */
export async function imeiServices(): Promise<ImeiServicesResult> {
  if (!features.imei) return { configured: false };

  const [bal, svc] = await Promise.all([
    call(endpoint("balance", {})),
    call(endpoint("services", {})),
  ]);

  if (!svc || svc.status !== 1) {
    return { configured: true, error: "Couldn't load services — check the API key or try again." };
  }

  const response = svc.response as { services?: ImeiService[] } | undefined;
  const services = (response?.services ?? [])
    .filter((s) => typeof s?.id === "number" && typeof s?.name === "string")
    .map((s) => ({ id: s.id, name: s.name, price: Number(s.price) || 0 }));

  const credits =
    bal && bal.status === 1
      ? Number((bal.response as { credits?: number } | undefined)?.credits ?? 0)
      : 0;

  return { configured: true, credits, services };
}

/** Run an IMEI/serial through a chosen service and return the full report. */
export async function imeiSubmit(serviceId: number, imei: string): Promise<ImeiReportResult> {
  if (!features.imei) return { configured: false };

  // Synchronous call: the report comes back directly (no order polling needed
  // for the fast info/blacklist services). Allow a generous timeout.
  const data = await call(
    endpoint("submit", { service_id: String(serviceId), input: imei }),
    50_000,
  );

  if (!data) {
    return { configured: true, ok: false, error: "The check timed out or failed. Please try again." };
  }

  if (data.status !== 1) {
    const err = typeof data.error === "string" && data.error ? data.error : "rejected";
    const friendly =
      err.toLowerCase() === "rejected"
        ? "Check rejected — usually an out-of-credits balance or an IMEI not recognized by this service."
        : err;
    return { configured: true, ok: false, error: friendly };
  }

  const response = data.response as { services?: Array<Record<string, unknown>> } | undefined;
  const report = response?.services?.[0];
  if (!report || typeof report !== "object") {
    return { configured: true, ok: false, error: "No report returned for this IMEI." };
  }

  const fields: ImeiReportField[] = Object.entries(report)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([label, v]) => ({ label, value: String(v) }));

  return { configured: true, ok: true, fields, raw: report };
}
