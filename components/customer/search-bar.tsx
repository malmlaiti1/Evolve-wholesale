"use client";

import { useQueryState } from "nuqs";
import { Search } from "lucide-react";

export function SearchBar() {
  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    throttleMs: 400,
  });

  return (
    <div className="relative flex flex-1 items-center">
      <Search className="pointer-events-none absolute left-3 size-4 text-ink-3" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value || null)}
        placeholder="Search by brand, model, color…"
        aria-label="Search inventory"
        className="h-10 w-full rounded-md border border-line-2 bg-paper pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
      />
    </div>
  );
}
