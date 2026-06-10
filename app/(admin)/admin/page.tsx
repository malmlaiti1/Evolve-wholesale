import Link from "next/link";
import { getDashboard } from "@/lib/admin/queries";
import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/customer/order-status-badge";
import { money, money0 } from "@/lib/money";
import { DollarSign, Package, ClipboardList, Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const d = await getDashboard();

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Inventory & orders at a glance" />
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Inventory value" value={money0(d.value)} sub={`${d.availableCount} available`} icon={DollarSign} />
          <KpiCard label="Devices listed" value={d.localCount} sub="in local catalog" icon={Package} />
          <KpiCard label="Total orders" value={d.totalOrders} icon={ClipboardList} />
          <KpiCard label="Pending" value={d.pendingOrders} sub="awaiting approval" icon={Clock} />
        </div>

        <div className="mt-6">
          <RevenueChart data={d.revenue} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent orders */}
          <div className="overflow-hidden rounded-lg border border-line bg-paper lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line p-4">
              <h2 className="font-bold">Recent orders</h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            {d.recentOrders.length === 0 ? (
              <p className="p-10 text-center text-sm text-ink-3">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-3">
                    <th className="px-4 py-2.5 font-semibold">Order</th>
                    <th className="px-4 py-2.5 font-semibold">Customer</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentOrders.map((o) => (
                    <tr key={o.order_number} className="border-b border-line last:border-0 hover:bg-cream">
                      <td className="mono px-4 py-3 font-semibold">{o.order_number}</td>
                      <td className="px-4 py-3">{o.customer_name}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="mono px-4 py-3 text-right font-semibold">{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Low stock */}
          <div className="rounded-lg border border-line bg-paper">
            <div className="flex items-center gap-2 border-b border-line p-4">
              <AlertTriangle className="size-4 text-warning" />
              <h2 className="font-bold">Low stock by model</h2>
            </div>
            {d.lowStock.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-3">All models well stocked.</p>
            ) : (
              <ul className="divide-y divide-line">
                {d.lowStock.map((m) => (
                  <li key={m.model} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-ink-2">{m.model}</span>
                    <span
                      className={`mono rounded-full px-2 py-0.5 text-xs font-bold ${
                        m.count === 0 ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"
                      }`}
                    >
                      {m.count} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
