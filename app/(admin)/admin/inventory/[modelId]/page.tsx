import Link from "next/link";
import { notFound } from "next/navigation";
import { getModelDetail } from "@/lib/admin/queries";
import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { UnitsTable } from "@/components/admin/units-table";
import { money0 } from "@/lib/money";
import { ArrowLeft, CircleCheck, Package, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModelUnitsPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  const data = await getModelDetail(modelId);
  if (!data) notFound();
  const { model, units } = data;
  const label = `${model.brand} ${model.model}`;
  const available = units.filter((u) => u.status === "available");
  const sold = units.filter((u) => u.status === "sold").length;
  const value = available.reduce((s, u) => s + Number(u.price), 0);

  return (
    <>
      <AdminHeader
        title={label}
        subtitle={`${units.length} ${units.length === 1 ? "phone" : "phones"} in this category`}
      />
      <div className="p-6">
        <Link
          href="/admin/inventory"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
        >
          <ArrowLeft className="size-4" /> All categories
        </Link>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <KpiCard label="Available" value={available.length} icon={CircleCheck} />
          <KpiCard label="Sold" value={sold} icon={Package} />
          <KpiCard label="Value (available)" value={money0(value)} icon={DollarSign} />
        </div>

        <div className="mt-6">
          <UnitsTable modelId={modelId} modelLabel={label} units={units} />
        </div>
      </div>
    </>
  );
}
