"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScanLine, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { GRADES, GRADE_LABELS, CARRIERS, STORAGE_OPTIONS, PHONE_COLORS } from "@/lib/constants";
import { isValidImei } from "@/lib/imei";
import { createUnit, updateUnit } from "@/app/(admin)/admin/inventory/actions";
import { ImeiScanner } from "./imei-scanner";
import type { AdminDevice } from "@/lib/admin/queries";

const inputCls =
  "h-10 w-full rounded-md border border-line-2 bg-paper px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft";

function initial(d?: AdminDevice | null) {
  return {
    imei: d?.imei ?? "",
    storage: d?.storage ?? "",
    color: d?.color ?? "",
    carrier: d?.carrier ?? "",
    grade: (d?.grade ?? "") as "" | (typeof GRADES)[number],
    battery_health: d?.battery_health != null ? String(d.battery_health) : "",
    price: d?.price != null ? String(d.price) : "",
    cost: d?.cost != null ? String(d.cost) : "",
    is_local: d?.is_local ?? true,
    condition_notes: d?.condition_notes ?? "",
  };
}
type FormState = ReturnType<typeof initial>;

export function UnitDrawer({
  open,
  onOpenChange,
  modelId,
  modelLabel,
  unit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  modelId: string;
  modelLabel: string;
  unit?: AdminDevice | null;
}) {
  const router = useRouter();
  const editing = !!unit;
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState<FormState>(() => initial(unit));

  useEffect(() => {
    if (open) setForm(initial(unit));
  }, [open, unit]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const imei = form.imei.trim();
  const imeiValid = /^\d{15}$/.test(imei);
  const luhnOk = imeiValid && isValidImei(imei);
  // Battery is optional, but if provided it must be 0–100.
  const batteryOk =
    form.battery_health === "" ||
    (Number(form.battery_health) >= 0 && Number(form.battery_health) <= 100);
  const canSave =
    imeiValid &&
    form.storage !== "" &&
    form.color !== "" &&
    form.carrier !== "" &&
    form.grade !== "" &&
    form.price !== "" &&
    form.cost !== "" &&
    batteryOk;

  async function save() {
    setSaving(true);
    try {
      const payload = {
        imei,
        storage: form.storage,
        color: form.color,
        carrier: form.carrier,
        grade: form.grade as (typeof GRADES)[number],
        battery_health: form.battery_health === "" ? null : Number(form.battery_health),
        price: form.price === "" ? Number.NaN : Number(form.price),
        cost: form.cost === "" ? Number.NaN : Number(form.cost),
        is_local: form.is_local,
        condition_notes: form.condition_notes.trim() || null,
      };
      const res = editing
        ? await updateUnit(unit!.id, payload)
        : await createUnit(modelId, payload);
      if (res.ok) {
        toast.success(editing ? "Phone updated" : "Phone added");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit phone" : "Add phone"}</SheetTitle>
          <SheetDescription>
            {modelLabel} · fields marked <span className="text-danger">*</span> are required. Battery
            is optional.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <Field label="IMEI" required>
            <div className="flex gap-2">
              <input
                value={form.imei}
                onChange={(e) => set("imei", e.target.value.replace(/\D/g, "").slice(0, 15))}
                placeholder="15 digits"
                className={`${inputCls} mono`}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setScanning(true)}
                title="Scan IMEI barcode"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-line-2 text-ink-2 transition hover:bg-cream-2 hover:text-primary"
              >
                <ScanLine className="size-4" />
              </button>
            </div>
            {form.imei && !imeiValid && <Hint tone="danger">Must be exactly 15 digits</Hint>}
            {imeiValid && !luhnOk && <Hint tone="warn">Checksum looks off — double-check</Hint>}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Carrier" required>
              <select value={form.carrier} onChange={(e) => set("carrier", e.target.value)} className={inputCls}>
                <option value="" disabled>Select carrier…</option>
                {CARRIERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Storage" required>
              <select value={form.storage} onChange={(e) => set("storage", e.target.value)} className={inputCls}>
                <option value="" disabled>Select storage…</option>
                {STORAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Color" required>
              <select value={form.color} onChange={(e) => set("color", e.target.value)} className={inputCls}>
                <option value="" disabled>Select color…</option>
                {PHONE_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Grade" required>
              <select value={form.grade} onChange={(e) => set("grade", e.target.value as FormState["grade"])} className={inputCls}>
                <option value="" disabled>Select grade…</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g} — {GRADE_LABELS[g]}</option>
                ))}
              </select>
            </Field>
            <Field label="Price ($)" required>
              <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="480" className={inputCls} />
            </Field>
            <Field label="Cost ($)" required>
              <input type="number" min={0} step="0.01" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="360" className={inputCls} />
            </Field>
            <Field label="Battery %">
              <input type="number" min={0} max={100} value={form.battery_health} onChange={(e) => set("battery_health", e.target.value)} placeholder="Optional" className={inputCls} />
            </Field>
          </div>

          <Field label="Condition notes">
            <textarea
              rows={3}
              value={form.condition_notes}
              onChange={(e) => set("condition_notes", e.target.value)}
              placeholder="Minor scratches, fully functional…"
              className={`${inputCls} h-auto py-2`}
            />
          </Field>

          <label className="flex items-start gap-2.5 rounded-md border border-line-2 p-3 text-sm">
            <input type="checkbox" checked={form.is_local} onChange={(e) => set("is_local", e.target.checked)} className="mt-0.5 size-4" />
            <span>
              <b className="font-semibold">List on local storefront</b>
              <span className="block text-xs text-ink-2">Uncheck for wholesale-only stock (hidden from customers).</span>
            </span>
          </label>
        </div>

        <SheetFooter>
          <button
            onClick={save}
            disabled={saving || !canSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {editing ? "Save changes" : "Add phone"}
          </button>
        </SheetFooter>

        <ImeiScanner open={scanning} onOpenChange={setScanning} onScan={(v) => set("imei", v)} />
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink-2">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Hint({ tone, children }: { tone: "danger" | "warn"; children: React.ReactNode }) {
  return (
    <span className={`text-[11px] ${tone === "danger" ? "text-danger" : "text-warning"}`}>
      {children}
    </span>
  );
}
