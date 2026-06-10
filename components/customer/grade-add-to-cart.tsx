"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { useCart, type CartLine } from "@/hooks/use-cart";

export function GradeAddToCart({ line }: { line: CartLine }) {
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [qty, setQty] = useState(1);
  useEffect(() => setMounted(true), []);

  const inCart = mounted
    ? items.find((i) => i.modelId === line.modelId && i.grade === line.grade)?.quantity ?? 0
    : 0;
  const max = Math.max(1, line.available);
  const clamped = Math.min(qty, max);

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border border-line-2 bg-paper">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={clamped <= 1}
            className="flex size-9 items-center justify-center text-ink-2 transition hover:text-primary disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="mono w-9 text-center text-sm font-semibold tabular-nums">{clamped}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={clamped >= max}
            className="flex size-9 items-center justify-center text-ink-2 transition hover:text-primary disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            add(line, clamped);
            toast.success(
              `Added ${clamped} × ${line.brand} ${line.model} (${line.grade}) to your order`,
            );
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
        >
          <ShoppingCart className="size-4" />
          Add
        </button>
      </div>
      {inCart > 0 && (
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-success transition hover:text-primary"
        >
          <Check className="size-3.5" />
          {inCart} in your order — view cart
        </Link>
      )}
    </div>
  );
}
