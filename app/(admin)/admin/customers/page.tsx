import { getCustomers } from "@/lib/admin/customers";
import { AdminHeader } from "@/components/admin/admin-header";
import { money } from "@/lib/money";
import { Search, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const customers = await getCustomers(sp.q);

  return (
    <>
      <AdminHeader title="Customers" subtitle={`${customers.length} with orders`} />
      <div className="p-6">
        <form action="/admin/customers" className="mb-5 max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Search name, email, or phone"
              className="h-10 w-full rounded-md border border-line-2 bg-paper pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </form>

        <div className="overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-3">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 text-right font-semibold">Orders</th>
                <th className="px-4 py-3 text-right font-semibold">Lifetime spend</th>
                <th className="px-4 py-3 font-semibold">Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm text-ink-3">
                    <Users className="mx-auto mb-2 size-7 text-ink-3" />
                    No customers yet — they appear here after their first order.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.email} className="border-b border-line last:border-0 hover:bg-cream">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[11px] text-ink-3">{c.email}</div>
                    </td>
                    <td className="mono px-4 py-3 text-ink-2">{c.phone}</td>
                    <td className="mono px-4 py-3 text-right">{c.orders}</td>
                    <td className="mono px-4 py-3 text-right font-semibold">{money(c.spend)}</td>
                    <td className="px-4 py-3 text-ink-2">
                      {new Date(c.lastOrder).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
