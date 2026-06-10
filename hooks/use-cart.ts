"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Enums } from "@/lib/supabase/types";

// A cart line is a (category, grade) bundle bought by quantity — not a single
// phone. The price is the grade's price (highest available at add-time); the
// server re-validates and re-prices at checkout.
export type CartItem = {
  modelId: string; // category id
  brand: string;
  model: string;
  grade: Enums<"device_grade">;
  unitPrice: number; // price per phone for this grade
  quantity: number;
  available: number; // how many were available at add-time (revalidated later)
  addedAt: number;
};

export type CartLine = Omit<CartItem, "quantity" | "addedAt">;

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const same = (i: CartItem, modelId: string, grade: string) =>
  i.modelId === modelId && i.grade === grade;

const clampQty = (qty: number, available: number) =>
  Math.max(1, Math.min(qty, Math.max(1, available)));

type CartState = {
  items: CartItem[];
  add: (line: CartLine, qty?: number) => void;
  setQuantity: (modelId: string, grade: string, qty: number) => void;
  setUnitPrice: (modelId: string, grade: string, price: number) => void;
  setAvailable: (modelId: string, grade: string, available: number) => void;
  remove: (modelId: string, grade: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => same(i, line.modelId, line.grade));
          if (existing) {
            return {
              items: s.items.map((i) =>
                same(i, line.modelId, line.grade)
                  ? {
                      ...i,
                      unitPrice: line.unitPrice,
                      available: line.available,
                      quantity: clampQty(i.quantity + qty, line.available),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              { ...line, quantity: clampQty(qty, line.available), addedAt: Date.now() },
            ],
          };
        }),
      setQuantity: (modelId, grade, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            same(i, modelId, grade) ? { ...i, quantity: clampQty(qty, i.available) } : i,
          ),
        })),
      setUnitPrice: (modelId, grade, price) =>
        set((s) => ({
          items: s.items.map((i) => (same(i, modelId, grade) ? { ...i, unitPrice: price } : i)),
        })),
      setAvailable: (modelId, grade, available) =>
        set((s) => ({
          items: s.items.map((i) =>
            same(i, modelId, grade)
              ? { ...i, available, quantity: clampQty(i.quantity, available) }
              : i,
          ),
        })),
      remove: (modelId, grade) =>
        set((s) => ({ items: s.items.filter((i) => !same(i, modelId, grade)) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "evolve-cart-v2", // bumped: cart lines are now (category, grade) + quantity
      // Drop items older than 7 days when the store rehydrates.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        state.items = state.items.filter((i) => now - i.addedAt < SEVEN_DAYS);
      },
    },
  ),
);
