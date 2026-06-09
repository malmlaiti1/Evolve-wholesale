import { features } from "@/lib/env";
import { AdminHeader } from "@/components/admin/admin-header";
import { COMPANY } from "@/lib/constants";
import { Check, X, ShieldCheck, Mail, ScanLine, Gauge, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const integrations = [
    {
      name: "Admin login (Clerk)",
      on: features.clerk,
      env: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY · CLERK_SECRET_KEY",
      icon: ShieldCheck,
    },
    {
      name: "Order emails (Resend)",
      on: features.resend,
      env: "RESEND_API_KEY · RESEND_FROM_EMAIL",
      icon: Mail,
    },
    {
      name: "IMEI metadata (ImeiDB)",
      on: features.imeidb,
      env: "IMEIDB_API_KEY",
      icon: ScanLine,
    },
    {
      name: "IMEI blacklist (IMEI.org)",
      on: features.imeiOrg,
      env: "IMEI_ORG_API_KEY",
      icon: ScanLine,
    },
    {
      name: "Rate limiting (Upstash)",
      on: features.upstash,
      env: "UPSTASH_REDIS_REST_URL · UPSTASH_REDIS_REST_TOKEN",
      icon: Gauge,
    },
    {
      name: "Error tracking (Sentry)",
      on: features.sentry,
      env: "SENTRY_DSN",
      icon: BarChart3,
    },
  ];

  const business: [string, string][] = [
    ["Store name", COMPANY.brand],
    ["Legal entity", COMPANY.legal],
    ["Payment", "Cash on delivery"],
    ["Delivery", "Free local delivery"],
    ["Sales tax", "None (resale-exempt B2B)"],
  ];

  return (
    <>
      <AdminHeader title="Settings" subtitle="Store configuration & integrations" />
      <div className="max-w-3xl space-y-6 p-6">
        <section className="rounded-lg border border-line bg-paper p-6">
          <h2 className="text-lg font-bold">Store</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {business.map(([label, value]) => (
              <div key={label} className="rounded-md bg-cream-2 px-4 py-3">
                <dt className="text-[11px] uppercase tracking-wide text-ink-3">{label}</dt>
                <dd className="mt-0.5 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-line bg-paper p-6">
          <h2 className="text-lg font-bold">Integrations</h2>
          <p className="mt-1 text-sm text-ink-2">
            Add the keys to <code className="mono rounded bg-cream-2 px-1">.env.local</code> and
            restart to enable each feature.
          </p>
          <ul className="mt-4 divide-y divide-line">
            {integrations.map((i) => {
              const Icon = i.icon;
              return (
                <li key={i.name} className="flex items-center gap-3 py-3">
                  <Icon className="size-5 text-ink-3" />
                  <div className="flex-1">
                    <div className="font-medium">{i.name}</div>
                    <div className="mono text-[11px] text-ink-3">{i.env}</div>
                  </div>
                  {i.on ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                      <Check className="size-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-2.5 py-1 text-xs font-semibold text-ink-2">
                      <X className="size-3.5" /> Not set
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
