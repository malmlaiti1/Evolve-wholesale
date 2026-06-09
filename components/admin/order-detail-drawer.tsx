"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { OrderStatusBadge } from "@/components/customer/order-status-badge";
import { money } from "@/lib/money";
import { FULFILLMENT_STEPS, ORDER_STATUS_LABELS, ORDER_TRANSITIONS } from "@/lib/constants";
import { setOrderStatus } from "@/app/(admin)/admin/orders/actions";
import type { OrderWithItems } from "@/lib/admin/orders";
import type { Enums } from "@/lib/supabase/types";
import { MailWarning, Loader2, User, Mail, Phone, MapPin, Check, X } from "lucide-react";

const ACTION_LABEL: Record<Enums<"order_status">, string> = {
  pending: "Pending",
  approved: "Approve",
  on_the_way: "Mark on the way",
  delivered: "Mark delivered",
  denied: "Deny",
};

export function OrderDetailDrawer({
  order,
  open,
  onOpenChange,
}: {
  order: OrderWithItems | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [denying, setDenying] = useState(false);
  const [reason, setReason] = useState("");

  if (!order) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const next = ORDER_TRANSITIONS[order.status] ?? [];
  const currentIdx = FULFILLMENT_STEPS.indexOf(order.status);
  const emailMissing = !order.email_sent_at && order.status !== "pending";

  async function act(target: Enums<"order_status">, denialReason?: string) {
    setBusy(true);
    try {
      const res = await setOrderStatus(order!.id, target, denialReason);
      if (res.ok) {
        toast.success(
          `Order ${ORDER_STATUS_LABELS[target].toLowerCase()}${res.emailSent ? " · email sent" : ""}`,
        );
        setDenying(false);
        setReason("");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="mono">{order.order_number}</SheetTitle>
            <OrderStatusBadge status={order.status} />
          </div>
          <SheetDescription>
            Placed {new Date(order.created_at).toLocaleDateString()} · cash on delivery
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          {emailMissing && (
            <div className="flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
              <MailWarning className="size-3.5 shrink-0" />
              Customer email not sent (Resend not configured or failed).
            </div>
          )}

          <div className="rounded-lg border border-line p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <User className="size-4 text-ink-3" /> {order.customer_name}
            </div>
            <div className="mt-2 flex items-center gap-2 text-ink-2">
              <Mail className="size-3.5 text-ink-3" /> {order.customer_email}
            </div>
            <div className="mt-1 flex items-center gap-2 text-ink-2">
              <Phone className="size-3.5 text-ink-3" /> {order.customer_phone}
            </div>
            <div className="mt-1 flex items-start gap-2 text-ink-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-3" /> {order.customer_address}
            </div>
          </div>

          {order.status !== "denied" ? (
            <ol className="flex items-center">
              {FULFILLMENT_STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                return (
                  <li key={step} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          done ? "bg-primary text-primary-foreground" : "bg-cream-deep text-ink-3"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className={`text-[10px] ${done ? "text-ink" : "text-ink-3"}`}>
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                    {idx < FULFILLMENT_STEPS.length - 1 && (
                      <span
                        className={`mx-1 h-0.5 flex-1 ${idx < currentIdx ? "bg-primary" : "bg-cream-deep"}`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="rounded-md bg-danger-soft p-3 text-sm text-danger">
              <b>Denied.</b> {order.denial_reason}
            </div>
          )}

          <div className="rounded-lg border border-line">
            <div className="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
              Items ({order.items.length})
            </div>
            <ul className="divide-y divide-line">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <div className="font-medium">
                      {it.device_brand} {it.device_model}
                    </div>
                    <div className="mono text-[11px] text-ink-3">{it.device_imei}</div>
                  </div>
                  <span className="mono font-semibold">{money(Number(it.unit_price))}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <span className="font-bold">Total</span>
              <span className="mono text-lg font-extrabold text-primary">
                {money(Number(order.total))}
              </span>
            </div>
          </div>

          {next.length > 0 && !denying && (
            <div className="flex flex-wrap gap-2">
              {next.map((target) => {
                const isDeny = target === "denied";
                return (
                  <button
                    key={target}
                    disabled={busy}
                    onClick={() => (isDeny ? setDenying(true) : act(target))}
                    className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      isDeny
                        ? "border border-danger/30 text-danger hover:bg-danger-soft"
                        : "bg-primary text-primary-foreground hover:bg-accent-deep"
                    }`}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isDeny ? (
                      <X className="size-4" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {ACTION_LABEL[target]}
                  </button>
                );
              })}
            </div>
          )}

          {denying && (
            <div className="rounded-lg border border-danger/30 bg-danger-soft/40 p-3">
              <label className="text-xs font-semibold text-danger">Reason for denial</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Unable to verify the delivery address"
                className="mt-1 w-full rounded-md border border-line-2 bg-paper px-3 py-2 text-sm outline-none focus:border-danger"
              />
              <div className="mt-2 flex gap-2">
                <button
                  disabled={busy || !reason.trim()}
                  onClick={() => act("denied", reason)}
                  className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Confirm denial
                </button>
                <button
                  onClick={() => {
                    setDenying(false);
                    setReason("");
                  }}
                  className="rounded-md border border-line-2 px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
