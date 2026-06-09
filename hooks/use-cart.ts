"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Enums } from "@/lib/supabase/types";

export type CartItem = {
  id: string; // device (unit) id — each phone is unique, qty always 1
  modelId: string; // category id (for linking back to the model page)
  brand: string;
  model: string;
  storage: string | null;
  color: string | null;
  grade: Enums<"device_grade">;
  price: number; // snapshot at add-time; the server re-validates at checkout
  addedAt: number;
};

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "addedAt">) => void;
  remove: (id: string) => void;
  setPrice: (id: string, price: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) =>
          s.items.some((i) => i.id === item.id)
            ? s
            : { items: [...s.items, { ...item, addedAt: Date.now() }] },
        ),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setPrice: (id, price) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, price } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "evolve-cart",
      // Drop items older than 7 days when the store rehydrates.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        state.items = state.items.filter((i) => now - i.addedAt < SEVEN_DAYS);
      },
    },
  ),
);
