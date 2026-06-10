import Link from "next/link";
import { DeviceImage } from "@/components/shared/device-image";
import { money } from "@/lib/money";
import type { CatalogModel } from "@/lib/devices";

const RANK: Record<string, number> = { "A+": 0, A: 1, "B+": 2, B: 3, C: 4 };

export function ModelCard({ m }: { m: CatalogModel }) {
  const sorted = [...m.grades].sort((a, b) => RANK[a] - RANK[b]);
  const gradeLabel =
    sorted.length === 0 ? null : sorted.length === 1 ? sorted[0] : `${sorted[0]}–${sorted[sorted.length - 1]}`;

  return (
    <Link
      href={`/models/${m.modelId}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <DeviceImage src={m.imageUrl} label={`${m.brand} ${m.model}`} className="aspect-square" />
        {gradeLabel && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-primary">
            <span className="mono font-bold">{gradeLabel}</span>
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-cream">
          {m.available} available
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="mono text-[11px] uppercase tracking-wide text-ink-3">{m.brand}</span>
        <h3 className="font-bold leading-tight text-ink">{m.model}</h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="text-[11px] text-ink-3">from</span>
            <div className="mono text-xl font-extrabold text-primary">{money(m.fromPrice)}</div>
          </div>
          <span className="text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
