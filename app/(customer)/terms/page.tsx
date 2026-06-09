import type { Metadata } from "next";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-3">
        Template — review with legal counsel before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-2">
        <section>
          <h2 className="text-base font-bold text-ink">1. Who we are</h2>
          <p className="mt-2">
            {COMPANY.brand} is operated by {COMPANY.legal}. By placing an order you agree to these
            terms.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">2. Products</h2>
          <p className="mt-2">
            We sell pre-owned mobile devices, individually inspected and graded. Each listing
            reflects the specific unit&rsquo;s condition, grade, and battery health at the time of
            listing. Availability is live and a unit may sell before your order is confirmed.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">3. Orders &amp; payment</h2>
          <p className="mt-2">
            Orders are placed online for local delivery and paid in cash on delivery. Submitting an
            order is a request to purchase; we confirm and prepare it before delivery. Prices are
            recalculated from current listings at checkout.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">4. Delivery</h2>
          <p className="mt-2">
            We deliver locally to the address you provide. We may decline orders outside our
            delivery area or that we cannot verify.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">5. Returns &amp; warranty</h2>
          <p className="mt-2">
            Warranty and return terms are provided with your device. Contact us for any issue with a
            delivered order.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">6. Contact</h2>
          <p className="mt-2">Questions about these terms? Contact {COMPANY.legal}.</p>
        </section>
      </div>
    </div>
  );
}
