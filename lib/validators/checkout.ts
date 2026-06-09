import { z } from "zod";

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your name").max(120),
    email: z.string().trim().email("Enter a valid email").max(200),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
    address: z.string().trim().min(8, "Enter a full delivery address").max(400),
  }),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        price: z.number().nonnegative(),
      }),
    )
    .min(1, "Your order is empty")
    .max(50),
  idempotencyKey: z.string().min(8).max(100),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const lookupSchema = z.object({
  orderNumber: z.string().trim().min(3).max(20),
  email: z.string().trim().email(),
});
