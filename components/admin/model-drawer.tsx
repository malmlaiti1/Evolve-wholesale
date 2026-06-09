"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { createModel, updateModel } from "@/app/(admin)/admin/inventory/actions";

const inputCls =
  "h-10 w-full rounded-md border border-line-2 bg-paper px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft";

export type EditableModel = { id: string; brand: string; model: string; description: string | null };

export function ModelDrawer({
  open,
  onOpenChange,
  model,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  model?: EditableModel | null;
}) {
  const router = useRouter();
  const editing = !!model;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ brand: "", model: "", description: "" });

  useEffect(() => {
    if (open)
      setForm({
        brand: model?.brand ?? "",
        model: model?.model ?? "",
        description: model?.description ?? "",
      });
  }, [open, model]);

  const canSave = !!form.brand.trim() && !!form.model.trim();

  async function save() {
    setSaving(true);
    try {
      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        description: form.description.trim() || null,
      };
      if (editing) {
        const res = await updateModel(model!.id, payload);
        if (res.ok) {
          toast.success("Category updated");
          onOpenChange(false);
          router.refresh();
        } else toast.error(res.error);
      } else {
        const res = await createModel(payload);
        if (res.ok) {
          toast.success("Category created — now add phones to it");
          onOpenChange(false);
          router.push(`/admin/inventory/${res.id}`);
        } else toast.error(res.error);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit category" : "New category"}</SheetTitle>
          <SheetDescription>
            A category groups individual phones (e.g. &ldquo;Apple iPhone 13&rdquo;). Storage, IMEI,
            battery and price live on each phone.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-2">Brand</span>
            <input
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              placeholder="Apple"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-2">Model</span>
            <input
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder="iPhone 13"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-2">Description (optional)</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Notes about this model…"
              className={`${inputCls} h-auto py-2`}
            />
          </label>
        </div>

        <SheetFooter>
          <button
            onClick={save}
            disabled={saving || !canSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {editing ? "Save changes" : "Create category"}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
