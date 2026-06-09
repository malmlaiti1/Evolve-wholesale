import type { Enums } from "@/lib/supabase/types";

export const GRADES: Enums<"device_grade">[] = ["A+", "A", "B+", "B", "C"];

export const GRADE_LABELS: Record<Enums<"device_grade">, string> = {
  "A+": "Like new",
  A: "Excellent",
  "B+": "Very good",
  B: "Good",
  C: "Fair",
};

export const GRADE_DESCRIPTIONS: Record<Enums<"device_grade">, string> = {
  "A+": "Indistinguishable from new. No visible wear.",
  A: "Excellent condition. Minimal, hard-to-spot marks.",
  "B+": "Very good. Light wear under normal use.",
  B: "Good. Visible but minor cosmetic wear.",
  C: "Fair. Noticeable wear; fully functional.",
};

export const ORDER_STATUSES: Enums<"order_status">[] = [
  "pending",
  "approved",
  "on_the_way",
  "delivered",
  "denied",
];

export const ORDER_STATUS_LABELS: Record<Enums<"order_status">, string> = {
  pending: "Pending",
  approved: "Approved",
  on_the_way: "On the way",
  delivered: "Delivered",
  denied: "Denied",
};

/** Legal forward transitions for the order status machine. */
export const ORDER_TRANSITIONS: Record<Enums<"order_status">, Enums<"order_status">[]> = {
  pending: ["approved", "denied"],
  approved: ["on_the_way"],
  on_the_way: ["delivered"],
  delivered: [],
  denied: [],
};

/** Fulfillment timeline steps (denied is rendered separately). */
export const FULFILLMENT_STEPS: Enums<"order_status">[] = [
  "pending",
  "approved",
  "on_the_way",
  "delivered",
];

export const DEVICE_STATUS_LABELS: Record<Enums<"device_status">, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

// A model is "low stock" when this many or fewer units are available.
export const LOW_STOCK_THRESHOLD = 3;

export const PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 50;

export const COMPANY = {
  brand: "Evolve Wholesale",
  legal: "Evolve Wireless LLC",
  tagline: "Used phones, wholesale prices — delivered locally.",
} as const;
