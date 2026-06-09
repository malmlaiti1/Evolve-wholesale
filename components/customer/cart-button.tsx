"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.length : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
    >
      <ShoppingCart className="size-4" />
      Cart
      {count > 0 && (
        <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-cream px-1.5 text-xs font-bold text-primary">
          {count}
        </span>
      )}
    </Link>
  );
}
