import { Smartphone } from "lucide-react";

// Placeholder visual — real device photos are a v2 item (Supabase Storage).
export function DeviceImage({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`imgph ${className}`}>
      <div className="flex flex-col items-center gap-2 px-3 text-center text-primary/40">
        <Smartphone className="size-9" strokeWidth={1.4} />
        {label && (
          <span className="mono text-[10px] lowercase tracking-wide text-ink-3">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
