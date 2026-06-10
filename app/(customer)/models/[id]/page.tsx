import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getModel, getRelatedModels } from "@/lib/devices";
import { DeviceImage } from "@/components/shared/device-image";
import { GradeBadge } from "@/components/shared/grade-badge";
import { ModelCard } from "@/components/customer/model-card";
import { GradeAddToCart } from "@/components/customer/grade-add-to-cart";
import { GRADE_DESCRIPTIONS } from "@/lib/constants";
import { money } from "@/lib/money";
import { ShieldCheck, Truck, BadgeCheck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = await getModel(id);
  if (!m) return { title: "Not found" };
  const from = Math.min(...m.grades.map((g) => g.price));
  return {
    title: `${m.brand} ${m.model}`,
    description: `${m.brand} ${m.model} — ${m.available} available, from ${money(from)}.`,
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
            {m.available} {m.available === 1 ? "phone" : "phones"} in stock. Pick a grade and how
            many you need — we&rsquo;ll match you with inspected units.
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
        <h2 className="text-lg font-bold">Choose a grade</h2>
        <div className="mt-4 space-y-3">
          {m.grades.map((g) => (
            <div
              key={g.grade}
              className="flex flex-col gap-4 rounded-lg border border-line bg-paper p-4 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <GradeBadge grade={g.grade} />
                  <span className="text-[13px] font-medium text-ink-2">{g.available} available</span>
                </div>
                <p className="text-xs leading-relaxed text-ink-3">{GRADE_DESCRIPTIONS[g.grade]}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:flex-col sm:items-end sm:gap-2">
                <span className="mono text-xl font-extrabold text-primary">
                  {money(g.price)}
                  <span className="ml-1 text-xs font-medium text-ink-3">each</span>
                </span>
                <GradeAddToCart
                  line={{
                    modelId: m.modelId,
                    brand: m.brand,
                    model: m.model,
                    grade: g.grade,
                    unitPrice: g.price,
                    available: g.available,
                  }}
                />
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
