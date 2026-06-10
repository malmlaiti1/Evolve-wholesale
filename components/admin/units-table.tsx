"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Archive, Trash2, BatteryFull } from "lucide-react";
import { GradeBadge } from "@/components/shared/grade-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { money } from "@/lib/money";
import { UnitDrawer } from "./unit-drawer";
import { archiveUnit, deleteUnit } from "@/app/(admin)/admin/inventory/actions";
import type { AdminDevice } from "@/lib/admin/queries";

export function UnitsTable({
  modelId,
  modelLabel,
  units,
}: {
  modelId: string;
  modelLabel: string;
  units: AdminDevice[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminDevice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onArchive(u: AdminDevice) {
    if (!confirm("Archive this phone? It will be hidden from the catalog.")) return;
    setBusy(u.id);
    try {
      const res = await archiveUnit(u.id);
      if (res.ok) {
        toast.success("Phone archived");
        router.refresh();
      } else toast.error(res.error);
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(u: AdminDevice) {
    if (!confirm("Permanently delete this phone?")) return;
    setBusy(u.id);
    try {
      const res = await deleteUnit(u.id);
      if (res.ok) {
        toast.success("Phone deleted");
        router.refresh();
      } else toast.error(res.error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setAdding(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep sm:w-auto sm:py-2"
        >
          <Plus className="size-4" /> Add phone
        </button>
      </div>

      {/* Mobile: stacked cards (the wide table is unusable on a phone). */}
      <div className="space-y-3 md:hidden">
        {units.length === 0 ? (
          <div className="rounded-lg border border-line bg-paper p-8 text-center text-sm text-ink-3">
            No phones in this category yet — add one.
          </div>
        ) : (
          units.map((u) => (
            <div key={u.id} className="rounded-lg border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mono truncate text-[13px] font-semibold text-ink">
                    {u.imei ?? <span className="font-normal text-ink-3">— no IMEI</span>}
                  </p>
                  <p className="mono mt-0.5 text-[11px] text-ink-2">
                    {[u.storage, u.color, u.carrier].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <StatusBadge status={u.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                <GradeBadge grade={u.grade} />
                {u.battery_health != null && (
                  <span className="mono inline-flex items-center gap-1 text-ink-2">
                    <BatteryFull className="size-3.5" />
                    {u.battery_health}%
                  </span>
                )}
                <span className="mono ml-auto font-semibold text-ink">{money(u.price)}</span>
                {u.cost != null && (
                  <span className="mono text-[11px] text-ink-3">cost {money(u.cost)}</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEditing(u)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line py-2 text-[13px] font-medium text-ink-2 transition hover:border-primary hover:text-primary"
                >
                  <Pencil className="size-4" /> Edit
                </button>
                <button
                  onClick={() => onArchive(u)}
                  disabled={busy === u.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line py-2 text-[13px] font-medium text-ink-2 transition hover:border-warning hover:text-warning disabled:opacity-50"
                >
                  <Archive className="size-4" /> Archive
                </button>
                <button
                  onClick={() => onDelete(u)}
                  disabled={busy === u.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line py-2 text-[13px] font-medium text-danger transition hover:border-danger hover:bg-danger-soft disabled:opacity-50"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-line bg-paper md:block">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-3">
              <th className="px-4 py-3 font-semibold">IMEI</th>
              <th className="px-4 py-3 font-semibold">Specs</th>
              <th className="px-4 py-3 font-semibold">Grade</th>
              <th className="px-4 py-3 font-semibold">Battery</th>
              <th className="px-4 py-3 text-right font-semibold">Cost</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-sm text-ink-3">
                  No phones in this category yet — add one.
                </td>
              </tr>
            ) : (
              units.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-cream">
                  <td className="mono px-4 py-3 text-[12px] text-ink-2">
                    {u.imei ?? <span className="text-ink-3">— no IMEI</span>}
                  </td>
                  <td className="mono px-4 py-3 text-[11px] text-ink-2">
                    {[u.storage, u.color, u.carrier].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <GradeBadge grade={u.grade} withLabel={false} />
                  </td>
                  <td className="px-4 py-3">
                    {u.battery_health != null ? (
                      <span className="mono inline-flex items-center gap-1 text-ink-2">
                        <BatteryFull className="size-3.5" />
                        {u.battery_health}%
                      </span>
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td className="mono px-4 py-3 text-right text-ink-2">
                    {u.cost != null ? money(u.cost) : "—"}
                  </td>
                  <td className="mono px-4 py-3 text-right font-semibold">{money(u.price)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(u)}
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-2 transition hover:bg-cream-2 hover:text-primary"
                        aria-label="Edit phone"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onArchive(u)}
                        disabled={busy === u.id}
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-2 transition hover:bg-cream-2 hover:text-warning disabled:opacity-50"
                        aria-label="Archive phone"
                        title="Archive"
                      >
                        <Archive className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        disabled={busy === u.id}
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-2 transition hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                        aria-label="Delete phone"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UnitDrawer
        open={adding}
        onOpenChange={setAdding}
        modelId={modelId}
        modelLabel={modelLabel}
        unit={null}
      />
      <UnitDrawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        modelId={modelId}
        modelLabel={modelLabel}
        unit={editing}
      />
    </>
  );
}
