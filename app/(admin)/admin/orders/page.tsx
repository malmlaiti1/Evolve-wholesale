import Link from "next/link";
import { getOrders, getOrderCounts } from "@/lib/admin/orders";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

const TABS = [
  { val: "", label: "All" },
  { val: "pending", label: "Pending" },
  { val: "approved", label: "Approved" },
  { val: "on_the_way", label: "On the way" },
  { val: "delivered", label: "Delivered" },
  { val: "denied", label: "Denied" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const active = sp.status ?? "";
  const [orders, counts] = await Promise.all([getOrders(active), getOrderCounts()]);

  return (
    <>
      <AdminHeader title="Orders" subtitle={`${counts.all} total`} />
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const c = t.val === "" ? counts.all : counts[t.val] ?? 0;
            return (
              <Link
                key={t.val}
                href={`/admin/orders${t.val ? `?status=${t.val}` : ""}`}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition ${
                  active === t.val
                    ? "bg-primary text-primary-foreground"
                    : "border border-line-2 bg-paper text-ink-2 hover:border-ink-3"
                }`}
              >
                {t.label}
                <span className={`mono text-[11px] ${active === t.val ? "opacity-80" : "text-ink-3"}`}>
                  {c}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-4">
          <OrdersTable orders={orders} />
        </div>
      </div>
    </>
  );
}
