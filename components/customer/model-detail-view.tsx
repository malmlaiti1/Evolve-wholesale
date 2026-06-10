"use client";

import { useState } from "react";
import { DeviceImage } from "@/components/shared/device-image";
import { GradeBadge } from "@/components/shared/grade-badge";
import { GradeAddToCart } from "@/components/customer/grade-add-to-cart";
import { GRADE_DESCRIPTIONS } from "@/lib/constants";
import { money } from "@/lib/money";
import type { ModelDetail } from "@/lib/devices";
import { ShieldCheck, Truck, BadgeCheck } from "lucide-react";

const TRUST = [
  [Truck, "Same-day local delivery"],
  [ShieldCheck, "30-day warranty"],
  [BadgeCheck, "IMEI checked"],
] as const;

// Grades arrive best-first from getModel. Selecting a grade swaps the main photo
// to that grade's top-priced available unit and reveals its add-to-cart.
export function ModelDetailView({ m }: { m: ModelDetail }) {
  const [selected, setSelected] = useState(m.grades[0]?.grade ?? null);
  const active = m.grades.find((g) => g.grade === selected) ?? m.grades[0] ?? null;

  return (
    <>
      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <DeviceImage
          src={active?.imageUrl}
          label={`${m.brand} ${m.model}`}
          className="aspect-square w-full rounded-lg border border-line sm:w-56"
        />
        <div>
          <span className="mono text-xs uppercase tracking-wide text-ink-3">{m.brand}</span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{m.model}</h1>
          <p className="mt-2 text-ink-2">
            {m.available} {m.available === 1 ? "phone" : "phones"} in stock. Pick a grade and how
            many you need — we&rsquo;ll match you with inspected units.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST.map(([Icon, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-[13px] text-ink-2">
                <Icon className="size-4 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-7 sm:mt-9">
        <h2 className="text-lg font-bold">Choose a grade</h2>
        {/* Radio semantics (not <button>) so the active row can hold the
            add-to-cart's own buttons without nesting interactive elements. */}
        <div role="radiogroup" aria-label="Choose a grade" className="mt-4 space-y-3">
          {m.grades.map((g) => {
            const isActive = g.grade === active?.grade;
            const select = () => setSelected(g.grade);
            return (
              <div
                key={g.grade}
                role="radio"
                aria-checked={isActive}
                tabIndex={0}
                onClick={select}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select();
                  }
                }}
                className={`flex cursor-pointer flex-col gap-4 rounded-lg border bg-paper p-4 transition sm:flex-row sm:items-center ${
                  isActive ? "border-primary ring-2 ring-accent-soft" : "border-line hover:border-line-2"
                }`}
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
                  {isActive ? (
                    <div onClick={(e) => e.stopPropagation()}>
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
                  ) : (
                    <span className="text-xs font-semibold text-primary">Select →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
