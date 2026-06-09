import type { Metadata } from "next";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-3">
        Template — review with legal counsel before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-2">
        <section>
          <h2 className="text-base font-bold text-ink">What we collect</h2>
          <p className="mt-2">
            To fulfill an order we collect your name, email, phone number, and delivery address. We
            do not collect payment card details — orders are paid in cash on delivery.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">How we use it</h2>
          <p className="mt-2">
            We use your information only to process, deliver, and provide status updates on your
            order, and to respond to your inquiries.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">Sharing</h2>
          <p className="mt-2">
            We don&rsquo;t sell your information. We share it only with service providers that help
            us operate (for example, email delivery), and only as needed.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">Your choices</h2>
          <p className="mt-2">
            Contact us to access or delete the personal information associated with your orders.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-ink">Contact</h2>
          <p className="mt-2">Privacy questions? Contact {COMPANY.legal}.</p>
        </section>
      </div>
    </div>
  );
}
