"use client";

import { useQueryState } from "nuqs";

export function BrandQuickSelect({
  brands,
}: {
  brands: { brand: string; count: number }[];
}) {
  const [brand, setBrand] = useQueryState("brand", { shallow: false });

  const pill = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-line-2 bg-paper text-ink-2 hover:border-ink-3 hover:text-ink"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={pill(!brand)} onClick={() => setBrand(null)}>
        All phones
      </button>
      {brands.map((b) => (
        <button
          key={b.brand}
          type="button"
          className={pill(brand === b.brand)}
          onClick={() => setBrand(brand === b.brand ? null : b.brand)}
        >
          {b.brand}
          <span className="mono text-[11px] opacity-60">{b.count}</span>
        </button>
      ))}
    </div>
  );
}
