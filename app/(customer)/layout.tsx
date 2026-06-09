import { Suspense } from "react";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CustomerFooter } from "@/components/customer/customer-footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <CustomerHeader />
      <main id="main" className="flex-1">
        <Suspense>{children}</Suspense>
      </main>
      <CustomerFooter />
    </div>
  );
}
