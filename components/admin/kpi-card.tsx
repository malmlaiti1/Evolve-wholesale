import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-3">{label}</span>
        {Icon && <Icon className="size-4 text-ink-3" />}
      </div>
      <div className="mono mt-3 text-2xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-2">{sub}</div>}
    </div>
  );
}
