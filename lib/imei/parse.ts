/**
 * Pure parsing helpers for imei.org responses — no env / no "server-only" so
 * they can be unit-tested directly.
 *
 * The live /api/submit + /api/track responses don't reliably match the
 * documented `{ response: { services: [ {...} ] } }` shape: depending on the
 * service the report object can sit under `services[0]`, under `result`/`object`,
 * be the `response` object itself, or be an array. We probe all of these so the
 * report renders regardless of which the gateway returns.
 */

export type ImeiReportField = { label: string; value: string };

// Keys that are envelope/control metadata, never report content.
const CONTROL_KEYS = new Set([
  "status",
  "error",
  "credits",
  "orderid",
  "orderId",
  "id",
  "services",
  "service",
  "balance",
  "response",
]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** A plain object counts as a "report" if it has at least one non-control key. */
function looksLikeReport(o: Record<string, unknown>): boolean {
  return Object.keys(o).some((k) => !CONTROL_KEYS.has(k));
}

/**
 * Find the report object inside an imei.org payload (or its `response`).
 * Returns null when there's no report (e.g. an orderId-only async ack).
 */
export function pickReportObject(payload: unknown): Record<string, unknown> | null {
  if (payload == null) return null;

  if (Array.isArray(payload)) {
    return isPlainObject(payload[0]) ? payload[0] : null;
  }
  if (!isPlainObject(payload)) return null;

  // Unwrap a `response` envelope first.
  if (isPlainObject(payload.response) || Array.isArray(payload.response)) {
    const inner = pickReportObject(payload.response);
    if (inner) return inner;
  }

  // Common container keys that hold the report.
  for (const key of ["services", "service", "result", "object", "data", "report"]) {
    const v = payload[key];
    if (Array.isArray(v) && isPlainObject(v[0])) return v[0];
    if (isPlainObject(v) && looksLikeReport(v)) return v;
  }

  // The payload itself may be the flat report (e.g. { Model, IMEI, ... }).
  if (looksLikeReport(payload)) return payload;

  return null;
}

/** Pull an async order id out of a submit/ack payload, if present. */
export function pickOrderId(payload: unknown): string | null {
  if (!isPlainObject(payload)) return null;
  const candidates = [
    payload.orderId,
    payload.orderid,
    payload.id,
    isPlainObject(payload.response) ? payload.response.orderId : undefined,
    isPlainObject(payload.response) ? payload.response.orderid : undefined,
  ];
  for (const c of candidates) {
    if (typeof c === "number" || (typeof c === "string" && c.trim() !== "")) {
      return String(c);
    }
  }
  return null;
}

/** Flatten a report object into label/value rows (one level of nesting). */
export function toFields(report: Record<string, unknown>): ImeiReportField[] {
  const out: ImeiReportField[] = [];
  for (const [key, value] of Object.entries(report)) {
    if (value == null) continue;
    if (isPlainObject(value)) {
      for (const [k2, v2] of Object.entries(value)) {
        const s = v2 == null ? "" : String(v2).trim();
        if (s !== "") out.push({ label: `${key} · ${k2}`, value: s });
      }
    } else if (Array.isArray(value)) {
      const s = value.map((x) => String(x)).filter((x) => x.trim() !== "").join(", ");
      if (s !== "") out.push({ label: key, value: s });
    } else {
      const s = String(value).trim();
      if (s !== "") out.push({ label: key, value: s });
    }
  }
  return out;
}
