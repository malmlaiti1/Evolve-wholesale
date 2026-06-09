import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getModel, getRelatedModels } from "@/lib/devices";
import { DeviceImage } from "@/components/shared/device-image";
import { GradeBadge } from "@/components/shared/grade-badge";
import { ModelCard } from "@/components/customer/model-card";
import { AddToCartButton } from "@/components/customer/add-to-cart-button";
import { money } from "@/lib/money";
import { BatteryFull, ShieldCheck, Truck, BadgeCheck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = await getModel(id);
  if (!m) return { title: "Not found" };
  const from = Math.min(...m.units.map((u) => Number(u.price)));
  return {
    title: `${m.brand} ${m.model}`,
    description: `${m.brand} ${m.model} — ${m.units.length} available, from ${money(from)}.`,
  };
}

export default async function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getModel(id);
  if (!m) notFound();
  const related = await getRelatedModels(m.brand, id);

  return (
    <div className="screen-in mx-auto max-w-5xl px-5 py-8">
      <nav className="mono flex items-center gap-1.5 text-xs text-ink-3">
        <Link href="/" className="hover:text-ink-2">Catalog</Link>
        <ChevronRight className="size-3" />
        <span className="text-ink-2">{m.brand}</span>
        <ChevronRight className="size-3" />
        <span className="text-ink">{m.model}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <DeviceImage
          label={`${m.brand} ${m.model}`}
          className="aspect-square w-full rounded-lg border border-line sm:w-44"
        />
        <div>
          <span className="mono text-xs uppercase tracking-wide text-ink-3">{m.brand}</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{m.model}</h1>
          <p className="mt-2 text-ink-2">
            {m.units.length} {m.units.length === 1 ? "unit" : "units"} available — each individually
            inspected and graded. Pick the one that fits.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {[
              [Truck, "Same-day local delivery"],
              [ShieldCheck, "30-day warranty"],
              [BadgeCheck, "IMEI checked"],
            ].map(([Icon, label]) => {
              const I = Icon as React.ComponentType<{ className?: string }>;
              return (
                <span key={label as string} className="flex items-center gap-1.5 text-[13px] text-ink-2">
                  <I className="size-4 text-primary" />
                  {label as string}
                </span>
              );
            })}
          </div>
        </div>
      </header>

      <section className="mt-9">
        <h2 className="text-lg font-bold">Available units</h2>
        <div className="mt-4 space-y-3">
          {m.units.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-lg border border-line bg-paper p-4 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  {u.grade && <GradeBadge grade={u.grade} />}
                  <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-2">
                    {u.storage && <span>{u.storage}</span>}
                    {u.color && <span>{u.color}</span>}
                    {u.carrier && <span>{u.carrier}</span>}
                    {u.battery_health != null && (
                      <span className="inline-flex items-center gap-1">
                        <BatteryFull className="size-3.5" />
                        {u.battery_health}%
                      </span>
                    )}
                  </div>
                </div>
                {u.condition_notes && (
                  <p className="text-xs leading-relaxed text-ink-3">{u.condition_notes}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end sm:shrink-0">
                <span className="mono text-xl font-extrabold text-primary">
                  {money(Number(u.price))}
                </span>
                <div className="w-40">
                  <AddToCartButton
                    available={u.status === "available"}
                    device={{
                      id: u.id ?? "",
                      modelId: m.modelId,
                      brand: m.brand,
                      model: m.model,
                      storage: u.storage,
                      color: u.color,
                      grade: u.grade ?? "B",
                      price: Number(u.price),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">More {m.brand}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rm) => (
              <ModelCard key={rm.modelId} m={rm} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
