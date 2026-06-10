"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { features } from "@/lib/env";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";
import {
  verifyCredentials,
  createSessionToken,
  ADMIN_COOKIE,
  sessionCookieOptions,
} from "@/lib/admin-auth";

export type SignInState = { error: string | null };

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!features.password) {
    return { error: "Password login isn't configured." };
  }

  // Throttle by IP to stop online password brute-force.
  const { ok } = await rateLimit("login", ipFromHeaders(await headers()));
  if (!ok) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }
  if (!verifyCredentials(email, password)) {
    return { error: "Incorrect email or password." };
  }
  const token = createSessionToken(email);
  (await cookies()).set(ADMIN_COOKIE, token, sessionCookieOptions);
  redirect("/admin");
}

export async function signOutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/sign-in");
}
