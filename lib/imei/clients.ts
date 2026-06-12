import "server-only";
import { env, features } from "@/lib/env";
import { pickReportObject, pickOrderId, toFields, type ImeiReportField } from "./parse";

export type { ImeiReportField };

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Map a non-success status (0 = duplicate/soft error, -1 = rejected) to a message. */
function statusError(data: Record<string, unknown>): string {
  const err = typeof data.error === "string" ? data.error.trim() : "";
  if (data.status === 0) {
    if (/duplicate/i.test(err)) {
      return "This IMEI was already checked on this service — open it in your imei.org order history (no new charge).";
    }
    return err || "The order couldn't be completed.";
  }
  // status === -1 and anything else
  if (/reject/i.test(err) || !err) {
    return "Check rejected — the IMEI/serial isn't recognized by this service, or your balance is too low.";
  }
  return err;
}

/** Poll /track for an async order until the report is ready (or we give up). */
async function pollReport(orderId: string): Promise<Record<string, unknown> | null> {
  const url = endpoint("track", { id: orderId });
  for (let i = 0; i < 12; i++) {
    await sleep(3000);
    const data = await call(url, 15_000);
    if (data && data.status === 1) {
      const report = pickReportObject(data);
      if (report) return report;
    }
    // status 0 / pending → keep waiting
  }
  return null;
}

/** Run an IMEI/serial through a chosen service and return the full report. */
export async function imeiSubmit(serviceId: number, imei: string): Promise<ImeiReportResult> {
  if (!features.imei) return { configured: false };

  const data = await call(
    endpoint("submit", { service_id: String(serviceId), input: imei }),
    50_000,
  );

  if (!data) {
    return { configured: true, ok: false, error: "The check timed out or failed. Please try again." };
  }

  // status: 1 = ok, 0 = duplicate/soft error, -1 = rejected.
  if (data.status !== 1) {
    return { configured: true, ok: false, error: statusError(data) };
  }

  // The report can arrive inline (under various keys — see parse.ts), or, for
  // async services, as just an orderId we then poll /track for.
  let report = pickReportObject(data);
  if (!report) {
    const orderId = pickOrderId(data);
    if (orderId) report = await pollReport(orderId);
  }

  if (report) {
    const fields = toFields(report);
    if (fields.length) return { configured: true, ok: true, fields, raw: report };
  }

  // Reached only if the gateway reported success but we couldn't read a report.
  // Log the raw shape (admin's own data, truncated) so we can tighten parse.ts.
  console.error("[imei] success status but no parseable report:", JSON.stringify(data).slice(0, 1500));
  return {
    configured: true,
    ok: false,
    error: "The check completed but returned no readable report. It may still be processing — try again shortly.",
  };
}
