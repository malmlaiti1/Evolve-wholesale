import Image from "next/image";
import { Smartphone } from "lucide-react";

// Single chokepoint for product imagery. With `src`, renders the uploaded photo
// cropped to a uniform square via object-cover; without it, falls back to the
// placeholder icon (legacy/seed units that predate the image requirement).
export function DeviceImage({
  src,
  label,
  className = "",
}: {
  src?: string | null;
  label?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={label ?? "Product image"}
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover"
        />
      </div>
    );
  }
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
