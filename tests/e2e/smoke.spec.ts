import { test, expect } from "@playwright/test";

test("storefront loads with inventory", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /used phones/i })).toBeVisible();
  await expect(page.getByText(/phones available/i)).toBeVisible();
});

test("device detail page opens", async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href^="/devices/"]').first().click();
  await expect(
    page.getByRole("button", { name: /add to order|no longer available|view cart/i }),
  ).toBeVisible();
});

test("order tracking page works", async ({ page }) => {
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: /track your order/i })).toBeVisible();
});

test("admin dashboard loads (dev bypass)", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /^dashboard$/i })).toBeVisible();
});

test("admin nav pages all resolve", async ({ page }) => {
  for (const path of [
    "/admin/inventory",
    "/admin/orders",
    "/admin/customers",
    "/admin/settings",
    "/admin/imei-checker",
  ]) {
    const res = await page.goto(path);
    expect(res?.status(), `${path} should not 404`).toBeLessThan(400);
  }
});
