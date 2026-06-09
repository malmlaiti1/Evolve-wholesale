import { AdminHeader } from "@/components/admin/admin-header";
import { ImeiChecker } from "@/components/admin/imei-checker";

export const dynamic = "force-dynamic";

export default function ImeiCheckerPage() {
  return (
    <>
      <AdminHeader title="IMEI Checker" subtitle="Look up device metadata & GSMA blacklist status" />
      <div className="p-6">
        <ImeiChecker />
      </div>
    </>
  );
}
