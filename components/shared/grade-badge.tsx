import { GRADE_LABELS } from "@/lib/constants";
import type { Enums } from "@/lib/supabase/types";

export function GradeBadge({
  grade,
  withLabel = true,
}: {
  grade: Enums<"device_grade">;
  withLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-primary">
      <span className="mono font-bold">{grade}</span>
      {withLabel && <span className="text-primary/70">{GRADE_LABELS[grade]}</span>}
    </span>
  );
}
