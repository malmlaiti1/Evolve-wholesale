"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/use-cart";

export function AddToCartButton({
  device,
  available,
}: {
  device: Omit<CartItem, "addedAt">;
  available: boolean;
}) {
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const inCart = mounted && items.some((i) => i.id === device.id);

  if (!available) {
    return (
      <button
        disabled
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cream-deep px-6 py-3.5 text-[15px] font-semibold text-ink-3"
      >
        No longer available
      </button>
    );
  }

  if (inCart) {
    return (
      <button
        onClick={() => router.push("/cart")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-line-2 bg-paper px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:bg-cream"
      >
        In your order — view cart
        <ArrowRight className="size-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        add(device);
        toast.success(`Added ${device.brand} ${device.model} to your order`);
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition hover:bg-accent-deep hover:shadow-md"
    >
      <ShoppingCart className="size-4" />
      Add to order
    </button>
  );
}
