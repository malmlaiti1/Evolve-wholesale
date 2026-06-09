"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/money";
import { OrderStatusBadge } from "@/components/customer/order-status-badge";
import { FULFILLMENT_STEPS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Loader2, PackageSearch, Search } from "lucide-react";
import type { Enums } from "@/lib/supabase/types";

type Result = {
  found: boolean;
  order?: {
    order_number: string;
    status: Enums<"order_status">;
    created_at: string;
    total: number;
    customer_name: string;
    denial_reason: string | null;
  };
  items?: { device_brand: string; device_model: string; unit_price: number }[];
};

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("order");
    if (p) setOrderNumber(p);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lookup failed.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentIdx = result?.order ? FULFILLMENT_STEPS.indexOf(result.order.status) : -1;

  return (
    <div className="screen-in mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Track your order</h1>
      <p className="mt-2 text-ink-2">
        Enter your order number and the email you used at checkout.
      </p>

      <form onSubmit={submit} className="mt-6 rounded-lg border border-line bg-paper p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Order number</span>
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="EW-10001"
              className="mono h-11 rounded-md border border-line-2 bg-paper px-3.5 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@store.com"
              className="h-11 rounded-md border border-line-2 bg-paper px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Look up order
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      {result && !result.found && (
        <div className="mt-6 rounded-lg border border-line bg-paper p-8 text-center">
          <PackageSearch className="mx-auto size-8 text-ink-3" />
          <p className="mt-3 font-semibold">No matching order</p>
          <p className="mt-1 text-sm text-ink-2">Double-check your order number and email.</p>
        </div>
      )}

      {result?.found && result.order && (
        <div className="mt-6 rounded-lg border border-line bg-paper p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mono text-lg font-bold">{result.order.order_number}</div>
              <div className="text-sm text-ink-2">{result.order.customer_name}</div>
            </div>
            <OrderStatusBadge status={result.order.status} />
          </div>

          {result.order.status !== "denied" ? (
            <ol className="mt-6 flex items-center">
              {FULFILLMENT_STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                return (
                  <li key={step} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                          done ? "bg-primary text-primary-foreground" : "bg-cream-deep text-ink-3"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className={`text-[11px] ${done ? "text-ink" : "text-ink-3"}`}>
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                    {idx < FULFILLMENT_STEPS.length - 1 && (
                      <span
                        className={`mx-1 h-0.5 flex-1 ${idx < currentIdx ? "bg-primary" : "bg-cream-deep"}`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-5 rounded-md bg-danger-soft p-4 text-sm text-danger">
              <b>Order denied.</b> {result.order.denial_reason ?? "Please contact us for details."}
            </div>
          )}

          <div className="mt-6 divide-y divide-line border-t border-line">
            {result.items?.map((it, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  {it.device_brand} {it.device_model}
                </span>
                <span className="mono">{money(it.unit_price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="font-bold">Total</span>
            <span className="mono text-lg font-extrabold text-primary">{money(result.order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
