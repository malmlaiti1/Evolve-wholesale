import "server-only";
import { Resend } from "resend";
import { env, features } from "@/lib/env";
import { orderEmail } from "./templates";
import type { Enums } from "@/lib/supabase/types";

const resend = features.resend ? new Resend(env.RESEND_API_KEY!) : null;

/**
 * Sends an order-status email. Graceful: with no Resend config it no-ops (logs)
 * and reports `sent: false`, so the order update still succeeds and the admin
 * sees an "Email not sent" badge. Resend failures behave the same way.
 */
export async function sendOrderStatusEmail(order: {
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: Enums<"order_status">;
  total: number;
  denial_reason?: string | null;
}): Promise<{ sent: boolean }> {
  if (!resend) {
    console.info(
      `[email stub] ${order.status} → ${order.customer_email} for ${order.order_number} (Resend not configured)`,
    );
    return { sent: false };
  }
  try {
    const { subject, html } = orderEmail(order);
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL!,
      to: order.customer_email,
      subject,
      html,
    });
    return { sent: true };
  } catch (e) {
    console.error("Resend send failed:", e);
    return { sent: false };
  }
}
