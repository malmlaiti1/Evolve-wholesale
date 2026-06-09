"use client";

import { useState } from "react";
import { isValidImei } from "@/lib/imei";
import { ImeiScanner } from "./imei-scanner";
import {
  ScanLine,
  Search,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type Meta = { configured: boolean; brand?: string; model?: string; error?: string };
type Blacklist = {
  configured: boolean;
  status?: "clean" | "blacklisted" | "unknown";
  error?: string;
};

export function ImeiChecker() {
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [blacklist, setBlacklist] = useState<Blacklist | null>(null);
  const [error, setError] = useState<string | null>(null);

  const valid15 = /^\d{15}$/.test(imei);
  const luhnOk = valid15 && isValidImei(imei);

  async function check() {
    setLoading(true);
    setError(null);
    setMeta(null);
    setBlacklist(null);
    try {
      const [m, b] = await Promise.all([
        fetch("/api/devices/imei-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imei }),
        }).then((r) => r.json()),
        fetch("/api/devices/imei-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imei }),
        }).then((r) => r.json()),
      ]);
      if (m.error && b.error) setError(m.error);
      setMeta(m);
      setBlacklist(b);
    } catch {
      setError("Check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-line bg-paper p-6">
        <label className="text-sm font-medium">IMEI</label>
        <div className="mt-1.5 flex gap-2">
          <input
            value={imei}
            onChange={(e) => setImei(e.target.value.replace(/\D/g, "").slice(0, 15))}
            placeholder="15 digits"
            inputMode="numeric"
            className="mono h-11 w-full rounded-md border border-line-2 bg-paper px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
          />
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-line-2 px-3 text-sm font-medium text-ink-2 transition hover:bg-cream-2"
          >
            <ScanLine className="size-4" /> Scan
          </button>
        </div>
        {imei && !valid15 && <p className="mt-1.5 text-[11px] text-danger">Must be 15 digits</p>}
        {valid15 && !luhnOk && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-warning">
            <AlertTriangle className="size-3" /> Checksum looks off
          </p>
        )}

        <button
          onClick={check}
          disabled={!valid15 || loading}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Check IMEI
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {(meta || blacklist) && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Device metadata */}
          <div className="rounded-lg border border-line bg-paper p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Device</h3>
            {meta && !meta.configured ? (
              <NotConfigured what="ImeiDB" envVar="IMEIDB_API_KEY" />
            ) : meta?.brand || meta?.model ? (
              <div className="mt-2">
                <div className="text-lg font-bold">
                  {meta.brand} {meta.model}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-3">{meta?.error ?? "No metadata returned."}</p>
            )}
          </div>

          {/* Blacklist */}
          <div className="rounded-lg border border-line bg-paper p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">
              GSMA blacklist
            </h3>
            {blacklist && !blacklist.configured ? (
              <NotConfigured what="IMEI.org" envVar="IMEI_ORG_API_KEY" />
            ) : blacklist?.status === "blacklisted" ? (
              <div className="mt-2 inline-flex items-center gap-2 font-bold text-danger">
                <ShieldAlert className="size-5" /> Blacklisted
              </div>
            ) : blacklist?.status === "clean" ? (
              <div className="mt-2 inline-flex items-center gap-2 font-bold text-success">
                <ShieldCheck className="size-5" /> Clean
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-2 text-ink-3">
                <ShieldQuestion className="size-5" /> {blacklist?.error ?? "Unknown"}
              </div>
            )}
          </div>
        </div>
      )}

      <ImeiScanner open={scanning} onOpenChange={setScanning} onScan={setImei} />
    </div>
  );
}

function NotConfigured({ what, envVar }: { what: string; envVar: string }) {
  return (
    <p className="mt-2 text-sm text-ink-2">
      {what} not configured — add <code className="mono rounded bg-cream-2 px-1">{envVar}</code> to
      enable.
    </p>
  );
}
