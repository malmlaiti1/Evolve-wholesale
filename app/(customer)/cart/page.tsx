"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { DeviceImage } from "@/components/shared/device-image";
import { GradeBadge } from "@/components/shared/grade-badge";
import { money } from "@/lib/money";
import { Trash2, ShoppingCart, ArrowRight, AlertTriangle, Loader2, Minus, Plus } from "lucide-react";

type Issue = "unavailable" | "price" | "quantity";

const lineKey = (modelId: string, grade: string) => `${modelId}:${grade}`;

export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const setUnitPrice = useCart((s) => s.setUnitPrice);
  const setAvailable = useCart((s) => s.setAvailable);
  const [hydrated, setHydrated] = useState(false);
  const [issues, setIssues] = useState<Record<string, Issue>>({});
  const [validating, setValidating] = useState(false);

  // Wait for the persisted cart to hydrate before rendering empty/contents.
  useEffect(() => {
    setHydrated(useCart.persist.hasHydrated());
    return useCart.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    let cancelled = false;
    setValidating(true);
    fetch("/api/devices/validate-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: items.map((i) => ({ modelId: i.modelId, grade: i.grade })) }),
    })
      .then((r) => r.json())
      .then(
        (data: {
          items: { modelId: string; grade: string; available: number; price: number | null }[];
        }) => {
          if (cancelled) return;
          const next: Record<string, Issue> = {};
          for (const v of data.items ?? []) {
            const item = useCart.getState().items.find((i) => i.modelId === v.modelId && i.grade === v.grade);
            if (!item) continue;
            const key = lineKey(v.modelId, v.grade);
            setAvailable(v.modelId, v.grade, v.available);
            if (v.available === 0) {
              next[key] = "unavailable";
            } else if (v.available < item.quantity) {
              next[key] = "quantity";
              setQuantity(v.modelId, v.grade, v.available);
            } else if (v.price != null && v.price !== item.unitPrice) {
              next[key] = "price";
              setUnitPrice(v.modelId, v.grade, v.price);
            }
          }
          setIssues(next);
        },
      )
      .catch(() => {})
      .finally(() => !cancelled && setValidating(false));
    return () => {
      cancelled = true;
    };
    // validate once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) {
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
  const totalPhones = items
    .filter((i) => issues[lineKey(i.modelId, i.grade)] !== "unavailable")
    .reduce((s, i) => s + i.quantity, 0);
  const subtotal = items
    .filter((i) => issues[lineKey(i.modelId, i.grade)] !== "unavailable")
    .reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <div className="screen-in mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Your order</h1>
      <p className="mt-1 text-ink-2">
        {totalPhones} {totalPhones === 1 ? "phone" : "phones"}
        {validating && " · checking availability…"}
      </p>

      <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper">
          {items.map((i) => {
            const key = lineKey(i.modelId, i.grade);
            const issue = issues[key];
            const unavailable = issue === "unavailable";
            return (
              <div key={key} className="flex gap-4 p-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-md border border-line">
                  <DeviceImage className="size-full" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/models/${i.modelId}`} className="font-bold transition hover:text-primary">
                        {i.brand} {i.model}
                      </Link>
                      <div className="mt-1.5">
                        <GradeBadge grade={i.grade} />
                      </div>
                    </div>
                    <button
                      onClick={() => remove(i.modelId, i.grade)}
                      className="rounded-md p-1.5 text-ink-3 transition hover:bg-cream-2 hover:text-danger"
                      aria-label={`Remove ${i.brand} ${i.model} ${i.grade}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    {unavailable ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
                        <AlertTriangle className="size-3.5" /> Sold out — remove to continue
                      </span>
                    ) : (
                      <div className="flex items-center rounded-md border border-line-2 bg-paper">
                        <button
                          onClick={() => setQuantity(i.modelId, i.grade, i.quantity - 1)}
                          disabled={i.quantity <= 1}
                          className="flex size-8 items-center justify-center text-ink-2 transition hover:text-primary disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="mono w-8 text-center text-sm font-semibold tabular-nums">{i.quantity}</span>
                        <button
                          onClick={() => setQuantity(i.modelId, i.grade, i.quantity + 1)}
                          disabled={i.quantity >= i.available}
                          className="flex size-8 items-center justify-center text-ink-2 transition hover:text-primary disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="text-right">
                      {issue === "price" && (
                        <span className="mb-0.5 block text-[11px] font-semibold text-warning">Price updated</span>
                      )}
                      {issue === "quantity" && (
                        <span className="mb-0.5 block text-[11px] font-semibold text-warning">
                          Only {i.available} left
                        </span>
                      )}
                      <span className="mono text-lg font-bold text-primary">
                        {money(i.unitPrice * i.quantity)}
                      </span>
                      {!unavailable && i.quantity > 1 && (
                        <span className="mono block text-[11px] text-ink-3">{money(i.unitPrice)} each</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-lg border border-line bg-paper p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink-2">Subtotal ({totalPhones})</span>
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
            <p className="mt-2 text-center text-xs text-danger">Remove sold-out lines to continue.</p>
          )}
          <div className="mt-4 flex gap-2.5 rounded-md bg-cream p-3 text-xs leading-relaxed text-ink-2">
            <span aria-hidden>💵</span>
            <span>Pay cash on local delivery — no prepayment. An invoice comes with your phones.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
