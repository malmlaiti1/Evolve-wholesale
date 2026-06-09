"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { money } from "@/lib/money";
import { toast } from "sonner";
import { Loader2, Lock, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const remove = useCart((s) => s.remove);
  const setPrice = useCart((s) => s.setPrice);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [idemKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `k_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) router.replace("/cart");
  }, [mounted, items.length, submitting, router]);

  const subtotal = items.reduce((s, i) => s + i.price, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ id: i.id, price: i.price })),
          idempotencyKey: idemKey,
        }),
      });
      const data = await res.json();
      if (res.status === 429) {
        toast.error(data.error ?? "Too many attempts. Please wait.");
        return;
      }
      if (data.status === "price_changed") {
        for (const it of data.items) setPrice(it.device_id, it.current_price);
        toast.error("Some prices changed — please review your cart.");
        router.push("/cart");
        return;
      }
      if (data.status === "unavailable") {
        for (const it of data.items) remove(it.device_id);
        toast.error("Some phones just sold and were removed from your order.");
        router.push("/cart");
        return;
      }
      if (data.status === "ok") {
        clear();
        router.push(`/order-confirmation?order=${encodeURIComponent(data.order.order_number)}`);
        return;
      }
      toast.error(data.error ?? "Could not place your order.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="py-20 text-center text-ink-3">
        <Loader2 className="mx-auto size-6 animate-spin" />
      </div>
    );
  }
  if (items.length === 0) return null;

  const field =
    "h-11 w-full rounded-md border border-line-2 bg-paper px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft";

  return (
    <div className="screen-in mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
      <form onSubmit={submit} className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-7">
          <section className="rounded-lg border border-line bg-paper p-6">
            <h2 className="text-lg font-bold">Delivery details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Full name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} placeholder="Jordan Reyes" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Phone</span>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} placeholder="(555) 010-0100" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Email</span>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} placeholder="you@store.com" />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Delivery address</span>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-md border border-line-2 bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
                  placeholder="Street address, city, ZIP"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-paper p-6">
            <h2 className="text-lg font-bold">Payment</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 rounded-md border-2 border-primary bg-accent-soft/40 p-4">
                <input type="radio" checked readOnly className="size-4 accent-[var(--primary)]" />
                <div>
                  <div className="font-semibold">Cash on delivery</div>
                  <div className="text-xs text-ink-2">Pay when your phone arrives. No prepayment.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-md border border-line-2 p-4 opacity-55">
                <input type="radio" disabled className="size-4" />
                <div>
                  <div className="font-semibold">Card payment</div>
                  <div className="text-xs text-ink-2">Coming soon.</div>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-paper p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-2">
                  {i.brand} {i.model} <span className="mono text-ink-3">· {i.grade}</span>
                </span>
                <span className="mono font-semibold">{money(i.price)}</span>
              </li>
            ))}
          </ul>
          <div className="my-4 h-px bg-line" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-2">Local delivery</span>
            <span className="mono font-semibold text-success">Free</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="font-bold">Total</span>
            <span className="mono text-2xl font-extrabold text-primary">{money(subtotal)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Placing order…
              </>
            ) : (
              <>
                Place order <ArrowRight className="size-4" />
              </>
            )}
          </button>
          <p className="mono mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-3">
            <Lock className="size-3" /> Pay {money(subtotal)} cash on delivery
          </p>
          <Link href="/cart" className="mt-2 block text-center text-xs text-ink-2 transition hover:text-ink">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
