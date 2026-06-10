import { getCatalogModels, getBrandsWithCounts, type SortKey } from "@/lib/devices";
import { ModelCard } from "@/components/customer/model-card";
import { BrandQuickSelect } from "@/components/customer/brand-quick-select";
import { SortSelect } from "@/components/customer/sort-select";
import { COMPANY } from "@/lib/constants";
import { PackageSearch } from "lucide-react";

// Catalog is filter-driven (search params) and reflects live inventory.
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const [brands, models] = await Promise.all([
    getBrandsWithCounts(),
    getCatalogModels({
      search: sp.q,
      brands: sp.brand ? [sp.brand] : [],
      sort: (sp.sort as SortKey) ?? "newest",
    }),
  ]);
  const totalUnits = models.reduce((s, m) => s + m.available, 0);

  return (
    <div className="screen-in mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8">
      <header className="max-w-2xl">
        <span className="eyebrow">Live wholesale inventory</span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
          Used phones, graded and ready to move.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2 sm:text-base">
          {COMPANY.tagline} Browse by model, then pick the exact unit — every phone is individually
          inspected and graded. Order for local delivery, pay cash on arrival.
        </p>
      </header>

      <div className="mt-7">
        <BrandQuickSelect brands={brands} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm text-ink-2">
          <b className="mono text-ink">{models.length}</b> {models.length === 1 ? "model" : "models"}
          {" · "}
          <b className="mono text-ink">{totalUnits}</b> {totalUnits === 1 ? "phone" : "phones"}{" "}
          available
        </span>
        <SortSelect />
      </div>

      {models.length === 0 ? (
        <div className="mt-8 rounded-lg border border-line bg-paper p-16 text-center">
          <PackageSearch className="mx-auto size-8 text-ink-3" />
          <p className="mt-3 font-semibold">No phones match your search</p>
          <p className="mt-1 text-sm text-ink-2">Try a different brand or clear your search.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {models.map((m) => (
            <ModelCard key={m.modelId} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
