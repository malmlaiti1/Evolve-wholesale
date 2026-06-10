"use client";

import { useState } from "react";
import { OrderStatusBadge } from "@/components/customer/order-status-badge";
import { money } from "@/lib/money";
import { OrderDetailDrawer } from "./order-detail-drawer";
import type { OrderWithItems } from "@/lib/admin/orders";

export function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  const [selected, setSelected] = useState<OrderWithItems | null>(null);

  return (
    <>
      {/* Mobile: stacked cards, tap to open the detail drawer. */}
      <div className="space-y-3 md:hidden">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-line bg-paper p-8 text-center text-sm text-ink-3">
            No orders in this view.
          </div>
        ) : (
          orders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className="block w-full rounded-lg border border-line bg-paper p-4 text-left transition active:bg-cream"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mono text-sm font-semibold text-ink">{o.order_number}</p>
                  <p className="mt-0.5 truncate text-[13px] font-medium text-ink-2">
                    {o.customer_name}
                  </p>
                  <p className="truncate text-[11px] text-ink-3">{o.customer_email}</p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-ink-2">
                  {o.items.length} {o.items.length === 1 ? "item" : "items"}
                </span>
                <span className="mono font-semibold text-ink">{money(Number(o.total))}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-line bg-paper md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-3">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-ink-3">
                  No orders in this view.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-cream"
                >
                  <td className="mono px-4 py-3 font-semibold">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-[11px] text-ink-3">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{o.items.length}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="mono px-4 py-3 text-right font-semibold">
                    {money(Number(o.total))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailDrawer
        order={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
