import { DEVICE_STATUS_LABELS } from "@/lib/constants";
import type { Enums } from "@/lib/supabase/types";

const TONES: Record<Enums<"device_status">, string> = {
  available: "bg-success-soft text-success",
  reserved: "bg-warning-soft text-warning",
  sold: "bg-danger-soft text-danger",
};

export function StatusBadge({ status }: { status: Enums<"device_status"> }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${TONES[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {DEVICE_STATUS_LABELS[status]}
    </span>
  );
}
