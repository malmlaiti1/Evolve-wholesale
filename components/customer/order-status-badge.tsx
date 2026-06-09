import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Enums } from "@/lib/supabase/types";

const TONE: Record<Enums<"order_status">, string> = {
  pending: "bg-warning-soft text-warning",
  approved: "bg-accent-soft text-primary",
  on_the_way: "bg-accent-soft text-primary",
  delivered: "bg-success-soft text-success",
  denied: "bg-danger-soft text-danger",
};

export function OrderStatusBadge({ status }: { status: Enums<"order_status"> }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
