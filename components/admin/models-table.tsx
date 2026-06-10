"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { money0 } from "@/lib/money";
import { ModelDrawer, type EditableModel } from "./model-drawer";
import { deleteModel } from "@/app/(admin)/admin/inventory/actions";
import type { AdminModel } from "@/lib/admin/queries";

const RANK: Record<string, number> = { "A+": 0, A: 1, "B+": 2, B: 3, C: 4 };

function gradeRange(grades: string[]) {
  if (!grades.length) return "—";
  const s = [...grades].sort((a, b) => RANK[a] - RANK[b]);
  return s.length === 1 ? s[0] : `${s[0]}–${s[s.length - 1]}`;
}

export function ModelsTable({ models }: { models: AdminModel[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EditableModel | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onDelete(m: AdminModel) {
    if (!confirm(`Delete category ${m.brand} ${m.model}? It must have no phones.`)) return;
    setBusy(m.id);
    try {
      const res = await deleteModel(m.id);
      if (res.ok) {
        toast.success("Category deleted");
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
          onClick={() => setCreating(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep sm:w-auto sm:py-2"
        >
          <Plus className="size-4" /> New category
        </button>
      </div>

      {/* Mobile: stacked cards. */}
      <div className="space-y-3 md:hidden">
        {models.length === 0 ? (
          <div className="rounded-lg border border-line bg-paper p-8 text-center text-sm text-ink-3">
            No categories yet — create one to start adding phones.
          </div>
        ) : (
          models.map((m) => (
            <div key={m.id} className="rounded-lg border border-line bg-paper p-4">
              <button
                onClick={() => router.push(`/admin/inventory/${m.id}`)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="font-semibold text-ink">
                  {m.brand} {m.model}
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-3" />
              </button>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-2">
                <span>{m.available} available{m.sold ? ` · ${m.sold} sold` : ""}</span>
                <span className="mono">Grades {gradeRange(m.grades)}</span>
                <span className="mono ml-auto font-semibold text-ink">
                  {m.minPrice == null
                    ? "—"
                    : m.minPrice === m.maxPrice
                      ? money0(m.minPrice)
                      : `${money0(m.minPrice)}–${money0(m.maxPrice!)}`}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setEditing({ id: m.id, brand: m.brand, model: m.model, description: m.description })
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line py-2 text-[13px] font-medium text-ink-2 transition hover:border-primary hover:text-primary"
                >
                  <Pencil className="size-4" /> Edit
                </button>
                <button
                  onClick={() => onDelete(m)}
                  disabled={busy === m.id}
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
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-3">
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Grades</th>
              <th className="px-4 py-3 text-right font-semibold">Price range</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-ink-3">
                  No categories yet — create one to start adding phones.
                </td>
              </tr>
            ) : (
              models.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => router.push(`/admin/inventory/${m.id}`)}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-cream"
                >
                  <td className="px-4 py-3 font-semibold">
                    {m.brand} {m.model}
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {m.available} available{m.sold ? ` · ${m.sold} sold` : ""}
                  </td>
                  <td className="mono px-4 py-3 text-ink-2">{gradeRange(m.grades)}</td>
                  <td className="mono px-4 py-3 text-right">
                    {m.minPrice == null
                      ? "—"
                      : m.minPrice === m.maxPrice
                        ? money0(m.minPrice)
                        : `${money0(m.minPrice)}–${money0(m.maxPrice!)}`}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setEditing({ id: m.id, brand: m.brand, model: m.model, description: m.description })
                        }
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-2 transition hover:bg-cream-2 hover:text-primary"
                        aria-label="Edit category"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(m)}
                        disabled={busy === m.id}
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-2 transition hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                        aria-label="Delete category"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <ChevronRight className="size-4 text-ink-3" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModelDrawer open={creating} onOpenChange={setCreating} model={null} />
      <ModelDrawer open={!!editing} onOpenChange={(o) => !o && setEditing(null)} model={editing} />
    </>
  );
}
