"use client";

import { useQueryState } from "nuqs";

export function SortSelect() {
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "newest",
    shallow: false,
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-3">Sort</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value === "newest" ? null : e.target.value)}
        aria-label="Sort phones"
        className="h-9 rounded-md border border-line-2 bg-paper px-3 text-sm outline-none transition focus:border-primary"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}
