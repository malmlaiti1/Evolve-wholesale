import { money0 } from "@/lib/money";

export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-lg border border-line bg-paper p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">Revenue</h2>
        <span className="mono text-sm text-ink-2">{money0(total)} · last 6 mo</span>
      </div>
      <div className="mt-5 flex h-40 items-end gap-3">
        {data.map((d, i) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-[3px] transition-[height]"
                style={{
                  height: `${(d.value / max) * 100}%`,
                  minHeight: d.value > 0 ? 4 : 0,
                  background: i === data.length - 1 ? "var(--primary)" : "var(--accent-mid)",
                }}
                title={`${d.label}: ${money0(d.value)}`}
              />
            </div>
            <span className="text-[11px] text-ink-3">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
