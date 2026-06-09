import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type CustomerSummary = {
  name: string;
  email: string;
  phone: string;
  orders: number;
  spend: number;
  lastOrder: string;
};

// There is no separate customers table — customer info lives on orders.
// This aggregates orders by email into a customer view.
export async function getCustomers(search?: string): Promise<CustomerSummary[]> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("customer_name, customer_email, customer_phone, total, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const byEmail = new Map<string, CustomerSummary>();
  for (const o of data ?? []) {
    const key = o.customer_email.toLowerCase();
    let c = byEmail.get(key);
    if (!c) {
      c = {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        orders: 0,
        spend: 0,
        lastOrder: o.created_at, // first seen = most recent (ordered desc)
      };
      byEmail.set(key, c);
    }
    c.orders++;
    if (o.status !== "denied") c.spend += Number(o.total);
  }

  let list = [...byEmail.values()];
  if (search?.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s),
    );
  }
  return list.sort((a, b) => b.spend - a.spend);
}
