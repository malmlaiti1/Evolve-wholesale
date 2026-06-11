"use client";

import { useEffect, useMemo, useState } from "react";
import { isValidImei } from "@/lib/imei";
import { ImeiScanner } from "./imei-scanner";
import {
  ScanLine,
  Search,
  Loader2,
  AlertTriangle,
  Wallet,
  FileText,
  ShieldAlert,
} from "lucide-react";

type Service = { id: number; name: string; price: number };
type ServicesState =
  | { configured: false }
  | { configured: true; error: string }
  | { configured: true; credits: number; services: Service[] };

type ReportField = { label: string; value: string };
type ReportState =
  | { ok: true; fields: ReportField[] }
  | { ok: false; error: string };

// Pick a sensible default service: a universal "make & model" lookup if present,
// otherwise the cheapest available.
function defaultServiceId(services: Service[]): number | undefined {
  if (services.length === 0) return undefined;
  const byName = services.find((s) => /make and model|basic check|tac/i.test(s.name));
  if (byName) return byName.id;
  return [...services].sort((a, b) => a.price - b.price)[0].id;
}

export function ImeiChecker() {
  const [svc, setSvc] = useState<ServicesState | null>(null);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<ReportState | null>(null);

  // Load services + balance once.
  useEffect(() => {
    let active = true;
    fetch("/api/devices/imei-services")
      .then((r) => r.json())
      .then((data: ServicesState) => {
        if (!active) return;
        setSvc(data);
        if (data.configured && "services" in data) {
          setServiceId((prev) => prev ?? defaultServiceId(data.services));
        }
      })
      .catch(() => active && setSvc({ configured: true, error: "Couldn't load services." }));
    return () => {
      active = false;
    };
  }, []);

  const services = useMemo<Service[]>(
    () => (svc && svc.configured && "services" in svc ? svc.services : []),
    [svc],
  );
  const credits = svc && svc.configured && "credits" in svc ? svc.credits : null;
  const selected = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );

  const input = imei.trim();
  const validShape = /^[A-Za-z0-9]{6,24}$/.test(input);
  const looksImei = /^\d{15}$/.test(input);
  const luhnOk = looksImei && isValidImei(input);

  async function check() {
    if (!serviceId) return;
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/devices/imei-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei: input, serviceId }),
      });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.fields)) {
        setReport({ ok: true, fields: data.fields });
      } else {
        setReport({ ok: false, error: data?.error ?? "Check failed. Please try again." });
      }
    } catch {
      setReport({ ok: false, error: "Check failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (svc && !svc.configured) {
    return (
      <div className="max-w-2xl rounded-lg border border-line bg-paper p-6">
        <h3 className="font-bold">IMEI checking not configured</h3>
        <p className="mt-2 text-sm text-ink-2">
          Add <code className="mono rounded bg-cream-2 px-1">IMEI_API_KEY</code> (and optionally{" "}
          <code className="mono rounded bg-cream-2 px-1">IMEI_API_URL</code>) to your environment to
          enable lookups.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-line bg-paper p-4 sm:p-6">
        {/* Balance */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-cream-2 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-2">
            <Wallet className="size-4 text-primary" /> Balance
          </span>
          <span className="mono text-sm font-bold">
            {credits == null ? "—" : `${credits.toFixed(2)} credits`}
          </span>
        </div>

        {/* Service picker */}
        <label className="text-sm font-medium" htmlFor="imei-service">
          Service
        </label>
        <select
          id="imei-service"
          value={serviceId ?? ""}
          onChange={(e) => setServiceId(Number(e.target.value) || undefined)}
          disabled={!svc || services.length === 0}
          className="mono mt-1.5 h-11 w-full rounded-md border border-line-2 bg-paper px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft disabled:opacity-60"
        >
          {!svc ? (
            <option>Loading services…</option>
          ) : services.length === 0 ? (
            <option>No services available</option>
          ) : (
            services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.price.toFixed(2)} cr
              </option>
            ))
          )}
        </select>

        {/* IMEI / serial input */}
        <label className="mt-4 block text-sm font-medium" htmlFor="imei-input">
          IMEI / Serial
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="imei-input"
            value={imei}
            onChange={(e) => setImei(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 24))}
            placeholder="Type, paste, or scan"
            inputMode="text"
            autoCapitalize="characters"
            className="mono h-11 w-full rounded-md border border-line-2 bg-paper px-3.5 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
          />
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-line-2 px-3 text-sm font-medium text-ink-2 transition hover:bg-cream-2"
          >
            <ScanLine className="size-4" /> Scan
          </button>
        </div>
        {input && !validShape && (
          <p className="mt-1.5 text-[11px] text-danger">Enter a 6–24 character IMEI or serial.</p>
        )}
        {looksImei && !luhnOk && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-warning">
            <AlertTriangle className="size-3" /> IMEI checksum looks off — double-check
          </p>
        )}

        <button
          onClick={check}
          disabled={!validShape || !serviceId || loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60 sm:w-auto"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? "Checking…" : "Check"}
        </button>
        {selected && (
          <p className="mt-2 text-[11px] text-ink-3">
            Runs <span className="font-medium text-ink-2">{selected.name}</span> · costs{" "}
            <span className="mono">{selected.price.toFixed(2)}</span> credits.
          </p>
        )}
      </div>

      {/* Report */}
      {report && (
        <div className="mt-4 rounded-lg border border-line bg-paper p-4 sm:p-5">
          {report.ok ? (
            <>
              <h3 className="inline-flex items-center gap-2 text-sm font-bold">
                <FileText className="size-4 text-primary" /> Report
              </h3>
              <dl className="mt-3 divide-y divide-line">
                {report.fields.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <dt className="text-[12px] uppercase tracking-wide text-ink-3">{f.label}</dt>
                    <dd className={`mono text-sm font-medium sm:text-right ${valueTone(f)}`}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <div className="inline-flex items-start gap-2 text-sm text-danger">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span>{report.error}</span>
            </div>
          )}
        </div>
      )}

      <ImeiScanner open={scanning} onOpenChange={setScanning} onScan={(v) => setImei(v)} />
    </div>
  );
}

// Light semantic coloring for the well-known status fields so problems pop.
function valueTone({ label, value }: ReportField): string {
  const l = label.toLowerCase();
  const v = value.toLowerCase();
  if (l.includes("fmi") || l.includes("find my") || l.includes("icloud")) {
    if (/(on|lost|locked)/.test(v)) return "text-danger";
    if (/(off|clean|unlock)/.test(v)) return "text-success";
  }
  if (l.includes("blacklist") || l.includes("lost") || l.includes("status")) {
    if (/(blacklist|lost|barred|fraud)/.test(v)) return "text-danger";
    if (/(clean|clear)/.test(v)) return "text-success";
  }
  if (l.includes("simlock") || l.includes("lock")) {
    if (/locked/.test(v) && !/unlocked/.test(v)) return "text-warning";
    if (/unlocked/.test(v)) return "text-success";
  }
  return "text-ink";
}
