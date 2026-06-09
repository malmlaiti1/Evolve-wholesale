import { getModels, getInventoryStats } from "@/lib/admin/queries";
import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { ModelsTable } from "@/components/admin/models-table";
import { money0 } from "@/lib/money";
import { Layers, CircleCheck, DollarSign, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [stats, models] = await Promise.all([getInventoryStats(), getModels()]);

  return (
    <>
      <AdminHeader
        title="Inventory"
        subtitle={`${models.length} categories · ${stats.total} phones`}
      />
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Categories" value={models.length} icon={Layers} />
          <KpiCard label="Available" value={stats.available} sub={`${stats.listed} listed locally`} icon={CircleCheck} />
          <KpiCard label="Inventory value" value={money0(stats.value)} icon={DollarSign} />
          <KpiCard label="Est. margin" value={money0(stats.margin)} sub="value − cost" icon={TrendingUp} />
        </div>

        <div className="mt-6">
          <ModelsTable models={models} />
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Click a category to manage its individual phones (IMEI, battery, grade, price). IMEI and
          cost are staff-only.
        </p>
      </div>
    </>
  );
}
