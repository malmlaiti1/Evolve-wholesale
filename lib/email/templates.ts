import type { Enums } from "@/lib/supabase/types";

type OrderForEmail = {
  order_number: string;
  customer_name: string;
  status: Enums<"order_status">;
  total: number;
  denial_reason?: string | null;
};

const COPY: Record<
  Enums<"order_status">,
  { subject: (n: string) => string; heading: string; body: string }
> = {
  pending: {
    subject: (n) => `We received your order ${n}`,
    heading: "Order received",
    body: "Thanks for your order! We're reviewing it and will confirm shortly.",
  },
  approved: {
    subject: (n) => `Your order ${n} is approved`,
    heading: "Order approved",
    body: "Good news — your order is approved and being prepared for local delivery.",
  },
  on_the_way: {
    subject: (n) => `Order ${n} is on the way`,
    heading: "On the way",
    body: "Your order is out for local delivery. Please have cash ready on arrival.",
  },
  delivered: {
    subject: (n) => `Order ${n} delivered`,
    heading: "Delivered",
    body: "Your order has been delivered. Thank you for buying from Evolve Wholesale!",
  },
  denied: {
    subject: (n) => `Update on your order ${n}`,
    heading: "Order update",
    body: "Unfortunately we weren't able to fulfill your order.",
  },
};

export function orderEmail(order: OrderForEmail): { subject: string; html: string } {
  const c = COPY[order.status];
  const reason =
    order.status === "denied" && order.denial_reason
      ? `<p style="margin:0 0 16px;color:#9E3B2C">Reason: ${escapeHtml(order.denial_reason)}</p>`
      : "";
  const html = `<!doctype html><html><body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#FAF6EE;padding:24px;color:#211E18">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #EAE2D3;border-radius:12px;overflow:hidden">
    <div style="background:#1F4D3A;padding:20px 28px;color:#F4F8F4"><strong style="font-size:18px">Evolve Wholesale</strong></div>
    <div style="padding:28px">
      <h1 style="margin:0 0 8px;font-size:22px">${c.heading}</h1>
      <p style="margin:0 0 16px;color:#6B6557">Hi ${escapeHtml(order.customer_name)}, ${c.body}</p>
      ${reason}
      <div style="background:#FAF6EE;border-radius:8px;padding:14px 16px;margin:8px 0">
        <div style="font-size:12px;color:#9A9282;text-transform:uppercase;letter-spacing:.04em">Order</div>
        <div style="font-size:18px;font-weight:bold;color:#1F4D3A">${order.order_number}</div>
        <div style="margin-top:6px;color:#6B6557">Total: <strong>$${order.total.toLocaleString()}</strong> — cash on delivery</div>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#9A9282">Evolve Wireless LLC · Local delivery only</p>
    </div>
  </div>
  </body></html>`;
  return { subject: c.subject(order.order_number), html };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (ch) =>
    ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : "&quot;",
  );
}
