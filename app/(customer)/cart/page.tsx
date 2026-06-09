"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { DeviceImage } from "@/components/shared/device-image";
import { GradeBadge } from "@/components/shared/grade-badge";
import { money } from "@/lib/money";
import { Trash2, ShoppingCart, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";

type Issue = "unavailable" | "price";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setPrice = useCart((s) => s.setPrice);
  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<Record<string, Issue>>({});
  const [validating, setValidating] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    let cancelled = false;
    setValidating(true);
    fetch("/api/devices/validate-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: items.map((i) => i.id) }),
    })
      .then((r) => r.json())
      .then((data: { items: { id: string; available: boolean; price: number | null }[] }) => {
        if (cancelled) return;
        const next: Record<string, Issue> = {};
        for (const v of data.items ?? []) {
          const item = useCart.getState().items.find((i) => i.id === v.id);
          if (!item) continue;
          if (!v.available) next[v.id] = "unavailable";
          else if (v.price != null && v.price !== item.price) {
            next[v.id] = "price";
            setPrice(v.id, v.price);
          }
        }
        setIssues(next);
      })
      .catch(() => {})
      .finally(() => !cancelled && setValidating(false));
    return () => {
      cancelled = true;
    };
    // validate once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center text-ink-3">
        <Loader2 className="mx-auto size-6 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="screen-in mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-lg border border-line bg-paper p-14 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-cream-2 text-ink-3">
            <ShoppingCart className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Your order is empty</h1>
          <p className="mt-2 text-ink-2">Browse the catalog and add phones to build an order.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
          >
            Browse phones <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const hasBlocking = Object.values(issues).some((v) => v === "unavailable");
  const subtotal = items
    .filter((i) => issues[i.id] !== "unavailable")
    .reduce((s, i) => s + i.price, 0);

  return (
    <div className="screen-in mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Your order</h1>
      <p className="mt-1 text-ink-2">
        {items.length} {items.length === 1 ? "phone" : "phones"}
        {validating && " · checking availability…"}
      </p>

      <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 p-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-md border border-line">
                <DeviceImage className="size-full" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/models/${i.modelId}`} className="font-bold transition hover:text-primary">
                      {i.brand} {i.model}
                    </Link>
                    <div className="mono mt-1 flex flex-wrap items-center gap-x-2 text-[11.5px] text-ink-3">
                      {i.storage && <span>{i.storage}</span>}
                      {i.color && <span>· {i.color}</span>}
                    </div>
                    <div className="mt-1.5">
                      <GradeBadge grade={i.grade} />
                    </div>
                  </div>
                  <button
                    onClick={() => remove(i.id)}
                    className="rounded-md p-1.5 text-ink-3 transition hover:bg-cream-2 hover:text-danger"
                    aria-label={`Remove ${i.brand} ${i.model}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  {issues[i.id] === "unavailable" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
                      <AlertTriangle className="size-3.5" /> Just sold — remove to continue
                    </span>
                  ) : issues[i.id] === "price" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                      <AlertTriangle className="size-3.5" /> Price updated
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="mono text-lg font-bold text-primary">{money(i.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-line bg-paper p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink-2">Subtotal</span>
            <span className="mono font-semibold">{money(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink-2">Local delivery</span>
            <span className="mono font-semibold text-success">Free</span>
          </div>
          <div className="my-4 h-px bg-line" />
          <div className="flex items-end justify-between">
            <span className="font-bold">Total</span>
            <span className="mono text-2xl font-extrabold text-primary">{money(subtotal)}</span>
          </div>
          <Link
            href={hasBlocking ? "#" : "/checkout"}
            aria-disabled={hasBlocking}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[15px] font-semibold transition ${
              hasBlocking
                ? "pointer-events-none bg-cream-deep text-ink-3"
                : "bg-primary text-primary-foreground hover:bg-accent-deep"
            }`}
          >
            Checkout <ArrowRight className="size-4" />
          </Link>
          {hasBlocking && (
            <p className="mt-2 text-center text-xs text-danger">Remove sold-out phones to continue.</p>
          )}
          <div className="mt-4 flex gap-2.5 rounded-md bg-cream p-3 text-xs leading-relaxed text-ink-2">
            <span aria-hidden>💵</span>
            <span>Pay cash on local delivery — no prepayment. An invoice comes with your phone.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
